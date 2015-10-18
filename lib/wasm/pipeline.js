'use strict';

var assert = require('assert');
var linearscan = require('linearscan');
var Dominance = require('dominance-frontier');
var SSA = require('ssa.js');
var Scheduler = require('json-pipeline-scheduler');
var GVN = require('gvn');
var Reducer = require('json-pipeline-reducer');
var debug = require('debug')('wasm:pipeline');

var wasm = require('../wasm');

function Pipeline(platform, table, info) {
  this.table = table;
  this.info = info;
  this.ast = this.info.ast;
  this.cfg = this.info.cfg;
  this.platform = platform;
}
module.exports = Pipeline;

Pipeline.create = function create(platform, table, info) {
  return new Pipeline(platform, table, info);
};

Pipeline.prototype.compile = function compile(masm) {
  debug('compile');
  debug('dominance start');
  Dominance.create(this.cfg).compute();
  debug('dominance end');
  debug('ssa start');
  SSA.create(this.cfg).compute();
  debug('ssa end');

  this.reduce(this.cfg, 'generic');
  this.gvn(this.cfg, 'generic');
  this.reduce(this.cfg, 'platform');
  this.gvn(this.cfg, 'platform');

  debug('schedule start');
  var scheduled = Scheduler.create(this.cfg).run();
  debug('schedule end');

  this.reduce(scheduled, 'lir');

  // Ensure proper ordering of blocks
  debug('reindex start');
  scheduled.reindex();
  debug('reindex start');
  return this.compileLow(scheduled, masm);
};

Pipeline.prototype.reduce = function reduce(cfg, stage) {
  debug('reduce start: %j', stage);
  var reducer = new Reducer();
  var list = wasm.platform.base.reductions.stages[stage] || [];
  list = list.concat(this.platform.reductions.stages[stage] || []);

  for (var i = 0; i < list.length; i++) {
    var Reduction = list[i];
    reducer.addReduction(new Reduction(this.platform, this.ast));
  }

  reducer.reduce(cfg);
  debug('reduce end: %j', stage);
};

Pipeline.prototype.gvn = function gvn(cfg, stage) {
  debug('gvn start: %j', stage);
  var reducer = new Reducer();
  var gvn = new GVN();
  var list = wasm.platform.base.gvn.stages[stage] || [];
  list = list.concat(this.platform.gvn.stages[stage] || []);

  for (var i = 0; i < list.length; i++) {
    var Relation = list[i];
    gvn.addRelation(new Relation(this.platform, this.ast));
  }

  reducer.addReduction(gvn);
  reducer.reduce(cfg);
  debug('gvn end: %j', stage);
};

Pipeline.prototype.compileLow = function compileLow(cfg, masm) {
  var codegen = new this.platform.Codegen(masm, this.table);

  debug('linearscan start');
  var lir = linearscan.allocate(cfg, codegen.linearscan);
  debug('linearscan end');

  debug('codegen start');
  var self = this;
  masm.labelScope(function() {
    codegen.prologue(lir, self.info);
    for (var i = 0; i < lir.instructions.length; i++) {
      var instr = lir.instructions[i];
      if (instr.linkUses.length !== 0)
        masm.bind(instr.index);
      assert(codegen[instr.opcode], 'Opcode not found: ' + instr.opcode);
      codegen[instr.opcode](instr);
    }

    // No need in epilogue, there is always a return block that everyone ends at
  });
  debug('codegen end');
};

'use strict';

var assert = require('assert');
var linearscan = require('linearscan');
var Dominance = require('dominance-frontier');
var SSA = require('ssa.js');
var Scheduler = require('json-pipeline-scheduler');
var Reducer = require('json-pipeline-reducer');

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
  Dominance.create(this.cfg).compute();
  SSA.create(this.cfg).compute();

  this.reduce(this.cfg, 'generic');
  this.reduce(this.cfg, 'platform');

  var scheduled = Scheduler.create(this.cfg).run();

  // Ensure proper ordering of blocks
  scheduled.reindex();
  return this.compileLow(scheduled, masm);
};

Pipeline.prototype.reduce = function reduce(cfg, stage) {
  var reducer = new Reducer();
  var list = wasm.platform.base.reductions.stages[stage] || [];
  list = list.concat(this.platform.reductions.stages[stage] || []);

  for (var i = 0; i < list.length; i++) {
    var Reduction = list[i];
    reducer.addReduction(new Reduction(this.platform, this.ast));
  }

  reducer.reduce(cfg);
};

Pipeline.prototype.compileLow = function compileLow(cfg, masm) {
  var codegen = new this.platform.Codegen(masm, this.table);

  var lir = linearscan.allocate(cfg, codegen.linearscan);

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

  return masm.compile();
};

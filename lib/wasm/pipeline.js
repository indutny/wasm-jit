'use strict';

var assert = require('assert');
var linearscan = require('linearscan');
var Dominance = require('dominance-frontier');
var SSA = require('ssa.js');
var Scheduler = require('json-pipeline-scheduler');
var Reducer = require('json-pipeline-reducer');

var wasm = require('../wasm');

function Pipeline(platform, ast, cfg) {
  this.ast = ast;
  this.cfg = cfg;
  this.platform = platform;
}
module.exports = Pipeline;

Pipeline.create = function create(platform, ast, cfg) {
  return new Pipeline(platform, ast, cfg);
};

Pipeline.prototype.compile = function compile(masm) {
  Dominance.create(this.cfg).compute();
  SSA.create(this.cfg).compute();

  this.reduce(this.cfg, 'generic');
  this.reduce(this.cfg, 'platform');

  var scheduled = Scheduler.create(this.cfg).run();
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
  var lir = linearscan.allocate(cfg, this.platform.linearscan);

  var codegen = new this.platform.Codegen(masm);

  masm.labelScope(function() {
    codegen.prologue(lir);
    for (var i = 0; i < lir.instructions.length; i++) {
      var instr = lir.instructions[i];
      if (instr.linkUses.length !== 0)
        masm.bind(instr.index);
      assert(codegen[instr.opcode], 'Opcode not found: ' + instr.opcode);
      codegen[instr.opcode](instr);
    }
    codegen.epilogue();
  });

  return masm.compile();
};

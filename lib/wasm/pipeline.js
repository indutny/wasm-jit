'use strict';

var assert = require('assert');
var Dominance = require('dominance-frontier');
var SSA = require('ssa.js');
var Scheduler = require('json-pipeline-scheduler');
var linearscan = require('linearscan');

function Pipeline(platform, cfg) {
  this.cfg = cfg;
  this.platform = platform;
}
module.exports = Pipeline;

Pipeline.create = function create(platform, cfg) {
  return new Pipeline(platform, cfg);
};

Pipeline.prototype.compile = function compile(masm) {
  Dominance.create(this.cfg).compute();
  SSA.create(this.cfg).compute();
  var lir = Scheduler.create(this.cfg).run();
  return this.compileLow(lir, masm);
};

Pipeline.prototype.compileLow = function compileLow(cfg, masm) {
  cfg.reindex();
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

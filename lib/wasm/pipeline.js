'use strict';

var assert = require('assert');
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
  var scheduler = Scheduler.create(this.cfg);
  var out = scheduler.run();
  return this.compileLow(out, masm);
};

Pipeline.prototype.compileLow = function compileLow(cfg, masm) {
  cfg.reindex();
  var lir = linearscan.allocate(cfg, this.platform.linearscan);

  var codegen = new this.platform.Codegen(masm);

  codegen.prologue(lir);
  for (var i = 0; i < lir.instructions.length; i++) {
    var instr = lir.instructions[i];
    assert(codegen[instr.opcode], 'Opcode not found: ' + instr.opcode);
    codegen[instr.opcode](instr);
  }
  codegen.epilogue();

  return masm.compile();
};

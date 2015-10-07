'use strict';

var util = require('util');

var wasm = require('../../../wasm');
var x64 = require('../');

function Codegen(masm, table) {
  wasm.platform.base.Codegen.call(this, masm, table);

  this.lastEpilogue = -1;
  this.calleeSaved = null;
}
util.inherits(Codegen, wasm.platform.base.Codegen);
module.exports = Codegen;

Codegen.Builder = require('./builder');
Codegen.builder = new Codegen.Builder(Codegen);

Codegen.prototype.linearscan = Codegen.builder.linearscan;

Codegen.prototype.spill = function spill(index) {
  return [ 'rbp', -x64.ptrSize * (1 + index) ];
};

Codegen.prototype.param = function param(index) {
  return [ 'rbp', x64.ptrSize * (2 + index) ];
};

Codegen.prototype._align = function _align(masm) {
  // Align code
  var pad = masm.getOffset() % (x64.ptrSize * 2);
  if (pad !== 0)
    pad = x64.ptrSize * 2 - pad;
  for (; pad > 0; pad--)
    masm.int3();
};

Codegen.prototype._saveCalleeRegs = function _saveCalleeRegs(pipeline,
                                                             masm,
                                                             offset) {
  var usedRegs = pipeline.getUsedRegisters();
  this.calleeSaved = usedRegs.filter(function(reg) {
    return x64.calleeSaveRegs.general.indexOf(reg) !== -1 ||
           x64.calleeSaveRegs.float.indexOf(reg) !== -1;
  }).map(function(reg, i) {
    return {
      reg: reg,
      spill: this.spill(offset + i)
    };
  }, this);

  // Align spills
  var stackSize = offset + this.calleeSaved.length;
  if (stackSize % 2 !== 0)
    stackSize++;
  stackSize *= x64.ptrSize;

  if (stackSize !== 0)
    masm.sub('rsp', stackSize);

  // Save regs
  for (var i = 0; i < this.calleeSaved.length; i++) {
    var item = this.calleeSaved[i];
    masm.mov(item.spill, item.reg);
  }
};

Codegen.prototype.prologue = function prologue(pipeline, info) {
  var masm = this.masm;

  this._align(masm);

  masm.bind(this.table.get(info.index).label);
  this.table.setOffset(info.index, masm.getOffset());
  masm.int3();
  masm.push('rbp');
  masm.mov('rbp', 'rsp');

  // Spills have equal size for x64
  var spillSize = 0;
  for (var i = 0; i < pipeline.spillType.length; i++)
    spillSize = Math.max(pipeline.spillType[i].to, spillSize);

  this._saveCalleeRegs(pipeline, masm, spillSize);
};

Codegen.prototype.epilogue = function epilogue(node) {
  var masm = this.masm;
  if (!node && masm.getOffset() === this.lastEpilogue)
    return;

  // Restore callee regs
  for (var i = 0; i < this.calleeSaved.length; i++) {
    var item = this.calleeSaved[i];
    masm.mov(item.reg, item.spill);
  }

  masm.mov('rsp', 'rbp');
  masm.pop('rbp');
  masm.ret();

  this.lastEpilogue = masm.getOffset();
};

//
// Linearscan stuff
//

Codegen.builder.opcode('ls:move.general', function() {
  return {};
}, function(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.mov(dst, src);
});

Codegen.builder.opcode('ls:swap.general', function() {
  return {};
}, function(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  if (Array.isArray(dst) && Array.isArray(src)) {
    masm.mov(x64.scratch, dst);
    masm.mov(dst, src);
    masm.mov(src, x64.scratch);
  } else {
    masm.xchg(dst, src);
  }
});

Codegen.builder.opcode('ls:move.float', function() {
  return {};
}, function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.movq(dst, src);
});

Codegen.builder.opcode('ls:swap.float', function() {
  return {};
}, function(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  masm.movq(x64.scratch, dst);
  masm.movq(dst, src);
  masm.movq(src, x64.scratch);
});

//
// X64 specific instructions
//
function declareReg(type, reg) {
  Codegen.builder.opcode('x64:' + reg, function() {
    return { output: this[type]('register', reg) };
  }, function() {
    // No-op, the return type is all that matters
  });
}
x64.registers.general.forEach(function(reg) {
  return declareReg('int', reg);
});
x64.registers.float.forEach(function(reg) {
  return declareReg('float', reg);
});

//
// Load Codegen extensions
//
require('./generic');
require('./math');
require('./memory');
require('./cast');
require('./branching');

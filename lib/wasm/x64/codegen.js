'use strict';

var util = require('util');
var BN = require('bn.js');
var Buffer = require('buffer').Buffer;

var wasm = require('../../wasm');
var x64 = require('./');

function Codegen(masm) {
  wasm.platform.base.Codegen.call(this, masm);

  this.lastEpilogue = -1;
}
util.inherits(Codegen, wasm.platform.base.Codegen);
module.exports = Codegen;

Codegen.prototype.spill = function spill(index) {
  return [ 'rbp', -x64.ptrSize * (1 + index) ];
};

Codegen.prototype.param = function param(index) {
  return [ 'rbp', x64.ptrSize * (2 + index) ];
};

Codegen.prototype.prologue = function prologue(pipeline) {
  this.masm.push('rbp');
  this.masm.mov('rbp', 'rsp');

  // Spills have equal size for x64
  var spillSize = 0;
  for (var i = 0; i < pipeline.spillType.length; i++)
    spillSize = Math.max(pipeline.spillType[i].to, spillSize);

  // Align spills
  if (spillSize % 2 !== 0)
    spillSize++;
  spillSize *= x64.ptrSize;

  if (spillSize !== 0)
    this.masm.sub('rsp', spillSize);
};

Codegen.prototype.epilogue = function epilogue(node) {
  if (!node && this.masm.getOffset() === this.lastEpilogue)
    return;

  this.masm.mov('rsp', 'rbp');
  this.masm.pop('rbp');
  this.masm.ret();

  this.lastEpilogue = this.masm.getOffset();
};

//
// Jumps and linearscan moves
//

Codegen.prototype['if'] = function _if(node) {
  this.masm.test(this.input(node, 0), 0);
  var left = node.links[0].index;
  var right = node.links[1].index;

  var next = node.index + 1;
  if (left !== next)
    this.masm.j('ne', left);
  if (right !== next)
    this.masm.j('e', right);
};

Codegen.prototype['jump'] = function _jump(node) {
  var dst = node.links[0].index;
  if (dst !== node.index + 1)
    this.masm.j(dst);
};

Codegen.prototype['ls:move.general'] = function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.mov(dst, src);
};

Codegen.prototype['ls:swap.general'] = function swap(node) {
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
};

Codegen.prototype['ls:move.float'] = function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.movq(dst, src);
};

Codegen.prototype['ls:swap.float'] = function swap(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  masm.movq(x64.scratch, dst);
  masm.movq(dst, src);
  masm.movq(src, x64.scratch);
};

//
// Generic instructions
//

Codegen.prototype['i8.const'] = function i8const(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xff);
};

Codegen.prototype['i16.const'] = function i16const(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xffff);
};

Codegen.prototype['i32.const'] = function i32const(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xffffffff);
};

Codegen.prototype['i64.const'] = function i64const(node) {
  var out = this.output(node);
  if (typeof node.literals[0] === 'number')
    this.masm.mov(out, node.literals[0]);
  else
    this.masm.mov(out, new Buffer(new BN(node.literals[0]).toArray()));
};

Codegen.prototype['f32.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadFloat(x64.scratch, parseFloat(node.literals[0]));
  this.masm.movd(out, x64.scratch);
};

Codegen.prototype['f64.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadDouble(x64.scratch, parseFloat(node.literals[0]));
  this.masm.movq(out, x64.scratch);
};

Codegen.prototype['x64:int.param'] = function i8param(node) {
  this.masm.mov(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['x64:f32.param'] = function i64param(node) {
  this.masm.movd(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['x64:f64.param'] = function i64param(node) {
  this.masm.movq(this.output(node), this.param(node.literals[0]));
};

// TODO(indutny): reduce to single x64 instruction
Codegen.prototype['ret'] = Codegen.prototype.epilogue;
wasm.types.forEach(function(type) {
  Codegen.prototype[type + '.ret'] = Codegen.prototype['ret'];
});

Codegen.prototype['i64.add'] = function i64add(node) {
  var out = this.output(node);
  var left = this.input(node, 0);
  var right = this.input(node, 1);

  if (out === left) {
    this.masm.add(left, right);
  } else if (out === right) {
    this.masm.add(right, left);
  } else {
    this.masm.mov(out, left);
    this.masm.add(out, right);
  }
};

Codegen.prototype['f64.add'] = function i64add(node) {
  var out = this.output(node);
  var left = this.input(node, 0);
  var right = this.input(node, 1);

  if (out === left) {
    this.masm.addsd(left, right);
  } else if (out === right) {
    this.masm.addsd(right, left);
  } else {
    this.masm.movsd(out, left);
    this.masm.addsd(out, right);
  }
};

Codegen.prototype['i64.trunc_s_64'] = function i64add(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvttsd2si(out, input);
};

//
// X64 specific instructions
//
function declareReg(reg) {
  Codegen.prototype['x64:' + reg] = function _regWrap() {
    // No-op, the return type is all that matters
  };
}
x64.registers.general.forEach(declareReg);
x64.registers.float.forEach(declareReg);

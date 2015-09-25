'use strict';

var assert = require('assert');
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
  if (index < x64.params.length)
    return x64.params[index];
  return [ 'rbp', x64.ptrSize * (2 + index - x64.params.length) ];
};

Codegen.prototype.fpParam = function fpParam(index) {
  if (index < x64.fpParams.length)
    return x64.fpParams[index];
  return [ 'rbp', x64.ptrSize * (2 + index - x64.fpParams.length) ];
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
    spilLSize++;
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

  // TODO(indutny): register groups in linearscan
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

Codegen.prototype['i8.param'] = function i8param(node) {
  this.masm.movzxb(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['i16.param'] = function i16param(node) {
  this.masm.movzxw(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['i32.param'] = function i32param(node) {
  this.masm.movl(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['i64.param'] = function i64param(node) {
  this.masm.mov(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['f32.param'] = function i64param(node) {
  this.masm.movd(this.output(node), this.fpParam(node.literals[0]));
};

Codegen.prototype['f64.param'] = function i64param(node) {
  this.masm.movq(this.output(node), this.fpParam(node.literals[0]));
};

// TODO(indutny): reduce to single x64 instruction
Codegen.prototype['ret'] = Codegen.prototype.epilogue;
Codegen.prototype['i8.ret'] = Codegen.prototype['ret'];
Codegen.prototype['i16.ret'] = Codegen.prototype['ret'];
Codegen.prototype['i32.ret'] = Codegen.prototype['ret'];
Codegen.prototype['i64.ret'] = Codegen.prototype['ret'];
Codegen.prototype['f32.ret'] = Codegen.prototype['ret'];
Codegen.prototype['f64.ret'] = Codegen.prototype['ret'];

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

Codegen.prototype['i64.bool'] = function i64bool(node) {
  this.masm.test(this.input(node, 0), 0);
  this.masm.set('ne', this.output(node));
};

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

Codegen.prototype['ls:move'] = function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  masm.mov(dst, src);
};

Codegen.prototype['ls:swap'] = function swap(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  if (Array.isArray(dst) && Array.isArray(src)) {
    masm.mov(this.scratch, dst);
    masm.mov(dst, src);
    masm.mov(src, this.scratch);
  } else {
    masm.xchg(dst, src);
  }
};

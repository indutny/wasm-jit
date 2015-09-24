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
  return [ 'rbp', -8 * (1 + index) ];
};

Codegen.prototype.param = function param(index) {
  return [ 'rbp', 8 * (2 + index) ];
};

Codegen.prototype.prologue = function prologue(pipeline) {
  this.masm.push('rbp');
  this.masm.mov('rbp', 'rsp');

  // Spills have equal size for x64
  var spillSize = 0;
  for (var i = 0; i < pipeline.spillType.length; i++)
    spillSize = Math.max(pipeline.spillType[i].to, spillSize);
  spillSize *= x64.ptrSize;

  // Align spills
  if (spillSize % (x64.ptrSize * 2) !== 0)
    spillSize += x64.ptrSize;

  if (spillSize !== 0)
    this.masm.sub('rsp', spillSize);
};

Codegen.prototype.epilogue = function epilogue() {
  if (this.masm.getOffset() === this.lastEpilogue)
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

Codegen.prototype['f64.const'] = function i64const(node) {
  var out = this.output(node);
  var buf = new Buffer(8);
  buf.writeDoubleLE(parseFloat(node.literals[0]), 0, true);
  this.masm.mov(x64.scratch, buf);
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

Codegen.prototype['f64.param'] = function i64param(node) {
  this.masm.movq(this.output(node), this.param(node.literals[0]));
};

// TODO(indutny): reduce to single x64 instruction
Codegen.prototype['i8.ret'] = Codegen.prototype.epilogue;
Codegen.prototype['i16.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i32.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i64.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['f32.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['f64.ret'] = Codegen.prototype['i8.ret'];

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

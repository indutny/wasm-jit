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

Codegen.prototype.prologue = function prologue() {
  this.masm.push('rbp');
  this.masm.mov('rbp', 'rsp');
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

// TODO(indutny): reduce to single x64 instruction
Codegen.prototype['i8.ret'] = Codegen.prototype.epilogue;
Codegen.prototype['i16.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i32.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i64.ret'] = Codegen.prototype['i8.ret'];

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

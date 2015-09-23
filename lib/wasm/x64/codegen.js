'use strict';

var util = require('util');
var BN = require('bn.js');
var Buffer = require('buffer').Buffer;

var wasm = require('../../wasm');

function Codegen(masm) {
  wasm.platform.base.Codegen.call(this, masm);
}
util.inherits(Codegen, wasm.platform.base.Codegen);
module.exports = Codegen;

Codegen.prototype.spill = function spill(index) {
  throw new Error('Not implemented yet');
};

Codegen.prototype.prologue = function prologue() {
  this.masm.push('rbp');
  this.masm.mov('rbp', 'rsp');
};

Codegen.prototype.epilogue = function epilogue() {
  this.masm.mov('rsp', 'rbp');
  this.masm.pop('rbp');
  this.masm.ret();
};

  // TODO(indutny): register groups in linearscan
Codegen.prototype['i8.const'] = function(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xff);
};

Codegen.prototype['i16.const'] = function(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xffff);
};

Codegen.prototype['i32.const'] = function(node) {
  this.masm.mov(this.output(node), node.literals[0] & 0xffffffff);
};

Codegen.prototype['i64.const'] = function(node) {
  var out = this.output(node);
  if (typeof node.literals[0] === 'number')
    this.masm.mov(out, node.literals[0]);
  else
    this.masm.mov(out, new Buffer(new BN(node.literals[0]).toArray()));
};

Codegen.prototype['i8.param'] = function(node) {
  throw new Error('Not implemented yet');
};

Codegen.prototype['i16.param'] = Codegen.prototype['i8.param'];
Codegen.prototype['i32.param'] = Codegen.prototype['i8.param'];
Codegen.prototype['i64.param'] = Codegen.prototype['i8.param'];

// TODO(indutny): reduce to single x64 instruction
Codegen.prototype['i8.ret'] = Codegen.prototype.epilogue;
Codegen.prototype['i16.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i32.ret'] = Codegen.prototype['i8.ret'];
Codegen.prototype['i64.ret'] = Codegen.prototype['i8.ret'];

Codegen.prototype['i64.add'] = function(node) {
  var out = this.out(node);
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

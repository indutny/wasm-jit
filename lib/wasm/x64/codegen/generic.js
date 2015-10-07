'use strict';

var BN = require('bn.js');
var Buffer = require('buffer').Buffer;

var x64 = require('../');

var Codegen = require('./');

Codegen.prototype['i8.const'] = function i8const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xff);
};

Codegen.prototype['i16.const'] = function i16const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffff);
};

Codegen.prototype['i32.const'] = function i32const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffffffff);
};

Codegen.prototype['i64.const'] = function i64const(node) {
  var out = this.output(node);
  var masked = node.literals[0];

  // Short number
  if (masked.bitLength() <= 31)
    return this.masm.mov(out, masked.toString(10) | 0);

  if (masked.sign)
    masked = new BN('10000000000000000', 16).iadd(masked);
  masked = masked.maskn(64);

  var arr = masked.toArray('le');
  while (arr.length < 8)
    arr.push(0);

  this.masm.mov(out, new Buffer(arr));
};

Codegen.prototype['f32.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadFloat(x64.scratch, node.literals[0]);
  this.masm.movd(out, x64.scratch);
};

Codegen.prototype['f64.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadDouble(x64.scratch, node.literals[0]);
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

Codegen.prototype['ret'] = Codegen.prototype.epilogue;
Codegen.prototype['x64:int.ret'] = function nop() {};
Codegen.prototype['x64:float.ret'] = function nop() {};

'use strict';

var BN = require('bn.js');
var Buffer = require('buffer').Buffer;

var x64 = require('../');

var builder = require('./').builder;

builder.opcode('i8.const', function() {
  return { output: this.int('any') };
}, function(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xff);
});

builder.opcode('i16.const', function() {
  return { output: this.int('any') };
}, function(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffff);
});

builder.opcode('i32.const', function() {
  return { output: this.int('any') };
}, function(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffffffff);
});

builder.opcode('i64.const', function() {
  return { output: this.int('any') };
}, function(node) {
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
});

builder.opcode('f32.const', function() {
  return { output: this.float('any') };
}, function(node) {
  var out = this.output(node);
  this.masm.loadFloat(x64.scratch, node.literals[0]);
  this.masm.movd(out, x64.scratch);
});

builder.opcode('f64.const', function() {
  return { output: this.float('any') };
}, function(node) {
  var out = this.output(node);
  this.masm.loadDouble(x64.scratch, node.literals[0]);
  this.masm.movq(out, x64.scratch);
});

builder.opcode('x64:int.param', function() {
  return { output: this.int('any') };
}, function(node) {
  this.masm.mov(this.output(node), this.param(node.literals[0]));
});

builder.opcode('x64:f32.param', function() {
  return { output: this.float('any') };
}, function(node) {
  this.masm.movd(this.output(node), this.param(node.literals[0]));
});

builder.opcode('x64:f64.param', function() {
  return { output: this.float('any') };
}, function(node) {
  this.masm.movq(this.output(node), this.param(node.literals[0]));
});

builder.opcode('ret', function() {
  return {};
}, function(node) {
  return this.epilogue(node);
});

builder.opcode('x64:int.ret', function() {
  return { inputs: [ this.int('register', 'rax') ] };
}, function() {
  // No-op
});

builder.opcode('x64:float.ret', function() {
  return { inputs: [ this.float('register', 'xmm0') ] };
}, function() {
  // No-op
});

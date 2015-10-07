'use strict';

var builder = require('./').builder;

builder.opcode('int.add', function() {
  return {
    output: this.gp('register'),
    inputs: [ this.gp('any'), this.gp('any') ]
  };
}, function(node) {
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
});

builder.opcode('f32.add', function() {
  return {
    output: this.fp('register'),
    inputs: [ this.fp('any'), this.fp('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var left = this.input(node, 0);
  var right = this.input(node, 1);

  if (out === left) {
    this.masm.addss(left, right);
  } else if (out === right) {
    this.masm.addss(right, left);
  } else {
    this.masm.movss(out, left);
    this.masm.addss(out, right);
  }
});

builder.opcode('f64.add', function() {
  return {
    output: this.fp('register'),
    inputs: [ this.fp('any'), this.fp('any') ]
  };
}, function(node) {
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
});

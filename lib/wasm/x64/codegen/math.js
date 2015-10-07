'use strict';

var builder = require('./').builder;

function commutativeIntMath(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.gp('register'),
      inputs: [ this.gp('any'), this.gp('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      other = left;
    } else {
      this.masm.mov(out, left);
      other = right;
    }
    generate.call(this, out, other);
  });
}

commutativeIntMath('int.add', function(out, other) {
  this.masm.add(out, other);
});

commutativeIntMath('int.sub', function(out, other) {
  this.masm.sub(out, other);
});

commutativeIntMath('int.mul', function(out, other) {
  this.masm.imul(out, other);
});

//
// Floating point opcodes
//

function commutativeFloatMath(name, size, generate) {
  builder.opcode(name, function() {
    return {
      output: this.fp('register'),
      inputs: [ this.fp('any'), this.fp('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      other = left;
    } else {
      if (size === 32)
        this.masm.movss(out, left);
      else
        this.masm.movsd(out, left);
      other = right;
    }
    generate.call(this, out, other);
  });
}

commutativeFloatMath('f32.add', 32, function(out, other) {
  this.masm.addss(out, other);
});

commutativeFloatMath('f64.add', 64, function(out, other) {
  this.masm.addsd(out, other);
});

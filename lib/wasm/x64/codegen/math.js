'use strict';

var x64 = require('../');
var builder = require('./').builder;

function commutativeIntMath(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register'),
      inputs: [ this.int('any'), this.int('any') ]
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

commutativeIntMath('x64:int.add', function(out, other) {
  this.masm.add(out, other);
});

commutativeIntMath('x64:int.mul', function(out, other) {
  this.masm.imul(out, other);
});

function nonCommutativeIntMath(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register'),
      inputs: [ this.int('any'), this.int('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      this.masm.mov(x64.scratch, left);
      generate.call(this, x64.scratch, right);
      this.masm.mov(out, x64.scratch);
      return;
    } else {
      this.masm.mov(out, left);
      other = right;
    }

    generate.call(this, out, other);
  });
}

nonCommutativeIntMath('x64:int.sub', function(out, other) {
  this.masm.sub(out, other);
});


//
// Floating point opcodes
//

function commutativeFloatMath(name, size, generate) {
  builder.opcode(name, function() {
    return {
      output: this.float('register'),
      inputs: [ this.float('any'), this.float('any') ]
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

'use strict';

var builder = require('./').builder;

builder.opcode('x64:change-u32-to-i64', function() {
  return {
    output: this.int('register'), inputs: [ this.int('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.movl(out, input);
});

builder.opcode('x64:change-s32-to-i64', function() {
  return {
    output: this.int('register'), inputs: [ this.int('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.movsxl(out, input);
});

'use strict';

var builder = require('./').builder;

builder.opcode('i64.trunc_s_64', function() {
  return {
    output: this.int('any'),
    inputs: [ this.float('register') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvttsd2si(out, input);
});

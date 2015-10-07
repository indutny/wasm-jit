'use strict';

var x64 = require('../');
var builder = require('./').builder;

builder.opcode('if', function() {
  return { inputs: [ this.int('any') ] };
}, function(node) {
  this.masm.cmp(this.input(node, 0), 0x0);
  var left = node.links[0].index;
  var right = node.links[1].index;

  var next = node.index + 1;
  if (left !== next)
    this.masm.jl('ne', left);
  if (right !== next)
    this.masm.jl('e', right);
});

builder.opcode('jump', function() {
  return {};
}, function(node) {
  var dst = node.links[0].index;
  if (dst !== node.index + 1)
    this.masm.jl(dst);
});

builder.opcode('int.call', function(node) {
  var counters = {
    int: x64.params.int.length,
    float: x64.params.float.length
  };

  return {
    output: this.int('register', 'rax'),
    inputs: node.inputs.map(function(input, i) {
      var type = node.literals[i + 1];
      var params;
      var def;
      if (type === 'f32' || type === 'f64') {
        params = x64.params.float;
        type = 'float';
        def = this.float;
      } else {
        params = x64.params.int;
        type = 'int';
        def = this.int;
      }

      var param;
      if (counters[type] <= 0)
        param = def('any');
      else
        param = def('register', params[params.length - counters[type]--]);

      return param;
    }, this),
    spills: this.spills
  };
}, function intCall(node) {
  var masm = this.masm;
  var fnIndex = node.literals[0];
  var output = this.output(node);

  // TODO(indutny): push some args to stack

  masm.call(output, this.table.get(fnIndex).label);
});

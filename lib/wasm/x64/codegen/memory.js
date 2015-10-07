'use strict';

var x64 = require('../');

var Codegen = require('./');

Codegen.prototype['x64:memory.space'] = function memorySpace(node) {
  this.masm.mov(this.output(node), x64.memory.space);
};

Codegen.prototype['x64:memory.size'] = function memorySize(node) {
  this.masm.mov(this.output(node), x64.memory.size);
};

Codegen.prototype['x64:memory.bounds-check'] = function memoryBounds(node) {
  var masm = this.masm;
  var output = this.output(node);
  var input = this.input(node, 0);
  var size = this.input(node, 1);

  var setValue = masm.label();
  var merge = masm.label();

  masm.lea(x64.scratch, [ input, node.literals[0] ]);
  masm.cmp(x64.scratch, size);

  masm.j('le', setValue);
  masm.xor(output, output);
  if (output === input) {
    masm.bind(setValue);
  } else {
    masm.j(merge);
    masm.bind(setValue);
    masm.mov(output, input);
  }
  masm.bind(merge);
};

Codegen.prototype['x64:i64.load'] = function i64load(node) {
  var output = this.output(node);
  var space = this.input(node, 0);
  var off = this.input(node, 1);
  this.masm.mov(output, [ space, off, 0 ]);
};

Codegen.prototype['x64:i64.store'] = function i64store(node) {
  var space = this.input(node, 0);
  var off = this.input(node, 1);
  var value = this.input(node, 2);
  this.masm.mov([ space, off, 0 ], value);
};

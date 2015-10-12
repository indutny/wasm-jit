'use strict';

var x64 = require('../');

var builder = require('./').builder;

builder.opcode('x64:memory.space', function() {
  return { output: this.int('register') };
}, function(node) {
  this.masm.mov(this.output(node), x64.memory.space);
});

builder.opcode('x64:memory.size', function() {
  return { output: this.int('register') };
}, function(node) {
  this.masm.mov(this.output(node), x64.memory.size);
});

builder.opcode('x64:memory.bounds-check', function() {
  return {
    output: this.int('register'),
    inputs: [ this.int('none'), this.int('register'), this.int('any') ]
  };
}, function(node) {
  var masm = this.masm;
  var output = this.output(node);
  var input = this.input(node, 1);
  var size = this.input(node, 2);

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
});

var access = [
  { size: 8, extend: '_s' },
  { size: 8, extend: '_u' },
  { size: 16, extend: '_s' },
  { size: 16, extend: '_u' },
  { size: 32, extend: '_s' },
  { size: 32, extend: '_u' },
  { size: 32, extend: '' },
  { size: 64, extend: '' }
];

access.forEach(function(item) {
  var size = item.size;
  var extend = item.extend;

  builder.opcode('x64:load' + size + extend, function() {
    return {
      output: this.int('register'),
      inputs: [ this.int('none'), this.int('register'), this.int('register') ]
    };
  }, function(node) {
    var masm = this.masm;

    var output = this.output(node);
    var space = this.input(node, 1);
    var off = this.input(node, 2);

    var op = [ space, off, 0 ];
    if (size === 64)
      masm.mov(output, op);
    else if (size === 32 && (extend === '' || extend === '_u'))
      masm.movl(output, op);
    else if (size === 32 && extend === '_s')
      masm.movsxl(output, op);
    else if (size === 16 && extend === '_u')
      masm.movzxw(output, op);
    else if (size === 16 && extend === '_s')
      masm.movsxw(output, op);
    else if (size === 8 && extend === '_u')
      masm.movzxb(output, op);
    else if (size === 8 && extend === '_s')
      masm.movsxb(output, op);
    else
      masm.int3();
  });
});

[ 8, 16, 32, 64 ].forEach(function(size) {
  builder.opcode('x64:store' + size, function() {
    return {
      inputs: [
        // State
        this.int('none'),

        // Real params
        this.int('register'), this.int('register'), this.int('register')
      ]
    };
  }, function(node) {
    var masm = this.masm;

    var space = this.input(node, 1);
    var off = this.input(node, 2);
    var value = this.input(node, 3);
    var op = [ space, off, 0 ];

    if (size === 64)
      masm.mov(op, value);
    else if (size === 32)
      masm.movl(op, value);
    else if (size === 16)
      masm.movw(op, value);
    else if (size === 8)
      masm.movb(op, value);
  });
});

[ 32, 64 ].forEach(function(size) {
  builder.opcode('x64:f' + size + '.load', function() {
    return {
      output: this.float('register'),
      inputs: [
        // State
        this.int('none'),

        // Real params
        this.int('register'), this.int('register')
      ]
    };
  }, function(node) {
    var masm = this.masm;

    var out = this.output(node);
    var space = this.input(node, 1);
    var off = this.input(node, 2);
    var op = [ space, off, 0 ];

    if (size === 64)
      masm.movq(out, op);
    else if (size === 32)
      masm.movd(out, op);
  });

  builder.opcode('x64:f' + size + '.store', function() {
    return {
      output: this.float('register'),
      inputs: [
        // State
        this.int('none'),

        // Real params
        this.int('register'), this.int('register'), this.int('register')
      ]
    };
  }, function(node) {
    var masm = this.masm;

    var space = this.input(node, 1);
    var off = this.input(node, 2);
    var value = this.input(node, 3);
    var op = [ space, off, 0 ];

    if (size === 64)
      masm.movq(op, value);
    else if (size === 32)
      masm.movd(op, value);
  });
});

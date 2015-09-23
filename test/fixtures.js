'use strict';

var assertText = require('assert-text');
assertText.options.trim = true;
var disasm = require('disasm');
var fixtures = require('./fixtures');

var wasm = require('../');

exports.fn2str = function fn2str(fn) {
  return fn.toString().replace(/^function[^{]+{\/\*|\*\/}$/g, '');
};

exports.testAsm = function testAsm(input, expected) {
  var c = wasm.Compiler.create();

  var info = c.generateCode(exports.fn2str(input));
  var asm = disasm.create('x64').disasm(info.buffer);
  asm = disasm.stringify(asm);

  assertText.equal(asm, exports.fn2str(expected));
};

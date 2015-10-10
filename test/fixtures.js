'use strict';

var assertText = require('assert-text');
assertText.options.trim = true;

var pipeline = require('json-pipeline');
var Reducer = require('json-pipeline-reducer');
var Scheduler = require('json-pipeline-scheduler');
var GVN = require('gvn');
var disasm = require('disasm');
var fixtures = require('./fixtures');

var wasm = require('../');

exports.fn2str = function fn2str(fn) {
  return fn.toString().replace(/^function[^{]+{\/\*|\*\/}$/g, '');
};

exports.testAsm = function testAsm(input, expected) {
  var c = wasm.Compiler.create();

  var info = c.generateCode(exports.fn2str(input)).reloc;
  var asm = disasm.create('x64').disasm(info.buffer);
  var pad = /int3\s*\n(\s*int3\s*\n)*/g;
  asm = disasm.stringify(asm).replace(pad, '(padding)\n');

  assertText.equal(asm, exports.fn2str(expected));
};

exports.testReduction = function testReduction(reduction, input, expected) {
  var p = pipeline.create('cfg');
  p.parse(exports.fn2str(input), { cfg: true }, 'printable');

  var reducer = Reducer.create();
  reducer.addReduction(reduction);
  reducer.reduce(p);

  var scheduled = Scheduler.create(p).run();
  scheduled.reindex();
  assertText.equal(scheduled.render({ cfg: true }, 'printable'),
                   exports.fn2str(expected));
};

exports.testGVN = function testGVN(relation, input, expected) {
  var p = pipeline.create('cfg');
  p.parse(exports.fn2str(input), { cfg: true }, 'printable');

  var gvn = GVN.create();
  gvn.addRelation(relation);

  var reducer = Reducer.create();
  reducer.addReduction(gvn);
  reducer.reduce(p);

  var scheduled = Scheduler.create(p).run();
  scheduled.reindex();
  assertText.equal(scheduled.render({ cfg: true }, 'printable'),
                   exports.fn2str(expected));
};

exports.compile = function compile(input) {
  var c = wasm.Compiler.create();

  return c.compile(exports.fn2str(input));
};

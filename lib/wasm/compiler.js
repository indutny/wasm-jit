'use strict';

var wasmAST = require('wasm-ast');
var wasmCFG = require('wasm-cfg');
var jit = require('jit.js');

var wasm = require('../wasm');
var Pipeline = wasm.Pipeline;

function Compiler() {
}
module.exports = Compiler;

Compiler.create = function create() {
  return new Compiler();
};

Compiler.prototype.generateCode = function generateCode(source) {
  var ast = wasmAST.parse(source, { index: true });
  var cfgs = wasmCFG.build(ast);

  // TODO(indutny): make this configurable
  var platform = wasm.platform.x64;

  var masm = jit.create(platform.arch);

  for (var i = 0; i < cfgs.length; i++) {
    var pair = cfgs[i];
    var pipeline = Pipeline.create(platform, pair.ast, pair.cfg);

    // TODO(indutny): labels
    pipeline.compile(masm);
  }

  return masm.compile();
};

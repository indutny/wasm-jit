'use strict';

var wasmAST = require('wasm-ast');
var wasmCFG = require('wasm-cfg');
var jit = require('jit.js');

var wasm = require('../wasm');
var Pipeline = wasm.Pipeline;
var RefTable = wasm.RefTable;

function Compiler() {
}
module.exports = Compiler;

Compiler.create = function create() {
  return new Compiler();
};

Compiler.prototype.generateCode = function generateCode(source) {
  var ast = wasmAST.parse(source, { index: true });
  var infos = wasmCFG.build(ast);

  // TODO(indutny): make this configurable
  var platform = wasm.platform.x64;

  var masm = jit.create(platform.arch);

  var table = new RefTable();
  for (var i = 0; i < infos.length; i++)
    table.direct[i] = masm.label();

  for (var i = 0; i < infos.length; i++) {
    var info = infos[i];
    var pipeline = Pipeline.create(platform, table, info);

    pipeline.compile(masm);
  }

  return masm.compile();
};

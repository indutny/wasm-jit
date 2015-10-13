'use strict';

var wasmAST = require('wasm-ast');
var wasmCFG = require('wasm-cfg');
var jit = require('jit.js');
var mmap = require('mmap.js');

var wasm = require('../wasm');
var Pipeline = wasm.Pipeline;
var RefTable = wasm.RefTable;

function Compiler() {
  this.namespace = {
    std: wasm.std.table
  };
}
module.exports = Compiler;

Compiler.create = function create() {
  return new Compiler();
};

Compiler.prototype.generateCode = function generateCode(module, source) {
  var table = new RefTable(this.namespace);

  var ast = wasmAST.parse(source, { index: true });
  var infos = wasmCFG.build(ast, table);

  // TODO(indutny): make this configurable
  var platform = wasm.platform.x64;

  var masm = jit.create(platform.arch);
  for (var i = 0; i < infos.length; i++) {
    var info = infos[i];
    table.register(info, masm.label());
  }

  if (module !== null)
    this.namespace[module] = table;

  for (var i = 0; i < infos.length; i++) {
    var info = infos[i];
    var pipeline = Pipeline.create(platform, table, info);

    pipeline.compile(masm);
  }

  return {
    reloc: masm.compile(),
    table: table
  };
};

Compiler.prototype.compile = function compile(module, source) {
  var info = this.generateCode(module, source);
  var reloc = info.reloc;

  var size = reloc.buffer.length;
  if (size % mmap.PAGE_SIZE !== 0)
    size += mmap.PAGE_SIZE - (size % mmap.PAGE_SIZE);

  var prot = mmap.PROT_READ | mmap.PROT_WRITE | mmap.PROT_EXEC;
  var flags = mmap.MAP_PRIVATE | mmap.MAP_ANON;
  var code = mmap.alloc(size, prot, flags, -1, 0);

  reloc.buffer.copy(code);
  reloc.resolve(code);
  info.table.finalize(code);

  var api = {};
  for (var i = 0; i < info.table.fn.length; i++) {
    var fn = info.table.fn[i];
    if (fn.signature.public)
      api[fn.name] = jit.toFunction(code.slice(fn.offset));
  }
  return api;
};

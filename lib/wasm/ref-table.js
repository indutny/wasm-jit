'use strict';

var assert = require('assert');
var wasmCFG = require('wasm-cfg');

function Entry(info, label) {
  this.index = info.index;
  this.name = info.name;
  this.signature = info.signature;
  this.label = label;
  this.offset = null;
  this.code = null;
}

function RefTable(namespace) {
  this.fn = [];
  this.fnByName = {};
  this.namespace = namespace;
}
module.exports = RefTable;

RefTable.prototype.register = function register(info, label) {
  var entry = new Entry(info, label);
  this.fn[entry.index] = entry;
  this.fnByName[entry.name] = entry;
  return entry;
};

RefTable.prototype._binding = function binding(result, name, params, code) {
  var info = {
    index: this.fn.length,
    name: name,
    signature: new wasmCFG.Signature(result, params)
  };
  var entry = this.register(info, null);
  entry.code = code;
  return entry;
};

RefTable.prototype.get = function get(module, index) {
  if (module === null)
    return this.fn[index];
  else
    return this.namespace[module].get(null, index);
};

RefTable.prototype.getByName = function getByName(module, name) {
  if (module === null)
    return this.fnByName[name];
  else
    return this.namespace[module].getByName(null, name);
};

RefTable.prototype.setOffset = function setOffset(index, offset) {
  this.fn[index].offset = offset;
};

RefTable.prototype.getExternal = function getExternal(module, name) {
  // TODO(indutny): dynamically load?
  assert(this.namespace.hasOwnProperty(module),
         'Module: ' + module + ' is unknown');
  var entry = this.namespace[module].getByName(null, name);
  assert(entry.signature.public,
         module + '::' + name + ' is not for public use');
  return entry;
};

RefTable.prototype.finalize = function finalize(buffer) {
  for (var i = 0; i < this.fn.length; i++) {
    var entry = this.fn[i];
    entry.code = buffer.slice(entry.offset);
    entry.label = null;
  }
};

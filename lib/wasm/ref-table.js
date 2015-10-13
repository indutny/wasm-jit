'use strict';

var assert = require('assert');

function Entry(info, label) {
  this.index = info.index;
  this.name = info.name;
  this.signature = info.signature;
  this.label = label;
  this.offset = null;
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
};

RefTable.prototype.get = function get(module, index) {
  if (module === null)
    return this.fn[index];
  else
    return this.external[module].getByName(index);
};

RefTable.prototype.getByName = function getByName(name) {
  return this.fnByName[name];
};

RefTable.prototype.setOffset = function setOffset(index, offset) {
  this.fn[index].offset = offset;
};

RefTable.prototype.getExternal = function getExternal(module, name) {
  // TODO(indutny): dynamically load?
  assert(this.namespace.hasOwnProperty(module),
         'Module: ' + module + ' is unknown');
  var entry = this.namespace[module].getByName(name);
  assert(entry.signature.public,
         module + '::' + name + ' is not for public use');
  return entry;
};

RefTable.prototype.finalize = function finalize() {
};

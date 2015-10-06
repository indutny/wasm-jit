'use strict';

function Entry(info, label) {
  this.index = info.index;
  this.name = info.name;
  this.signature = info.signature;
  this.label = label;
  this.offset = null;
}

function RefTable() {
  this.fn = [];
  this.fnByName = {};
  this.external = {};
}
module.exports = RefTable;

RefTable.prototype.register = function register(info, label) {
  var entry = new Entry(info, label);
  this.fn[entry.index] = entry;
  this.fnByName[entry.name] = entry;
};

RefTable.prototype.get = function get(index) {
  return this.fn[index];
};

RefTable.prototype.getByName = function getByName(name) {
  return this.fnByName[name];
};

RefTable.prototype.setOffset = function setOffset(index, offset) {
  this.fn[index].offset = offset;
};

RefTable.prototype.registerExternal = function registerExternal(name, table) {
  this.external[name] = table;
};

RefTable.prototype.getExternal = function getExternal(module, name) {
  return this.external[module].getByName(name);
};

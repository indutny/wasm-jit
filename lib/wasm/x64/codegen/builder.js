'use strict';

var util = require('util');
var linearscan = require('linearscan');

var wasm = require('../../../wasm');
var x64 = require('../');
var BaseBuilder = wasm.platform.base.Codegen.Builder;

function X64CodegenBuilder(Codegen) {
  BaseBuilder.call(this, Codegen);

  this.linearscan = linearscan.config.create({
    registers: x64.registers
  });
}
util.inherits(X64CodegenBuilder, BaseBuilder);
module.exports = X64CodegenBuilder;

function int(kind, value) {
  return { group: 'general', kind: kind, value: value };
}
X64CodegenBuilder.prototype.int = int;

function float(kind, value) {
  return { group: 'float', kind: kind, value: value };
}
X64CodegenBuilder.prototype.float = float;

X64CodegenBuilder.prototype.iterateTypes = function iterateTypes(body) {
  body('i32', int);
  body('i64', int);
  body('f32', float);
  body('f64', float);
};

var spills = x64.temporaryRegs.general.map(function(name) {
  return int('register', name);
}).concat(x64.temporaryRegs.float.map(function(name) {
  return float('register', name);
}));
X64CodegenBuilder.prototype.spills = spills;

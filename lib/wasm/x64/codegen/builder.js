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

function gp(kind, value) {
  return { group: 'general', kind: kind, value: value };
}
X64CodegenBuilder.prototype.gp = gp;

function fp(kind, value) {
  return { group: 'float', kind: kind, value: value };
}
X64CodegenBuilder.prototype.fp = fp;

X64CodegenBuilder.prototype.iterateTypes = function iterateTypes(body) {
  body('i8', gp);
  body('i16', gp);
  body('i32', gp);
  body('i64', gp);
  body('f32', fp);
  body('f64', fp);
};

var spills = x64.temporaryRegs.general.map(function(name) {
  return gp('register', name);
}).concat(x64.temporaryRegs.float.map(function(name) {
  return fp('register', name);
}));
X64CodegenBuilder.prototype.spills = spills;

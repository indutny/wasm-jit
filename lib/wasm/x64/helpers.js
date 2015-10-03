'use strict';

var x64 = require('./');
var registers = x64.registers;

function gp(kind, value) {
  return { group: 'general', kind: kind, value: value };
}
exports.gp = gp;

function fp(kind, value) {
  return { group: 'float', kind: kind, value: value };
}
exports.fp = fp;

function iterateTypes(body) {
  body('i8', gp);
  body('i16', gp);
  body('i32', gp);
  body('i64', gp);
  body('f32', fp);
  body('f64', fp);
}
exports.iterateTypes = iterateTypes;

var spills = registers.general.map(function(name) {
  return gp('register', name);
}).concat(registers.float.map(function(name) {
  return fp('register', name);
}));
exports.spills = spills;

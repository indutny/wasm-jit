'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function SelectX64Opcode() {
  Reducer.Reduction.call(this);

  this.space = null;
}
util.inherits(SelectX64Opcode, Reducer.Reduction);
module.exports = SelectX64Opcode;

SelectX64Opcode.prototype.start = function start(reducer) {
  this.space = reducer.graph.create('x64:memory.space');
  reducer.add(this.space);
};

SelectX64Opcode.prototype.end = function end() {
  this.space = null;
};

SelectX64Opcode.prototype.reduce = function reduce(node, reducer) {
  // Already replaced
  if (/^x64:/.test(node.opcode))
    return;

  if (/\.bool$/.test(node.opcode))
    return this.reduceBool(node, reducer);

  if (/\.ret$/.test(node.opcode))
    return this.reduceRet(node, reducer);

  if (/\.load/.test(node.opcode) || /\.store/.test(node.opcode))
    return this.reduceMemoryAccess(node, reducer);
};

SelectX64Opcode.prototype.reduceBool = function reduceBool(node, reducer) {
  if (/^f/.test(node.opcode))
    return;

  // Just replace with the input, we are ready to handle integers!
  reducer.replace(node, node.inputs[0]);
};

SelectX64Opcode.prototype.reduceRet = function reduceRet(node, reducer) {
  if (node.opcode === 'f32.ret' || node.opcode === 'f64.ret')
    node.opcode = 'x64:float.ret';
  else
    node.opcode = 'x64:int.ret';
  reducer.change(node);
};

SelectX64Opcode.prototype.reduceMemoryAccess = function reduceMemoryAccess(
    node, reducer) {
  // Prepend input to load/store

  var opcode = node.opcode;

  // Generalize opcode
  if (opcode === 'i64.store8' || opcode === 'i32.store8')
    opcode = 'int.store8';
  else if (opcode === 'i64.store16' || opcode === 'i32.store16')
    opcode = 'int.store16';
  else if (opcode === 'i32.load8_u' || opcode === 'i64.load8_u')
    opcode = 'int.load8_u';
  else if (opcode === 'i32.load8_s' || opcode === 'i64.load8_s')
    opcode = 'int.load8_s';
  else if (opcode === 'i32.load16_u' || opcode === 'i64.load16_u')
    opcode = 'int.load16_u';
  else if (opcode === 'i32.load16_s' || opcode === 'i64.load16_s')
    opcode = 'int.load16_s';

  var access = reducer.graph.create('x64:' + opcode, this.space);
  for (var i = 0; i < node.inputs.length; i++)
    access.addInput(node.inputs[i]);

  reducer.replace(node, access);
};

'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function SelectX64Opcode() {
  Reducer.Reduction.call(this);
}
util.inherits(SelectX64Opcode, Reducer.Reduction);
module.exports = SelectX64Opcode;

SelectX64Opcode.prototype.reduce = function reduce(node, reducer) {
  // Already replaced
  if (/^x64:/.test(node.opcode))
    return;

  if (/\.bool$/.test(node.opcode))
    return this.reduceBool(node, reducer);

  if (/\.ret$/.test(node.opcode))
    return this.reduceRet(node, reducer);
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

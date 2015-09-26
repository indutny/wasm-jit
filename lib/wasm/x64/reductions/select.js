var util = require('util');
var Reducer = require('json-pipeline-reducer');

var x64 = require('../');

function SelectX64Opcode() {
  Reducer.Reduction.call(this);
}
util.inherits(SelectX64Opcode, Reducer.Reduction);
module.exports = SelectX64Opcode;

SelectX64Opcode.prototype.reduce = function reduce(node, reducer) {
  // Already replaced
  if (/^x64:/.test(node.opcode))
    return;

  if (/\.param$/.test(node.opcode))
    return this.reduceParam(node, reducer);

  if (/\.bool$/.test(node.opcode))
    return this.reduceBool(node, reducer);
};

SelectX64Opcode.prototype.reduceParam = function reduceParam(node, reducer) {
  var params = /^i/.test(node.opcode) ? x64.params : x64.fpParams;
  var index = node.literals[0];

  if (index >= params.length)
    return;

  // Replace with register
  var reg = reducer.graph.create('x64:' + params[index]);
  reducer.replace(node, reg);
};

SelectX64Opcode.prototype.reduceBool = function reduceBool(node, reducer) {
  if (/^f/.test(node.opcode))
    return;

  // Just replace with the input, we are ready to handle integers!
  reducer.replace(node, node.inputs[0]);
};

'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function X64Cleanup() {
  Reducer.Reduction.call(this);
}
util.inherits(X64Cleanup, Reducer.Reduction);
module.exports = X64Cleanup;

X64Cleanup.prototype.reduce = function reduce(node, reducer) {
  if (node.opcode === 'x64:memory.space' &&
      node.uses.length === 0) {
    reducer.remove(node);
    return;
  }

  if (node.opcode === 'int.call' &&
      node.inputs[0].opcode === 'x64:memory.space') {
    node.removeInput(0);
    reducer.change(node);
    return;
  }
};

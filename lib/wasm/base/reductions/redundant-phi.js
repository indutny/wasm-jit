'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function RedundantPhi() {
  Reducer.Reduction.call(this);
}
util.inherits(RedundantPhi, Reducer.Reduction);
module.exports = RedundantPhi;

RedundantPhi.prototype.reduce = function reduce(node, reducer) {
  // Remove phis without uses
  if (node.opcode !== 'ssa:phi' || node.uses.length !== 0)
    return;

  for (var i = 0; i < node.inputs.length; i++)
    reducer.change(node.inputs[i]);
  reducer.remove(node);
};

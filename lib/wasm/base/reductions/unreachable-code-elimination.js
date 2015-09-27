'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function UnreachableCodeElimination() {
  Reducer.Reduction.call(this);

  this.unreachable = new Map();
}
util.inherits(UnreachableCodeElimination, Reducer.Reduction);
module.exports = UnreachableCodeElimination;

UnreachableCodeElimination.prototype.reduce = function reduce(node, reducer) {
  var remove;
  var propagate;
  if (node.opcode === 'ret' || /\.ret$/.test(node.opcode)) {
    remove = this.unreachable.get(node);
    propagate = true;
  } else {
    remove = this.unreachable.get(node);
    propagate = remove;
  }

  // Propagate `unreachable` mark
  if (!propagate)
    return;

  for (var i = 0; i < node.controlUses.length; i += 2) {
    var use = node.controlUses[i];

    // Do not propagate through blocks
    if (use.opcode === 'region' || use.opcode === 'start')
      continue;

    if (this.unreachable.has(use))
      continue;

    this.unreachable.set(use, true);
    reducer.change(use);
  }

  if (remove)
    reducer.remove(node);
};

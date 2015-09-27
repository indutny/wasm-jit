'use strict';

var util = require('util');
var Reducer = require('json-pipeline-reducer');

function UnreachableCodeElimination() {
  Reducer.Reduction.call(this);

  this.last = new Map();
}
util.inherits(UnreachableCodeElimination, Reducer.Reduction);
module.exports = UnreachableCodeElimination;

UnreachableCodeElimination.prototype.reduce = function reduce(node, reducer) {
  var remove;
  var propagate;
  if (node.opcode === 'ret' || /\.ret$/.test(node.opcode)) {
    remove = this.last.get(node);
    propagate = true;
    if (!remove)
      this.last.set(node, true);
  } else {
    remove = this.last.get(node);
    propagate = remove;
  }

  // Propagate `last` mark
  if (!propagate)
    return;

  for (var i = 0; i < node.controlUses.length; i += 2) {
    var use = node.controlUses[i];

    // Do not propagate through blocks
    if (use.opcode === 'region' || use.opcode === 'start')
      continue;

    if (this.last.has(use))
      continue;

    this.last.set(use, true);
    reducer.change(use);
  }

  if (remove)
    reducer.remove(node);
};

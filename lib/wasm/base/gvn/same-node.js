'use strict';

var util = require('util');
var GVN = require('gvn');

function SameNode(combo) {
  GVN.Relation.call(this);

  this.combo = combo;
}
util.inherits(SameNode, GVN.Relation);
module.exports = SameNode;

SameNode.prototype.hash = function hash(node, gvn) {
  // Control nodes and dangling blocks should not be touched
  if (node.isControl() || node.opcode === 'region')
    return;

  var hash = gvn.hash(node.opcode, 0);
  for (var i = 0; i < node.inputs.length; i++)
    hash = gvn.hash(node.inputs[i], hash);
  for (var i = 0; i < node.literals.length; i++)
    hash = gvn.hash(JSON.stringify(node.literals[i]), hash);

  return hash;
};

SameNode.prototype.areCongruent = function areCongruent(a, b) {
  if (a.opcode !== b.opcode)
    return false;

  if (a.inputs.length !== b.inputs.length ||
      a.literals.length !== b.literals.length) {
    return false;
  }

  for (var i = 0; i < a.inputs.length; i++)
    if (a.inputs[i] !== b.inputs[i])
      return false;

  for (var i = 0; i < a.literals.length; i++)
    if (JSON.stringify(a.literals[i]) !== JSON.stringify(b.literals[i]))
      return false;

  return true;
};

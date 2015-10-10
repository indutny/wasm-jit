'use strict';

var util = require('util');
var GVN = require('GVN');

function CommutativeMath(combo) {
  GVN.Relation.call(this);

  this.combo = combo;
}
util.inherits(CommutativeMath, GVN.Relation);
module.exports = CommutativeMath;

CommutativeMath.prototype.hash = function hash(node, gvn) {
  if (!/\.add$/.test(node.opcode))
    return;

  var hash = gvn.hash(node.inputs[0], 0) ^ gvn.hash(node.inputs[1], 0);
  return gvn.hash(node.opcode, hash);
};

CommutativeMath.prototype.areCongruent = function areCongruent(a, b) {
  if (a.opcode !== b.opcode)
    return false;

  if (a.inputs[0] === b.inputs[0] && a.inputs[1] === b.inputs[1])
    return true;
  if (a.inputs[0] === b.inputs[1] && a.inputs[1] === b.inputs[0])
    return true;

  return false;
};

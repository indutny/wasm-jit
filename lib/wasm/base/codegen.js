'use strict';

function Codegen(masm) {
  this.masm = masm;
}
module.exports = Codegen;

Codegen.prototype.operand = function operand(op) {
  if (op.kind === 'register')
    return op.value;

  if (op.kind === 'spill')
    return this.spill(op.value);
};

Codegen.prototype.out = function out(node) {
  return this.operand(node.output);
};

Codegen.prototype.input = function input(node, index) {
  return this.operand(node.inputs[index]);
};

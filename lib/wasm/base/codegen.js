'use strict';

function Codegen(masm, table) {
  this.masm = masm;
  this.table = table;
}
module.exports = Codegen;

Codegen.prototype.operand = function operand(op) {
  if (op.kind === 'register')
    return op.value;

  if (op.kind === 'spill')
    return this.spill(op.value);
};

Codegen.prototype.output = function output(node) {
  return this.operand(node.output);
};

Codegen.prototype.input = function input(node, index) {
  return this.operand(node.inputs[index]);
};

'use strict';

function CodegenBuilder(Codegen) {
  this.Codegen = Codegen;
  this.linearscan = null;
}
module.exports = CodegenBuilder;

CodegenBuilder.prototype.opcode = function opcode(name, desc, body) {
  if (desc.length !== 0) {
    // Dynamic opcode
    var self = this;
    this.linearscan.defineOpcode(name, function(node) {
      return desc.call(self, node);
    });
  } else {
    this.linearscan.defineOpcode(name, desc.call(this));
  }

  // Either static or dynamic definition
  this.Codegen.prototype[name] = body;
};

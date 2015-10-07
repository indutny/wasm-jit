'use strict';

var Codegen = require('./');

Codegen.prototype['if'] = function _if(node) {
  this.masm.cmp(this.input(node, 0), 0x0);
  var left = node.links[0].index;
  var right = node.links[1].index;

  var next = node.index + 1;
  if (left !== next)
    this.masm.jl('ne', left);
  if (right !== next)
    this.masm.jl('e', right);
};

Codegen.prototype['jump'] = function _jump(node) {
  var dst = node.links[0].index;
  if (dst !== node.index + 1)
    this.masm.jl(dst);
};

Codegen.prototype['int.call' ] = function intCall(node) {
  var masm = this.masm;
  var fnIndex = node.literals[0];
  var output = this.output(node);

  // TODO(indutny): push some args to stack

  masm.call(output, this.table.get(fnIndex).label);
};

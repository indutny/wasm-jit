'use strict';

var Codegen = require('./');

Codegen.prototype['i64.trunc_s_64'] = function i64truncS64(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvttsd2si(out, input);
};

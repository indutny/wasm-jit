'use strict';

exports.InlineParams = require('./inline-params');
exports.UnreachableCodeElimination = require('./unreachable-code-elimination');

exports.list = [
  exports.InlineParams,
  exports.UnreachableCodeElimination
];

'use strict';

exports.InlineParams = require('./inline-params');
exports.DeadCodeElimination = require('./dead-code-elimination');

exports.list = [
  exports.InlineParams,
  exports.DeadCodeElimination
];

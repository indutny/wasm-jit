'use strict';

exports.Select = require('./select');
exports.LIRCleanup = require('./lir-cleanup');

exports.stages = {
  platform: [
    exports.Select
  ],
  lir: [
    exports.LIRCleanup
  ]
};

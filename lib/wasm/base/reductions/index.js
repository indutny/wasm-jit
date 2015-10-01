'use strict';

exports.InlineParams = require('./inline-params');
exports.Select = require('./select');
exports.ComboAnalysis = require('./combo-analysis');

exports.stages = {
  generic: [
    exports.ComboAnalysis,
    exports.Select
  ],
  platform: [
    exports.InlineParams
  ]
};

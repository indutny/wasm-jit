'use strict';

exports.InlineParams = require('./inline-params');
exports.Select = require('./select');
exports.RedundantPhi = require('./redundant-phi');
exports.ComboAnalysis = require('./combo-analysis');

exports.stages = {
  generic: [
    exports.ComboAnalysis,
    exports.Select,
    exports.RedundantPhi
  ],
  platform: [
    exports.InlineParams
  ]
};

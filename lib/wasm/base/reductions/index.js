'use strict';

exports.InlineParams = require('./inline-params');
exports.ComboAnalysis = require('./combo-analysis');

exports.stages = {
  generic: [
    exports.ComboAnalysis
  ],
  platform: [
    exports.InlineParams
  ]
};

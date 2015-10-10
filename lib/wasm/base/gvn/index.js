'use strict';

exports.SameNode = require('./same-node');
exports.CommutativeMath = require('./commutative-math');

exports.stages = {
  generic: [
    exports.SameNode,
    exports.CommutativeMath
  ],
  platform: [
    exports.SameNode
  ]
};

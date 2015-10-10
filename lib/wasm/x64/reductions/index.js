'use strict';

exports.Select = require('./select');

exports.stages = {
  platform: [
    exports.Select
  ]
};

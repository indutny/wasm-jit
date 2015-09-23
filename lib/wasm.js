'use strict';

exports.platform = {};
exports.platform.base = require('./wasm/base');

// TODO(indutny): accessors
exports.platform.x64 = require('./wasm/x64');

exports.Pipeline = require('./wasm/pipeline');
exports.Compiler = require('./wasm/compiler');

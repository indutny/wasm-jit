'use strict';

exports.types = [ 'i8', 'i16', 'i32', 'i64', 'f32', 'f64' ];

exports.platform = {};
exports.platform.base = require('./wasm/base');

// TODO(indutny): accessors
exports.platform.x64 = require('./wasm/x64');

exports.RefTable = require('./wasm/ref-table');
exports.Pipeline = require('./wasm/pipeline');
exports.Compiler = require('./wasm/compiler');

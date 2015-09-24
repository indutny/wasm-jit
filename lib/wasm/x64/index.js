'use strict';

exports.arch = 'x64';
exports.ptrSize = 8;
exports.scratch = 'r15';

exports.Codegen = require('./codegen');
exports.linearscan = require('./linearscan');

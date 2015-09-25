'use strict';

exports.arch = 'x64';
exports.ptrSize = 8;
exports.scratch = 'r15';
exports.params = [ 'rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9' ];
exports.fpParams = [
  'xmm0', 'xmm1', 'xmm2', 'xmm3',
  'xmm4', 'xmm5', 'xmm6', 'xmm7'
];

exports.Codegen = require('./codegen');
exports.linearscan = require('./linearscan');

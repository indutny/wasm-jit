'use strict';

exports.arch = 'x64';
exports.ptrSize = 8;
exports.context = 'r14';
exports.scratch = 'r15';
exports.params = [ 'rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9' ];
exports.fpParams = [
  'xmm0', 'xmm1', 'xmm2', 'xmm3',
  'xmm4', 'xmm5', 'xmm6', 'xmm7'
];

exports.registers = {
  general: [
    'rax', 'rbx', 'rcx', 'rdx',
    'rdi', 'rsi', 'r8', 'r9',
    'r10', 'r11', 'r12', 'r13'

    // r14 - context
    // TODO(indutny): get rid of scratch
    // r15 - scratch
  ],
  float: [
    'xmm0', 'xmm1', 'xmm2', 'xmm3',
    'xmm4', 'xmm5', 'xmm6', 'xmm7',
    'xmm8', 'xmm9', 'xmm10', 'xmm11',
    'xmm12', 'xmm13', 'xmm14', 'xmm15'
  ]
};

exports.Codegen = require('./codegen');
exports.linearscan = require('./linearscan');

exports.reductions = require('./reductions');

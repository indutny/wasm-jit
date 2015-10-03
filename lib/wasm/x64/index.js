'use strict';

var x64 = exports;

x64.prefix = 'x64';
x64.arch = 'x64';
x64.ptrSize = 8;
x64.context = 'r14';
x64.memory = {
  space: [ x64.context, x64.ptrSize * 0 ],
  size: [ x64.context, x64.ptrSize * 1 ]
};
x64.scratch = 'r15';
x64.params = {
  int: [ 'rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9' ],
  float: [ 'xmm0', 'xmm1', 'xmm2', 'xmm3', 'xmm4', 'xmm5', 'xmm6', 'xmm7' ]
};

x64.registers = {
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

x64.helpers = require('./helpers');
x64.Codegen = require('./codegen');
x64.opcodes = require('./opcodes');
x64.linearscan = require('./linearscan');

x64.reductions = require('./reductions');

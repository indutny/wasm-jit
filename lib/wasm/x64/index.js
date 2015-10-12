'use strict';

var x64 = exports;

x64.prefix = 'x64';
x64.arch = 'x64';
x64.ptrSize = 8;
x64.context = 'rdi';
x64.memory = {
  space: [ x64.context, x64.ptrSize * 0 ],
  size: [ x64.context, x64.ptrSize * 1 ]
};
x64.scratch = 'r15';
x64.floatScratch = 'xmm15';
x64.params = {
  int: [ 'rsi', 'rdx', 'rcx', 'r8', 'r9' ],
  float: [ 'xmm0', 'xmm1', 'xmm2', 'xmm3', 'xmm4', 'xmm5', 'xmm6', 'xmm7' ]
};

x64.registers = {
  general: [
    'rax', 'rcx', 'rdx', 'rsi', 'r8', 'r9', 'r10', 'r11',

    // Allocate callee-save registers only as a last resort
    'rbx', 'r12', 'r13', 'r14'

    // rdi - context (aka `this` in C++)
    // TODO(indutny): get rid of scratch
    // r15 - scratch
  ],
  float: [
    'xmm0', 'xmm1', 'xmm2', 'xmm3',
    'xmm4', 'xmm5', 'xmm6', 'xmm7',
    'xmm8', 'xmm9', 'xmm10', 'xmm11',
    'xmm12', 'xmm13', 'xmm14'
  ]
};

// Non callee-save registers
x64.temporaryRegs = {
  general: [
    'rax', 'rcx', 'rdx', 'rsi',
    'r8', 'r9', 'r10', 'r11'
  ],
  float: x64.registers.float
};

x64.calleeSaveRegs = {
  general: [ 'rbx', 'r12', 'r13', 'r14', 'r15' ],
  float: []
};

x64.Codegen = require('./codegen');

x64.reductions = require('./reductions');
x64.gvn = require('./gvn');

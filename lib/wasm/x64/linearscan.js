'use strict';

var linearscan = require('linearscan');

module.exports = linearscan.config.create({
  registers: [
    'rax', 'rbx', 'rcx', 'rdx',
    'rsi', 'r8', 'r9', 'r10',
    'r11', 'r12', 'r13', 'r14', 'r15'
  ],

  // TODO(indutny): register groups in linearscan
  opcodes: {
    'if': {},
    'jump': {},

    'ssa:phi': { output: 'any', inputs: [ 'any', 'any' ] },

    'i8.const': { output: 'any' },
    'i16.const': { output: 'any' },
    'i32.const': { output: 'any' },
    'i64.const': { output: 'any' },

    'i8.param': { output: 'register' },
    'i16.param': { output: 'register' },
    'i32.param': { output: 'register' },
    'i64.param': { output: 'register' },

    'i8.ret': { inputs: [ { kind: 'register', value: 'rax' } ] },
    'i16.ret': { inputs: [ { kind: 'register', value: 'rax' } ] },
    'i32.ret': { inputs: [ { kind: 'register', value: 'rax' } ] },
    'i64.ret': { inputs: [ { kind: 'register', value: 'rax' } ] },

    'i64.add': {
      output: 'register',
      inputs: [
        'register',
        'any'
      ]
    }
  }
});

'use strict';

var linearscan = require('linearscan');

var x64 = require('./');

function gp(kind, value) {
  return { group: 'general', kind: kind, value: value };
}

function fp(kind, value) {
  return { group: 'float', kind: kind, value: value };
}

module.exports = linearscan.config.create({
  registers: {
    general: [
      'rax', 'rbx', 'rcx', 'rdx',
      'rsi', 'r8', 'r9', 'r10',
      'r11', 'r12', 'r13', 'r14'
    ],
    float: [
      'xmm0', 'xmm1', 'xmm2', 'xmm3',
      'xmm4', 'xmm5', 'xmm6', 'xmm7',
      'xmm8', 'xmm9', 'xmm10', 'xmm11',
      'xmm12', 'xmm13', 'xmm14', 'xmm15'
    ]
  },

  // TODO(indutny): register groups in linearscan
  opcodes: {
    'if': { inputs: [ gp('any') ] },
    'jump': {},

    'i8.const': { output: gp('any') },
    'i16.const': { output: gp('any') },
    'i32.const': { output: gp('any') },
    'i64.const': { output: gp('any') },
    'f32.const': { output: fp('any') },
    'f64.const': { output: fp('any') },

    'i8.param': { output: gp('register') },
    'i16.param': { output: gp('register') },
    'i32.param': { output: gp('register') },
    'i64.param': { output: gp('register') },
    'f32.param': { output: fp('register') },
    'f64.param': { output: fp('register') },

    'i8.bool': { output: gp('register'), inputs: [ gp('any') ] },
    'i16.bool': { output: gp('register'), inputs: [ gp('any') ] },
    'i32.bool': { output: gp('register'), inputs: [ gp('any') ] },
    'i64.bool': { output: gp('register'), inputs: [ gp('any') ] },
    'f32.bool': { output: gp('register'), inputs: [ fp('any') ] },
    'f64.bool': { output: gp('register'), inputs: [ fp('any') ] },

    'ret': { inputs: [] },
    'i8.ret': { inputs: [ gp('register', 'rax') ] },
    'i16.ret': { inputs: [ gp('register', 'rax') ] },
    'i32.ret': { inputs: [ gp('register', 'rax') ] },
    'i64.ret': { inputs: [ gp('register', 'rax') ] },
    'f32.ret': { inputs: [ fp('register', 'xmm0') ] },
    'f64.ret': { inputs: [ fp('register', 'xmm0') ] },

    'i64.add': {
      output: gp('register'),
      inputs: [
        gp('register'),
        gp('any')
      ]
    },

    'f64.add': {
      output: fp('register'),
      inputs: [
        fp('register'),
        fp('any')
      ]
    }
  }
});

'use strict';

var linearscan = require('linearscan');

var x64 = require('./');

function gp(kind, value) {
  return { group: 'general', kind: kind, value: value };
}

function fp(kind, value) {
  return { group: 'float', kind: kind, value: value };
}

var registers = x64.registers;

function iterateTypes(body) {
  body('i8', gp);
  body('i16', gp);
  body('i32', gp);
  body('i64', gp);
  body('f32', fp);
  body('f64', fp);
}

var opcodes = {
  'if': { inputs: [ gp('any') ] },
  'jump': {},

  'ret': { inputs: [] },

  'x64:int.ret': { inputs: [ gp('register', 'rax') ] },
  'x64:float.ret': { inputs: [ fp('register', 'xmm0') ] },

  'x64:int.param': { output: gp('any') },
  'x64:f32.param': { output: fp('any') },
  'x64:f64.param': { output: fp('any') },

  'i64.add': {
    output: gp('register'),
    inputs: [ gp('any'), gp('any') ]
  },

  'f64.add': {
    output: fp('register'),
    inputs: [ fp('any'), fp('any') ]
  },

  'i64.trunc_s_64': {
    output: gp('any'),
    inputs: [ fp('register') ]
  }
};

iterateTypes(function(type, group) {
  opcodes[type + '.const'] = { output: group('any') };

  // Otheres are used directly without `.bool` conversion
  if (type === 'f32' || type === 'f64') {
    opcodes[type + '.bool'] = {
      output: gp('register'),
      inputs: [ group('any') ]
    };
  }
});

function regOpcode(group, name) {
  opcodes['x64:' + name] = { output: group('register', name) };
}

registers.general.forEach(function(name) {
  regOpcode(gp, name);
});

registers.float.forEach(function(name) {
  regOpcode(fp, name);
});

var config = {
  registers: registers,
  opcodes: opcodes
};

module.exports = linearscan.config.create(config);

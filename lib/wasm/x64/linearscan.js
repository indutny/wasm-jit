'use strict';

var linearscan = require('linearscan');

var x64 = require('./');
var registers = x64.registers;
var gp = x64.helpers.gp;
var fp = x64.helpers.fp;
var iterateTypes = x64.helpers.iterateTypes;

var opcodes = {
  'if': { inputs: [ gp('any') ] },
  'jump': {},

  'ret': { inputs: [] },

  'x64:int.ret': { inputs: [ gp('register', 'rax') ] },
  'x64:float.ret': { inputs: [ fp('register', 'xmm0') ] },

  'x64:int.param': { output: gp('any') },
  'x64:f32.param': { output: fp('any') },
  'x64:f64.param': { output: fp('any') },

  'x64:memory.space': { output: gp('register') },
  'x64:memory.size': { output: gp('register') },
  'x64:memory.bounds-check': {
    output: gp('register'),
    inputs: [ gp('register'), gp('any') ]
  },

  'x64:i64.load': {
    output: gp('register'),
    inputs: [ gp('register'), gp('register') ]
  },
  'x64:i64.store': {
    inputs: [ gp('register'), gp('register'), gp('register') ]
  },

  'int.add': {
    output: gp('register'),
    inputs: [ gp('any'), gp('any') ]
  },

  'f32.add': {
    output: fp('register'),
    inputs: [ fp('any'), fp('any') ]
  },
  'f64.add': {
    output: fp('register'),
    inputs: [ fp('any'), fp('any') ]
  },

  'i64.trunc_s_64': {
    output: gp('any'),
    inputs: [ fp('register') ]
  },

  // Dynamic opcodes
  'int.call': x64.opcodes.intCall
};

iterateTypes(function(type, group) {
  opcodes[type + '.const'] = { output: group('any') };

  // Others are used directly without `.bool` conversion
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

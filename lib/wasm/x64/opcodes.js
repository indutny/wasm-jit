'use strict';

var x64 = require('./');
var gp = x64.helpers.gp;
var fp = x64.helpers.fp;
var spills = x64.helpers.spills;

var opcodes = exports;

opcodes.intCall = function intCall(node) {
  var counters = {
    int: x64.params.int.length,
    float: x64.params.float.length
  };

  return {
    output: gp('register', 'rax'),
    inputs: node.inputs.map(function(input, i) {
      var type = node.literals[i + 1];
      var params;
      var def;
      if (type === 'f32' || type === 'f64') {
        params = x64.params.float;
        type = 'float';
        def = fp;
      } else {
        params = x64.params.int;
        type = 'int';
        def = gp;
      }

      var param;
      if (counters[type] <= 0)
        param = def('any');
      else
        param = def('register', params[params.length - counters[type]--]);

      return param;
    }),
    spills: spills
  };
};

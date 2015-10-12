'use strict';

var builder = require('./').builder;

builder.opcode('i32.wrap', function() {
  return {
    output: this.int('register'), inputs: [ this.int('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.movl(out, input);
});

builder.opcode('x64:change-u32-to-i64', function() {
  return {
    output: this.int('register'), inputs: [ this.int('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.movl(out, input);
});

builder.opcode('x64:change-s32-to-i64', function() {
  return {
    output: this.int('register'), inputs: [ this.int('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.movsxl(out, input);
});

var trunc = [
  { result: 32, signed: false, input: 32 },
  { result: 32, signed: true, input: 32 },
  { result: 32, signed: false, input: 64 },
  { result: 32, signed: true, input: 64 },
  { result: 64, signed: false, input: 32 },
  { result: 64, signed: true, input: 32 },
  { result: 64, signed: false, input: 64 },
  { result: 64, signed: true, input: 64 }
];

trunc.forEach(function(info) {
  var result = info.result;
  var signed = info.signed;
  var inputSize = info.input;

  // Float to int
  var key = 'i' + result + '.trunc_' + (signed ? 's_' : 'u_') + inputSize;

  builder.opcode(key, function() {
    return {
      output: this.int('any'), inputs: [ this.float('register') ]
    };
  }, function(node) {
    var out = this.output(node);
    var input = this.input(node, 0);

    if (result === 64) {
      if (inputSize === 64)
        this.masm.cvttsd2si(out, input);
      else
        this.masm.cvttss2si(out, input);
    } else {
      if (inputSize === 64)
        this.masm.cvttsd2sil(out, input);
      else
        this.masm.cvttss2sil(out, input);

      if (signed)
        this.masm.movsxl(out, out);
      else
        this.masm.movl(out, out);
    }
  });

  // Int to float
  key = 'f' + inputSize + '.convert_' + (signed ? 's_' : 'u_') + result;

  builder.opcode(key, function() {
    return {
      output: this.float('register'), inputs: [ this.int('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var input = this.input(node, 0);

    if (result === 64) {
      if (inputSize === 64)
        this.masm.cvtsi2sd(out, input);
      else
        this.masm.cvtsi2ss(out, input);
    } else {
      if (inputSize === 64)
        this.masm.cvtsi2sdl(out, input);
      else
        this.masm.cvtsi2ssl(out, input);
    }
  });
});

[ 32, 64 ].forEach(function(size) {
  builder.opcode('i' + size + '.reinterpret', function() {
    return {
      output: this.int('register'), inputs: [ this.float('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var input = this.input(node, 0);

    this.masm.movq(out, input);
  });

  builder.opcode('f' + size + '.reinterpret', function() {
    return {
      output: this.float('register'), inputs: [ this.int('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var input = this.input(node, 0);

    this.masm.movq(out, input);
  });
});

builder.opcode('f32.demote', function() {
  return {
    output: this.float('register'), inputs: [ this.float('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvtsd2ss(out, input);
});

builder.opcode('f64.promote', function() {
  return {
    output: this.float('register'), inputs: [ this.float('any') ]
  };
}, function(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvtss2sd(out, input);
});

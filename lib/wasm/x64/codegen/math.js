'use strict';

var x64 = require('../');
var builder = require('./').builder;

function intMath(type, name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register'),
      inputs: [ this.int('any'), this.int('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      if (type === 'comm') {
        other = left;
      } else {
        this.masm.mov(x64.scratch, left);
        generate.call(this, x64.scratch, right);
        this.masm.mov(out, x64.scratch);
        return;
      }
    } else {
      this.masm.mov(out, left);
      other = right;
    }
    generate.call(this, out, other);
  });
}

intMath('comm', 'x64:int.add', function(out, other) {
  this.masm.add(out, other);
});

intMath('non-comm', 'x64:int.sub', function(out, other) {
  this.masm.sub(out, other);
});

intMath('comm', 'x64:int.mul', function(out, other) {
  this.masm.imul(out, other);
});

intMath('comm', 'x64:int.and', function(out, other) {
  this.masm.and(out, other);
});

intMath('comm', 'x64:int.xor', function(out, other) {
  this.masm.xor(out, other);
});

intMath('comm', 'x64:int.or', function(out, other) {
  this.masm.or(out, other);
});

function intDiv(type, name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register', type === 'rem' ? 'rdx' : 'rax'),
      scratches: [ this.int('register', 'rdx') ],
      inputs: [ this.int('register', 'rax'), this.int('any') ]
    };
  }, function(node) {
    generate.call(this, this.input(node, 1));
  });
}

var divs = [
  { type: 'div', result: 64, signed: false },
  { type: 'div', result: 64, signed: true },
  { type: 'div', result: 32, signed: true },
  { type: 'div', result: 32, signed: true },
  { type: 'rem', result: 64, signed: false },
  { type: 'rem', result: 64, signed: true },
  { type: 'rem', result: 32, signed: true },
  { type: 'rem', result: 32, signed: true }
];

divs.forEach(function(div) {
  var type = div.type;
  var result = div.result;
  var signed = div.signed;

  var key = 'i' + result + '.' + type + (signed ? '_s' : '_u');
  intDiv(type, key, function(input) {
    if (signed) {
      if (result === 64) {
        this.masm.cqo();
        this.masm.idiv(input);
      } else {
        this.masm.cdq();
        this.masm.idivl(input);
      }
    } else {
      this.masm.xor('rdx', 'rdx');
      if (result === 64)
        this.masm.div(input);
      else
        this.masm.divl(input);
    }
  });
});

function intUnary(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register'), inputs: [ this.int('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var input = this.input(node, 0);

    generate.call(this, out, input);
  });
}

intUnary('i32.clz', function(out, input) {
  this.masm.lzcntl(out, input);
});

intUnary('i64.clz', function(out, input) {
  this.masm.lzcnt(out, input);
});

intUnary('i32.ctz', function(out, input) {
  this.masm.tzcntl(out, input);
});

intUnary('i64.ctz', function(out, input) {
  this.masm.tzcnt(out, input);
});

intUnary('i32.popcnt', function(out, input) {
  this.masm.popcntl(out, input);
});

intUnary('i64.popcnt', function(out, input) {
  this.masm.popcnt(out, input);
});

function shiftIntMath(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register'),
      inputs: [ this.int('any'), this.int('register', 'rcx') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      this.masm.mov(x64.scratch, left);
      generate.call(this, x64.scratch, right);
      this.masm.mov(out, x64.scratch);
      return;
    } else {
      this.masm.mov(out, left);
      other = right;
    }

    generate.call(this, out, other);
  });
}

shiftIntMath('x64:int.shl', function(out, other) {
  this.masm.shl(out, other);
});

shiftIntMath('i64.shr_s', function(out, other) {
  this.masm.sar(out, other);
});

shiftIntMath('i64.shr_u', function(out, other) {
  this.masm.shr(out, other);
});

shiftIntMath('i32.shr_s', function(out, other) {
  this.masm.sarl(out, other);
});

shiftIntMath('i32.shr_u', function(out, other) {
  this.masm.shrl(out, other);
});

//
// Floating point opcodes
//

function floatMath(type, name, size, generate) {
  builder.opcode(name, function() {
    return {
      output: this.float('register'),
      scratches: type === 'comm' ? [] : [ this.float('register', 'xmm15') ],
      inputs: [ this.float('any'), this.float('any') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var other;
    if (out === left) {
      other = right;
    } else if (out === right) {
      if (type === 'comm') {
        other = left;
      } else {
        this.masm.movsd('xmm15', left);
        generate.call(this, 'xmm15', right);
        this.masm.movsd(out, 'xmm15');
      }
      return;
    } else {
      if (size === 32)
        this.masm.movss(out, left);
      else
        this.masm.movsd(out, left);
      other = right;
    }
    generate.call(this, out, other);
  });
}

[ 32, 64 ].forEach(function(size) {
  floatMath('comm', 'f' + size + '.add', size, function(out, other) {
    if (size === 32)
      this.masm.addss(out, other);
    else
      this.masm.addsd(out, other);
  });

  floatMath('comm', 'f' + size + '.mul', size, function(out, other) {
    if (size === 32)
      this.masm.mulss(out, other);
    else
      this.masm.mulsd(out, other);
  });

  floatMath('non-comm', 'f' + size + '.sub', size, function(out, other) {
    if (size === 32)
      this.masm.subss(out, other);
    else
      this.masm.subsd(out, other);
  });

  floatMath('non-comm', 'f' + size + '.div', size, function(out, other) {
    if (size === 32)
      this.masm.divss(out, other);
    else
      this.masm.divsd(out, other);
  });

  floatMath('comm', 'f' + size + '.max', size, function(out, other) {
    if (size === 32)
      this.masm.maxss(out, other);
    else
      this.masm.maxsd(out, other);
  });

  floatMath('comm', 'f' + size + '.min', size, function(out, other) {
    if (size === 32)
      this.masm.minss(out, other);
    else
      this.masm.minsd(out, other);
  });
});

function floatUnary(name, generator) {
  builder.opcode(name, function() {
    return {
      output: this.float('register'),
      inputs: [ this.float('any') ]
    };
  }, function(node) {
    var output = this.output(node);
    var input = this.input(node, 0);
    generator.call(this, output, input);
  });
}

floatUnary('f64.sqrt', function(out, input) {
  this.masm.sqrtsd(out, input);
});

floatUnary('f32.sqrt', function(out, input) {
  this.masm.sqrtss(out, input);
});

floatUnary('f64.ceil', function(out, input) {
  this.masm.roundsd('up', out, input);
});

floatUnary('f32.ceil', function(out, input) {
  this.masm.roundss('up', out, input);
});

floatUnary('f64.floor', function(out, input) {
  this.masm.roundsd('down', out, input);
});

floatUnary('f32.floor', function(out, input) {
  this.masm.roundss('down', out, input);
});

floatUnary('f64.nearest', function(out, input) {
  this.masm.roundsd('nearest', out, input);
});

floatUnary('f32.nearest', function(out, input) {
  this.masm.roundss('nearest', out, input);
});

floatUnary('f64.trunc', function(out, input) {
  this.masm.roundsd('zero', out, input);
});

floatUnary('f32.trunc', function(out, input) {
  this.masm.roundss('zero', out, input);
});

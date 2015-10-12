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

function intDiv(name, generate) {
  builder.opcode(name, function() {
    return {
      output: this.int('register', 'rax'),
      scratches: [ this.int('register', 'rdx') ],
      inputs: [ this.int('register', 'rax'), this.int('any') ]
    };
  }, function(node) {
    generate.call(this, this.input(node, 1));
  });
}

intDiv('i64.div_u', function(input) {
  this.masm.xor('rdx', 'rdx');
  this.masm.div(input);
});

intDiv('i64.div_s', function(input) {
  this.masm.xor('rdx', 'rdx');
  this.masm.idiv(input);
});

intDiv('i32.div_u', function(input) {
  this.masm.xor('rdx', 'rdx');
  this.masm.divl(input);
});

intDiv('i32.div_s', function(input) {
  this.masm.xor('rdx', 'rdx');
  this.masm.idivl(input);
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

//
// Floating point opcodes
//

function floatMath(type, name, size, generate) {
  builder.opcode(name, function() {
    return {
      output: this.float('register'),
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
      other = left;
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
});

'use strict';

var builder = require('./').builder;

function unaryBoolean(name, operand, generator) {
  builder.opcode(name, function() {
    return {
      output: this.int('any'),
      inputs: [ operand('register'), operand('register') ]
    };
  }, function(node) {
    var out = this.output(node);
    var left = this.input(node, 0);
    var right = this.input(node, 1);

    var cond = generator.call(this, left, right);
    this.masm.set(cond, out);
  });
}

var floatConditions = [
  { name: 'eq', asm: 'e' },
  { name: 'ne', asm: 'ne' },
  { name: 'lt', asm: 'l' },
  { name: 'le', asm: 'le' },
  { name: 'gt', asm: 'g' },
  { name: 'ge', asm: 'ge' }
];

[ 'f32', 'f64' ].forEach(function(type) {
  floatConditions.forEach(function(cond) {
    unaryBoolean(type + '.' + cond.name, builder.float, function(left, right) {
      if (type === 'f32')
        this.masm.ucomiss(left, right);
      else
        this.masm.ucomisd(left, right);

      return cond.asm;
    });
  });
});

var intConditions = [
  { name: 'eq', asm: 'e', unsigned: true },
  { name: 'ne', asm: 'ne', unsigned: true },
  { name: 'lt_u', asm: 'b' },
  { name: 'le_u', asm: 'be' },
  { name: 'gt_u', asm: 'a' },
  { name: 'ge_u', asm: 'ae' },
  { name: 'lt_s', asm: 'l' },
  { name: 'le_s', asm: 'le' },
  { name: 'gt_s', asm: 'g' },
  { name: 'ge_s', asm: 'ge' }
];

intConditions.forEach(function(cond) {
  // NOTE: i32->i64 truncation should be done by Select reducer
  unaryBoolean('i64.' + cond.name, builder.int, function(left, right) {
    this.masm.cmp(left, right);

    return cond.asm;
  });
});

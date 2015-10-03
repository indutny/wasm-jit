'use strict';

var util = require('util');
var BN = require('bn.js');
var Buffer = require('buffer').Buffer;

var wasm = require('../../wasm');
var x64 = require('./');

function Codegen(masm, table) {
  wasm.platform.base.Codegen.call(this, masm, table);

  this.lastEpilogue = -1;
}
util.inherits(Codegen, wasm.platform.base.Codegen);
module.exports = Codegen;

Codegen.prototype.spill = function spill(index) {
  return [ 'rbp', -x64.ptrSize * (1 + index) ];
};

Codegen.prototype.param = function param(index) {
  return [ 'rbp', x64.ptrSize * (2 + index) ];
};

Codegen.prototype.prologue = function prologue(pipeline, info) {
  var masm = this.masm;

  // Align code
  var pad = masm.getOffset() % (x64.ptrSize * 2);
  if (pad !== 0)
    pad = x64.ptrSize * 2 - pad;
  for (; pad > 0; pad--)
    masm.int3();

  masm.bind(this.table.direct[info.index]);
  masm.push('rbp');
  masm.mov('rbp', 'rsp');

  // Spills have equal size for x64
  var spillSize = 0;
  for (var i = 0; i < pipeline.spillType.length; i++)
    spillSize = Math.max(pipeline.spillType[i].to, spillSize);

  // Align spills
  if (spillSize % 2 !== 0)
    spillSize++;
  spillSize *= x64.ptrSize;

  if (spillSize !== 0)
    masm.sub('rsp', spillSize);
};

Codegen.prototype.epilogue = function epilogue(node) {
  if (!node && this.masm.getOffset() === this.lastEpilogue)
    return;

  this.masm.mov('rsp', 'rbp');
  this.masm.pop('rbp');
  this.masm.ret();

  this.lastEpilogue = this.masm.getOffset();
};

//
// Jumps and linearscan moves
//

Codegen.prototype['if'] = function _if(node) {
  this.masm.test(this.input(node, 0), 0);
  var left = node.links[0].index;
  var right = node.links[1].index;

  var next = node.index + 1;
  if (left !== next)
    this.masm.j('ne', left);
  if (right !== next)
    this.masm.j('e', right);
};

Codegen.prototype['jump'] = function _jump(node) {
  var dst = node.links[0].index;
  if (dst !== node.index + 1)
    this.masm.j(dst);
};

Codegen.prototype['ls:move.general'] = function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.mov(dst, src);
};

Codegen.prototype['ls:swap.general'] = function swap(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  if (Array.isArray(dst) && Array.isArray(src)) {
    masm.mov(x64.scratch, dst);
    masm.mov(dst, src);
    masm.mov(src, x64.scratch);
  } else {
    masm.xchg(dst, src);
  }
};

Codegen.prototype['ls:move.float'] = function move(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  this.masm.movq(dst, src);
};

Codegen.prototype['ls:swap.float'] = function swap(node) {
  var dst = this.output(node);
  var src = this.input(node, 0);

  var masm = this.masm;
  masm.movq(x64.scratch, dst);
  masm.movq(dst, src);
  masm.movq(src, x64.scratch);
};

//
// Generic instructions
//

Codegen.prototype['i8.const'] = function i8const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xff);
};

Codegen.prototype['i16.const'] = function i16const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffff);
};

Codegen.prototype['i32.const'] = function i32const(node) {
  var val = node.literals[0] | 0;
  this.masm.mov(this.output(node), val & 0xffffffff);
};

Codegen.prototype['i64.const'] = function i64const(node) {
  var out = this.output(node);
  var masked = node.literals[0];

  // Short number
  if (masked.bitLength() <= 31)
    return this.masm.mov(out, masked.toString(10) | 0);

  if (masked.sign)
    masked = new BN('10000000000000000', 16).iadd(masked);
  masked = masked.maskn(64);

  var arr = masked.toArray('le');
  while (arr.length < 8)
    arr.push(0);

  this.masm.mov(out, new Buffer(arr));
};

Codegen.prototype['f32.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadFloat(x64.scratch, node.literals[0]);
  this.masm.movd(out, x64.scratch);
};

Codegen.prototype['f64.const'] = function i64const(node) {
  var out = this.output(node);
  this.masm.loadDouble(x64.scratch, node.literals[0]);
  this.masm.movq(out, x64.scratch);
};

Codegen.prototype['x64:int.param'] = function i8param(node) {
  this.masm.mov(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['x64:f32.param'] = function i64param(node) {
  this.masm.movd(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['x64:f64.param'] = function i64param(node) {
  this.masm.movq(this.output(node), this.param(node.literals[0]));
};

Codegen.prototype['ret'] = Codegen.prototype.epilogue;
Codegen.prototype['x64:int.ret'] = Codegen.prototype['ret'];
Codegen.prototype['x64:float.ret'] = Codegen.prototype['ret'];

Codegen.prototype['x64:memory.space'] = function memorySpace(node) {
  this.masm.mov(this.output(node), x64.memory.space);
};

Codegen.prototype['x64:memory.size'] = function memorySize(node) {
  this.masm.mov(this.output(node), x64.memory.size);
};

Codegen.prototype['x64:memory.bounds-check'] = function memoryBounds(node) {
  var masm = this.masm;
  var output = this.output(node);
  var input = this.input(node, 0);
  var size = this.input(node, 1);

  masm.lea(x64.scratch, [ input, node.literals[0] ]);
  masm.cmp(x64.scratch, size);
  masm.xor(x64.scratch, x64.scratch);
  if (output !== input)
    masm.cmov('l', output, input);
  masm.cmov('ge', output, x64.scratch);
};

Codegen.prototype['x64:i64.load'] = function i64load(node) {
  var output = this.output(node);
  var space = this.input(node, 0);
  var off = this.input(node, 1);
  this.masm.mov(output, [ space, off, 0 ]);
};

Codegen.prototype['x64:i64.store'] = function i64store(node) {
  var space = this.input(node, 0);
  var off = this.input(node, 1);
  var value = this.input(node, 2);
  this.masm.mov([ space, off, 0 ], value);
};

Codegen.prototype['i64.add'] = function i64add(node) {
  var out = this.output(node);
  var left = this.input(node, 0);
  var right = this.input(node, 1);

  if (out === left) {
    this.masm.add(left, right);
  } else if (out === right) {
    this.masm.add(right, left);
  } else {
    this.masm.mov(out, left);
    this.masm.add(out, right);
  }
};

Codegen.prototype['f64.add'] = function i64add(node) {
  var out = this.output(node);
  var left = this.input(node, 0);
  var right = this.input(node, 1);

  if (out === left) {
    this.masm.addsd(left, right);
  } else if (out === right) {
    this.masm.addsd(right, left);
  } else {
    this.masm.movsd(out, left);
    this.masm.addsd(out, right);
  }
};

Codegen.prototype['i64.trunc_s_64'] = function i64truncS64(node) {
  var out = this.output(node);
  var input = this.input(node, 0);

  this.masm.cvttsd2si(out, input);
};

//
// X64 specific instructions
//
function declareReg(reg) {
  Codegen.prototype['x64:' + reg] = function _regWrap() {
    // No-op, the return type is all that matters
  };
}
x64.registers.general.forEach(declareReg);
x64.registers.float.forEach(declareReg);

Codegen.prototype['int.copy' ] = function intCopy(node) {
  var masm = this.masm;

  var output = this.output(node);
  var input = this.input(node, 0);

  if (typeof output === 'string' && typeof input === 'string') {
    masm.mov(output, input);
    return;
  }
  masm.mov(this.scratch, input);
  masm.mov(output, this.scratch);
};

Codegen.prototype['float.copy' ] = function floatCopy(node) {
  var masm = this.masm;

  var output = this.output(node);
  var input = this.input(node, 0);

  if (typeof output === 'string' && typeof input === 'string') {
    masm.movd(output, input);
    return;
  }
  masm.movq(this.scratch, input);
  masm.movq(output, this.scratch);
};

Codegen.prototype['int.call' ] = function intCall(node) {
  var masm = this.masm;
  var fnIndex = node.literals[0];
  var output = this.output(node);

  // TODO(indutny): push some args to stack

  masm.call(output, this.table.direct[fnIndex]);
};

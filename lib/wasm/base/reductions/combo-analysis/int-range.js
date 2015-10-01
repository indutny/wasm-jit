'use strict';

var BN = require('bn.js');

function IntRange(size, from, to) {
  this.size = size;
  this.from = from;
  this.to = to;

  // Just for testing purposes
  if (typeof this.from === 'number')
    this.from = new BN(this.from);
  else if (typeof this.from === 'string')
    this.from = new BN(this.from, 16);
  if (typeof this.to === 'number')
    this.to = new BN(this.to);
  else if (typeof this.to === 'string')
    this.to = new BN(this.to, 16);
}
module.exports = IntRange;

IntRange.prototype.contains = function contains(value) {
  return this.from.cmpn(value) <= 0 && this.to.cmpn(value) >= 0;
};

IntRange.prototype.add = function add(other) {
  var from = this.from.add(other.from);
  var to = this.to.add(other.to);

  // Overflow
  if (from.bitLength() > this.size || to.bitLength() > this.size)
    return null;
  return new IntRange(this.size, from, to);
};

IntRange.prototype.union = function union(other) {
  return new IntRange(this.size,
                      BN.min(this.from, other.from),
                      BN.max(this.to, other.to));
};

IntRange.prototype.isConstant = function isConstant() {
  return this.from.cmp(this.to) === 0;
};

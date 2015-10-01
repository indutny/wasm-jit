'use strict';

function FloatRange(from, to) {
  this.from = from;
  this.to = to;
}
module.exports = FloatRange;

FloatRange.prototype.contains = function contains(value) {
  return this.from <= value && value <= this.to;
};

FloatRange.prototype.add = function add(other) {
  return new FloatRange(this.from + other.from, this.to + other.to);
};

FloatRange.prototype.union = function union(other) {
  return new FloatRange(Math.min(this.from, other.from),
                        Math.max(this.to, other.to));
};

FloatRange.prototype.isConstant = function isConstant() {
  return this.from === this.to;
};

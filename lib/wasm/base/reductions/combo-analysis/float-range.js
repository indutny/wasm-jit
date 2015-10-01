'use strict';

function FloatRange(size, from, to) {
  this.size = size;
  this.from = from;
  this.to = to;
}
module.exports = FloatRange;

FloatRange.prototype.contains = function contains(value) {
  return this.from <= value && value <= this.to;
};

FloatRange.prototype.add = function add(other) {
  // TODO(indutny): check size
  return new FloatRange(this.size, this.from + other.from, this.to + other.to);
};

FloatRange.prototype.union = function union(other) {
  return new FloatRange(this.size,
                        Math.min(this.from, other.from),
                        Math.max(this.to, other.to));
};

FloatRange.prototype.isConstant = function isConstant() {
  return this.from === this.to;
};

'use strict';

function Range(from, to) {
  this.from = from;
  this.to = to;
}
module.exports = Range;

Range.prototype.contains = function contains(value) {
  return this.from <= value && value <= this.to;
};

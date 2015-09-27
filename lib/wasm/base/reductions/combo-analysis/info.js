'use strict';

function Info() {
  this.reachable = false;

  this.type = null;

  // Either `null`, `Range` or `false`
  // `null` - means any
  // `Range`
  // `false` - means unknown
  this.range = null;
}
module.exports = Info;

Info.prototype.updateReachable = function updateReachable(value) {
  if (this.reachable === value)
    return false;

  this.reachable = value;
  return true;
};

Info.prototype.updateRange = function updateRange(range) {
  var res = false;
  if (this.range && range) {
    res = this.range.from !== range.from || this.range.to !== range.to;
  } else if (this.range !== range) {
    res = true;
  }

  this.range = range;
  return res;
};

Info.prototype.isConstant = function isConstant() {
  return this.range && this.range.from === this.range.to;
}

Info.prototype.constantValue = function constantValue() {
  return this.range.from;
};


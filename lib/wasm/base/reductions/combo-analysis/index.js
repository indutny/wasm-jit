'use strict';

var assert = require('assert');
var util = require('util');
var Reducer = require('json-pipeline-reducer');

var Info = require('./info');
var FloatRange = require('./float-range');
var IntRange = require('./int-range');

function ComboAnalysis() {
  Reducer.Reduction.call(this);

  this.map = null;
}
util.inherits(ComboAnalysis, Reducer.Reduction);
module.exports = ComboAnalysis;

ComboAnalysis.prototype.start = function start() {
  this.map = new Map();
};

ComboAnalysis.prototype.getInfo = function getInfo(node) {
  var info = this.map.get(node);
  if (info === undefined) {
    info = new Info();
    info.reachable = !node.isControl();
    this.map.set(node, info);
  }
  return info;
};

ComboAnalysis.prototype.reduce = function reduce(node, reducer) {
  var info = this.getInfo(node);

  this.propagateReachability(node, info, reducer);
  this.propagateRanges(node, info, reducer);
};

ComboAnalysis.prototype.propagateReachability = function propagateReachability(
    node, info, reducer) {
  if (node.opcode === 'start')
    info.reachable = true;

  if (!info.reachable)
    return;

  // Control ends at `return`
  if (node.opcode === 'ret' || /\.ret$/.test(node.opcode))
    return;

  if (node.opcode === 'if' && this.propagateIfReachability(node, info, reducer))
    return;

  // Propagate reachability
  for (var i = 0; i < node.controlUses.length; i += 2) {
    var use = node.controlUses[i];
    var useInfo = this.getInfo(use);

    if (useInfo.updateReachable(true))
      reducer.change(use);
  }
};

ComboAnalysis.prototype.propagateIfReachability =
    function propagateIfReachability(node, info, reducer) {
  var test = node.inputs[0];
  var testInfo = this.getInfo(test);

  if (!testInfo.range)
    return false;

  var hasZero = testInfo.range.contains(0);
  if (!testInfo.isConstant() && hasZero)
    return false;

  for (var i = 0; i < node.controlUses.length; i += 2) {
    var use = node.controlUses[i];
    var useInfo = this.getInfo(use);

    var useReachable = hasZero ? i !== 0 : i === 0;
    if (useInfo.updateReachable(useReachable))
      reducer.change(use);
  }

  return true;
};

ComboAnalysis.prototype.propagateRanges = function propagateRanges(node,
                                                                   info,
                                                                   reducer) {
  if (/\.const$/.test(node.opcode)) {
    var size;
    if (node.opcode === 'i8.const') {
      info.type = 'i8';
      size = 8;
    } else if (node.opcode === 'i16.const') {
      info.type = 'i16';
      size = 16;
    } else if (node.opcode === 'i32.const') {
      info.type = 'i32';
      size = 32;
    } else if (node.opcode === 'i64.const') {
      info.type = 'i64';
      size = 64;
    } else if (node.opcode === 'f32.const') {
      info.type = 'f32';
      size = 32;
    } else if (node.opcode === 'f64.const') {
      info.type = 'f64';
      size = 64;
    }

    var range;
    if (info.type === 'f32' || info.type === 'f64')
      range = new FloatRange(size, node.literals[0], node.literals[0]);
    else
      range = new IntRange(size, node.literals[0], node.literals[0]);

    info.updateRange(range);
    return;
  }

  if (/\.add$/.test(node.opcode)) {
    var left = this.getInfo(node.inputs[0]);
    var right = this.getInfo(node.inputs[1]);

    if (!left.range || !right.range)
      return;

    info.type = left.type;
    if (info.updateRange(left.range.add(right.range)))
      reducer.change(node);
    return;
  }

  if (node.opcode === 'ssa:phi') {
    var left = this.getInfo(node.inputs[0]);
    var right = this.getInfo(node.inputs[1]);

    if (!left.range || !right.range)
      return;

    info.type = left.type;
    if (info.updateRange(left.range.union(right.range)))
      reducer.change(node);
    return;
  }
};

ComboAnalysis.prototype.end = function end(reducer) {
  this.map.forEach(function(info, node) {
    if (!info.reachable) {
      this.cutUnreachable(node, reducer);
    } else if (info.isConstant() && !/\.const$/.test(node.opcode)) {
      this.replaceWithConstant(node, info, reducer);
    } else if (node.opcode === 'ssa:phi') {
      this.endPhi(node);
    }
  }, this);
  this.map = null;
};

ComboAnalysis.prototype.cutUnreachable = function cutUnreachable(node,
                                                                 reducer) {
  if (node.control.length === 1) {
    var controlParent = node.control[0];

    // Unreachable branch of `if` - replace `if` with `jump`
    if (controlParent.opcode === 'if')
      controlParent.replace(reducer.graph.create('jump'));
  }

  node.cut();
};

ComboAnalysis.prototype.replaceWithConstant = function replaceWithConstant(
    node, info, reducer) {
  var c = reducer.graph.create(info.type + '.const')
      .addLiteral(info.constantValue());
  node.removeControl();
  node.replace(c);
};

ComboAnalysis.prototype.endPhi = function endPhi(node) {
  var region = node.control[0];
  while (region.opcode !== 'region' && region.opcode !== 'start')
    region = region.control[0];

  assert(region.control.length, 2, 'Phi\'s block has just one predecessor');
  var left = this.getInfo(region.control[0]);
  var right = this.getInfo(region.control[1]);

  if (left.reachable && !right.reachable) {
    node.removeControl();
    node.replace(node.inputs[0]);
  } else if (!left.reachable && right.reachable) {
    node.removeControl();
    node.replace(node.inputs[1]);
  }
};

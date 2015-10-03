'use strict';

var assert = require('assert');
var util = require('util');
var Reducer = require('json-pipeline-reducer');

function InlineParams(platform, ast) {
  Reducer.Reduction.call(this);

  this.platform = platform;
  this.ast = ast;

  this.params = new Array(this.ast.params.length);
  this.computeParams();
}
util.inherits(InlineParams, Reducer.Reduction);
module.exports = InlineParams;

InlineParams.prototype.computeParams = function computeParams() {
  var intIndex = 0;
  var floatIndex = 0;
  var stackIndex = 0;
  for (var i = 0; i < this.params.length; i++) {
    var param = this.ast.params[i];
    var isInt = /^i/.test(param.result.name);

    var index;
    var params;
    if (isInt) {
      params = this.platform.params.int;
      index = intIndex++;
    } else {
      params = this.platform.params.float;
      index = floatIndex++;
    }
    this.params[i] = index < params.length ? params[index] : stackIndex++;
  }
};

InlineParams.prototype.reduce = function reduce(node, reducer) {
  if (node.opcode === 'i8.param' || node.opcode === 'i16.param')
    return this.reduceParam(node, reducer);
  if (node.opcode === 'i32.param' || node.opcode === 'i64.param')
    return this.reduceParam(node, reducer);
  if (node.opcode === 'f32.param' || node.opcode === 'f64.param')
    return this.reduceParam(node, reducer);
  if (/\.call$/.test(node.opcode))
    return this.reduceCall(node, reducer);
};

InlineParams.prototype.reduceParam = function reduceParam(node, reducer) {
  var prefix = this.platform.prefix + ':';

  var index = node.literals[0];
  var param = this.params[index];
  if (typeof param === 'string') {
    // Replace with register
    var reg = reducer.graph.create(prefix + param);
    reducer.replace(node, reg);
    return;
  }

  // Replace with `<prefix>:type.param`
  var opcode = prefix;
  if (node.opcode === 'i8.param' ||
      node.opcode === 'i16.param' ||
      node.opcode === 'i32.param' ||
      node.opcode === 'i64.param') {
    opcode += 'int.param';
  } else if (node.opcode === 'f32.param') {
    opcode += 'f32.param';
  } else if (node.opcode === 'f64.param') {
    opcode += 'f64.param';
  }

  for (var i = node.uses.length - 2; i >= 0; i -= 2) {
    var use = node.uses[i];
    var index = node.uses[i + 1];

    var load = reducer.graph.create(opcode);
    load.addLiteral(param);
    reducer.add(load);

    use.replaceInput(index, load);
    reducer.change(use);
  }

  reducer.remove(node);
};

InlineParams.prototype.reduceCall = function reduceCall(node, reducer) {
  if (node.opcode === 'int.call')
    return;

  // TODO(indutny): count params, align stack if some of them needs to be stored
  // there.
  if (node.opcode === 'i8.call' || node.opcode === 'i16.call' ||
      node.opcode === 'i32.call' || node.opcode === 'i64.call') {
    node.opcode = 'int.call';
  }
  reducer.change(node);
};

var util = require('util');
var Reducer = require('json-pipeline-reducer');

var x64 = require('../');

function SelectX64Opcode(ast) {
  Reducer.Reduction.call(this);

  this.ast = ast;
  this.params = new Array(this.ast.params.length);

  this.computeParams();
}
util.inherits(SelectX64Opcode, Reducer.Reduction);
module.exports = SelectX64Opcode;

SelectX64Opcode.prototype.computeParams = function computeParams() {
  var intIndex = 0;
  var floatIndex = 0;
  var stackIndex = 0;
  for (var i = 0; i < this.params.length; i++) {
    var param = this.ast.params[i];
    var isInt = /^i/.test(param.result.name);

    var index;
    var params;
    if (isInt) {
      params = x64.params.int;
      index = intIndex++;
    } else {
      params = x64.params.float;
      index = floatIndex++;
    }
    this.params[i] = index < params.length ? params[index] : stackIndex++;
  }
};

SelectX64Opcode.prototype.reduce = function reduce(node, reducer) {
  // Already replaced
  if (/^x64:/.test(node.opcode))
    return;

  if (/\.param$/.test(node.opcode))
    return this.reduceParam(node, reducer);

  if (/\.bool$/.test(node.opcode))
    return this.reduceBool(node, reducer);
};

SelectX64Opcode.prototype.reduceParam = function reduceParam(node, reducer) {
  var index = node.literals[0];

  var param = this.params[index];
  if (typeof param === 'string') {
    // Replace with register
    var reg = reducer.graph.create('x64:' + param);
    reducer.replace(node, reg);
    return;
  }

  // Replace with `x64:x.param`
  if (node.opcode === 'i8.param' ||
      node.opcode === 'i16.param' ||
      node.opcode === 'i32.param' ||
      node.opcode === 'i64.param') {
    opcode = 'x64:int.param';
  } else if (node.opcode === 'f32.param') {
    opcode = 'x64:f32.param';
  } else if (node.opcode === 'f64.param') {
    opcode = 'x64:f64.param';
  }
  var param = reducer.graph.create(opcode);
  param.addLiteral(param);
  reducer.replace(node, param);
};

SelectX64Opcode.prototype.reduceBool = function reduceBool(node, reducer) {
  if (/^f/.test(node.opcode))
    return;

  // Just replace with the input, we are ready to handle integers!
  reducer.replace(node, node.inputs[0]);
};

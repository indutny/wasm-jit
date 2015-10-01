'use strict';

var util = require('util');
var mmap = require('mmap.js');
var Reducer = require('json-pipeline-reducer');

function SelectBaseOpcode() {
  Reducer.Reduction.call(this);
}
util.inherits(SelectBaseOpcode, Reducer.Reduction);
module.exports = SelectBaseOpcode;

SelectBaseOpcode.prototype.reduce = function reduce(node, reducer) {
  // Replace with constant
  if (node.opcode === 'addr.page_size')
    return this.reducePageSize(node, reducer);
};

SelectBaseOpcode.prototype.reducePageSize = function reducePageSize(node,
                                                                    reducer) {
  var c = reducer.graph.create('i32.const').addLiteral(mmap.PAGE_SIZE);
  reducer.add(c);

  var addr = reducer.graph.create('addr.from_i32', c);
  reducer.add(addr);

  // Just replace with the input, we are ready to handle integers!
  reducer.replace(node, addr);
};

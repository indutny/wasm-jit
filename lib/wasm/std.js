'use strict';

var std = exports;

var jit = require('jit.js');

var wasm = require('../wasm');
var binding = require('bindings')('std');

std.createContext = function createContext() {
  var ctx = binding.createContext();
  var ptr = jit.ptr(ctx);
  ptr._ctx = ctx;
  return ptr;
};

std.table = new wasm.RefTable(null);
std.table._binding('void', 'resize_memory', [ 'addr' ], binding.resize_memory);
std.table._binding('void', 'print', [ 'addr', 'addr' ], binding.print);

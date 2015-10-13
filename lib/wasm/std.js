'use strict';

var std = exports;

var wasm = require('../wasm');
var binding = require('bindings')('std');

std.createContext = binding.createContext;

std.table = new wasm.RefTable(null);
std.table._binding('void', 'resize_memory', [ 'addr' ], binding.resize_memory);

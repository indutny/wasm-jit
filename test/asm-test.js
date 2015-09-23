var assert = require('assert');
var fixtures = require('./fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler', function() {
  it('should compile empty function', function() {
    testAsm(function() {/*
      void main() {
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

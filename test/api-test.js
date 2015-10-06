var assert = require('assert');
var fixtures = require('./fixtures');
var compile = fixtures.compile;

describe('wasm Compiler/API', function() {
  var ctx;
  beforeEach(function() {
    ctx = new Buffer(16);
    ctx.fill(0);
  });

  it('should run empty function', function() {
    var main = compile(function() {/*
      void main() {
      }
    */}).main;
    main();
  });

  it('should run add function', function() {
    var add = compile(function() {/*
      i64 add(i64 a, i64 b) {
        return i64.add(a, b);
      }
    */}).add;
    assert.equal(add(ctx, 1, 2), 3);
  });

  it('should compute fibonacci number', function() {
    var fib = compile(function() {/*
      i64 fib(i64 count) {
        i64 a = i64.const(1);
        i64 b = i64.const(1);
        i64 i = count;
        do {
          i64 c = i64.add(a, b);
          a = b;
          b = c;
          i = i64.add(i, i64.const(-1));
        } while (i);
        return a;
      }
    */}).fib;

    assert.equal(fib(ctx, 83), 160500643816367088);
  });
});

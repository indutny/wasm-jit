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

  it('should compute fibonacci number iteratively', function() {
    var fib = compile(function() {/*
      i64 fib(i64 count) {
        i64 a = i64.const(1);
        i64 b = i64.const(1);
        i64 i = count;
        do {
          i64 c = i64.add(a, b);
          a = b;
          b = c;
          i = i64.sub(i, i64.const(1));
        } while (i);
        return a;
      }
    */}).fib;

    function referenceFib(count) {
      var a = 1;
      var b = 1;
      var i = count;
      do {
        var c = a + b;
        a = b;
        b = c;
        i = i - 1;
      } while (i);
      return a;
    }

    for (var i = 1; i < 60; i++)
      assert.equal(fib(ctx, i), referenceFib(i));
  });

  it('should compute fibonacci number recursively', function() {
    var fib = compile(function() {/*
      i64 fib(i64 count) {
        if (i64.eq(count, i64.const(0)))
          return i64.const(1);
        if (i64.eq(count, i64.const(1)))
          return i64.const(1);

        return i64.add(fib(i64.sub(count, i64.const(2))),
                       fib(i64.sub(count, i64.const(1))));
      }
    */}).fib;

    function referenceFib(count) {
      if (count === 0 || count === 1)
        return 1;
      return referenceFib(count - 2) + referenceFib(count - 1);
    }

    for (var i = 1; i < 10; i++)
      assert.equal(fib(ctx, i), referenceFib(i));
  });
});

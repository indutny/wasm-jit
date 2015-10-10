'use strict';

var CommutativeMath = require('./commutative-math');
var fixtures = require('../../../../test/fixtures');

describe('base/gvn/CommutativeMath', function() {
  var rel;
  beforeEach(function() {
    rel = new CommutativeMath();
  });

  it('should replace addition with identical input', function() {
    fixtures.testGVN(rel, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = i64.const "456"
          i2 = i64.add i0, i1
          i3 = i64.add i1, i0
          i4 = i64.add i2, i3
          i5 = i64.ret ^b0, i4
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = i64.const "456"
          i2 = i64.add i0, i1
          i3 = i64.add i2, i2
          i4 = i64.ret ^b0, i3
        }
      }
    */});
  });
});

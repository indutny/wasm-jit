'use strict';

var ComboAnalysis = require('./combo-analysis');
var fixtures = require('../../../../test/fixtures');

describe('base/reductions/ComboAnalysis', function() {
  var combo;
  beforeEach(function() {
    combo = new ComboAnalysis();
  });

  it('should remove trivially unreachable code', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.const 1
          i1 = i64.ret ^b0, i0
          i2 = i64.const 2
          i3 = i64.ret ^i1, i2
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const 1
          i1 = i64.ret ^b0, i0
        }
      }
    */});
  });

  it('should remove branched unreachable code', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = x64:int.param 1
          i1 = if ^b0, i0
        }
        b0 -> b1, b2

        b1 {
          i2 = i64.const 2
          i3 = i64.ret ^b1, i2
          i4 = jump ^b1
        }
        b1 -> b3

        b2 {
          i5 = i64.const 3
          i6 = i64.ret ^b2, i5
          i7 = jump ^b2
        }
        b2 -> b3

        b3 {
          i8 = i64.const 4
          i9 = i64.ret ^b3, i8
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = x64:int.param 1
          i1 = if ^b0, i0
        }
        b0 -> b1, b2
        b1 {
          i2 = i64.const 2
          i3 = i64.ret ^b1, i2
          i4 = jump ^b1
        }
        b2 {
          i5 = i64.const 3
          i6 = i64.ret ^b2, i5
          i7 = jump ^b2
        }
      }
    */});
  });

  it('should remove replace math operations with constants', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.const 1
          i1 = i64.const 2
          i2 = i64.add i0, i1
          i3 = i64.ret ^b0, i2
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const 3
          i1 = i64.ret ^b0, i0
        }
      }
    */});
  });

  it('should remove unreachable code under the constant branches', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.const 1
          i1 = i64.const 2
          i2 = i64.add i0, i1
          i3 = if ^b0, i2
        }
        b0 -> b1, b2

        b1 {
          i4 = i64.const 123
          i5 = jump ^b1
        }
        b1 -> b3

        b2 {
          i6 = i64.const 456
          i7 = jump ^b2
        }
        b2 -> b3

        b3 {
          i8 = ssa:phi ^b3, i4, i6
          i9 = i64.ret ^i8, i8
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = jump ^b0
        }
        b0 -> b1
        b1 {
          i1 = jump ^b1
        }
        b1 -> b2
        b2 {
          i2 = i64.const ^b2, 123
          i3 = i64.ret ^i2, i2
        }
      }
    */});
  });
});

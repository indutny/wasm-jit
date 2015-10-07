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
          i0 = i64.const "1"
          i1 = i64.ret ^b0, i0
          i2 = ret ^i1
          i3 = i64.const "2"
          i4 = i64.ret ^i2, i3
          i5 = ret ^i4
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "1"
          i1 = i64.ret ^b0, i0
          i2 = ret ^i1
        }
      }
    */});
  });

  it('should replace math operations with constants', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "1"
          i1 = i64.const "2"
          i2 = i64.add i0, i1
          i3 = i64.ret ^b0, i2
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "3"
          i1 = i64.ret ^b0, i0
        }
      }
    */});
  });

  it('should not replace overflowing math operations', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i32.const "deadbeef"
          i1 = i32.const "abbadead"
          i2 = i32.add i0, i1
          i3 = i32.ret ^b0, i2
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i32.const "deadbeef"
          i1 = i32.const "abbadead"
          i2 = i32.add i0, i1
          i3 = i32.ret ^b0, i2
        }
      }
    */});
  });

  it('should remove unreachable code under the constant branches', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "1"
          i1 = i64.const "2"
          i2 = i64.add i0, i1
          i3 = if ^b0, i2
        }
        b0 -> b1, b2

        b1 {
          i4 = i64.const "123"
          i5 = jump ^b1
        }
        b1 -> b3

        b2 {
          i6 = i64.const "456"
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
          i2 = i64.const "123"
          i3 = i64.ret ^b2, i2
        }
      }
    */});
  });

  it('should propagate constants through ssa:phi', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.param 0
          i3 = if ^b0, i0
        }
        b0 -> b1, b2

        b1 {
          i4 = i64.const "456"
          i5 = jump ^b1
        }
        b1 -> b3

        b2 {
          i6 = i64.const "456"
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
          i0 = i64.param 0
          i1 = if ^b0, i0
        }
        b0 -> b1, b2
        b1 {
          i2 = jump ^b1
        }
        b1 -> b3
        b2 {
          i3 = jump ^b2
        }
        b2 -> b3
        b3 {
          i4 = i64.const "456"
          i5 = i64.ret ^b3, i4
        }
      }
    */});
  });

  it('should propagate ranges through ssa:phi', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.param 0
          i3 = if ^b0, i0
        }
        b0 -> b1, b2

        b1 {
          i4 = i64.const "456"
          i5 = jump ^b1
        }
        b1 -> b3

        b2 {
          i6 = i64.const "123"
          i7 = jump ^b2
        }
        b2 -> b3

        b3 {
          i8 = ssa:phi ^b3, i4, i6
          i9 = if ^i8, i8
        }
        b3 -> b4, b5

        b4 {
          i10 = i64.const "42"
          i11 = return ^b4, i10
        }

        b5 {
          i12 = i64.const "23"
          i13 = return ^b5, i12
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.param 0
          i1 = if ^b0, i0
        }
        b0 -> b1, b2
        b1 {
          i2 = i64.const "456"
          i3 = jump ^b1
        }
        b1 -> b3
        b2 {
          i4 = i64.const "123"
          i5 = jump ^b2
        }
        b2 -> b3
        b3 {
          i6 = ssa:phi ^b3, i2, i4
          i7 = jump ^i6
        }
        b3 -> b4
        b4 {
          i8 = i64.const "42"
          i9 = return ^b4, i8
        }
      }
    */});
  });

  it('should not kill branch with too wide range', function() {
    fixtures.testReduction(combo, function() {/*
      pipeline {
        b0 {
          i0 = i64.param 0
          i3 = if ^b0, i0
        }
        b0 -> b1, b2

        b1 {
          i4 = i64.const "0"
          i5 = jump ^b1
        }
        b1 -> b3

        b2 {
          i6 = i64.const "123"
          i7 = jump ^b2
        }
        b2 -> b3

        b3 {
          i8 = ssa:phi ^b3, i4, i6
          i9 = if ^i8, i8
        }
        b3 -> b4, b5

        b4 {
          i10 = i64.const "42"
          i11 = return ^b4, i10
        }

        b5 {
          i12 = i64.const "23"
          i13 = return ^b5, i12
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.param 0
          i1 = if ^b0, i0
        }
        b0 -> b1, b2
        b1 {
          i2 = i64.const "0"
          i3 = jump ^b1
        }
        b1 -> b3
        b2 {
          i4 = i64.const "123"
          i5 = jump ^b2
        }
        b2 -> b3
        b3 {
          i6 = ssa:phi ^b3, i2, i4
          i7 = if ^i6, i6
        }
        b3 -> b4, b5
        b4 {
          i8 = i64.const "42"
          i9 = return ^b4, i8
        }
        b5 {
          i10 = i64.const "23"
          i11 = return ^b5, i10
        }
      }
    */});
  });
});

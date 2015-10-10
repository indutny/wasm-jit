'use strict';

var Select = require('./select');
var fixtures = require('../../../../test/fixtures');

describe('x64/reductions/SelectOpcode', function() {
  var select;
  beforeEach(function() {
    select = new Select();
  });

  describe('binary ops', function() {
    it('should reduce iXX.add', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = i64.add i0, i0
            i2 = ret ^b0, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = x64:int.add i0, i0
            i2 = ret ^b0, i1
          }
        }
      */});
    });

    it('should not reduce fXX.add', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = f64.add i0, i0
            i2 = ret ^b0, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = f64.add i0, i0
            i2 = ret ^b0, i1
          }
        }
      */});
    });
  });

  describe('branching', function() {
    it('should reduce iXX.bool', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = i64.bool i0
            i2 = ret ^b0, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = ret ^b0, i0
          }
        }
      */});
    });

    it('should not reduce fXX.bool', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = f64.bool i0
            i2 = ret ^b0, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = f64.bool i0
            i2 = ret ^b0, i1
          }
        }
      */});
    });
  });

  describe('.ret', function() {
    it('should reduce int return', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = i64.ret ^b0, i0
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = x64:int.ret ^b0, i0
          }
        }
      */});
    });

    it('should reduce float return', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = f64.ret ^b0, i0
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = f64.const 123
            i1 = x64:float.ret ^b0, i0
          }
        }
      */});
    });
  });

  describe('memory access', function() {
    it('should add space input to store/load', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = state
            i1 = i64.const 1
            i2 = addr.from_i64 i1
            i3 = i64.store ^b0, i0, i2, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = state
            i1 = x64:memory.space
            i2 = i64.const 1
            i3 = x64:memory.size
            i4 = x64:memory.bounds-check 8, i0, i2, i3
            i5 = x64:i64.store ^b0, i0, i1, i4, i2
          }
        }
      */});
    });

    it('should reuse space input between store/load', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = state
            i1 = i64.const 1
            i2 = addr.from_i64 i1
            i3 = i64.store ^b0, i0, i2, i1
            i4 = updateState ^i3, 4, i0
            i5 = i32.load i4, i2
            i6 = ret ^b0, i5
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = state
            i1 = x64:memory.space
            i2 = i64.const 1
            i3 = x64:memory.size
            i4 = x64:memory.bounds-check 8, i0, i2, i3
            i5 = x64:i64.store ^b0, i0, i1, i4, i2
            i6 = updateState ^i5, 4, i0
            i7 = x64:memory.bounds-check 4, i6, i2, i3
            i8 = x64:i32.load i6, i1, i7
            i9 = ret ^b0, i8
          }
        }
      */});
    });

    it('should reduce if + i64.eq', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = i64.const 456
            i2 = i64.eq i0, i1
            i3 = if ^b0, i2
          }
          b0 -> b1, b2
          b1 {
            i4 = ret ^b1
          }
          b2 {
            i5 = ret ^b2
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 123
            i1 = i64.const 456
            i2 = x64:if.i64.eq ^b0, i0, i1
          }
          b0 -> b1, b2
          b1 {
            i3 = ret ^b1
          }
          b2 {
            i4 = ret ^b2
          }
        }
      */});
    });
  });
});

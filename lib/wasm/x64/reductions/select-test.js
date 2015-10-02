'use strict';

var Select = require('./select');
var fixtures = require('../../../../test/fixtures');

describe('x64/reductions/SelectOpcode', function() {
  var select;
  beforeEach(function() {
    select = new Select();
  });

  describe('.bool', function() {
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
            i0 = i64.const 1
            i1 = addr.from_i64 i0
            i2 = i64.store ^b0, i1, i0
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = x64:memory.space
            i1 = i64.const 1
            i2 = addr.from_i64 i1
            i3 = x64:i64.store ^b0, i0, i2, i1
          }
        }
      */});
    });

    it('should reuse space input between store/load', function() {
      fixtures.testReduction(select, function() {/*
        pipeline {
          b0 {
            i0 = i64.const 1
            i1 = addr.from_i64 i0
            i2 = i64.store ^b0, i1, i0
            i3 = i64.load ^i2, i1
          }
        }
      */}, function() {/*
        pipeline {
          b0 {
            i0 = x64:memory.space
            i1 = i64.const 1
            i2 = addr.from_i64 i1
            i3 = x64:i64.store ^b0, i0, i2, i1
            i4 = x64:i64.load ^i3, i0, i2
          }
        }
      */});
    });
  });
});

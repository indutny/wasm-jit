'use strict';

var LIRCleanup = require('./lir-cleanup');
var fixtures = require('../../../../test/fixtures');

describe('x64/reductions/LIRCleanup', function() {
  var select;
  beforeEach(function() {
    select = new LIRCleanup();
  });

  it('should remove unused memory nodes', function() {
    fixtures.testReduction(select, function() {/*
      pipeline {
        b0 {
          i0 = x64:memory.space ^b0
          i1 = ret ^i0
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = ret ^b0
        }
      }
    */});
  });

  it('should remove memory arg from call', function() {
    fixtures.testReduction(select, function() {/*
      pipeline {
        b0 {
          i0 = x64:memory.space
          i1 = i64.const "dead"
          i2 = int.call ^b0, "i64", i0, i1
          i3 = ret ^i2, i2
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "dead"
          i1 = int.call ^b0, "i64", i0
          i2 = ret ^i1, i1
        }
      }
    */});
  });
});

'use strict';

var RedundantPhi = require('./redundant-phi');
var fixtures = require('../../../../test/fixtures');

describe('base/reductions/RedundantPhi', function() {
  var select;
  beforeEach(function() {
    select = new RedundantPhi();
  });

  it('should remove redundant phi', function() {
    fixtures.testReduction(select, function() {/*
      pipeline {
        b0 {
          i0 = if ^b0
        }
        b0 -> b1, b2
        b1 {
          i1 = i64.const "1"
          i2 = jump ^b1
        }
        b1 -> b3
        b2 {
          i3 = i64.const "1"
          i4 = jump ^b2
        }
        b2 -> b3
        b3 {
          i5 = ssa:phi ^b3, i1, i3
          i6 = ret ^i5
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = if ^b0
        }
        b0 -> b1, b2
        b1 {
          i1 = jump ^b1
        }
        b1 -> b3
        b2 {
          i2 = jump ^b2
        }
        b2 -> b3
        b3 {
          i3 = ret ^b3
        }
      }
    */});
  });
});

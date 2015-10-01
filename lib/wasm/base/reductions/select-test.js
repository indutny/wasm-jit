'use strict';

var Select = require('./select');
var fixtures = require('../../../../test/fixtures');

describe('base/reductions/ComboAnalysis', function() {
  var select;
  beforeEach(function() {
    select = new Select();
  });

  it('should replace addr.page_size with constant', function() {
    fixtures.testReduction(select, function() {/*
      pipeline {
        b0 {
          i0 = addr.page_size
          i1 = i64.from_addr i0
          i2 = i64.ret ^b0, i1
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i32.const 4096
          i1 = addr.from_i32 i0
          i2 = i64.from_addr i1
          i3 = i64.ret ^b0, i2
        }
      }
    */});
  });
});

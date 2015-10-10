'use strict';

var SameNode = require('./same-node');
var fixtures = require('../../../../test/fixtures');

describe('base/gvn/SameNode', function() {
  var rel;
  beforeEach(function() {
    rel = new SameNode();
  });

  it('should replace nodes with same opcode and inputs', function() {
    fixtures.testGVN(rel, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = i64.const "456"
          i2 = i64.add i0, i1
          i3 = i64.const "123"
          i4 = i64.const "456"
          i5 = i64.add i3, i4
          i6 = i64.const "123"
          i7 = i64.const "456"
          i8 = i64.add ^b0, i6, i7
          i9 = i64.add i2, i5
          i10 = i64.add i8, i9
          i11 = i64.ret ^i8, i10
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = i64.const "456"
          i2 = i64.add ^b0, i0, i1
          i3 = i64.add i0, i1
          i4 = i64.add i3, i3
          i5 = i64.add i2, i4
          i6 = i64.ret ^i2, i5
        }
      }
    */});
  });
});

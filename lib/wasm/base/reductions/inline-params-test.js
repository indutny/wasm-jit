'use strict';

var InlineParams = require('./inline-params');
var fixtures = require('../../../../test/fixtures');
var wasm = require('../../../wasm');

var PARAM_COUNT = 10;

describe('base/reductions/InlineParams', function() {
  var inline;
  beforeEach(function() {
    var params = [];
    for (var i = 0; i < PARAM_COUNT; i++) {
      params.push({
        type: 'ParamDeclaration',
        result: { type: 'Type', name: 'i64' },
        name: { type: 'Param', index: i * 2 }
      });
      params.push({
        type: 'ParamDeclaration',
        result: { type: 'Type', name: 'f64' },
        name: { type: 'Param', index: i * 2 + 1 }
      });
    }
    inline = new InlineParams(wasm.platform.x64, {
      params: params
    });
  });

  it('should replace params with inlined versions', function() {
    var src = 'pipeline {\n';

    src += '  b0 {\n';
    var control = 'b0';
    for (var i = 0; i < 2 * PARAM_COUNT; i++) {
      var type = i % 2 === 0 ? 'i64' : 'f64';
      var id = 'i' + i;
      src += '    ' +
             id + ' = ' + type + '.param ^' + control + ', ' + i + '\n';
      control = id;
    }
    src += '  }\n';
    src += '  b0 -> b1\n';

    src += '  b1 {\n';
    control = 'b1';
    for (var i = 0; i < 2 * PARAM_COUNT; i++) {
      var id = 'i' + (i + 2 * PARAM_COUNT);
      src += id + ' = use ^' + control + ', i' + i + '\n';
      control = id;
    }
    src += '  }\n';

    src += '}\n';
    fixtures.testReduction(inline, src, function() {/*
      pipeline {
        b0 {
          i0 = x64:rsi ^b0
          i1 = x64:xmm0 ^i0
          i2 = x64:rdx ^i1
          i3 = x64:xmm1 ^i2
          i4 = x64:rcx ^i3
          i5 = x64:xmm2 ^i4
          i6 = x64:r8 ^i5
          i7 = x64:xmm3 ^i6
          i8 = x64:r9 ^i7
          i9 = x64:xmm4 ^i8
          i10 = x64:xmm5 ^i9
          i11 = x64:xmm6 ^i10
          i12 = x64:xmm7 ^i11
        }
        b0 -> b1
        b1 {
          i13 = use ^b1, i0
          i14 = use ^i13, i1
          i15 = use ^i14, i2
          i16 = use ^i15, i3
          i17 = use ^i16, i4
          i18 = use ^i17, i5
          i19 = use ^i18, i6
          i20 = use ^i19, i7
          i21 = use ^i20, i8
          i22 = use ^i21, i9
          i23 = x64:int.param 0
          i24 = use ^i22, i23
          i25 = use ^i24, i10
          i26 = x64:int.param 1
          i27 = use ^i25, i26
          i28 = use ^i27, i11
          i29 = x64:int.param 2
          i30 = use ^i28, i29
          i31 = use ^i30, i12
          i32 = x64:int.param 3
          i33 = use ^i31, i32
          i34 = x64:f64.param 4
          i35 = use ^i33, i34
          i36 = x64:int.param 5
          i37 = use ^i35, i36
          i38 = x64:f64.param 6
          i39 = use ^i37, i38
        }
      }
    */});
  });

  it('should add alignment and replace pushArg of call', function() {
    fixtures.testReduction(inline, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = i64.call ^b0, 0, "i64", "i64", i0, i0
        }
      }
    */}, function() {/*
      pipeline {
        b0 {
          i0 = i64.const "123"
          i1 = int.call ^b0, 0, "i64", "i64", i0, i0
        }
      }
    */});
  });
});

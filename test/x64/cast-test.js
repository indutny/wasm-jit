var assert = require('assert');
var fixtures = require('../fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler/x64/cast', function() {
  it('should compile i64.trunc_s_64', function() {
    testAsm(function() {/*
      i64 main(f64 a) {
        return i64.trunc_s_64(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttsd2si rax, xmm0
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i64.trunc_s_32', function() {
    testAsm(function() {/*
      i64 main(f32 a) {
        return i64.trunc_s_32(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttss2si rax, xmm0
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32.trunc_u_64', function() {
    testAsm(function() {/*
      i32 main(f64 a) {
        return i32.trunc_u_64(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttsd2si eax, xmm0
      mov eax, eax
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32.trunc_u_32', function() {
    testAsm(function() {/*
      i32 main(f32 a) {
        return i32.trunc_u_32(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttss2si eax, xmm0
      mov eax, eax
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32.trunc_s_64', function() {
    testAsm(function() {/*
      i32 main(f64 a) {
        return i32.trunc_s_64(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttsd2si eax, xmm0
      movsxd rax, rax
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32.trunc_s_32', function() {
    testAsm(function() {/*
      i32 main(f32 a) {
        return i32.trunc_s_32(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvttss2si eax, xmm0
      movsxd rax, rax
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile f64.convert_s_64', function() {
    testAsm(function() {/*
      f64 main(i64 a) {
        return f64.convert_s_64(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvtsi2sd xmm0, rsi
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile f32.convert_s_64', function() {
    testAsm(function() {/*
      f32 main(i64 a) {
        return f32.convert_s_64(a);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      vcvtsi2ss xmm0, rsi
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32.from_addr', function() {
    testAsm(function() {/*
      i32 main() {
        return i32.from_addr(addr.from_64(i64.const(0xdead)));
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, 0xdead
      mov eax, eax
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

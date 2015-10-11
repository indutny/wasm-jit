var assert = require('assert');
var fixtures = require('../fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler/x64/bool', function() {
  describe('int', function() {
    it('should support i64.eq', function() {
      testAsm(function() {/*
        i32 main(i64 a) {
          return i64.eq(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        cmp rsi, rax
        setcc z, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.gt_u', function() {
      testAsm(function() {/*
        i32 main(i64 a) {
          return i64.gt_u(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        cmp rsi, rax
        setcc nbe, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.eq in branch', function() {
      testAsm(function() {/*
        i64 main(i64 a, i64 b) {
          if (i64.eq(a, b))
            return a;
          else
            return b;
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        cmp rsi, rdx
        far-jcc nz, 0x8
        mov rax, rsi
        jmp 0x3
        mov rax, rdx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });

  describe('truncating bools', function() {
    it('should support i32.eq', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.eq(a, i32.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov eax, esi
        mov rcx, 0x1
        mov ecx, ecx
        cmp rax, rcx
        setcc z, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.gt_s', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.gt_s(a, i32.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        movsxd rax, rsi
        mov rcx, 0x1
        movsxd rcx, rcx
        cmp rax, rcx
        setcc nle, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });

  describe('floating point', function() {
    it('should support f64.eq', function() {
      testAsm(function() {/*
        i32 main(f64 a, f64 b) {
          return f64.eq(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vucomisd xmm0, xmm1
        setcc z, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f32.eq', function() {
      testAsm(function() {/*
        i32 main(f32 a, f32 b) {
          return f32.eq(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vucomiss xmm0, xmm1
        setcc z, eax
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });
});

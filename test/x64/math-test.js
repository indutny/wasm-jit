var assert = require('assert');
var fixtures = require('../fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler/x64/math', function() {
  describe('int', function() {
    it('should support i64.add', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.add(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        add rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.sub', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.sub(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        mov r15, rsi
        sub r15, rax
        mov rax, r15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.mul', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.mul(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        imul rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.div_s', function() {
      testAsm(function() {/*
        i64 main(i64 a, i64 b) {
          return i64.div_s(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, rdx
        mov rax, rsi
        cwd
        idiv rax, rcx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.div_u', function() {
      testAsm(function() {/*
        i64 main(i64 a, i64 b) {
          return i64.div_u(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, rdx
        mov rax, rsi
        xor rdx, rdx
        div rax, rcx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.div_s', function() {
      testAsm(function() {/*
        i32 main(i32 a, i32 b) {
          return i32.div_s(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, rdx
        mov rax, rsi
        cwd
        idiv rax, ecx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.rem_s', function() {
      testAsm(function() {/*
        i64 main(i64 a, i64 b) {
          return i64.rem_s(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, rdx
        mov rax, rsi
        cwd
        idiv rax, rcx
        mov rax, rdx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.and', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.and(a, i64.const(0x1));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, 0x1
        and rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.shl', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.shl(a, i64.const(0x4));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, 0x4
        mov rax, rsi
        shl rax, cl
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.shr_s', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.shr_s(a, i64.const(0x4));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, 0x4
        mov rax, rsi
        sar rax, cl
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.shr_u', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.shr_u(a, i64.const(0x4));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, 0x4
        mov rax, rsi
        shr rax, cl
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.shr_u', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.shr_u(a, i32.const(0x4));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rcx, 0x4
        mov rax, rsi
        shr eax, cl
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.clz', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.clz(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        lzcnt rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.clz', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.clz(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        lzcnt eax, esi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.ctz', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.ctz(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        tzcnt rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.ctz', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.ctz(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        tzcnt eax, esi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i64.popcnt', function() {
      testAsm(function() {/*
        i64 main(i64 a) {
          return i64.popcnt(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        popcnt rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support i32.popcnt', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return i32.popcnt(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        popcnt eax, esi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });

  describe('floating point', function() {
    it('should support f32.add', function() {
      testAsm(function() {/*
        f32 main(f32 a) {
          return f32.add(a, f32.const(123.456));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov r15, 0x42f6e979
        vmovd xmm1, r15
        vaddss xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.add', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.add(a, f64.const(123.456));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov r15, 0x405edd2f1a9fbe77
        vmovq xmm1, r15
        vaddsd xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f32.mul', function() {
      testAsm(function() {/*
        f32 main(f32 a) {
          return f32.mul(a, f32.const(123.456));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov r15, 0x42f6e979
        vmovd xmm1, r15
        vmulss xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.mul', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.mul(a, f64.const(123.456));
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov r15, 0x405edd2f1a9fbe77
        vmovq xmm1, r15
        vmulsd xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.sqrt', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.sqrt(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vsqrtsd xmm0, xmm0
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f32.sqrt', function() {
      testAsm(function() {/*
        f32 main(f32 a) {
          return f32.sqrt(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vsqrtss xmm0, xmm0
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.ceil', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.ceil(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vroundsd xmm0, xmm0, 0x2
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.floor', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.floor(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vroundsd xmm0, xmm0, 0x1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.nearest', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.nearest(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vroundsd xmm0, xmm0, 0x0
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.trunc', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.trunc(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vroundsd xmm0, xmm0, 0x3
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.abs', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.abs(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vpcmpeqd xmm15, xmm15
        vpsrlq xmm15, 0x1
        vandpd xmm0, xmm15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f32.abs', function() {
      testAsm(function() {/*
        f32 main(f32 a) {
          return f32.abs(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vpcmpeqd xmm15, xmm15
        vpsrlq xmm15, 0x21
        vandpd xmm0, xmm15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.neg', function() {
      testAsm(function() {/*
        f64 main(f64 a) {
          return f64.neg(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vpcmpeqd xmm15, xmm15
        vpsllq xmm15, 0x3f
        vxorpd xmm0, xmm15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f32.neg', function() {
      testAsm(function() {/*
        f32 main(f32 a) {
          return f32.neg(a);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vpcmpeqd xmm15, xmm15
        vpsllq xmm15, 0x1f
        vxorpd xmm0, xmm15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.max', function() {
      testAsm(function() {/*
        f64 main(f64 a, f64 b) {
          return f64.max(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vmaxsd xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.sub', function() {
      testAsm(function() {/*
        f64 main(f64 a, f64 b) {
          return f64.sub(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vsubsd xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.div', function() {
      testAsm(function() {/*
        f64 main(f64 a, f64 b) {
          return f64.div(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vdivsd xmm0, xmm1
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should support f64.copysign', function() {
      testAsm(function() {/*
        f64 main(f64 a, f64 b) {
          return f64.copysign(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        vpcmpeqd xmm15, xmm15
        vpsrlq xmm15, 0x1
        vandpd xmm0, xmm15
        vpcmpeqd xmm15, xmm15
        vpsllq xmm15, 0x3f
        vandpd xmm15, xmm1
        vxorpd xmm0, xmm15
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });
});

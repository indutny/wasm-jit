var assert = require('assert');
var fixtures = require('./fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler', function() {
  it('should compile empty function', function() {
    testAsm(function() {/*
      void main() {
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  describe('params', function() {
    it('should compile i64 params', function() {
      testAsm(function() {/*
        i64 main(i64 a, i64 b) {
          return i64.add(a, b);
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, rdi
        add rax, rsi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should compile i32 params', function() {
      testAsm(function() {/*
        i32 main(i32 a) {
          return a;
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, rdi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should compile i16 params', function() {
      testAsm(function() {/*
        i16 main(i16 a) {
          return a;
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, rdi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should compile i8 params', function() {
      testAsm(function() {/*
        i8 main(i8 a) {
          return a;
        }
      */}, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, rdi
        mov rsp, rbp
        pop rbp
        ret
      */});
    });

    it('should compile many params', function() {
      var code = 'i64 main(';
      var count = 9;

      var params = [];
      for (var i = 0; i < count; i++)
        params.push('i64 pi' + i + ', f64 pf' + i);

      code += params.join(', ') + ') {\n';
      code += 'i64 ti = i64.const(0);\n';
      code += 'f64 tf = f64.const(0);\n';
      for (var i = 0; i < count; i++) {
        code += 'ti = i64.add(ti, pi' + i + ');\n';
        code += 'tf = f64.add(tf, pf' + i + ');\n';
      }
      code += 'ti = i64.add(ti, i64.trunc_s_64(tf));\n';
      code += 'return ti;\n';
      code += '}';

      testAsm(code, function() {/*
        push rbp
        mov rbp, rsp
        mov rax, [rbp, 0x10]
        mov rbx, [rbp, 0x18]
        mov r10, [rbp, 0x20]
        vmovq xmm8, [rbp, 0x28]
        mov r11, 0x0
        add rdi, r11
        add rdi, rsi
        add rdx, rdi
        add rcx, rdx
        add rcx, r8
        add rcx, r9
        add rax, rcx
        add rax, rbx
        add rax, r10
        mov r15, 0x0000000000000000
        vmovq xmm9, r15
        vaddsd xmm0, xmm9
        vaddsd xmm0, xmm1
        vaddsd xmm0, xmm2
        vaddsd xmm0, xmm3
        vaddsd xmm0, xmm4
        vaddsd xmm0, xmm5
        vaddsd xmm0, xmm6
        vaddsd xmm0, xmm7
        vaddsd xmm0, xmm8
        vcvttsd2si rbx, xmm0
        add rax, rbx
        mov rsp, rbp
        pop rbp
        ret
      */});
    });
  });

  it('should compile chain of expression', function() {
    testAsm(function() {/*
      i64 main(i64 a, i64 b) {
        return i64.add(a, i64.add(b, i64.const(1358)));
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, 0x54e
      add rax, rsi
      add rax, rdi
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should work for floating point', function() {
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

  it('should work with local variables', function() {
    testAsm(function() {/*
      f64 main(f64 a) {
        f64 b = f64.const(123.456);
        return f64.add(a, b);
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

  it('should work with branches', function() {
    testAsm(function() {/*
      i64 main(i64 a) {
        if (a) {
          return a;
        }
        return i64.const(1);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      test edi, 0x0
      jcc z, 0x9

      mov rax, rdi
      mov rsp, rbp
      pop rbp
      ret

      mov rax, 0x1
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

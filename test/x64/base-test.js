var assert = require('assert');
var fixtures = require('../fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler/x64', function() {
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

  it('should compile i64 params', function() {
    testAsm(function() {/*
      i64 main(i64 a, i64 b) {
        return i64.add(a, b);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, rsi
      add rax, rdx
      mov rsp, rbp
      pop rbp
      ret
    */});
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
      add rax, rdx
      add rax, rsi
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
      cmp rsi, 0x0
      far-jcc z, 0x8

      mov rax, rsi
      jmp 0x7

      mov rax, 0x1
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile forever loop', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(0);
        forever {
           t = i64.add(t, i64.const(1));
        }
        return t;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, 0x0
      mov rcx, 0x1
      add rax, rcx
      jmp -0x8
    */});
  });

  it('should compile forever loop with break/continue', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(0);
        forever {
           t = i64.add(t, i64.const(1));
           if (t)
             continue;
           else
             break;
        }
        return t;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, 0x0
      mov rcx, 0x1
      add rax, rcx
      cmp rax, 0x0
      far-jcc z, 0x5
      jmp -0x14
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile do {} while loop', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(10);
        do {
          t = i64.add(t, i64.const(-1));
        } while (t);
        return t;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      mov rax, 0xa
      mov rcx, -0x1
      add rax, rcx
      cmp rax, 0x0
      far-jcc z, 0x5
      jmp -0x14
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile memory stores/loads', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(0);
        i64.store(addr.from_i64(t), i64.const(0xdead));
        i64 l = i64.load(addr.from_i64(t));
        return l;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x8]
      cmp r15, rdx
      jcc le, 0x5

      xor rsi, rsi
      jmp 0x3

      mov rsi, rcx

      mov r8, 0xdead
      mov [rax, rsi, 0x0], r8
      lea r15, [rcx, 0x8]
      cmp r15, rdx
      jcc le, 0x3

      xor rcx, rcx

      mov rax, [rax, rcx, 0x0]
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile calls', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(123);
        i64 a = add(t, i64.const(456), t);
        return i64.add(t, a);
      }

      i64 add(i64 a, i64 b, i64 c) {
        return i64.add(a, b);
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp
      sub rsp, 0x10
      mov [rbp, -0x8], rbx
      mov rsi, 0x7b
      mov rdx, 0x1c8
      mov rbx, rsi
      mov rcx, rsi
      lea rax, [rip, 0x18]
      call eax
      add rax, rbx
      mov rbx, [rbp, -0x8]
      mov rsp, rbp
      pop rbp
      ret
      (padding)
      push rbp
      mov rbp, rsp
      mov rax, rsi
      add rax, rdx
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

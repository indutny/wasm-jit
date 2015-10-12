var assert = require('assert');
var fixtures = require('../fixtures');
var testAsm = fixtures.testAsm;

describe('wasm Compiler/x64/Memory', function() {
  it('should compile i64 load/store', function() {
    testAsm(function() {/*
      i64 main() {
        i64 t = i64.const(0);
        i64.store(addr.from_64(t), i64.const(0xdead));
        return i64.load(addr.from_64(t));
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x8]
      cmp r15, rdx
      jcc le, 0x3

      xor rcx, rcx

      mov rdx, 0xdead
      mov [rax, rcx, 0x0], rdx
      mov rax, [rax, rcx, 0x0]
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i32 load/store', function() {
    testAsm(function() {/*
      i32 main() {
        i64 t = i64.const(0);
        i32.store(addr.from_64(t), i32.const(0xdead));

        i32 r = i32.load(addr.from_64(t));
        r = i32.add(r, i32.wrap(i64.load32_s(addr.from_64(t))));
        r = i32.add(r, i32.wrap(i64.load32_u(addr.from_64(t))));
        return r;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x4]
      cmp r15, rdx
      jcc le, 0x3
      xor rcx, rcx
      mov rdx, 0xdead
      mov [eax, ecx, 0x0], edx

      mov edx, [eax, ecx, 0x0]
      movsxd rsi, [rax, rcx, 0x0]
      mov esi, esi
      add rdx, rsi

      mov eax, [eax, ecx, 0x0]
      mov eax, eax
      add rax, rdx

      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i16 load/store', function() {
    testAsm(function() {/*
      i32 main() {
        i64 t = i64.const(0);
        i32.store16(addr.from_64(t), i32.const(0xdead));

        i32 r = i32.load16_s(addr.from_64(t));
        r = i32.add(r, i32.load16_u(addr.from_64(t)));
        return r;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x2]
      cmp r15, rdx
      jcc le, 0x3
      xor rcx, rcx
      mov rdx, 0xdead
      mov [eax, ecx, 0x0], edx

      movsxw rdx, [rax, rcx, 0x0]
      movzxw rax, [rax, rcx, 0x0]

      add rax, rdx
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile i8 load/store', function() {
    testAsm(function() {/*
      i32 main() {
        i64 t = i64.const(0);
        i32.store8(addr.from_64(t), i32.const(0xdead));

        i32 r = i32.load8_s(addr.from_64(t));
        r = i32.add(r, i32.load8_u(addr.from_64(t)));
        return r;
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x1]
      cmp r15, rdx
      jcc le, 0x3
      xor rcx, rcx
      mov rdx, 0xdead
      movb [eax, ecx, 0x0], edx

      movsxb rdx, [rax, rcx, 0x0]
      movzxb rax, [rax, rcx, 0x0]

      add rax, rdx
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile f32 load/store', function() {
    testAsm(function() {/*
      f32 main(f32 a) {
        i64 t = i64.const(0);
        f32.store(addr.from_64(t), a);
        return f32.load(addr.from_64(t));
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x4]
      cmp r15, rdx
      jcc le, 0x3
      xor rcx, rcx
      vmovd [eax, ecx, 0x0], xmm0
      vmovd xmm0, [eax, ecx, 0x0]
      mov rsp, rbp
      pop rbp
      ret
    */});
  });

  it('should compile f64 load/store', function() {
    testAsm(function() {/*
      f64 main(f64 a) {
        i64 t = i64.const(0);
        f64.store(addr.from_64(t), a);
        return f64.load(addr.from_64(t));
      }
    */}, function() {/*
      push rbp
      mov rbp, rsp

      mov rax, [rdi, 0x0]
      mov rcx, 0x0
      mov rdx, [rdi, 0x8]
      lea r15, [rcx, 0x8]
      cmp r15, rdx
      jcc le, 0x3
      xor rcx, rcx
      vmovq [rax, rcx, 0x0], xmm0
      vmovq xmm0, [rax, rcx, 0x0]
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

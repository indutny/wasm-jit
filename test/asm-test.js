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
        mov rax, [rbp, 0x10]
        mov rbx, [rbp, 0x18]
        add rax, rbx
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
        mov eax, [ebp, 0x10]
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
        movzxw rax, [rbp, 0x10]
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
        movzxb rax, [rbp, 0x10]
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
      mov rax, [rbp, 0x10]
      mov rbx, [rbp, 0x18]
      mov rcx, 0x54e
      add rbx, rcx
      add rax, rbx
      mov rsp, rbp
      pop rbp
      ret
    */});
  });
});

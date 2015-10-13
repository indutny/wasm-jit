#include <stdint.h>
#include <string.h>

#include "nan.h"

#include "src/std.h"

#define container_of(ptr, type, member) \
    ((type *) ((char *) (ptr) - offsetof(type, member)))

namespace wasm {
namespace std {

using namespace v8;

WasmContext::WasmContext() {
  space.size = kInitialSpaceSize;
  space.ptr = new uint8_t[space.size];
}


WasmContext::~WasmContext() {
  delete[] space.ptr;
  space.ptr = nullptr;
  space.size = 0;
}


void WasmContext::Resize(uintptr_t size) {
  if (size <= space.size)
    return;

  uint8_t* new_space = new uint8_t[size];
  memcpy(new_space, space.ptr, space.size);
  space.ptr = new_space;
  space.size = size;
}


void WasmContext::Free(char* data, void* hint) {
  WasmContext* ctx = reinterpret_cast<WasmContext*>(hint);
  delete ctx;
}


NAN_METHOD(CreateContext) {
  WasmContext* ctx = new WasmContext();

  info.GetReturnValue().Set(Nan::NewBuffer(
        ctx->data(),
        ctx->data_length(),
        WasmContext::Free,
        reinterpret_cast<void*>(ctx)).ToLocalChecked());
}


void WasmContext::ResizeMemory(void* data, uintptr_t size) {
  WasmContext* ctx = container_of(data, WasmContext, space);
  ctx->Resize(size);
}


static void FreeFn(char* data, void* hint) {
  // No-op
}


static Local<Value> GetFnPtr(uintptr_t fn) {
  return Nan::NewBuffer(reinterpret_cast<char*>(fn),
                        64,
                        FreeFn,
                        nullptr).ToLocalChecked();
}


static void Init(Handle<Object> target) {
  target->Set(Nan::New("resize_memory").ToLocalChecked(),
              GetFnPtr(reinterpret_cast<uintptr_t>(WasmContext::ResizeMemory)));

  Nan::SetMethod(target, "createContext", CreateContext);
}

}  // namespace std
}  // namespace wasm

NODE_MODULE(std, wasm::std::Init);

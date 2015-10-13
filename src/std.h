#include <stdint.h>

#include "nan.h"

namespace wasm {
namespace std {

class WasmContext {
 public:
  WasmContext();
  ~WasmContext();

  void Resize(uintptr_t size);
  uint8_t* Load(uintptr_t off, uintptr_t size);

  static void Free(char* data, void* hint);
  static void ResizeMemory(void* ictx, uintptr_t size);
  static void Print(void* ictx, uintptr_t str, uintptr_t size);

  inline char* data() { return reinterpret_cast<char*>(&space); }
  inline size_t data_length() { return sizeof(space); }

 protected:
  static const uintptr_t kInitialSpaceSize = 1024 * 1024;

  struct {
    uint8_t* ptr;
    uintptr_t size;
  } space;
};

}  // namespace std
}  // namespace wasm

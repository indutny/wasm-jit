# WebAssembly JIT Compiler

## Usage

```javascript
var wasm = require('wasm-jit');

var compiler = wasm.Compiler.create();

var module = 'your-module-name';
var src = 'void main() {}\n' +
          'export main';
var info = compiler.compile(module, src);

if (!info.main)
  throw new Error('No `main` function was exported');

var ctx = wasm.std.createContext();
info.main(ctx);
```

## Project structure

The project is at its very early phase, and please use it with care. The main
npm dependencies are:

- [wasm-ast][0] - parsing source string into AST form, which is similar to
  [Mozilla's AST][2] in many ways
- [wasm-cfg][1] - taking the source and transforming it into Control Flow Graph
- [json-pipeline][3] - basement for CFG graph, and for generic sea-of-nodes
  graph
- [ssa.js][4], [dominance-frontier][5] - building SSA form out of non-SSA CFG
- [json-pipeline-reducer][6] - performing reductions on sea-of-nodes graph
- [gvn][9] - Global Value Numbering algorithm, for removing common
  sub-expressions
- [json-pipeline-scheduler][7] - scheduling sea-of-nodes back to CFG
- [jit.js][8] - generating machine code out of CFG

### Directories

- `lib/*.js` - has very generic, API related files and entities like:
  - `compiler.js` - a Compiler instance and APIs
  - `pipeline.js` - responsible for transforming CFG to the machine code,
    invokes all reductions and optimizations
  - `ref-table.js` - RefTable instance, holds references to modules'
    functions (both exported and internal), also holds `namespace` hashmap, used
    for looking up imported functions
  - `std` - standard library module, and context creation API
- `lib/<platform-name>/**/*.js` - platform-specific implementation (or base
  for all platform implementations):
  - `codegen/` - instance, responsible for generating machine code out of the
    CFG, invoked by `lib/pipeline.js`
  - `codegen/builder.js` - convenience methods for defining opcodes on the
    Codegen (see `builder.opcode()` throughout the code base)
  - `reductions/` - holds optimizing and instruction selecting reductions,
    invoked by `lib/pipeline.js`. May have different reduction phases, which
    will be invoked in specific order by `lib/pipeline.js`
  - `gvn/` - Global Value Numbering relations, i.e. the criteria for determining
    that two expressions are equivalent, and could be replaced by a single one

Each reduction and GVN relation have their own tests. Platform tests live in
`test/<platform-name>`. General tests in `test/*-test.js`.

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2015.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://github.com/indutny/wasm-ast
[1]: https://github.com/indutny/wasm-cfg
[2]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
[3]: https://github.com/indutny/json-pipeline
[4]: https://github.com/js-js/ssa.js
[5]: https://github.com/js-js/dominance-frontier
[6]: https://github.com/indutny/json-pipeline-reducer
[7]: https://github.com/indutny/json-pipeline-scheduler
[8]: https://github.com/js-js/jit.js
[9]: https://github.com/indutny/gvn

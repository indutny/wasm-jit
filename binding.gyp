{
  "targets": [
    {
      "target_name": "std",

      "include_dirs": [
        ".",
        "<!(node -e \"require('nan')\")",
      ],

      "sources": [
        "src/std.cc",
      ],
    }
  ]
}

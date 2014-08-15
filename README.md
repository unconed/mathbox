# README #

Note: this repo uses submodules, clone it with `--recursive` or do a `git submodule init`.

# DANGER WILL ROBINSON! #

Currently fucked/incomplete:

- Voxel/volume (3D sampler)
- Split/join operator (initial idea was dumb, need to revisit)
- Per vertex colors (broken due to shadergraph edge case, disabled for now)

See examples/ for a start.

####

/src tree:

* model/      - DOM tree + CSS selector handling
* primitives/ - The DOM node types (the legos)
* render/     - Smart proxies for Three.js (the glue)
* shaders/    - GLSL code
* stage/      - API / controllers (mostly missing)
* util/       - It's inevitable

Uses gulp to build.
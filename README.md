# MathBox

### Presentation-quality WebGL math graphing

![MathBox](http://acko.net/files/mathbox2/cover1.jpg)

MathBox is a library for rendering presentation-quality math diagrams in a browser using WebGL. Built on top of Three.js and ShaderGraph, it provides a clean API to visualize mathematical relationships and animate them declaratively.

MathBox is used through its JS-based DOM.

For background, see the [article series on Acko.net](http://acko.net/blog/mathbox2/).

Demos:

- [Audio Visualizer](http://acko.net/files/mathbox2/iframe-readyornot.html)
- [Cylindrical Stream](http://acko.net/files/mathbox2/iframe-cylindrical-stream.html)
- [Data/Shape Mapping](http://acko.net/files/mathbox2/iframe-lineup.html)
- [LaTeX/HTML/GL Labels](http://acko.net/files/mathbox2/iframe-labels.html)
- [Quaternion Hypersphere](http://acko.net/files/mathbox2/iframe-quat.html)
- [Render-to-Texture History](http://acko.net/files/mathbox2/iframe-rtt-history.html)
- [Vertex Warping](http://acko.net/files/mathbox2/iframe-vertex.html)
- [Volumetric Vectors](http://acko.net/files/mathbox2/iframe-volume.html)

Presentations:

- [The Pixel Factory](http://acko.net/files/gltalks/pixelfactory/online.html#0)

_Note: this repo uses submodules, clone it with `--recursive` or do a `git submodule update --init` after cloning._

---

## Installation

- via npm:

  ```bash
  npm install mathbox
  ```

- or CDN:
  ```html
  <script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/mathbox@latest/build/bundle/mathbox.js"
  ></script>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/mathbox@latest/build/mathbox.css"
  />
  ```

Open the included `/examples` to see more demos.

---

## Docs & Help

See:

- [Quick Start](docs/intro.md) for a hands on introduction.
- [Glossary](docs/glossary.md) of terms to help get familiar with MathBox and WebGL.
- [MathBox API](docs/api.md) for typical usage.
- [List of Primitives](docs/primitives.md) for a full element reference.
- [Writing Custom Shaders](docs/shaders.md) for info on custom shaders and GPU-side processing.
- [Context API](docs/context.md) for advanced usage.

Join us in the [MathBox Google Group](https://groups.google.com/forum/#!forum/mathbox) or #mathbox on Freenode.

---

## Basic Usage

Construct a MathBox instance using the provided `mathBox()` constructor:

```javascript
import { mathBox } from "mathbox";
import "mathbox/mathbox.css";

const mathbox = mathBox(options);

const three = mathbox.three;
// three.renderer, three.scene, three.camera
```

See [threestrap](https://github.com/unconed/threestrap) for all available `options`. e.g. To spawn inside a specific element, do:

```js
const element = document.querySelector("#my-thing");
const mathbox = MathBox.mathBox({ element: element });
```

On initialization, it returns a MathBox API object, wrapping the MathBox `<root/>`. You can spawn new nodes:

```jsx
<cartesian
  range={[
    [-2, 2],
    [-1, 1],
    [-1, 1],
  ]}
  scale={[2, 1, 1]}
>
  <axis axis={1} />
  <axis axis={2} />
</cartesian>
```

via

```js
const view = mathbox
  .cartesian({
    range: [
      [-2, 2],
      [-1, 1],
      [-1, 1],
    ],
    scale: [2, 1, 1],
  })
  .axis({
    axis: 1,
  })
  .axis({
    axis: 2,
  });
```

You can select objects using `.select()` and a CSS-like selector to get a jQuery-like selection:

```javascript
mathbox.select("cartesian > axis");
```

Use `.print()`, `.inspect()` and `.debug()` to show information about a selection.

---

## Related Projects

- [threestrap](https://github.com/unconed/threestrap) - Three.js bootstrapper
- [shadergraph](https://github.com/unconed/shadergraph) - Functional GLSL linker

---

MathBox and ShaderGraph (c) Steven Wittens 2013-2022. MIT License.

Libraries and 3rd party shaders (c) their respective authors.

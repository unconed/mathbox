# MathBox

[![NPM Package][npm]][npm-url]
[![Build Status][build-status]][build-status-url]
[![License][license]][license-url]

### Presentation-quality WebGL math graphing

![MathBox](http://acko.net/files/mathbox2/cover1.jpg)

MathBox is a library for rendering presentation-quality math diagrams in a
browser using WebGL. Built on top of [Three.js][three-url] and
[ShaderGraph][shadergraph-url] it provides a clean API to visualize mathematical
relationships and animate them declaratively.

For background, see the [article series on
Acko.net](http://acko.net/blog/mathbox2/).

**Presentations**:

- [The Pixel Factory](http://acko.net/files/gltalks/pixelfactory/online.html#0**

**Demos**:

- [Audio Visualizer](https://mathbox.org/demo/audio-visualizer.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/demo/audio-visualizer.html))
- [Cylindrical Stream](https://mathbox.org/demo/cylindrical-stream.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/demo/cylindrical-stream.html))
- [Data/Shape Mapping](https://mathbox.org/demo/shapes.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/demo/shapes.html))
- [LaTeX/HTML/GL Labels](https://mathbox.org/demo/labels.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/demo/labels.html))
- [Quaternion Hypersphere](https://mathbox.org/math/quat.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/math/quat.html))
- [Render-to-Texture History](test/resample2.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/test/resample2.html))
- [Vertex Warping](test/vertex.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/test/vertex.html))
- [Volumetric Vectors](test/volume.html) ([code](https://github.com/unconed/mathbox/blob/master/examples/test/volume.html))

And many more at https://mathbox.org.

## Installation

You can install MathBox via [npm][npm-url] for use with a bundler like
[Webpack](https://webpack.js.org/), or include a global `MathBox` object onto
your page by including the library via CDN.

### NPM Package

- Run the following in your project's directory to install MathBox and
  [Three.js][three-url] via [npm][npm-url]:

```bash
npm install --save mathbox three
```

Import `THREE` and `MathBox` (library and stylesheet), along with a controls
instance that you'll pass to the `MathBox.mathBox` constructor:

```js
import "mathbox/mathbox.css"

import { * as THREE } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { * as MathBox } from "mathbox"
```

### Install via CDN

Include the following in your HTML header to load all required libraries and
styles:

```html
<!-- Install your choice of three.js version from CDN: -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/three@0.137.0/build/three.min.js"
></script>

<!-- Load a Controls instance, making sure that the version matches the Three.js version above: -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/three@0.137.0/examples/js/controls/OrbitControls.js"
></script>

<!-- Install the latest MathBox, either mathbox.js or mathbos.min.js -->
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/mathbox@latest/build/bundle/mathbox.js"
></script>

<!-- Include the MathBox CSS: -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/mathbox@latest/build/mathbox.css"
/>
```

## Basic Usage

Construct a MathBox instance by passing initialization options to the
`mathBox()` constructor:

```js
const options = {
  controls: {
    // Orbit controls, i.e. Euler angles, with gimbal lock
    klass: THREE.OrbitControls
  },
};
const root = MathBox.mathBox(options);
```

> See [threestrap](https://github.com/unconed/threestrap) for all available
`options`.

To spawn inside a specific element, pass an
[`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)
with the `element` option:

```js
const element = document.querySelector("#my-thing");

const options = {
  element: element,
  controls: {
    klass: THREE.OrbitControls
  },
};
const root = MathBox.mathBox(options);
```

On initialization, `mathBox` returns a MathBox API object, wrapping the MathBox
`<root/>`. Insert new MathBox nodes into the component tree by calling the
method associated with the primitive you'd like to add.

> See [the Primitives doc](docs/primitives.md) for a description of all
> primitives and their properties.

The following code will set up a 3D Cartesian coordinate system with the
specified range and scale for its x, y and z axes, and then insert an `x` and
`y` axis into the scene:

```js
const view = root
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

Use your mouse to click and drag the camera's orientation, and zoom in and out:

![2023-01-19 11 32
59](https://user-images.githubusercontent.com/69635/213530497-22cdf2c2-bea6-4ef4-beea-fbebf73c85d4.gif)

Each primitive call:

- creates a new element
- inserts it into the tree
- returns a version of the API object with its selection focused on the new element.

Calling `print()` on some selection will print a representation to the console
of the selection and any children. For example, `view.print()` prints the
following:

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

Select objects using `.select()` and a CSS-like selector to get a jQuery-like
selection:

```javascript
root.select("cartesian > axis");
```

Next, visit the [Quick Start](docs/intro.md) page for a more involved example
that builds up an animating, interactive mathematical graph with labeled axes.

## Docs & Help

For help, see the following resources:

- [Glossary](docs/glossary.md) of terms to help get familiar with MathBox and WebGL.
- [MathBox API](docs/api.md) for typical usage.
- [List of Primitives](docs/primitives.md) for a full element reference.
- [Writing Custom Shaders](docs/shaders.md) for info on custom shaders and GPU-side processing.
- [Context API](docs/context.md) for advanced usage.

For more involved questions, or just to say hi, please join us in the [MathBox
Google Group][google-group-url].

## Related Projects

- [threestrap](https://github.com/unconed/threestrap) - Three.js bootstrapper
- [shadergraph][shadergraph-url] - Functional GLSL linker
- [MathBox-react](https://github.com/christopherChudzicki/mathbox-react) - React bindings for MathBox
- [MathBox.cljs](https://github.com/mentat-collective/mathbox.cljs) - ClojureScript bindings for MathBox via MathBox-react

## Who's using MathBox?

- [Math3D online graphing calculator](https://www.math3d.org/)
- [KineticGraphs JS Engine](https://kineticgraphs.org/) ([code](https://github.com/cmakler/kgjs))
- [Textbook: "Interactive Linear Algebra""](https://textbooks.math.gatech.edu/ila/) ([code](https://github.com/QBobWatson/ila))
- Many visualizations at [Sam Zhang's homepage](https://sam.zhang.fyi/#projects)
- Jesse Bettencourt's [Torus Knot Fibration](http://jessebett.com/TorusKnotFibration/) Master's project ([code](https://github.com/jessebett/TorusKnotFibration))
- [Interactive knot visualizations](https://rockey-math.github.io/mathbox/graph3d-curve)

And the many demos listed on [this
thread](https://groups.google.com/g/mathbox/c/Uvyb5fHaLq4) of the [MathBox
Google group][google-group-url].

## License

[MIT License](LICENSE.md).

MathBox and ShaderGraph (c) Steven Wittens 2013-2022.

Libraries and 3rd party shaders (c) their respective authors.

[npm]: https://img.shields.io/npm/v/mathbox
[npm-url]: https://npmjs.com/package/mathbox
[build-size]: https://badgen.net/bundlephobia/minzip/mathbox
[build-size-url]: https://bundlephobia.com/result?p=mathbox
[build-status]: https://github.com/unconed/mathbox/actions/workflows/tests.yaml/badge.svg?branch=master
[build-status-url]: https://github.com/unconed/mathbox/actions/workflows/tests.yaml
[license]: https://img.shields.io/badge/license-MIT-brightgreen.svg
[license-url]: LICENSE.md
[google-group-url]: https://groups.google.com/forum/#!forum/mathbox
[three-url]: https://threejs.org/
[shadergraph-url]: https://github.com/unconed/shadergraph

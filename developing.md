# Development

## Project Structure

```
build/
├─ bundle/            ... Web bundle
├─ module/            ... ES6 module
├─ mathbox.css        ... splash css
build/                ... a wealth of examples
src/
├─ model/             ... DOM tree + CSS selector handling
├─ primitives/        ... The DOM node types (the legos)
├─ render/            ... Smart proxies for Three.js (the glue)
├─ shaders/           ... GLSL code
├─ stage/             ... API / controllers
├─ util/              ... It's inevitable
```

## Build and bundling

We build primarily using Webpack. CSS is bundled using gulp.

`npm run build` will build the web bundle, css, ES6 module distribution.

Local changes can be visually inspected by changing `<script>` tags in the `examples/` directory to point to `/build/bundle/mathbox.js`. In this scenario, it can be useful to build the bundle in watch mode:

```
npm run build:bundle -- --watch
```

## Tests

We run tests in real browsers using Karma. Using a real browser ensures webgl contexts exist rather than being mocked away.

New tests should be written in Typescript.

Run the tests with

```
npm run tests -- --watch
```

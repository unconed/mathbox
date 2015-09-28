### MathBox.Context

See `examples/test/context.html` for a full usage example.

```javascript
var context = new MathBox.Context(renderer, scene, camera);

// Insert / remove from scene and surrounding DOM.
context.init();
context.destroy();

// Basic dimensions
context.resize(size = {viewWidth: WIDTH, viewHeight: HEIGHT});

// OR Give exact dimensions
context.resize(size = {viewWidth: WIDTH,   viewHeight: HEIGHT,
                       renderWidth: WIDTH, renderHeight: HEIGHT,
                       aspect: WIDTH / HEIGHT, pixelRatio: 1});

// Update one frame
context.frame();

// OR Update with custom clock
context.frame(time = {now, time, delta, clock, step});


// OR Step through update cycle
context.pre(time = {now, time, delta, clock, step});
context.update()
context.render()
context.post()

// now: unix timestamp in s
// time: real time in s
// delta: real time step in s
// clock: adjustable clock in s
// step: adjustable step in s
```

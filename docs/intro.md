# MathBox Intro

Open `examples/empty.html` in your text editor and browser.

Paste the following snippets into the HTML and refresh.

1) Cartesian view, axes and grid.

```javascript
var view =
  mathbox
  .camera({
    proxy: true,
    position: [0, 0, 3],
  })
  .cartesian({
    range: [[-2, 2], [-1, 1], [-1, 1]],
    scale: [2, 1, 1],
  })
    .axis({
      axis: 1,
      width: 3,
    })
    .axis({
      axis: 2,
      width: 3,
    })
    .grid({
      width: 2,  
      divideX: 20,
      divideY: 10,        
    })
```

2) Curve with live emitter

```javascript
var curve =
  view.interval({
    expr: function (emit, x, i, t) {
      emit(x, Math.sin(x + t));
    },
    length: 64,
    channels: 2,
  })
  .line({
    width: 5,
    color: '#3090FF',
  });
```

See `examples/` for more ideas and `examples/test` for specific usage.
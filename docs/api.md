## API Overview

The MathBox API uses the concept of selections, similar to D3 or jQuery. The default API object, `mathbox`, returned from the mathBox() constructor, is a selection that points to the `<root />` node.

You can change properties on a selection by calling `.set()`, either to change a single property, or multiple at once:

```javascript
// Single
mathbox.set('focus', 3);
mathbox.set('speed', 2);

// Multiple
mathbox.set({
  focus: 3,
  speed: 2,
});
```

You can append elements to the root node by calling the matching `.type()` function, passing in its properties, e.g.:

```javascript
mathbox.cartesian({
  range: [[-1, 1], [-1, 1]],
})
```

You may also pass in an object containing live expression as a second parameter, which will be evaluated dynamically every frame, based on the (local) clock:

```javascript
mathbox.line({
  // ...
}, {
  width: function (time, delta) {
    return 2 + Math.sin(t);
  }
})
```

This is equivalent to calling `.bind()` after creation, which works similarly to `.set()`:

```javascript
// Single
mathbox.bind("width", function (time, delta) {
  return 2 + Math.sin(t);
});

// Multiple
mathbox.bind({
  width: function (time, delta) {
    return 2 + Math.sin(t);
  }
})
```

Here `time` is the elapsed clock time, while `delta` is the difference in time with the previous frame. The default clock is time elapsed since page load, but you may use the `<clock>` and `<now>` primitives to control time hierarchically.

## Functions on Selections

* `select("selector")` - A function on `mathbox` that returns a selection of all the nodes matching the selector. Like CSS, the selector may be the name of a primitive (e.g. `"camera"`), an id (e.g. `"#colors"`), or a class (e.g. `".points"`).
* `get("propName")` - Get the current value of an prop.
* `get()` - Get the current values of all props.
* `set("propName", value)` - Set an prop to the value provided.
* `set({ propName: value, ... })` - Set multiple props to the values provided.
* `bind("propName", function(t, d) { ... })` - Invoke the function every frame and set the prop to its return value.
* `bind({ propName: function(t, d) { ... }, ... })` - Invoke functions every frame to set multiple props to the return values.

Example: `present.set('index', present.get('index') + 1);`

## Additional APIs

* `inspect()` - Print (in the console) the DOM nodes in this selection. Called automatically on first load.
* `debug()` - Display a visual representation of all shader snippets, how they are wired, with the GLSL available on mouseover.
* `orig("propName")` - Return the value of the prop as passed in, i.e. without renormalization. Used mostly for pretty-printing.
* `orig()` - Return the values of all props as passed in, i.e. without renormalization. Used mostly for pretty-printing.
* `end()` - Indicate that subsequent nodes are siblings rather than children of the current node. Example: `group().child().child().end().sibling();`
* `each(function (node) { ... })` - Iterate over a selection's nodes in document order and discard the return values.
* `map(function (node) { return ... })` - Iterate over a selection's nodes in document order and return the resulting values as an array.
* `eq(i)` - Select the i'th node where i is a 0-indexed number of the node in question.

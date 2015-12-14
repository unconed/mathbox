# Custom GLSL shaders in MathBox

MathBox offloads most of its computations onto the GPU. As it assembles shaders on the fly, you can easily insert your own pieces of shader code. This is either as part of the usual vertex/fragment shader, or as a (re)sampler, which processes pure data, whether it's values, colors, sprites, weights, and so on.

The `<shader>` node lets you add a GLSL shader you have written into Mathbox. The specific form of the shader will depend on the operator that uses the shader (`<resample>`, `<retext>`, `<mask>`, `<vertex>` or `<fragment>`). By default, they will link up with a preceding `<shader>`, but you can select any shader node using the `shader` prop.
  
The shader snippet it references will look something like this:

    <script type="application/glsl" id="map-temporal-blur">
      uniform float intensity;

      vec4 getSample(vec3 xyz);
      vec4 getFramesSample(vec3 xyz) {
        vec4 color = (
          getSample(xyz) +
          getSample(xyz + vec3(0.0, 0.0, 1.0)) +
          getSample(xyz + vec3(0.0, 0.0, 2.0)) +
          getSample(xyz + vec3(0.0, 0.0, 3.0))
        ) / 4.0;
        float v = (color.x + color.y + color.z) * intensity;
        return vec4(vec3(v * v) / 8.0, 1.0);
      }
    </script>

 * The names of the functions are not relevant outside the `<script>` block.  The functions are considered anonymous lambdas. The name that matters is the id in the script tag.
 * These scripts have type `application/glsl` and use different conventions from JavaScript.
 * The script shown here has random access to inputs using `getSample()`.  Here it is accessing four different values.
 * Global parameters are defined as `uniforms` and can be set like any other prop on the `<shader>` node, e.g. `.shader({ code: "...", intensity: 2 })`.

## Multiple Sources

Shaders are not limited to sampling from one (implied) source. You can specify an array of additional `sources` as a prop. This can be an array of selectors and/or nodes. Note you can also pass the code inline instead of via a `<script>` tag, though this is awkward without multi-line strings in classic JavaScript.

For example, for a `.shader({ code: "#multi-shader", sources: ["#array1", "#array2"] })`, the GLSL code would look like this:

    <script type="application/glsl" id="multi-shader">
      // External sources
      vec4 getArray1Sample(vec4 xyzw);
      vec4 getArray2Sample(vec4 xyzw);

      // Source being resampled
      vec4 getSample(vec4 xyzw);
      vec4 getFramesSample(vec4 xyzw) {
        return (getArray1Sample(xyzw) + getArray2Sample(xyzw)) * getSample(xyzw);
      }
    </script>

This samples both arrays and combines it with the third (implied) source. The order of the function definitions is matched with the array, their names are ignored. Note that external sources always have the signature `vec4 function(vec4)`, unlike implied sources, which depend on use (see below).

## Resample

This will take a data array and produce a new one, of the same or different size.

The callback signature depends on both indices and channels, mapping to float/vec2/vec3/vec4. Indices specifies the type of the argument, channels the return type. The example below is `{indices: 3, channels: 4}`:

    <script type="application/glsl" id="resample-shader">
      uniform vec3 dataResolution;   // inverse dimensions (sample-adjusted)
      uniform vec3 dataSize;         // dimensions
      uniform vec3 targetResolution; //
      uniform vec3 targetSize;       //
      
      vec4 getSample(vec3 xyz);         // indices 3, channels 4
      vec4 getFramesSample(vec3 xyz) {  //
        return getSample(xyz);          //
      }
    </script>

Used e.g. as
  
    mathbox
    .matrix({ ... })
    .shader({
      code: "#resample-shader"
    })
    .resample({
      indices: 3,
      channels: 4,
    });

Resample has a plethora of options, including the choice of centered vs uncentered sampling on each axis (e.g. `centeredX: false`). Uncentered sampling places the data on the corners, on coordinates 0...N-1 in each dimension. Centered sampling places the data in the middle, on coordinates [0.5...N-0.5].

Uncentered (default) sampling is appropriate for raw data, like an array of points being reduced to the even items. Centered sampling is appropriate for continuous/lerped data, like an image being resampled with bilinear filtering.

## Retext

This will take a GL text array and produce a new one, of the same or different size.

To render text, MathBox will produce a 2D text atlas, i.e. a bunch of text sprites packed into rows and columns in one big image. Each "data point" is then an (x,y,w,h) vec4, describing the XY offset and Width/Height of a sprite in the atlas.

So when you "retext", you are basically taking an input set of text sprites, and producing a new output set of sprites. This can be an arbitrary selection/permutation/repetition and can be larger or smaller.

Retext is easiest to understand with an example. Suppose you want to take an array of colors and render them as RGB strings, i.e. "0" to "255". You first emit text for the strings "0" to "255":

    mathbox
    .text({
      width: 256,
      weight: 'bold',
      expr: function (emit, i) { emit(i); },
    });

Now you can take your array of source data, `#colors`, and retext your strings to produce the matching sprite per data point, e.g. for the red channel:

    <script type="application/glsl" id="retext-shader">
      vec4 getColorSample(vec4 xyzw);
      vec4 getTextSample(vec4 xyzw);
    
      vec4 resample(vec4 xyzw) {
        vec4 rgba = getColorSample(xyzw);
        float i   = floor(rgba.r * 255.0 + .5);
        return getTextSample(vec4(i, 0, 0, 0));
      }
    </script>

    mathbox
    .shader({
      sources: ["#colors"],
      code: "#retext-shader"
    .retext({
      sample: 'absolute', // sample absolute source instead of relative to target
      width: WIDTH,
      height: HEIGHT,
    })
    .label({
      points: "#points", // e.g.
      color: 'red',
    })

## Mask

Mask is a specialized vertex + fragment shader for transparency masking. It takes 4D UV coordinates (stpq) and produces a floating point mask value.

While the result will be clamped to 0...1 and applied in the fragment shader, the per-vertex value is unbounded. This allows for transitions that are sharper than the underlying geometry. For example, if one vertex has mask 2 and the next has -1, then the actual transition from 0..1 will be in the middle, half as wide as the vertex spacing. This is what allows e.g. the `stagger` option on `.reveal()` to work even on low-res geometry.

The coordinates `stpq` passed in are in the range 0...1 across the source data, e.g.:

    <script type="application/glsl" id="mask-shader">
    float getMask(vec4 stpq) {
      vec2 sines = sin(stpq.st * 10.0);
      return (sines.x * sines.y);
    }
    </script>

    mathbox
    .shader({
      code: "#mask-shader",
    })
    .mask()
      // masked shapes
    .end()

## Vertex

Vertex is a raw vertex shader stage (per vertex/point). It takes a position (xyzw) and 4D UV coordinates (stpq) and produces new ones.

    <script type="application/glsl" id="vertex-shader">
    vec4 vertexShader(vec4 xyzw, inout vec4 stpq) {
      return xyzw;
    }
    </script>

    mathbox
    .shader({
      code: "#vertex-shader",
    })
    .vertex()
      // vertex shaded shapes
    .end()

 * You can control when your shader is applied using the `pass` property:
    - `data` operates on the original source data, before any views are applied.
    - `view` (default), works like any other view, e.g. `<polar>`.
    - `world` is applied after all the views.
    - `eye` is applied in eye space, i.e. relative to the current view.
 * If you wish for the modified STPQ value to be passed to a custom fragment shader, add a `#define POSITION_STPQ` to both.
 * Custom `varyings` will not work as expected, as a shader may call this snippet for neighbouring data points as well.

# Fragment

Fragment is a raw fragment shader stage (per pixel/sample). It takes a color (rgba) and 4D UV coordinates (stpq) and produces new ones.

    <script type="application/glsl" id="vertex-shader">
    vec4 fragmentShader(vec4 rgba, inout vec4 stpq) {
      return rgba;
    }
    </script>

    mathbox
    .shader({
      code: "#fragment-shader",
    })
    .fragment()
      // Fragment shaded shapes
    .end()
  
  * Colors outside the range 0...1 may be used in a floating point render-to-texture.
  * Set `.fragment({ gamma: false })` to operate directly in linear RGB rather than sRGB.
  * Applying a fragment shader will disable the built-in shader for surfaces.

## GLSL shaders for Javascript Programmers

 * Color format is RGBA. Each component is a float (0.0 to 1.0) and A is 1.0 for full opacity.
 * Write such constants as `1.0` rather than `1`. The floating point nature matters and is not converted automatically.
 * Values outside the range 0.0..1.0 will not be clamped automatically. `clamp()` is your friend.
 * `vec4( v.yx, 0.5, 1.0 )` is shorthand for `vec4( v.y, v.x, 0.5, 1.0 )`
 * `vec3( 7.0 )` is shorthand for `vec3( 7.0, 7.0, 7.0 )`
 * Your shader does not need to call `getSample()` if it can compute its results just from the coordinates passed in to it.


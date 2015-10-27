# Custom GLSL shaders in MathBox

The Mathbox `<shader>` node lets you add a GLSL shader you have written into Mathbox.  The shader snippet it references will look something like this:

    <script type="application/glsl" id="map-temporal-blur">
      vec4 getSample(vec3 xyz);
      vec4 getFramesSample(vec3 xyz) {
        vec4 color = (
          getSample(xyz) +
          getSample(xyz + vec3(0.0, 0.0, 1.0)) +
          getSample(xyz + vec3(0.0, 0.0, 2.0)) +
          getSample(xyz + vec3(0.0, 0.0, 3.0))
        ) / 4.0;
        float v = color.x + color.y + color.z;
        return vec4(vec3(v * v) / 8.0, 1.0);
      }
    </script>

 * The names of the functions are not relevant outside the `<script>` block.  The functions are anonymous lambdas.  The name that matters is the id in the script tag.
 * These scripts have type `application/glsl`.  The conventions of these glsl scripts are different to javascrpt.
 * The script shown here has random access to inputs using `getSample()`.  Here is accessing four different values.

## GLSL shaders for Javascript Programmers

 * Color format is RGBA.  Each component is a float (0.0 to 1.0) and A is 1.0 for full opacity.
 * Write such constants as `1.0` rather than `1`.  The floating point nature matters and is not converted automatically.
 * Values outside the range 0.0..1.0 will not give what you expect.  `clamp()` is your friend.
 * `vec4( v.yx, 0.5, 1.0 )` is shorthand for `vec4( v.y, v.x, 0.5, 1.0 )`
 * `vec3( 7.0 )` is shorthand for `vec3( 7.0, 7.0, 7.0 )`
 * Your shader does not need to call `getSample()` if it can compute its results just from the coordinates passed in to it.


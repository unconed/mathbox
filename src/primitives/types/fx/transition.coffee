Parent = require '../base/parent'
Util = require '../../../util'

class Transition extends Parent
  @traits = ['node', 'transition', 'transform', 'mask']

  make: () ->
    code = """
    uniform float transitionEnter;
    uniform float transitionExit;
    uniform vec4  transitionStagger;
    uniform vec4  transitionFlip;

    float getSignedDistance(vec4 stpq) {
      float enter   = transitionEnter;
      float exit    = transitionExit;
      vec4  stagger = transitionStagger;

      float skew    = dot(vec4(1.0), stagger);
      float scale   = 1.0 + skew;

      stpq = mix(stpq, vec4(1.0) - stpq, transitionFlip);
      float offset  = dot(stpq, stagger);

      float d1 = enter * scale - offset;
      float d2 = exit  * scale + offset - skew;

      return min(d1, d2);
    }
    """

    @uniforms =
      transitionEnter:    @node.attributes['transition.enter']
      transitionExit:     @node.attributes['transition.exit']
      transitionStagger:  @node.attributes['transition.stagger']
      transitionFlip:     @node.attributes['transition.flip']

    @shader = @_shaders.shader().pipe code, @uniforms

  mask: (shader) ->
    if shader
      s = @_shaders.shader()
      s.pipe Util.GLSL.identity 'vec4'
      s.fan()
      s  .pipe shader, @uniforms
      s.next()
      s  .pipe @shader
      s.end()
      s.pipe "float combine(float a, float b) { return min(a, b); }"
    else
      s = @_shaders.shader()
      s.pipe @shader

    @_inherit('mask')?.mask(s) ? s

  transform: (shader, pass) ->
    shader.pipe 'transform3.position', @uniforms if pass == @props.pass
    super shader, pass

module.exports = Transition
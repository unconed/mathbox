Base            = require './base'
ScreenGeometry  = require('../geometry').ScreenGeometry
Util            = require '../../util'

class Screen extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    fragment = options.fragment

    @geometry = new ScreenGeometry
      width:    options.width
      height:   options.height

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    v.pipe    'raw.position',    @uniforms
    v.fan()
    v  .pipe  'stpq.xyzw',       @uniforms
    v.next()
    v  .pipe  'screen.position', @uniforms
    v.join()

    f = factory.fragment
    f.require options.fragment
    f.fan()
    f.  pipe  'stpq.sample.2d'
    f.next()
    f.  pipe  'style.color',     @uniforms
    f.pass()
    f.pipe    Util.GLSL.binaryOperator 'vec4', '*'
    f.pipe    'fragment.color',  @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Screen

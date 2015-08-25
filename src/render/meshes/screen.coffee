Base            = require './base'
ScreenGeometry  = require('../geometry').ScreenGeometry
Util            = require '../../util'

class Screen extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    map      = options.map
    combine  = options.combine

    hasStyle = uniforms.styleColor?

    @geometry = new ScreenGeometry
      width:    options.width
      height:   options.height

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    v.pipe    'raw.position.scale', @uniforms
    v.fan()
    v  .pipe  'stpq.xyzw.2d',       @uniforms
    v.next()
    v  .pipe  'screen.position',    @uniforms
    v.join()

    f = factory.fragment
    f.require options.map
    f.pipe    'stpq.sample.2d'
    if hasStyle
      f.pipe  'style.color',        @uniforms
      f.pipe  combine                               if combine
      f.pipe  Util.GLSL.binaryOperator 'vec4', '*'  if !combine
    f.pipe    'fragment.color'

    @material = @_material factory.link
      side: THREE.DoubleSide

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false

    @_raw object
    @renders = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @renders = @geometry = @material = null
    super

module.exports = Screen

Base            = require './base'
ScreenGeometry  = require('../geometry').ScreenGeometry
Util            = require '../../util'

class Screen extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, map, combine, stpq, linear} = options
    uniforms ?= {}

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

    factory.fragment = f =
      @_fragmentColor hasStyle, false, null, null, map, 2, stpq, combine, linear

    f.pipe 'fragment.color',        @uniforms

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

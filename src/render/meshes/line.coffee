Base         = require './base'
LineGeometry = require('../geometry').LineGeometry

class Line extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, position, color, mask, clip, stroke} = options

    uniforms ?= {}
    stroke   = [null, 'dotted', 'dashed'][stroke]

    hasStyle = uniforms.styleColor?

    @geometry = new LineGeometry
      samples: options.samples
      strips:  options.strips
      ribbons: options.ribbons
      layers:  options.layers
      anchor:  options.anchor

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    defs = {}
    defs.LINE_STROKE = '' if stroke
    defs.LINE_CLIP   = '' if clip

    v = factory.vertex

    @_vertexColor v, color, mask

    v.require position if position
    v.require 'mesh.vertex.stpq',     @uniforms
    v.pipe 'line.position',           @uniforms, defs
    v.pipe 'project.position',        @uniforms

    f = factory.fragment
    f.pipe "fragment.clip.#{stroke}", @uniforms if stroke
    f.pipe 'fragment.clip.ends',      @uniforms if clip

    @_fragmentColor f, hasStyle, false, color, mask

    f.pipe 'fragment.color',          @uniforms

    @material = @_material factory.link
      side: THREE.DoubleSide
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Line

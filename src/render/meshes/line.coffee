Base         = require './base'
LineGeometry = require('../geometry').LineGeometry

class Line extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    {uniforms, material, position, color, mask, map, combine, stpq, linear, clip, stroke, join, proximity} = options

    uniforms ?= {}
    stroke   = [null, 'dotted', 'dashed'][stroke]

    hasStyle = uniforms.styleColor?

    # Line join
    join   = ['miter', 'round', 'bevel'][join] ? 'miter'
    detail = {miter: 1, round: 4, bevel: 2}[join]

    @geometry = new LineGeometry
      samples: options.samples
      strips:  options.strips
      ribbons: options.ribbons
      layers:  options.layers
      anchor:  options.anchor
      closed:  options.closed
      detail:  detail

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    defs = {}
    defs.LINE_STROKE    = '' if stroke
    defs.LINE_CLIP      = '' if clip
    defs.LINE_PROXIMITY = '' if proximity?

    defs['LINE_JOIN_' + join.toUpperCase()] = ''
    defs['LINE_JOIN_DETAIL'] = detail if detail > 1

    v = factory.vertex

    v.pipe @_vertexColor color, mask

    v.require @_vertexPosition position, material, map, 2, stpq
    v.pipe 'line.position',           @uniforms, defs
    v.pipe 'project.position',        @uniforms

    f = factory.fragment
    f.pipe "fragment.clip.#{stroke}", @uniforms if stroke
    f.pipe 'fragment.clip.ends',      @uniforms if clip
    f.pipe 'fragment.clip.proximity', @uniforms if proximity?

    f.pipe @_fragmentColor hasStyle, material, color, mask, map, 2, stpq, combine, linear

    f.pipe 'fragment.color',          @uniforms

    @material = @_material factory.link
      side: THREE.DoubleSide

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @renders = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @renders = @geometry = @material = null
    super

module.exports = Line

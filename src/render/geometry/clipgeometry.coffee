Geometry = require './geometry'

debug = false

tick = () ->
  now = +new Date
  return (label) ->
    delta = +new Date() - now
    console.log label, delta + " ms"
    delta

# Instanced geometry that is clippable along 4 dimensions
class ClipGeometry extends Geometry

  _clipUniforms: () ->

    @geometryClip       = new THREE.Vector4 1e10, 1e10, 1e10, 1e10
    @geometryResolution = new THREE.Vector4

    @uniforms ?= {}
    @uniforms.geometryClip =
      type: 'v4'
      value: @geometryClip
    @uniforms.geometryResolution =
      type: 'v4'
      value: @geometryResolution

  _clipGeometry: (width, height, depth, items) ->
    @geometryClip.set width - 1, height - 1, depth - 1, items - 1
    @geometryResolution.set 1 / (width - 1), 1 / (height - 1), 1 / (depth - 1), 1 / (items - 1)

  _clipOffsets: (factor, width, height, depth, items, _width, _height, _depth, _items) ->
    dims  = [ items,  depth,  height,  width]
    maxs  = [_items, _depth, _height, _width]
    elements = @_reduce dims, maxs

    @_offsets [
      start: 0
      count: elements * factor
    ]

module.exports = ClipGeometry
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
    @mapSize            = new THREE.Vector4

    @uniforms ?= {}
    @uniforms.geometryClip =
      type: 'v4'
      value: @geometryClip
    @uniforms.geometryResolution =
      type: 'v4'
      value: @geometryResolution
    @uniforms.mapSize =
      type: 'v4'
      value: @mapSize

  _clipGeometry: (width, height, depth, items) ->
    c = (x) -> Math.max 0, x - 1
    r = (x) -> 1 / Math.max 1, x - 1

    @geometryClip.set       c(width), c(height), c(depth), c(items)
    @geometryResolution.set r(width), r(height), r(depth), r(items)

  _clipMap: (mapWidth, mapHeight, mapDepth, mapItems) ->

    @mapSize.set mapWidth, mapHeight, mapDepth, mapItems

  _clipOffsets: (factor, width, height, depth, items, _width, _height, _depth, _items) ->
    dims  = [ depth,  height,  width,  items]
    maxs  = [_depth, _height, _width, _items]
    elements = @_reduce dims, maxs

    @_offsets [
      start: 0
      count: elements * factor
    ]

module.exports = ClipGeometry
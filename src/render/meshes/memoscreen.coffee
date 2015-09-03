Screen          = require './screen'
Util            = require '../../util'

class MemoScreen extends Screen
  constructor: (renderer, shaders, options) ->
    @memo = {items, width, height, depth, stpq} = options

    inv  = (x) -> 1 / Math.max 1, x
    inv1 = (x) -> 1 / Math.max 1, x - 1

    @uniforms =
      remapUVScale: {
        type: 'v2',
        value: new THREE.Vector2 items * width, height * depth }
      remapModulus: {
        type: 'v2',
        value: new THREE.Vector2 items, height }
      remapModulusInv: {
        type: 'v2',
        value: new THREE.Vector2 inv(items), inv(height) }
      remapSTPQScale: {
        type: 'v4',
        value: new THREE.Vector4 inv1(width), inv1(height), inv1(depth), inv1(items) }

    map = shaders.shader()
    map.pipe 'screen.map.xyzw', @uniforms
    if options.map?
      # Need artifical STPQs because the screen is not the real geometry
      map.pipe 'screen.map.stpq', @uniforms if stpq
      map.pipe options.map

    super renderer, shaders, {map, linear: true}

    for object in @renders
      object.transparent = false

    null

  cover: (width = @memo.width, height = @memo.height, depth = @memo.depth, items = @memo.items) ->
    inv1 = (x) -> 1 / Math.max 1, x - 1
    @uniforms.remapSTPQScale.value.set inv1(width), inv1(height), inv1(depth), inv1(items)

    x = width  / @memo.width
    y = depth  / @memo.depth
    y = height / @memo.height if @memo.depth == 1

    @geometry.cover x, y

module.exports = MemoScreen

Screen          = require './screen'
Util            = require '../../util'

class MemoScreen extends Screen
  constructor: (renderer, shaders, options) ->
    @memo = {items, width, height, depth, stpq} = options

    inv  = (x) -> 1 / Math.max 1, x
    inv1 = (x) -> 1 / Math.max 1, x - 1

    uniforms =
      remap2DScale: {
        type: 'v2',
        value: new THREE.Vector2 items * width, height * depth }
      remapModulus: {
        type: 'v2',
        value: new THREE.Vector2 items, height }
      remapModulusInv: {
        type: 'v2',
        value: new THREE.Vector2 inv(items), inv(height) }
      remap4DScale: {
        type: 'v4',
        value: new THREE.Vector4 inv1(width), inv1(height), inv1(depth), inv1(items) }

    map = shaders.shader()
    map.pipe 'screen.remap.4d.xyzw', uniforms
    map.pipe 'screen.remap.4d.stpq', uniforms if stpq
    map.pipe options.map if options.map?

    super renderer, shaders, {map}

    for object in @renders
      object.transparent = false

    null

  cover: (width = @memo.width, height = @memo.height, depth = @memo.depth) ->
    x = width  / @memo.width
    y = depth  / @memo.depth
    y = height / @memo.height if @memo.depth == 1
    @geometry.cover x, y

module.exports = MemoScreen

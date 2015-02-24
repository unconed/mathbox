Screen          = require './screen'
Util            = require '../../util'

class MemoScreen extends Screen
  constructor: (renderer, shaders, options) ->
    @memo = {items, width, height, depth} = options

    uniforms =
      remap2DScale:    { type: 'v2', value: new THREE.Vector2 items * width, height * depth }
      remapModulus:    { type: 'v2', value: new THREE.Vector2 items, height }
      remapModulusInv: { type: 'v2', value: new THREE.Vector2 1 / items, 1 / height }

    map = shaders.shader()
    map.pipe 'screen.remap.4d.xyzw', uniforms
    map.pipe options.map if options.map?

    super renderer, shaders, {map}

    for object in @objects
      object.transparent = false

    null

  cover: (width = @memo.width, height = @memo.height, depth = @memo.depth) ->
    x = width  / @memo.width
    y = depth  / @memo.depth
    y = height / @memo.height if @memo.depth == 1
    @geometry.cover x, y

module.exports = MemoScreen

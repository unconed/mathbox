# Flip sampling component
exports.flipVec2 = (channel) ->
  """
  vec2 flip(vec2 uv) {
    uv.#{channel} = -uv.#{channel};
    return uv;
  }
  """

# Apply 4-component vector swizzle
exports.swizzleVec4 = (order) ->
  """
  vec4 swizzle(vec4 xyzw) {
    return xyzw.#{order};
  }
  """

# Invert full or truncated swizzles for pointer lookups
exports.invertSwizzleVec4 = (order) ->
  letters = 'xyzw'.split('')

  index =
    x: 0
    y: 1
    z: 2
    w: 3

  swizzler = ['0.0', '0.0', '0.0', '0.0']

  for letter, i in order
    src = letters[i]
    j   = index[letter]

    swizzler[j] = "xyzw.#{src}"

  mask = swizzler.join ', '

  """
  vec4 invertSwizzle(vec4 xyzw) {
    return vec4(#{mask});
  }
  """


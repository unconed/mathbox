letters = 'xyzw'.split('')

index =
  x: 0
  y: 1
  z: 2
  w: 3

# Sample data texture array
exports.sample2DArray = (textures) ->

  divide = (a, b) ->
    if a == b
      out = """
      return texture2D(dataTextures[#{a}], uv);
      """
    else
      mid = Math.ceil a + (b - a) / 2
      out = """
      if (z < #{mid - .5}) {
        #{divide(a, mid - 1)}
      }
      else {
        #{divide(mid, b)}
      }
      """
    out = out.replace /\n/g, "\n  "

  body = divide 0, textures - 1

  """
  uniform sampler2D dataTextures[#{textures}];

  vec4 sample2DArray(vec2 uv, float z) {
    #{body}
  }
  """

# Binary operator
exports.binaryOperator = (type, op) ->
  """
  #{type} binaryOperator(#{type} a, #{type} b) {
    return a #{op} b;
  }
  """

# Select component
exports.selectVec4Float = (channel) ->
  channel = letters[channel] if (channel == +channel)

  """
  float selectVec4Float(vec4 xyzw) {
    return xyzw.#{channel};
  }
  """

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
  l = order.length
  extra = ""
  if l < 4
    extra = ', ' + ('0.0' for i in [l...4]).join ', '

  """
  vec4 swizzle(vec4 xyzw) {
    return vec4(xyzw.#{order}#{extra});
  }
  """

# Invert full or truncated swizzles for pointer lookups
exports.invertSwizzleVec4 = (order) ->
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


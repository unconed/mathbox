letters = 'xyzw'.split('')

index =
  0: -1
  x: 0
  y: 1
  z: 2
  w: 3

parseOrder = (order) ->
  order = order.split '' if order == "" + order
  order = [order]        if order == +order
  order

toType = (type) ->
  type = 'vec' + type if type == +type
  type = 'float' if type == 'vec1'
  type

toFloatString = (value) ->
  value = "" + value
  value += '.0' if value.indexOf('.') < 0

# Helper for float to byte conversion on the w axis, for readback
exports.mapByte2FloatOffset = (stretch = 4) ->
  factor = toFloatString stretch
  """
  vec4 float2ByteIndex(vec4 xyzw, out float channelIndex) {
    float relative = xyzw.w / #{factor};
    float w = floor(relative);
    channelIndex = (relative - w) * #{factor};
    return vec4(xyzw.xyz, w);
  }
  """

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
exports.binaryOperator = (type, op, curry) ->
  type = toType type
  if curry?
    """
    #{type} binaryOperator(#{type} a) {
      return a #{op} #{curry};
    }
    """
  else
    """
    #{type} binaryOperator(#{type} a, #{type} b) {
      return a #{op} b;
    }
    """

# Extend to n-vector with zeroes
exports.extendVec = (from, to, value = 0) ->
  return exports.truncateVec from, to if from > to

  diff = to - from

  from = toType from
  to   = toType to

  value = toFloatString value

  parts = [0..diff].map (x) -> if x then value else 'v'
  ctor  = parts.join ','

  """
  #{to} extendVec(#{from} v) { return #{to}(#{ctor}); }
  """

# Truncate n-vector
exports.truncateVec = (from, to) ->
  return exports.extendVec from, to if from < to

  swizzle = '.' + ('xyzw'.substr 0, to)

  from = toType from
  to   = toType to

  """
  #{to} truncateVec(#{from} v) { return v#{swizzle}; }
  """

# Inject float into 4-component vector
exports.injectVec4 = (order) ->
  swizzler = ['0.0', '0.0', '0.0', '0.0']

  order = parseOrder order
  order = order.map (v) -> if v == "" + v then index[v] else v

  for channel, i in order
    swizzler[channel] = ['a','b','c','d'][i]

  mask = swizzler.slice(0, 4).join ', '

  args = ['float a', 'float b', 'float c', 'float d'].slice 0, order.length

  """
  vec4 inject(#{args}) {
    return vec4(#{mask});
  }
  """

# Apply 4-component vector swizzle
exports.swizzleVec4 = (order, size = null) ->
  lookup = ['0.0', 'xyzw.x', 'xyzw.y', 'xyzw.z', 'xyzw.w']

  size = order.length if !size?

  order = parseOrder order
  order = order.map (v) ->
    v = +v           if +v in [0..4]
    v = index[v] + 1 if v == "" + v
    lookup[v]

  order.push '0.0' while order.length < size
  mask = order.join ', '

  """
  vec#{size} swizzle(vec4 xyzw) {
    return vec#{size}(#{mask});
  }
  """.replace /vec1/g, 'float'

# Invert full or truncated swizzles for pointer lookups
exports.invertSwizzleVec4 = (order) ->
  swizzler = ['0.0', '0.0', '0.0', '0.0']

  order = parseOrder order
  order = order.map (v) -> if v == +v then letters[v - 1] else v

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

exports.identity = (type) ->
  args = [].slice.call arguments
  if args.length > 1
    args = args.map (t, i) -> ['inout', t, String.fromCharCode 97 + i].join ' '
    args = args.join ', '
    """
    void identity(#{args}) { }
    """
  else
    """
    #{type} identity(#{type} x) {
      return x;
    }
    """

exports.constant = (type, value) ->
  """
  #{type} constant() {
    return #{value};
  }
  """

exports.toType = toType
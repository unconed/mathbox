Util = require '../../util'

# Property types
#
# The weird calling convention is for double-buffering the values
# while validating compound types like arrays and nullables. 
#
# validate: (value, target, invalid) ->
#
#   # Option 1: Call invalid() to reject
#   return invalid() if value < 0
#
#   # Option 2: Change target in-place
#   target.set(value)
#   return target
#
#   # Option 3: Return new value
#   return +value
#
Types =

  array: (type, size, value = null) ->
    lerp =
      if type.lerp
        (a, b, target, f) ->
          l = Math.min a.length, b.length
          for i in [0...l]
            target[i] = type.lerp a[i], b[i], target[i], f
          target

    op =
      if type.op
        (a, b, target, op) ->
          l = Math.min a.length, b.length
          for i in [0...l]
            target[i] = type.op a[i], b[i], target[i], op
          target

    value = [value] if value? and value !instanceof Array

    uniform: () -> if type.uniform then type.uniform() + 'v' else undefined
    make: () ->
      return value.slice() if value?
      return [] if !size
      (type.make() for i in [0...size])
    validate: (value, target, invalid) ->
      value = [value] if value !instanceof Array

      l = target.length = if size then size else value.length
      for i in [0...l]
        input = value[i] ? type.make()
        target[i] = type.validate input, target[i], invalid

      target
    equals: (a, b) ->
      al = a.length
      bl = b.length
      return false if al != bl

      l = Math.min al, bl
      for i in [0...l]
        return false if !type.equals? a[i], b[i]
      true
    lerp: lerp
    op: op
    clone: (v) -> type.clone(x) for x in v

  letters: (type, size, value = null) ->
    if value?
      if value == "" + value
        value = value.split ''
      value[i] = type.validate v, v for v, i in value

    array = Types.array type, size, value

    uniform: () -> array.uniform()
    make: () -> array.make()
    validate: (value, target, invalid) ->
      if value == "" + value
        value = value.split ''
      array.validate value, target, invalid
    equals: (a, b) -> array.equals a, b
    clone: array.clone

  nullable: (type, make = false) ->
    value = if make then type.make() else null

    emitter =
      if type.emitter
        (expr1, expr2) ->
          return expr1 if !expr2?
          return expr2 if !expr1?
          return type.emitter expr1, expr2

    lerp =
      if type.lerp
        (a, b, target, f) ->
          if a == null or b == null
            return if f < .5 then a else b
          target ?= type.make()
          value = type.lerp a, b, target, f
          target

    op =
      if type.op
        (a, b, target, op) ->
          return null if a == null or b == null
          target ?= type.make()
          value = type.op a, b, target, op
          value

    make: () -> value
    validate: (value, target, invalid) ->
      return value if value == null
      if target == null
        target = type.make()
      type.validate value, target, invalid
    uniform: () -> type.uniform?()
    equals: (a, b) ->
      an = a == null
      bn = b == null
      return true  if an and bn
      return false if an ^   bn
      return type.equals?(a, b) ? a == b
    lerp: lerp
    op: op
    emitter: emitter

  enum: (value, keys = [], map = {}) ->
    i = 0
    values = {}
    map[key]   ?= i++  for key    in keys when key != +key
    values[key] = key  for key    in keys when key == +key
    values[i]   = true for key, i of map

    value = map[value] if !values[value]?

    enum: () -> map
    make: () -> value
    validate: (value, target, invalid) ->
      v = if values[value] then value else map[value]
      return v if v?
      invalid()

  enumber: (value, keys, map = {}) ->
    _enum = Types.enum value, keys, map

    enum: _enum.enum
    uniform: () -> 'f'
    make: () -> _enum.make() ? +value
    validate: (value, target, invalid) ->
      return value if value == +value
      _enum.validate value, target, invalid
    op: (a, b, target, op) -> op a, b

  select: (value = '<') ->
    value
    make: () -> value
    validate: (value, target, invalid) ->
      return value if typeof value == 'string'
      return value if typeof value == 'object'
      invalid()

  bool: (value) ->
    value = !!value
    uniform: () -> 'f'
    make: () -> value
    validate: (value, target, invalid) ->
      !!value

  int: (value = 0) ->
    value = +Math.round(value)
    uniform: () -> 'i'
    make: () -> value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      Math.round(x) || 0
    op: (a, b, target, op) -> op a, b

  round: (value = 0) ->
    value = +Math.round(value)
    uniform: () -> 'f'
    make: () -> value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      Math.round(x) || 0
    op: (a, b, target, op) -> op a, b

  number: (value = 0) ->
    uniform: () -> 'f'
    make: () -> +value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      x || 0
    op: (a, b, target, op) -> op a, b

  positive: (type, strict = false) ->
    uniform: type.uniform
    make:    type.make
    validate: (value, target, invalid) ->
      value = type.validate value, target, invalid
      return invalid() if (value < 0) or (strict and value <= 0)
      value
    op: (a, b, target, op) -> op a, b

  string: (value = '') ->
    make: () -> "" + value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = "" + value)
      x

  func: () ->
    make: () -> () ->
    validate: (value, target, invalid) ->
      return value if typeof value == 'function'
      return invalid()

  emitter: () ->
    make: () -> (emit) -> emit 1, 1, 1, 1
    validate: (value, target, invalid) ->
      return value if typeof value == 'function'
      return invalid()
    emitter: (a, b) -> Util.Data.getLerpEmitter a, b

  object: (value) ->
    make: () -> value ? {}
    validate: (value, target, invalid) ->
      return value if typeof value == 'object'
      return invalid()
    clone: (v) -> JSON.parse JSON.stringify v

  timestamp: (value = null) ->
    if typeof value == 'string'
      value = Date.parse value

    uniform: () -> 'f'
    make: () -> value ? +new Date()
    validate: (value, target, invalid) ->
      value = Date.parse value
      return invalid() if value != (x = +value)
      value
    op: (a, b, target, op) -> op a, b

  vec2: (x = 0, y = 0) ->
    defaults = [x, y]
    uniform: () -> 'v2'
    make:
      () -> new THREE.Vector2 x, y
    validate: (value, target, invalid) ->
      if value == +value
        value = [value]

      if value instanceof THREE.Vector2
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else if value?
        xx = value.x ? x
        yy = value.y ? y
        target.set xx, yy
      else
        return invalid()
      target

    equals: (a, b) -> a.x == b.x and a.y == b.y
    op: (a, b, target, op) ->
      target.x = op a.x, b.x
      target.y = op a.y, b.y
      target

  ivec2: (x = 0, y = 0) ->
    vec2 = Types.vec2(x, y)
    validate = vec2.validate
    vec2.validate = (value, target, invalid) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      target
    vec2

  vec3: (x = 0, y = 0, z = 0) ->
    defaults = [x, y, z]
    uniform: () -> 'v3'
    make:
      () -> new THREE.Vector3 x, y, z
    validate: (value, target, invalid) ->
      if value == +value
        value = [value]

      if value instanceof THREE.Vector3
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else if value?
        xx = value.x ? x
        yy = value.y ? y
        zz = value.z ? z
        target.set xx, yy, zz
      else
        return invalid()
      target

    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z
    op: (a, b, target, op) ->
      target.x = op a.x, b.x
      target.y = op a.y, b.y
      target.z = op a.z, b.z
      target

  ivec3: (x = 0, y = 0, z = 0) ->
    vec3 = Types.vec3(x, y, z)
    validate = vec3.validate
    vec3.validate = (value, target) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      target.z = Math.round target.z
      target
    vec3

  vec4: (x = 0, y = 0, z = 0, w = 0) ->
    defaults = [x, y, z, w]
    uniform: () -> 'v4'
    make:
      () -> new THREE.Vector4 x, y, z, w
    validate: (value, target, invalid) ->
      if value == +value
        value = [value]

      if value instanceof THREE.Vector4
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else if value?
        xx = value.x ? x
        yy = value.y ? y
        zz = value.z ? z
        ww = value.w ? w
        target.set xx, yy, zz, ww
      else
        return invalid()
      target
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w
    op: (a, b, target, op) ->
      target.x = op a.x, b.x
      target.y = op a.y, b.y
      target.z = op a.z, b.z
      target.w = op a.w, b.w
      target

  ivec4: (x = 0, y = 0, z = 0, w = 0) ->
    vec4 = Types.vec4(x, y, z, w)
    validate = vec4.validate
    vec4.validate = (value, target) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      target.z = Math.round target.z
      target.w = Math.round target.w
      target
    vec4

  mat3: (n11 = 1, n12 = 0, n13 = 0, n21 = 0, n22 = 1, n23 = 0, n31 = 0, n32 = 0, n33 = 1) ->
    defaults = [n11, n12, n13, n21, n22, n23, n31, n32, n33]

    uniform: () -> 'm4'
    make:
      () ->
        m = new THREE.Matrix3
        m.set n11, n12, n13, n21, n22, n23, n31, n32, n33
        m
    validate: (value, target, invalid) ->
      if value instanceof THREE.Matrix3
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        return invalid()
      target

  mat4: (n11 = 1, n12 = 0, n13 = 0, n14 = 0, n21 = 0, n22 = 1, n23 = 0, n24 = 0, n31 = 0, n32 = 0, n33 = 1, n34 = 0, n41 = 0, n42 = 0, n43 = 0, n44 = 1) ->
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44]

    uniform: () -> 'm4'
    make:
      () ->
        m = new THREE.Matrix4
        m.set n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44
        m
    validate: (value, target, invalid) ->
      if value instanceof THREE.Matrix4
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        return invalid()
      target

  quat: (x = 0, y = 0, z = 0, w = 1) ->
    vec4 = Types.vec4(x, y, z, w)

    uniform: () -> 'v4'
    make:
      () -> new THREE.Quaternion
    validate: (value, target, invalid) ->
      if value instanceof THREE.Quaternion
        target.copy value
      else
        target = vec4.validate value, target, invalid
      target.normalize()
      target
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w
    op: (a, b, target, op) ->
      target.x = op a.x, b.x
      target.y = op a.y, b.y
      target.z = op a.z, b.z
      target.w = op a.w, b.w
      target.normalize()
      target
    lerp: (a, b, target, f) ->
      THREE.Quaternion.slerp a, b, target, f
      target

  color: (r = .5, g = .5, b = .5) ->
    defaults = [r, g, b]

    uniform: () -> 'c'
    make: () -> new THREE.Color r, g, b
    validate: (value, target, invalid) ->
      if value == "" + value
        value = new THREE.Color().setStyle value
      else if value == +value
        value = new THREE.Color value

      if value instanceof THREE.Color
        target.copy value
      else if value instanceof Array
        value = value.concat defaults.slice value.length
        target.setRGB.apply target, value
      else if value?
        rr = value.r ? r
        gg = value.g ? g
        bb = value.b ? b
        target.set rr, gg, bb
      else
        return invalid()
      target

    equals: (a, b) -> a.r == b.r and a.g == b.g and a.b == b.b
    op: (a, b, target, op) ->
      target.r = op a.r, b.r
      target.g = op a.g, b.g
      target.b = op a.b, b.b
      target

  axis: (value = 1, allowZero = false) ->
    map =
      x: 1
      y: 2
      z: 3
      w: 4
      W: 1
      H: 2
      D: 3
      I: 4
      zero:   0
      null:   0
      width:  1
      height: 2
      depth:  3
      items:  4

    range = if allowZero then [0..4] else [1..4]
    value = v if (v = map[value])?

    make: () -> value
    validate: (value, target, invalid) ->
      value = v if (v = map[value])?
      value = Math.round(value) ? 0
      return value if value in range
      return invalid()

  transpose: (order = [1, 2, 3, 4]) ->
    looseArray = Types.letters(Types.axis(null, false), 0, order)
    axesArray  = Types.letters(Types.axis(null, false), 4, order)

    make: () -> axesArray.make()
    validate: (value, target, invalid) ->
      temp = [1, 2, 3, 4]
      looseArray.validate value, temp, invalid

      if temp.length < 4
        missing = [1, 2, 3, 4].filter (x) -> temp.indexOf(x) == -1
        temp = temp.concat(missing)

      unique = (temp.indexOf(letter) == i for letter, i in temp)
      if unique.indexOf(false) < 0
        return axesArray.validate temp, target, invalid
      return invalid()
    equals: axesArray.equals
    clone:  axesArray.clone

  swizzle: (order = [1, 2, 3, 4], size = null) ->
    size ?= order.length
    order = order.slice 0, size
    looseArray = Types.letters(Types.axis(null, false), 0, order)
    axesArray  = Types.letters(Types.axis(null, true), size, order)

    make: () -> axesArray.make()
    validate: (value, target, invalid) ->
      temp = order.slice()
      looseArray.validate value, temp, invalid

      if temp.length < size
        temp = temp.concat([0, 0, 0, 0]).slice(0, size)

      return axesArray.validate temp, target, invalid
    equals: axesArray.equals
    clone:  axesArray.clone

  classes: () ->
    stringArray = Types.array(Types.string())

    make: () -> stringArray.make()
    validate: (value, target, invalid) ->
      value = value.split ' ' if (value == "" + value)
      value = value.filter (x) -> !!x.length
      return stringArray.validate value, target, invalid
    equals: stringArray.equals
    clone:  stringArray.clone

  blending: (value = 'normal') ->
    keys = ['no', 'normal', 'add', 'subtract', 'multiply', 'custom']
    Types.enum value, keys

  filter: (value = 'nearest') ->
    map =
      nearest:              THREE.NearestFilter
      nearestMipMapNearest: THREE.NearestMipMapNearestFilter
      nearestMipMapLinear:  THREE.NearestMipMapLinearFilter
      linear:               THREE.LinearFilter
      linearMipMapNearest:  THREE.LinearMipMapNearestFilter
      linearMipmapLinear:   THREE.LinearMipMapLinearFilter

    Types.enum value, [], map

  type: (value = 'unsignedByte') ->
    map =
      unsignedByte:  THREE.UnsignedByteType
      byte:          THREE.ByteType
      short:         THREE.ShortType
      unsignedShort: THREE.UnsignedShortType
      int:           THREE.IntType
      unsignedInt:   THREE.UnsignedIntType
      float:         THREE.FloatType

    Types.enum value, [], map

  scale: (value = 'linear') ->
    keys = ['linear', 'log']
    Types.enum value, keys

  mapping: (value = 'relative') ->
    keys = ['relative', 'absolute']
    Types.enum value, keys

  indexing: (value = 'original') ->
    keys = ['original', 'final']
    Types.enum value, keys

  shape: (value = 'circle') ->
    keys = ['circle', 'square', 'diamond', 'up', 'down', 'left', 'right']
    Types.enum value, keys

  join: (value = 'miter') ->
    keys = ['miter', 'round', 'bevel']
    Types.enum value, keys

  stroke: (value = 'solid') ->
    keys = ['solid', 'dotted', 'dashed']
    Types.enum value, keys

  vertexPass: (value = 'view') ->
    keys = ['data', 'view', 'world', 'eye']
    Types.enum value, keys

  fragmentPass: (value = 'light') ->
    keys = ['color', 'light', 'rgba']
    Types.enum value, keys

  ease: (value = 'linear') ->
    keys = ['linear', 'cosine', 'binary', 'hold']
    Types.enum value, keys

  fit: (value = 'contain') ->
    keys = ['x', 'y', 'contain', 'cover']
    Types.enum value, keys

  anchor: (value = 'middle') ->
    map =
      first:   1
      middle:  0
      last:   -1

    Types.enumber value, [], map

  transitionState: (value = 'enter') ->
    map =
      enter:  -1
      visible: 0
      exit:    1

    Types.enumber value, [], map

  font: (value = 'sans-serif') ->
    parse = Util.JS.parseQuoted
    value = parse value if value !instanceof Array
    stringArray = Types.array Types.string(), 0, value

    make: () -> stringArray.make()
    validate: (value, target, invalid) ->
      try
        value = parse value if value !instanceof Array
      catch
        return invalid()

      value = value.filter (x) -> !!x.length
      return stringArray.validate value, target, invalid
    equals: stringArray.equals
    clone:  stringArray.clone

  data: (value = []) ->

    make: () -> []
    validate: (value, target, invalid) ->

      if value instanceof Array
        return value
      else if value?.length?
        return value
      else
        return invalid()

    emitter: (a, b) -> Util.Data.getLerpThunk a, b

decorate = (types) ->
  for k, type of types
    types[k] = do (type) -> () ->
      t = type.apply type, arguments
      t.validate ?= (v) -> v?
      t.equals   ?= (a, b) -> a == b
      t.clone    ?= (v) -> v?.clone?() ? v
      t
  types

module.exports = decorate Types

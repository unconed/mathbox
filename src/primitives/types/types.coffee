Types =

  array: (type, size, value = null) ->
    uniform: () -> if type.uniform then type.uniform() + 'v' else undefined
    make: () ->
      return value.slice() if value?
      return [] if !size
      (type.make() for i in [0...size])
    validate: (value, target, invalid) ->
      if value.constructor? and value.constructor == Array
        l = target.length = if size then size else value.length
        for i in [0...l]
          input = value[i] ? type.make()
          replace = type.validate input, target[i], invalid
          target[i] = replace if replace != undefined
      else
        invalid()
      return
    equals: (a, b) ->
      al = a.length
      bl = b.length
      return false if al != bl

      l = Math.min al, bl
      for i in [0...l]
        return false if !type.equals? a[i], b[i]
      true

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
      return array.validate value, target, invalid
    equals: (a, b) -> array.equals a, b

  absolute: (type) ->
    value = type.make()
    make: () -> value
    uniform: () -> type.uniform()
    validate: (value, target, invalid) ->
      Math.abs +type.validate value, target, invalid

  nullable: (type, make = false) ->
    value = if make then type.make() else null
    make: () -> value
    validate: (value, target, invalid) ->
      return value if value == null
      if target == null
        target = type.make()
      value = type.validate value, target, invalid
      if value != undefined then value else target
    equals: (a, b) ->
      an = a == null
      bn = b == null
      return true  if an and bn
      return false if an ^   bn
      return type.equals?(a, b) ? a == b

  enum: (value, keys, map = {}) ->
    values = {}
    map[key] ?= i    for key, i in keys
    values[i] = true for key, i of map
    value = map[value] if !values[value]?

    enum: () -> map
    make: () -> value
    validate: (value, target, invalid) ->
      v = if values[value] then value else map[value]
      return v if v?
      return invalid()

  select: (value = '<') ->
    make: () -> value
    validate: (value, target, invalid) ->
      return value if typeof value == 'string'
      return value if typeof value == 'object'
      return invalid()

  bool: (value) ->
    value = !!value
    uniform: () -> 'f'
    make: () -> value
    validate: (value, target, invalid) ->
      return value if value == true or value == false

  int: (value = 0) ->
    value = +Math.round(value)
    uniform: () -> 'i'
    make: () -> value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      Math.round(x) || 0

  round: (value = 0) ->
    value = +Math.round(value)
    uniform: () -> 'f'
    make: () -> value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      Math.round(x) || 0

  number: (value = 0) ->
    uniform: () -> 'f'
    make: () -> +value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      x || 0

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

  object: (value) ->
    make: () -> value ? {}
    validate: (value, target, invalid) ->
      return value if typeof value == 'object'
      return invalid()

  vec2: (x = 0, y = 0) ->
    defaults = [x, y]
    uniform: () -> 'v2'
    make:
      () -> new THREE.Vector2 x, y
    validate: (value, target, invalid) ->
      if value instanceof THREE.Vector2
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else if value?
        xx = value.x ? x
        yy = value.y ? y
        target.set xx, yy
      else
        return invalid()
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y

  ivec2: (x = 0, y = 0) ->
    vec2 = Types.vec2(x, y)
    validate = vec2.validate
    vec2.validate = (value, target, invalid) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      return

  vec3: (x = 0, y = 0, z = 0) ->
    defaults = [x, y, z]
    uniform: () -> 'v3'
    make:
      () -> new THREE.Vector3 x, y, z
    validate: (value, target, invalid) ->
      if value instanceof THREE.Vector3
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else if value?
        xx = value.x ? x
        yy = value.y ? y
        zz = value.z ? z
        target.set xx, yy, zz
      else
        return invalid()
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z

  ivec3: (x = 0, y = 0, z = 0) ->
    vec3 = Types.vec3(x, y, z)
    validate = vec3.validate
    vec3.validate = (value, target) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      target.z = Math.round target.z
      return

  vec4: (x = 0, y = 0, z = 0, w = 0) ->
    defaults = [x, y, z, w]
    uniform: () -> 'v4'
    make:
      () -> new THREE.Vector4 x, y, z, w
    validate: (value, target, invalid) ->
      if value instanceof THREE.Vector4
        target.copy value
      else if value?.constructor == Array
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
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w

  ivec4: (x = 0, y = 0, z = 0, w = 0) ->
    vec4 = Types.vec4(x, y, z, w)
    validate = vec4.validate
    vec4.validate = (value, target) ->
      validate value, target, invalid
      target.x = Math.round target.x
      target.y = Math.round target.y
      target.z = Math.round target.z
      target.w = Math.round target.w
      return

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
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        return invalid()

  quat: (x = 0, y = 0, z = 0, w = 1) ->
    vec4 = Types.vec4(x, y, z, w)

    uniform: () -> 'v4'
    make:
      () -> new THREE.Quaternion
    validate: (value, target, invalid) ->
      if value instanceof THREE.Quaternion
        target.copy value
      else ret = vec4.validate value, target, invalid
      (ret ? target).normalize()
      return ret
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w

  color: (r = .5, g = .5, b = .5) ->
    vec3 = Types.vec3(r, g, b)

    uniform: () -> 'v3'
    make: () -> new THREE.Vector3 r, g, b
    validate: (value, target, invalid) ->
      if value == "" + value
        value = new THREE.Color().setStyle value
      else if value == +value
        value = new THREE.Color value

      if value instanceof THREE.Color
        target.set value.r,
                   value.g,
                   value.b
      else return vec3.validate value, target, invalid

    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z

  axis: (value = 1, allowZero = false) ->
    map =
      x: 1
      y: 2
      z: 3
      w: 4
      i: 4
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

    equals: (a, b) -> axesArray.equals a, b

  swizzle: (order = [1, 2, 3, 4], size = 4) ->
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
    equals: (a, b) -> axesArray.equals a, b

  classes: () ->
    stringArray = Types.array(Types.string())

    make: () -> stringArray.make()
    validate: (value, target, invalid) ->
      value = value.split ' ' if (value == "" + value)
      value = value.filter (x) -> !!x.length
      return stringArray.validate value, target, invalid
    equals: (a, b) -> stringArray.equals a, b

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
    keys = ['circle', 'square', 'diamond', 'triangle']
    Types.enum value, keys

  stroke: (value = 'solid') ->
    keys = ['solid', 'dotted', 'dashed']
    Types.enum value, keys

  vertexPass: (value = 'view') ->
    keys = ['data', 'view', 'world', 'eye']
    Types.enum value, keys

  anchor: (value = 'middle') ->
    map =
      first:   1
      middle:  0
      last:   -1
    value = map[value] ? +value

    uniform: () -> 'f'
    make: () -> +value
    validate: (value, target, invalid) ->
      return invalid() if value != (x = +value)
      x || 0
    

module.exports = Types

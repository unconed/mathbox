Types =

  array: (type, size, value = null) ->
    uniform: () -> if type.uniform then type.uniform() + 'v' else undefined
    make: () ->
      return value.slice() if value?
      return [] if !size
      (type.make() for i in [0...size])
    validate: (value, target) ->
      if value.constructor? and value.constructor == Array
        l = target.length = if size then size else value.length
        for i in [0...l]
          replace = type.validate value[i], target[i]
          target[i] = replace if replace != undefined
      else
        l = target.length = size
        target[i] = type.value for i in [0..l]
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
    validate: (value, target) ->
      if value == "" + value
        value = value.split ''
      return array.validate value, target
    equals: (a, b) -> array.equals a, b

  nullable: (type) ->
    make: () -> null
    validate: (value, target) ->
      return value if value == null
      if target == null
        target = type.make()
      value = type.validate value, target
      if value != undefined then value else target
    equals: (a, b) ->
      an = a == null
      bn = b == null
      return true  if an and bn
      return false if an ^   bn
      return type.equals? a, b

  enum: (value, keys, map = {}) ->
    values = {}
    map[key] ?= i    for key, i in keys
    values[i] = true for key, i of map
    value = map[value] if !values[value]?

    make: () -> value
    validate: (value) ->
      v = if values[value] then value else map[value]
      return v if v?

  select: (value = '<') ->
    make: () -> value
    validate: (value, target) ->
      return value if typeof value == 'string'
      return value if typeof value == 'object'

  bool: (value) ->
    value = !!value
    uniform: () -> 'f'
    make: () -> value
    validate: (value) ->
      !!value

  int: (value = 0) ->
    value = +Math.round(value)
    uniform: () -> 'i'
    make: () -> value
    validate: (value) ->
      +Math.round(value) || 0

  number: (value = 0) ->
    uniform: () -> 'f'
    make: () -> +value
    validate: (value) ->
      +value || 0

  string: (value = '') ->
    make: () -> "" + value
    validate: (value) ->
      "" + value

  func: () ->
    make: () -> () ->
    validate: (value) ->
      return value if typeof value == 'function'

  object: (value) ->
    make: () -> value ? {}
    validate: (value) ->
      return value if typeof value == 'object'

  vec2: (x = 0, y = 0) ->
    defaults = [x, y]
    uniform: () -> 'v2'
    make:
      () -> new THREE.Vector2 x, y
    validate: (value, target) ->
      if value instanceof THREE.Vector2
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        target.set x, y
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y

  vec3: (x = 0, y = 0, z = 0) ->
    defaults = [x, y, z]
    uniform: () -> 'v3'
    make:
      () -> new THREE.Vector3 x, y, z
    validate: (value, target) ->
      if value instanceof THREE.Vector3
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        target.set x, y, z
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z

  vec4: (x = 0, y = 0, z = 0, w = 0) ->
    defaults = [x, y, z, w]
    uniform: () -> 'v4'
    make:
      () -> new THREE.Vector4 x, y, z, w
    validate: (value, target) ->
      if value instanceof THREE.Vector4
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        target.set x, y, z, w
      return
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w

  mat4: (n11 = 1, n12 = 0, n13 = 0, n14 = 0, n21 = 0, n22 = 1, n23 = 0, n24 = 0, n31 = 0, n32 = 0, n33 = 1, n34 = 0, n41 = 0, n42 = 0, n43 = 0, n44 = 1) ->
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44]

    uniform: () -> 'm4'
    make:
      () -> new THREE.Matrix4 n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44
    validate: (value, target) ->
      if value instanceof THREE.Matrix4
        target.copy value
      else if value?.constructor == Array
        value = value.concat defaults.slice value.length
        target.set.apply target, value
      else
        target.set n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44
      return

  quat: (x = 0, y = 0, z = 0, w = 1) ->
    vec4 = Types.vec4(x, y, z, w)

    uniform: () -> 'v4'
    make:
      () -> new THREE.Quaternion
    validate: (value, target) ->
      if value instanceof THREE.Quaternion
        target.copy value
      else ret = vec4.validate value, target
      (ret ? target).normalize()
      return ret
    equals: (a, b) -> a.x == b.x and a.y == b.y and a.z == b.z and a.w == b.w

  color: (r = .5, g = .5, b = .5) ->
    vec3 = Types.vec3(r, g, b)

    uniform: () -> 'v3'
    make: () -> new THREE.Vector3 r, g, b
    validate: (value, target) ->
      if value == "" + value
        string = value
        value = new THREE.Color().setStyle string
      else if value == +value
        value = new THREE.Color value

      if value instanceof THREE.Color
        target.set value.r,
                   value.g,
                   value.b
      else return vec3.validate value, target

      return
    equals: (a, b) -> a.x == b.x and a.y == b.y

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
    validate: (value) ->
      value = v if (v = map[value])?
      value = Math.round(value) ? 0
      return value if value in range

  transpose: (order = [1, 2, 3, 4]) ->
    looseArray = Types.letters(Types.axis(null, false), 0, order)
    axesArray  = Types.letters(Types.axis(null, false), 4, order)

    make: () -> axesArray.make()
    validate: (value, target) ->
      temp = [1, 2, 3, 4]
      looseArray.validate value, temp

      if temp.length < 4
        missing = [1, 2, 3, 4].filter (x) -> temp.indexOf(x) == -1
        temp = temp.concat(missing)

      unique = (temp.indexOf(letter) == i for letter, i in temp)
      if unique.indexOf(false) < 0
        return axesArray.validate temp, target
    equals: (a, b) -> axesArray.equals a, b

  swizzle: (order = [1, 2, 3, 4], size = 4) ->
    order = order.slice 0, size
    looseArray = Types.letters(Types.axis(null, false), 0, order)
    axesArray  = Types.letters(Types.axis(null, true), size, order)

    make: () -> axesArray.make()
    validate: (value, target) ->
      temp = order.slice()
      looseArray.validate value, temp

      if temp.length < size
        temp = temp.concat([0, 0, 0, 0]).slice(0, size)

      return axesArray.validate temp, target
    equals: (a, b) -> axesArray.equals a, b

  classes: () ->
    stringArray = Types.array(Types.string())

    make: () -> stringArray.make()
    validate: (value, target) ->
      value = value.split ' ' if (value == "" + value)
      value = value.filter (x) -> !!x.length
      return stringArray.validate value, target
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
      lienarMipmapLinear:   THREE.LinearMipMapLinearFilter

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


module.exports = Types

Classes =
  grid: require('./grid').Grid
  root: require('./root').Root

  view: require('./view').View
  cartesian: require('./cartesian').Cartesian

Types =

  array: (type, size) ->
    make: () ->
      (type.make() for i in [0...size])
    validate: (value, target) ->
      if value.constructor? and value.constructor == Array
        target.length = if size then size else value.length
        for i in [0...target.length]
          replace = type.validate value[i], target[i]
          target[i] = replace if replace?
      else
        target.length = size
        target[i] = type.value for i in [0..target.length]
      return

  bool: (value) ->
    make: () -> !!value
    validate: (value) ->
      !!value

  number: (value = 0) ->
    make: () -> +value
    validate: (value) ->
      +value || 0

  string: (value = '') ->
    make: () -> "" + value
    validate: (value) ->
      "" + value

  scale: (value) -> new Types.string(value)

  vec2: (x = 0, y = 0) ->
    make:
      () -> new THREE.Vector2 x, y
    validate: (value, target) ->
      if value instanceof THREE.Vector2
        target.copy value
      else if value?.constructor == Array
        target.set value[0] ? x,
                   value[1] ? y
      else
        target.set x, y
      return

  vec3: (x = 0, y = 0, z = 0) ->
    make:
      () -> new THREE.Vector3 x, y, z
    validate: (value, target) ->
      if value instanceof THREE.Vector3
        target.copy value
      else if value?.constructor == Array
        target.set value[0] ? x,
                   value[1] ? y,
                   value[2] ? z
      else
        target.set x, y, z
      return

  vec4: (x = 0, y = 0, z = 0, w = 0) ->
    make:
      () -> new THREE.Vector4 x, y, z, w
    validate: (value, target) ->
      if value instanceof THREE.Vector4
        target.copy value
      else if value?.constructor == Array
        target.set value[0] ? x,
                   value[1] ? y,
                   value[2] ? z,
                   value[3] ? w
      else
        target.set x, y, z, w
      return

  quat: (x = 0, y = 0, z = 0, w = 1) ->
    vec4 = Types.vec4(x, y, z, w)

    make:
      () -> new THREE.Quaternion
    validate: (value, target) ->
      if value instanceof THREE.Quaternion
        target.copy value
      else ret = vec4.validate value, target
      (ret ? target).normalize()
      return ret

  color: (r = .5, g = .5, b = .5) ->
    vec3 = Types.vec3(r, g, b)

    make: () -> new THREE.Vector3()
    validate: (value, target) ->
      if value == +value
        value = new THREE.Color value

      if value instanceof THREE.Color
        target.set value.r,
                   value.g,
                   value.b
      else return vec3.validate value, target

      return

Traits =
  object:
    position: Types.vec4()
    rotation: Types.quat()
    scale: Types.vec4(1, 1, 1, 1)
  line:
    width: Types.number(1)
    color: Types.color()
  surface:
    color: Types.color()
  view:
    range: Types.array(Types.vec2(-1, 1), 4)
  grid:
    axes: Types.vec2(0, 1)
  axis:
    inherit: Types.bool()
    ticks: Types.number(10)
    unit: Types.number(1)
    base: Types.number(10)
    detail: Types.number(2)
    scale: Types.scale()

exports.Classes = Classes
exports.Types = Types
exports.Traits = Traits

Types =

  array: (type, size) ->
    uniform: () -> type.uniform() + 'v'
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
    uniform: () -> 'f'
    make: () -> !!value
    validate: (value) ->
      !!value

  number: (value = 0) ->
    uniform: () -> 'f'
    make: () -> +value
    validate: (value) ->
      +value || 0

  string: (value = '') ->
    make: () -> "" + value
    validate: (value) ->
      "" + value

  scale: () -> new Types.string 'linear'

  object: () ->
    make: () -> {}
    validate: (value) ->
      value

  vec2: (x = 0, y = 0) ->
    defaults = [x, y]
    uniform: () -> 'v2'
    make:
      () -> new THREE.Vector2 x, y
    validate: (value, target) ->
      if value instanceof THREE.Vector2
        target.copy value
      else if value?.constructor == Array
        value = value.concat(defaults.slice(value.length))
        target.set.apply target, value
      else
        target.set x, y
      return

  vec3: (x = 0, y = 0, z = 0) ->
    defaults = [x, y, z]
    uniform: () -> 'v3'
    make:
      () -> new THREE.Vector3 x, y, z
    validate: (value, target) ->
      if value instanceof THREE.Vector3
        target.copy value
      else if value?.constructor == Array
        value = value.concat(defaults.slice(value.length))
        target.set.apply target, value
      else
        target.set x, y, z
      return

  vec4: (x = 0, y = 0, z = 0, w = 0) ->
    defaults = [x, y, z, w]
    uniform: () -> 'v4'
    make:
      () -> new THREE.Vector4 x, y, z, w
    validate: (value, target) ->
      if value instanceof THREE.Vector4
        target.copy value
      else if value?.constructor == Array
        value = value.concat(defaults.slice(value.length))
        target.set.apply target, value
      else
        target.set x, y, z, w
      return

  mat4: (n11 = 1, n12 = 0, n13 = 0, n14 = 0, n21 = 0, n22 = 1, n23 = 0, n24 = 0, n31 = 0, n32 = 0, n33 = 1, n34 = 0, n41 = 0, n42 = 0, n43 = 0, n44 = 1) ->
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44]

    uniform: () -> 'm4'
    make:
      () -> new THREE.Matrix4 n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44
    validate: (value, target) ->
      if value instanceof THREE.Matrix4
        target.copy value
      else if value?.constructor == Array
        value = value.concat(defaults.slice(value.length))
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

module.exports = Types
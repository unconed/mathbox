exports.setOrigin = (vec, dimensions, origin) ->
  dimensions = [dimensions] if +dimensions == dimensions
  x = if 1 in dimensions then 0 else origin.x
  y = if 2 in dimensions then 0 else origin.y
  z = if 3 in dimensions then 0 else origin.z
  w = if 4 in dimensions then 0 else origin.w
  vec.set x, y, z, w

exports.addOrigin = do ->
  v = new THREE.Vector4
  (vec, dimension, origin) ->
    exports.setOrigin v, dimension, origin
    vec.add v

exports.setDimension = (vec, dimension) ->
  x = if dimension == 1 then 1 else 0
  y = if dimension == 2 then 1 else 0
  z = if dimension == 3 then 1 else 0
  w = if dimension == 4 then 1 else 0
  vec.set x, y, z, w

exports.setDimensionNormal = (vec, dimension) ->

  x = if dimension == 1 then 1 else 0
  y = if dimension == 2 then 1 else 0
  z = if dimension == 3 then 1 else 0
  w = if dimension == 4 then 1 else 0
  vec.set y, z + x, w, 0

exports.recenterAxis = do ->
  axis = [0, 0]

  (x, dx, bend, f = 0) ->
    if bend > 0
      x1 = x
      x2 = x + dx

      abs = Math.max Math.abs(x1), Math.abs(x2)
      fabs = abs * f

      min = Math.min x1, x2
      max = Math.max x1, x2

      x  = min + (-abs + fabs - min) * bend
      dx = max + (abs + fabs - max) * bend - x

    axis[0] = x
    axis[1] = dx
    axis

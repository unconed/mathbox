exports.Ticks = require('./ticks')

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


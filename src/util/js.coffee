# Merge multiple objects
exports.merge = () ->
  x = {}
  (x[k] = v for k, v of obj) for obj in arguments
  x

exports.clone = (o) -> JSON.parse JSON.serialize o
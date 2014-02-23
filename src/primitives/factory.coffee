class Factory
  constructor: (@classes, @attributes) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type](options, @attributes)

exports.Factory = Factory
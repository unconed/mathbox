types = require('./types').types

class Factory
  constructor: () ->
    @types = types

  getTypes: () ->
    Object.keys @types

  make: (type, options) ->
    new @types[type](options)

exports.Factory = Factory
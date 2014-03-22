Primitive = require('../primitive')

class Group extends Primitive
  @model = Primitive.Group
  @traits = ['object']

  make: () ->
    @_helper.object.make()

  unmake: () ->
    @_helper.object.unmake()


module.exports = Group
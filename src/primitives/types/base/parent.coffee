Primitive = require '../../primitive'

class Parent extends Primitive
  @model = Primitive.Group
  @traits = ['node']


module.exports = Parent
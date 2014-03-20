Renderable   = require '../renderable'

class Mesh extends Renderable
  show: (transparent) ->
    @object.visible = true
    @object.material.transparent = transparent

  hide: () ->
    @object.visible = false

module.exports = Mesh
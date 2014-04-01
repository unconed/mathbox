Renderable   = require '../renderable'

class Base extends Renderable
  show: (transparent) ->
    @object.visible = true
    @object.material.transparent = transparent

  hide: () ->
    @object.visible = false

module.exports = Base
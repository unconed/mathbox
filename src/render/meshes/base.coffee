Renderable   = require '../renderable'

class Base extends Renderable
  show: (transparent) ->
    for object in @objects
      object.visible = true
      object.material.transparent = transparent

  hide: () ->
    for object in @objects
      object.visible = false

module.exports = Base
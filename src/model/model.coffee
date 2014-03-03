class Model
  constructor: (@root) ->
    @root.model = @
    @root.root  = @root

  getRoot: () ->
    @root

THREE.Binder.apply Model::

module.exports = Model
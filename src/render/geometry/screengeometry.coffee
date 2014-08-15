SurfaceGeometry = require './surfacegeometry'

###
Grid Surface in raw screen space

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
###

class ScreenGeometry extends SurfaceGeometry

  constructor: (options) ->
    @uniforms ?= {}
    @uniforms.geometryScale =
      type: 'v4'
      value: new THREE.Vector4

    super options

  clip: (width = @width, height = @height, surfaces = @surfaces, layers = @layers) ->

    super width, height, surfaces, layers

    invert = (x) -> 1 / Math.max 1, x - 1
    @uniforms.geometryScale.value.set invert(width), invert(height), invert(surfaces), invert(layers)

module.exports = ScreenGeometry
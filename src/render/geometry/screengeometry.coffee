SurfaceGeometry = require './surfacegeometry'

###
Grid Surface in normalized screen space

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

    options.width  = Math.max 2, +options.width  ? 2
    options.height = Math.max 2, +options.height ? 2

    @cover()

    super options

  cover: (@scaleX = 1, @scaleY = 1, @scaleZ = 1, @scaleW = 1) ->

  clip: (width = @width, height = @height, surfaces = @surfaces, layers = @layers) ->

    super width, height, surfaces, layers

    invert = (x) -> 1 / Math.max 1, x - 1
    @uniforms.geometryScale.value.set invert(width)    * @scaleX,
                                      invert(height)   * @scaleY,
                                      invert(surfaces) * @scaleZ,
                                      invert(layers)   * @scaleW

module.exports = ScreenGeometry
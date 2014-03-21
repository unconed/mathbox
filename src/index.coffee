mathBox = (options) ->
  options ?= {}
  options.plugins ?= ['core', 'mathbox']
  three = THREE.Bootstrap options
  three.mathbox

window.MathBox = exports
window.mathBox = exports.mathBox = mathBox
exports.version = '2'

require '../build/shaders'

###
###

Context = require './context'

THREE.Bootstrap.registerPlugin 'mathbox',
  defaults:
    init: true

  listen: ['ready', 'update'],

  install: (three) ->
    inited = false

    three.MathBox =
      init: (options) =>
        return if inited
        inited = true

        scene  = options?.scene  || @options.scene  || three.scene
        camera = options?.camera || @options.camera || three.camera
        script = options?.script || @options.script

        @context = new Context three.renderer.context, scene, camera, script
        @context.api.three = three
        three.mathbox = @context.api

        @context.init()

      destroy: () =>
        return if !inited
        inited = false

        @context.destroy()

        delete three.mathbox
        delete @context.api.three
        delete @context

      object: () -> @context?.scene.getRoot()

  uninstall: (three) ->
    three.MathBox.destroy()
    delete three.MathBox

  ready: (event, three) ->
    if @options.init
      three.MathBox.init()

  update: (event, three) ->
    @context?.update()

###
###

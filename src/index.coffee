mathBox = (options) ->
  options ?= {}
  options.plugins ?= ['core', 'mathbox']
  three = THREE.Bootstrap options
  three.mathbox

window.MathBox = exports
window.mathBox = exports.mathBox = mathBox
exports.version = '2'

###
###

Context = require('./context').Context

THREE.Bootstrap.registerPlugin 'mathbox',
  defaults:
    init: true

  listen: ['ready', 'update'],

  install: (three) ->
    three.MathBox =
      init: (options) =>
        scene  = options?.scene  || @options.scene  || three.scene
        camera = options?.camera || @options.camera || three.camera
        script = options?.script || @options.script

        @context = new Context(scene, camera, script);
        @context.api.three = three
        three.mathbox = @context.api

      destroy: () =>
        delete three.mathbox
        delete @context.api.three
        delete @context

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

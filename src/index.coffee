mathBox = (options) ->
  options ?= {}
  options.plugins ?= ['core', 'mathbox']
  three = THREE.Bootstrap options
  three.mathbox

window.π = Math.PI
window.τ = π * 2

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

  listen: ['ready', 'update', 'post'],

  install: (three) ->
    inited = false
    @first = true

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

  post: () ->
    if @first
      fmt = (x) ->
        out = []
        while x >= 1000
          out.unshift x % 1000
          x = Math.floor(x / 1000)
        out.unshift x
        out.join ','

      @first = false
      info = three.renderer.info.render
      console.log(fmt(info.faces) + ' faces  ',
                  fmt(info.vertices) + ' vertices  ',
                  fmt(info.calls) + ' calls');


###
###

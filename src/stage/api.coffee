Util = require '../util'

class API
  v2: () -> @

  constructor: (@_context, @_up, @_targets) ->
    root = @_context.controller.getRoot()

    @_targets ?= [root]
    @isRoot = @_targets.length == 1 and @_targets[0] == root
    @isLeaf = @_targets.length == 1 and !@_targets[0].children?

    # Look like an array
    @[i] = t for t, i in @_targets
    @length = @_targets.length

    # Primitive factory
    for type in @_context.controller.getTypes() when type !in ['root']
      do (type) =>
        @[type] = (options, binds) => @add(type, options, binds)

  select: (selector) ->
    targets = @_context.model.select selector, if !@isRoot then @_targets else null
    @_push targets

  eq: (index) ->
    return @_push [@_targets[index]] if @_targets.length > index
    @_push []

  filter: (callback) ->
    if typeof callback == 'string'
      matcher  = @_context.model._matcher callback
      callback = (x) -> matcher x

    @_push @_targets.filter callback

  map: (callback) ->
    callback @[i], i, @ for i in [0...@length]

  each: (callback) ->
    callback @[i], i, @ for i in [0...@length]
    @

  add: (type, options, binds) ->

    # Make node/primitive
    controller = @_context.controller

    # Auto-pop if targeting leaf
    return @_pop().add(type, options, binds) if @isLeaf

    # Add to target
    nodes = []
    for target in @_targets
      node = controller.make type, options, binds
      controller.add node, target
      nodes.push node

    # Return changed selection
    @_push nodes

  remove: (selector) ->
    return @select(selector).remove() if selector
    @_context.controller.remove target for target in @_targets.slice().reverse()
    @_pop()

  set: (key, value) ->
    @_context.controller.set target, key, value for target in @_targets
    @

  getAll: (key) ->
    @_context.controller.get target, key for target in @_targets

  get: (key) ->
    @_targets[0]?.get key

  evaluate: (key, time) ->
    @_targets[0]?.evaluate key, time

  bind: (key, value) ->
    @_context.controller.bind target, key, value for target in @_targets
    @

  unbind: (key) ->
    @_context.controller.unbind target, key for target in @_targets
    @

  end:   () -> (if @isLeaf then @_pop() else @)._pop()

  _push:  (targets) -> new API @_context, @, targets
  _pop:   () -> @_up ? @
  _reset: () -> @_up?.reset() ? @

  map: (callback) -> @_targets.map callback

  "on": () ->
    args = arguments
    @_targets.map (x) -> x.on.apply x, args
    @

  "off": () ->
    args = arguments
    @_targets.map (x) -> x.on.apply x, args
    @

  toString: () ->
    tags = @_targets.map (x) -> x.toString()
    if @_targets.length > 1 then "[#{tags.join ", "}]" else tags[0]

  toMarkup: () ->
    tags = @_targets.map (x) -> x.toMarkup()
    tags.join "\n\n"

  print: () ->
    Util.Pretty.print @_targets.map((x) -> x.toMarkup()).join "\n\n"
    @

  debug: () ->
    info = @inspect()
    console.log 'Renderables: ', info.renderables
    console.log 'Renders: ',     info.renders
    console.log 'Shaders: ',     info.shaders

    getName = (owner) ->
      owner.constructor.toString().match('function +([^(]*)')[1]

    shaders = []
    for shader in info.shaders
      name = getName shader.owner
      shaders.push "#{name} - Vertex"
      shaders.push shader.vertex
      shaders.push "#{name} - Fragment"
      shaders.push shader.fragment
    ShaderGraph.inspect shaders

  inspect: (selector, trait, print) ->
    if typeof trait == 'boolean'
      print = trait
      trait = null
    print ?= true

    # Recurse tree and extract all inserted renderables
    map     = (node) -> node.controller?.objects ? []
    recurse = self = (node, list = []) ->
      list.push map node if !trait or node.traits.hash[trait]
      self child, list for child in node.children if node.children?
      list

    # Flatten arrays
    flatten = (list) ->
      list = list.reduce ((a, b) -> a.concat b), []
      list = list.filter (x, i) -> x? and list.indexOf(x) == i

    # Render descriptor
    make = (renderable, render) ->
      d = {}
      d.owner      = renderable
      d.geometry   = render.geometry
      d.material   = render.material
      d.vertex     = render.material.vertexGraph
      d.fragment   = render.material.fragmentGraph
      d

    info =
      nodes:       @_targets.slice()
      renderables: []
      renders:     []
      shaders:     []

    # Inspect all targets
    for target in @_targets
      target.print selector, 'info' if print

      _info =
        renderables: renderables = flatten recurse target
        renders:     flatten renderables.map (x) -> x.renders
        shaders:     flatten renderables.map (x) -> x.renders?.map (r) -> make x, r

      info[k] = info[k].concat _info[k] for k of _info

    info

module.exports = API
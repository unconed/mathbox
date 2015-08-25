Util = require '../util'

nodeIndex = 0

class Node
  constructor: (@type, defaults, options, binds, config, attributes) ->
    @_id = (++nodeIndex).toString()

    @configure config, attributes
    @parent = @root = @path = @index = null

    @set  defaults, true, true
    @set  options, false, true
    @bind binds, false

  configure: (config, attributes) ->
    {traits, props, freeform} = config
    traits   ?= @_config.traits   ? []
    props    ?= @_config.props    ? {}
    freeform ?= @_config.freeform ? false

    @attributes = attributes.apply @, traits, props, freeform
    @_config    = {traits, props, freeform}

  dispose: () ->
    @attributes.dispose()
    @attributes = null

  # Add/removal callback
  _added: (parent) ->
    @parent = parent
    @root   = parent.root

    # Notify root listeners of child addition
    event =
      type: 'add'
      node: @
      parent: @parent
    @root.trigger event if @root

    # Notify self listeners of own addition
    event.type = 'added'
    @trigger event

  _removed: () ->
    @root = @parent = null

    # Notify root listeners of child removal
    event =
      type: 'remove'
      node: @
    @root.trigger event if @root

    # Notify self listeners of own removal
    event.type = 'removed'
    @trigger event

  # Assign unique indices to nodes to make paths
  _index: (index, parent = @parent) ->
    @index = index
    @path  = path = if index? then (parent?.path ? []).concat [index] else null
    @order = if path? then @_encode path else Infinity
    @trigger type: 'reindex' if @root?

  # Asymptotic arithmetic encoding
  # Computes invariant node order from path of indices
  # Goes from 1 at the root [0] of the tree, to 0 at [∞] (best for FP precision).
  # Divides the interval into countably infinite many intervals, nested recursively.
  #
  # (loses precision eventually, it's used cos three.js needs a single numerical order)
  _encode: (path) ->
    # Tune precision between deep and narrow (1) vs shallow and wide (n)
    k    = 3

    map  = (x) -> k / (x + k)
    lerp = (t) -> b + (a - b) * t

    a = 1 + 1 / k
    b = 0
    for index in path
      f = map index + 1
      g = map index + 2
      [a, b] = [lerp(f), lerp(g)]
    a

  toString: () ->
    id = @id ? @_id

    tag  = @type ? 'node'
    id   = tag
    id  += "##{id}"
    id  += ".#{@classes.join '.'}" if @classes?.length


    if @children?
      if count = @children.length
        "<#{id}>…(#{count})…</#{tag}>"
      else
        "<#{id}></#{tag}>"
    else
      "<#{id} />"

  toMarkup: (indent = '') ->

    tag   = @type ? 'node'
    expr  = @expr

    # Ensure generated ID goes first
    orig  = {id: @_id}
    orig[k] = v for k, v of @orig?()

    props = (Util.Pretty.JSX.prop k, v for k, v of orig when !@expr[k])
    expr  = (Util.Pretty.JSX.prop k, v for k, v of expr)

    attr = ['']
    attr = attr.concat props if props.length
    attr = attr.concat expr  if expr.length
    attr = attr.join ' '

    if @children?
      child = indent + '  '
      [
        "#{indent}<#{tag}#{attr}>",
        @children.map((x) -> x.toMarkup child).join("\n"),
        "#{indent}</#{tag}>",
      ].join "\n"
    else
      "#{indent}<#{tag}#{attr} />"

  print: (level) ->
    Util.Pretty.print @toMarkup(), level


THREE.Binder.apply Node::

module.exports = Node

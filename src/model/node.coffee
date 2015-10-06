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
    {traits, props, finals, freeform} = config
    traits   ?= @_config?.traits   ? []
    props    ?= @_config?.props    ? {}
    finals   ?= @_config?.finals   ? {}
    freeform ?= @_config?.freeform ? false

    @_config    = {traits, props, finals, freeform}
    @attributes = attributes.apply @, @_config

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
    # Notify root listeners of child removal
    event =
      type: 'remove'
      node: @
    @root.trigger event if @root

    # Notify self listeners of own removal
    event.type = 'removed'
    @trigger event

    @root = @parent = null

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
    _id = @id ? @_id

    tag  = @type ? 'node'
    id   = tag
    id  += "##{_id}"
    id  += ".#{@classes.join '.'}" if @classes?.length


    if @children?
      if count = @children.length
        "<#{id}>…(#{count})…</#{tag}>"
      else
        "<#{id}></#{tag}>"
    else
      "<#{id} />"

  toMarkup: (selector = null, indent = '') ->
    if selector and typeof selector != 'function'
      selector = @root?.model._matcher(selector) ? () -> true

    tag   = @type ? 'node'
    expr  = @expr

    # Ensure generated ID goes first
    orig  = {id: @_id}
    orig[k] = v for k, v of @orig?()

    props = (Util.Pretty.JSX.prop k, v for k, v of orig when !@expr[k])
    expr  = (Util.Pretty.JSX.bind k, v for k, v of expr)

    attr = ['']
    attr = attr.concat props if props.length
    attr = attr.concat expr  if expr.length
    attr = attr.join ' '

    child = indent
    recurse = () =>
      return '' if !@children?.length
      children = @children
        .map((x) -> x.toMarkup selector, child)
        .filter((x) -> x? and x.length)
        .join("\n")

    if selector and !selector @
      return recurse()

    if @children?
      open  = "<#{tag}#{attr}>"
      close = "</#{tag}>"

      child = indent + '  '
      children  = recurse()
      children  = "\n" + children + "\n" + indent if children.length
      children ?= ''

      indent + open + children + close

    else
      "#{indent}<#{tag}#{attr} />"

  print: (selector, level) ->
    Util.Pretty.print @toMarkup(selector), level


Binder = require '../util/binder'
Binder.apply Node::

module.exports = Node

# Quick'n'dirty Virtual DOM diffing
# with a poor man's React for components
#
# This is for rendering HTML with data from a GL readback. See DOM examples.
HEAP = []
id = 0

# Static render components
Types = {
  ###
  # el('example', props, children);
  example: MathBox.DOM.createClass({
    render: (el, props, children) ->
      # VDOM node
      return el('span', { className: "foo" }, "Hello World")
  })
  ###
}

descriptor = () ->
  id:       id++
  type:     null
  props:    null
  children: null
  rendered: null
  instance: null

hint = (n) ->
  n *= 2
  n = Math.max 0, HEAP.length - n
  HEAP.push descriptor() for i in [0...n]
element = (type, props, children) ->
  el = if HEAP.length then HEAP.pop() else descriptor()

  el.type     = type       ? 'div'
  el.props    = props      ? null
  el.children = children   ? null
  # Can't use `arguments` here to pass children as direct args, it de-optimizes label emitters

  el

recycle = (el) ->
  return unless el.type

  children = el.children
  el.type  = el.props = el.children = el.instance = null

  HEAP.push el

  recycle child for child in children if children?
  return

apply = (el, last, node, parent, index) ->
  if el?
    if !last?
      # New node
      return mount el, parent, index
    else
      # Literal DOM node
      if el instanceof Node
        same = el == last
        return if same
      else
        # Check compatibility
        same = typeof el == typeof last    and
               last != null and el != null and
               el.type == last.type

      if !same
        # Not compatible: unmount and remount
        unmount last.instance, node
        node.remove()
        return mount el, parent, index
      else
        # Maintain component ref
        el.instance = last.instance

        # Check if it's a component
        type = if el.type?.isComponentClass then el.type else Types[el.type]

        # Prepare to diff props and children
        props     = last?.props
        nextProps = el   .props
        children     = last?.children ? null
        nextChildren = el   .children

        nextProps.children = nextChildren if nextProps?

        # Component
        if type?
          # See if it changed
          dirty = node._COMPONENT_DIRTY

          dirty = true if props? != nextProps?
          dirty = true if children != nextChildren

          if props? and nextProps?
            dirty = true for key        of props     when !nextProps.hasOwnProperty key if !dirty
            dirty = true for key, value of nextProps when (ref = props[key]) != value   if !dirty

          if dirty
            comp = last.instance
            el.props    ?= {}
            el.props[k] ?= v for k, v of comp.defaultProps
            el.props.children = el.children

            comp.willReceiveProps? el.props
            should = node._COMPONENT_FORCE || (comp.shouldUpdate?(el.props) ? true)

            if should
              nextState = comp.getNextState()
              comp.willUpdate? el.props, nextState

            prevProps = comp.props
            prevState = comp.applyNextState()

            comp.props    = el.props
            comp.children = el.children

            if should
              el   = el.rendered = comp.render? element, el.props, el.children
              apply el, last.rendered, node, parent, index

              comp.didUpdate? prevProps, prevState

          return

        else
          # VDOM node
          unset node, key, props[key] for key        of props     when !nextProps.hasOwnProperty key if props?
          set   node, key, value, ref for key, value of nextProps when (ref = props[key]) != value   and key != 'children' if nextProps?

          # Diff children
          if nextChildren?
            if typeof nextChildren in ['string', 'number']
              # Insert text directly
              if nextChildren != children
                node.textContent = nextChildren
            else
              if nextChildren.type?
                # Single child
                apply nextChildren, children, node.childNodes[0], node, 0
              else
                # Diff children
                childNodes   = node.childNodes
                if children?
                  apply child, children[i], childNodes[i], node, i for child, i in nextChildren
                else
                  apply child, null,        childNodes[i], node, i for child, i in nextChildren
          else if children?
            # Unmount all child components
            unmount null, node

            # Remove all children
            node.innerHTML = ''

        return

  if last?
    # Removed node
    unmount last.instance, node
    last.node.remove()

mount = (el, parent, index = 0) ->
  type = if el.type?.isComponentClass then el.type else Types[el.type]

  # Literal DOM node
  if el instanceof Node
    node = el
  else
    if type?
      # Component
      ctor = if el.type?.isComponentClass then el.type else Types[el.type]

      # No component class found
      if !ctor
        el = el.rendered = element 'noscript'
        node = mount el, parent, index
        return node

      # Construct component class
      el.instance  = comp = new ctor parent
      el.props    ?= {}
      el.props[k] ?= v for k, v of comp.defaultProps
      el.props.children = el.children

      # Do initial state transition
      comp.props    = el.props
      comp.children = el.children
      comp.setState comp.getInitialState?()
      comp.willMount?()

      # Render
      el = el.rendered = comp.render? element, el.props, el.children
      node = mount el, parent, index

      # Finish mounting and remember component/node association
      comp.didMount? el
      node._COMPONENT = comp

      return node

    else if typeof el in ['string', 'number']
      # Text
      node = document.createTextNode el
    else
      # VDOM Node
      node = document.createElement el.type
      set node, key, value for key, value of el.props

    children = el.children
    if children?
      if typeof children in ['string', 'number']
        # Insert text directly
        node.textContent = children
      else
        if children.type?
          # Single child
          mount children, node, 0
        else
          # Insert children
          mount child, node, i for child, i in children

  parent.insertBefore node, parent.childNodes[index]
  return node

unmount = (comp, node) ->
  if comp
    comp.willUnmount?()
    delete comp[k] for k of comp

  for child in node.childNodes
    unmount child._COMPONENT, child
    delete child._COMPONENT

prop = (key) ->
  return true if typeof document == 'undefined'
  return key if document.documentElement.style[key]?

  key = key[0].toUpperCase() + key.slice 1
  prefixes = ['webkit', 'moz', 'ms', 'o']
  return prefix + key for prefix in prefixes when document.documentElement.style[prefix + key]?

map = {}
map[key] = prop key for key in ['transform']

set = (node, key, value, orig) ->
  if key == 'style'
    for k, v of value when orig?[k] != v
      node.style[map[k] ? k] = v
    return

  if node[key]?
    node[key] = value
    return

  if node instanceof Node
    node.setAttribute key, value
    return

unset = (node, key, orig) ->
  if key == 'style'
    for k, v of orig
      node.style[map[k] ? k] = ''
    return

  if node[key]?
    node[key] = undefined

  if node instanceof Node
    node.removeAttribute key
    return

createClass = (prototype) ->
  aliases = {
    willMount:        'componentWillMount'
    didMount:         'componentDidMount'
    willReceiveProps: 'componentWillReceiveProps'
    shouldUpdate:     'shouldComponentUpdate'
    willUpdate:       'componentWillUpdate'
    didUpdate:        'componentDidUpdate'
    willUnmount:      'componentWillUnmount'
  }
  prototype[a] ?= prototype[b] for a, b of aliases

  class Component
    constructor: (node, @props = {}, @state = null, @children = null) ->
      bind = (f, self) -> if typeof f == 'function' then f.bind self else f
      @[k] = bind v, @ for k, v of prototype

      nextState = null

      @setState = (state) ->
        nextState ?= if state then nextState ? {} else null
        nextState[k] = v for k, v of state
        node._COMPONENT_DIRTY = true
        return

      @forceUpdate  = () ->
        node._COMPONENT_FORCE = node._COMPONENT_DIRTY = true

        el = node
        while el = el.parentNode
          if el._COMPONENT
            el._COMPONENT_FORCE = true

      @getNextState = () -> nextState

      @applyNextState = () ->
        node._COMPONENT_FORCE = node._COMPONENT_DIRTY = false
        prevState = @state
        [nextState, @state] = [null, nextState]
        prevState

      return

  Component.isComponentClass = true
  Component.prototype.defaultProps = prototype.getDefaultProps?() ? {}
  Component

module.exports = {element, recycle, apply, hint, Types, createClass}
# Quick'n'dirty Virtual DOM diffing
# with a poor man's React for stateless components
#
# This is for rendering only, no events, no component lifecycle, etc.
HEAP = []
id = 0

# Static render components
Types = {
  ###
  # el('example', props, children);
  example: {
    render: (el, props, children) ->
      return el('span', { className: "foo" }, "Hello World")
  }
  ###
}

descriptor = () ->
  id:       id++
  type:     null
  props:    null
  children: null
  render:   null

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
  el.type  = el.props = el.children = null

  HEAP.push el

  recycle child for child in children if children?
  return

apply = (el, last, node, parent, index) ->
  if el?
    if !last?
      # New node
      return insert el, parent, index
    else
      # Check compatibility
      same = typeof el == typeof last    and
             last != null and el != null and
             el.type == last.type

      if !same
        # Not compatible: remove and reinsert
        remove node, parent
        return insert el, parent, index
      else
        # Check if it's a component
        type = Types[el.type]

        # Prepare to diff props and children
        props     = last?.props
        nextProps = el   .props
        children     = last?.children ? null
        nextChildren = el   .children

        # Component
        if type?
          # See if it changed
          dirty = false
          dirty = true for key        of props     when !nextProps.hasOwnProperty key if props?
          dirty = true for key, value of nextProps when (ref = props[key]) != value   if nextProps?
          dirty = true if children != nextChildren

          if dirty
            el = el.render = type.render element, el.props ? {}, el.children
            return apply el, last.render, node, parent, index
          return

        else
          # DOM node
          unset node, key, props[key] for key        of props     when !nextProps.hasOwnProperty key if props?
          set   node, key, value, ref for key, value of nextProps when (ref = props[key]) != value   if nextProps?

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
            # Remove all children
            node.innerHTML = ''

        return

  if last?
    # Removed node
    return remove node, parent

insert = (el, parent, index = 0) ->
  type = Types[el.type]

  if type?
    # Component
    el = el.render = type.render element, el.props ? {}, el.children
    return insert el, parent, index
  else if typeof el in ['string', 'number']
    # Text
    node = document.createTextNode el
  else
    # DOM Node
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
        insert children, node, 0
      else
        # Insert children
        insert child, node, i for child, i in children

  parent.insertBefore node, parent.childNodes[index]
  return

remove = (node, parent) ->
  parent.removeChild node

prop = (key) ->
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

module.exports = {element, recycle, apply, hint, Types}
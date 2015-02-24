# Quick'n'dirty Virtual DOM
HEAP = []
id = 0

descriptor = () ->
  id:       id++
  type:     null
  props:    null
  children: null

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
        # Compatible: apply changes
        
        # Diff props
        props     = last?.props
        nextProps = el   .props

        unset node, key             for key        of props     when !nextProps.hasOwnProperty key if props?
        set   node, key, value, ref for key, value of nextProps when (ref = props[key]) != value   if nextProps?

        # Diff children
        children     = last?.children ? null
        nextChildren = el   .children

        if typeof nextChildren in ['string', 'number']
          # Skip text node creation and use innerText directly
          if nextChildren != children
            node.innerText = nextChildren

        else if nextChildren?
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
  if typeof el in ['string', 'number']
    node = document.createTextNode el
  else
    node = document.createElement el.type
    set node, key, value for key, value of el.props

  children = el.children
  if typeof children == 'string'
    insert children, node, 0
  else
    insert child, node, i for child, i in children if children?

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

unset = (node, key) ->
  return node.removeAttribute key

module.exports = {element, recycle, apply, hint}
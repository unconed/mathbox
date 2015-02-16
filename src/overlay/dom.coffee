Overlay = require './overlay'

id = 0
descriptor = () ->
  id:       id++
  type:     null
  props:    null
  children: null

# Quick'n'dirty Virtual DOM
class DOM extends Overlay
  init: (options) ->
    @heap = []
    @last = null

    @mount()

  dispose: () ->
    @unmount()
    super

  mount: () ->
    overlay = document.createElement 'div'
    overlay.classList.add 'mathbox-overlay'
    @element.appendChild overlay
    @overlay = overlay

  unmount: (overlay) ->
    @element.removeChild overlay
    @overlay = null

  el: (type, props, children) ->
    #children = [children] if children? and children !instanceof Array

    el = if @heap.length then @heap.pop() else descriptor()
    el.type     = type       ? 'div'
    el.props    = props      ? null
    el.children = children   ? null
    # Can't use `arguments` here to pass children as direct args, it de-optimizes label emitters
    el

  recycle: (el) ->
    return unless el.type

    children = el.children
    el.type  = el.props = el.children = null
    @heap.push el
    @recycle child for child in children if children?
    return

  render: (el) ->
    el      = @el 'div', null, el if typeof el == 'string'
    el      = @el 'div', null, el if el instanceof Array
    naked   = el.type == 'div'

    last    = @last
    overlay = @overlay

    node    = if naked then overlay else overlay.childNodes[0]
    parent  = if naked then overlay.parentNode else overlay

    # Mounting into element
    last = @el 'div' if !last && node

    @apply   el, last, node, parent, 0
    @recycle last if last?

    @last = el
    return

  apply: (el, last, node, parent, index) ->
    if el?
      if !last?
        return @insert el, parent, index
      else
        same = typeof el == typeof last    and
               last != null and el != null and
               el.type == last.type

        if !same
          @remove node, parent
          return @insert el, parent, index
        else
          props     = last?.props
          nextProps = el   .props

          @unset node, key, value for key        of props     when !nextProps.hasOwnProperty key if props?
          @set   node, key, value for key, value of nextProps when props[key] != value           if nextProps?

          children     = last?.children ? null
          nextChildren = el   .children

          if typeof nextChildren == 'string'
            if nextChildren != children
              node.innerText = nextChildren

          else if nextChildren?
            childNodes   = node.childNodes
            if children?
              @apply child, children[i], childNodes[i], node, i for child, i in nextChildren
            else
              @apply child, null,        childNodes[i], node, i for child, i in nextChildren

          else if children?
            node.innerHTML = ''

          return

    if last?
      return @remove node, parent

  insert: (el, parent, index = 0) ->
    if typeof el == 'string'
      node = document.createTextNode el
    else
      node = document.createElement el.type
      @set node, key, value for key, value of el.props

    children = el.children
    if typeof children == 'string'
      @insert children, node, 0
    else
      @insert child, node, i for child, i in children if children?

    parent.insertBefore node, parent.childNodes[index]
    return

  remove: (node, parent) ->
    parent.removeChild node

  set: (node, key, value) ->
    if key == 'style'
      node.style[k] = v for k, v of value
      return

    if node[key]?
      node[key] = value
      return

    if node instanceof Node
      node.setAttribute key, value
      return

  unset: (node, key, value) ->
    return node.removeAttribute key

module.exports = DOM
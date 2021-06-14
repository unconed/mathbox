ShaderGraph = require '@mentat/shadergraph'

Factory = (snippets) ->
  fetch = (name) ->
    # Built-in library
    s = snippets[name]
    return s if s?

    # Load from <script> tags by ID
    ref = name[0] in ['#', '.', ':', '[']
    sel = if ref then name else "##{name}"
    element = document.querySelector sel
    if element? and element.tagName == 'SCRIPT'
      return (element.textContent || element.innerText)

    throw new Error "Unknown shader `#{name}`"

  ShaderGraph.load fetch,
    autoInspect: true

module.exports = Factory

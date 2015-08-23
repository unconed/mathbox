class Guard
  constructor: (@limit = 10) ->
  iterate: (options) ->
    {step, last} = options

    limit = @limit
    while run = step()
      if !--limit
        console.warn "Last iteration", last?()
        throw "Exceeded iteration limit in digest."
    null

module.exports = Guard

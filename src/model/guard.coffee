class Guard
  constructor: (@limit = 10) ->
  iterate: (options) ->
    {step, last} = options

    limit = @limit
    while run = step()
      if !--limit
        console.warn "Last iteration", last?()
        throw new Error "Exceeded iteration limit."
    null

module.exports = Guard

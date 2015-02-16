class Guard
  constructor: (@limit = 10) ->
  iterate: (callback) ->
    limit = @limit
    while run = callback()
      throw "Exceeded iteration limit in digest." if !--limit
    null

module.exports = Guard

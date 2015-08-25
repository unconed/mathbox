# Merge multiple objects
exports.merge = () ->
  x = {}
  (x[k] = v for k, v of obj) for obj in arguments
  x

exports.clone = (o) -> JSON.parse JSON.serialize o

exports.parseQuoted = (str) ->

  accum = ""

  unescape = (str) -> str = str.replace /\\/g,   ''
  munch = (next) ->
    list.push unescape accum if accum.length
    accum = next ? ""

  str = str.split /(?=(?:\\.|["' ,]))/g
  quote = false
  list = []

  for chunk in str
    char  = chunk[0]
    token = chunk.slice(1)
    switch char
      when '"', "'"
        if quote
          if quote == char
            quote = false
            munch token
          else
            accum += chunk
        else
          if accum != ''
            throw new Error "ParseError: String `#{str}` does not contain comma-separated quoted tokens."

          quote = char
          accum += token
      when ' ', ','
        if !quote
          munch token
        else
          accum += chunk
      else
        accum += chunk
  munch()
  list
        
NUMBER_PRECISION = 5
NUMBER_THRESHOLD = 0.0001

checkFactor = (v, f) -> Math.abs(v / f - Math.round(v / f)) < NUMBER_THRESHOLD
checkUnit   = (v) -> checkFactor v, 1

formatMultiple = (v, f, k, compact) ->
  d = Math.round(v / f)
  return "#{k}"  if d ==  1
  return "-#{k}" if d == -1
  return "#{d}"  if k == '1'
  return if compact then "#{d}#{k}" else "#{d}*#{k}"

formatFraction = (v, f, k, compact) ->
  d = Math.round(v * f)
  if Math.abs(d) == 1
    d = if d < 0 then "-" else ""
    d += k
  else if k != '1'
    d += if compact then "#{k}" else "*#{k}"

  "#{d}/#{f}"

formatFactors    = [
  {1: 1}
  {1: 1, τ: Math.PI * 2}
  {1: 1, π: Math.PI}
  {1: 1, τ: Math.PI * 2, π: Math.PI}
  {1: 1, e: Math.E}
  {1: 1, τ: Math.PI * 2, e: Math.E}
  {1: 1, π: Math.PI, e: Math.E}
  {1: 1, τ: Math.PI * 2, π: Math.PI, e: Math.E}
]
formatPrimes     = [ # denominators 1-30 + interesting multiples
  [2*2*3*5*7, [2,3,5,7]]                   # 1-7
  [2*2*2*3*3*5*5*7*7, [2,3,5,7]]           # 8-11
  [2*2*3*5*7*11*13, [2,3,5,7,11,13]]       # 12-16
  [2*2*17*19*23*29, [2,17,19,23,29]]       # 17-30
  [256*256,         [2]]                   # Powers of 2
  [1000000,         [2,5]]                 # Powers of 10
]

prettyNumber = (options) ->
  {cache, compact, tau, pi, e, threshold, precision} = options if options

  compact   = +!!(compact ? true)
  tau       = +!!(tau     ? true)
  pi        = +!!(pi      ? true)
  e         = +!!(e       ? true)
  cache     = +!!(cache   ? true)
  threshold = +(threshold ? NUMBER_THRESHOLD)
  precision = +(precision ? NUMBER_PRECISION)

  formatIndex = tau + pi * 2 + e * 4
  cacheIndex = formatIndex + threshold + precision

  numberCache = if cache then {} else null

  (v) ->
    if numberCache?
      return cached if (cached = numberCache[v])?
      return numberCache[v] = "#{v}" if v == Math.round v

    out  = "#{v}"
    best = out.length + out.indexOf('.') + 2
    match = (x) ->
      d = x.length
      if d <= best
        out = "#{x}"
        best = d

    for k, f of formatFactors[formatIndex]
      if checkUnit v / f
        match "#{formatMultiple v / f, 1, k, compact}"
      else
        for [denom, list] in formatPrimes
          numer = v / f * denom
          if checkUnit numer
            for p in list
              while checkUnit(n = numer / p) and checkUnit(d = denom / p)
                numer = n
                denom = d

            match "#{formatFraction v / f, denom, k, compact}"
            break

    match "#{v.toPrecision NUMBER_PRECISION}" if "#{v}".length > NUMBER_PRECISION

    if numberCache?
      numberCache[v] = out

    out

prettyPrint = (markup, level = 'info') ->
  markup = prettyMarkup markup
  console[level].apply console, markup

prettyMarkup = (markup) ->

  # quick n dirty

  tag  = 'color:rgb(128,0,128)'
  attr = 'color:rgb(144,64,0)'
  str  = 'color:rgb(0,0,192)'
  obj  = 'color:rgb(0,70,156)'
  txt  = 'color:inherit'

  quoted = false
  nested = 0

  args = []
  markup = markup.replace /(\\[<={}> "'])|(=>|[<={}> "'])/g, (_, escape, char) ->
      return escape if escape?.length
      return char if quoted and char !in ['"', "'"]
      return char if nested and char !in ['"', "'", '{', "}"]

      res = switch char
        when '<'
          args.push tag
          "%c<"
        when '>'
          args.push tag
          args.push txt
          "%c>%c"
        when ' '
          args.push attr
          " %c"
        when '=', '=>'
          args.push tag
          "%c#{char}"
        when '"', "'"
          quoted = !quoted
          if quoted
            args.push if nested then attr else str
            "#{char}%c"
          else
            args.push if nested then obj else tag
            "%c#{char}"
        when '{'
          if nested++ == 0
            args.push obj
            "%c#{char}"
          else
            char
        when '}'
          if --nested == 0
            args.push tag
            "#{char}%c"
          else
            char
        else
          char

  [markup].concat args

prettyJSXProp = (k, v) -> prettyJSXPair k, v, '='
prettyJSXBind = (k, v) -> prettyJSXPair k, v, '=>'

prettyJSXPair = do ->
  formatNumber = prettyNumber {compact: false}

  (k, v, op) ->

    key   = (k) -> if (k == "" + +k) or k.match /^[A-Za-z_][A-Za-z0-9]*$/ then k else JSON.stringify k
    wrap  = (v) -> if v.match '\n*"' then v else "{#{v}}"
    value = (v) ->
      return "[#{v.map(value).join ', '}]" if v instanceof Array

      switch typeof v
              when 'string'
                if v.match "\n" then "\"\n#{v}\"\n" else "\"#{v}\""
              when 'function'
                v = "#{v}"
                if v.match "\n" then "\n#{v}\n" else "#{v}"
                v = v.replace /^function (\([^)]+\))/, "$1 =>"
                v = v.replace /^(\([^)]+\)) =>\s*{\s*return\s*([^}]+)\s*;\s*}/, "$1 => $2"
              when 'number'
                formatNumber v
              else
                if v? and v != !!v
                  if v._up?     then return value v.map (v) -> v
                  if v.toMarkup then return v.toString()
                  else
                    "{" + ("#{key kk}: #{value vv}" for kk, vv of v when v.hasOwnProperty kk).join(", ") + "}"
                else
                  "#{JSON.stringify v}"

    [k, op, wrap value v].join ''

escapeHTML = (str) ->
  str = str.replace /&/g, '&amp;'
  str = str.replace /</g, '&lt;'
  str = str.replace /"/g, '&quot;'

prettyFormat = (str) ->
  args = [].slice.call arguments
  args.shift()

  out = "<span>"

  str = escapeHTML str

  for arg in args
    str = str.replace /%([a-z])/, (_, f) ->
      v = args.shift()
      switch f
        when 'c'
          "</span><span style=\"#{escapeHTML v}\">"
        else
          escapeHTML v

  out += str
  out += "</span>"

module.exports =
  markup: prettyMarkup
  number: prettyNumber
  print:  prettyPrint
  format: prettyFormat
  JSX: { prop: prettyJSXProp, bind: prettyJSXBind }

###
for x in [1, 2, 1/2, 3, 1/3, Math.PI, Math.PI / 2, Math.PI * 2, Math.PI * 3, Math.PI * 4, Math.PI * 3 / 4, Math.E * 100, Math.E / 100]
  console.log prettyNumber({})(x)
###
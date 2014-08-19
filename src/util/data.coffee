exports.getSizes = getSizes = (data) ->
  sizes = []
  array = data
  while array.length?
    sizes.push array.length
    array = array[0]
  sizes

exports.getDimensions = (data, spec = {}) ->
  {items, channels, width, height, depth} = spec

  dims = {}

  if !data || !data.length
    return {items, channels, width: width ? 0, height: height ? 0, depth: depth ? 0}

  sizes = getSizes data
  nesting = sizes.length

  dims.channels = if channels != 1 and sizes.length > 1 then sizes.pop() else channels
  dims.items    = if items    != 1 and sizes.length > 1 then sizes.pop() else items
  dims.width    = if width    != 1 and sizes.length > 1 then sizes.pop() else width
  dims.height   = if height   != 1 and sizes.length > 1 then sizes.pop() else height
  dims.depth    = if depth    != 1 and sizes.length > 1 then sizes.pop() else depth

  levels    = nesting
  levels++ if channels == 1
  levels++ if items    == 1 and levels > 1
  levels++ if width    == 1 and levels > 2
  levels++ if height   == 1 and levels > 3

  n  = sizes.pop()   ? 1
  n /= dims.channels ? 1 if levels <= 1
  n /= dims.items    ? 1 if levels <= 2
  n /= dims.width    ? 1 if levels <= 3
  n /= dims.height   ? 1 if levels <= 4
  n  = Math.floor n

  if !dims.width?
    dims.width = n
    n = 1
  if !dims.height?
    dims.height = n
    n = 1
  if !dims.depth?
    dims.depth = n
    n = 1

  dims

exports.getThunk = (data) ->
  sizes = getSizes data
  nesting = sizes.length

  a = sizes.pop()
  b = sizes.pop()
  c = sizes.pop()
  d = sizes.pop()

  done = false

  switch nesting
    when 0 then () ->

    when 1
      i = 0
      () -> data[i++]

    when 2
      i = j = 0
      first = data[j] ? []

      () ->
        x = first[i++]
        if i == a
          [i, j] = [0, j + 1] 
          first = data[j] ? []
        x

    when 3
      i = j = k = 0
      second = data[k]   ? []
      first  = second[j] ? []

      () ->
        x = first[i++]
        if i == a
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
            second = data[k] ? []
          first = second[j]  ? []
        x

    when 4
      i = j = k = l = 0
      third  = data[l]   ? []
      second = third[k]  ? []
      first  = second[j] ? []

      () ->
        x = first[i++]
        if i == a
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
            if k == c
              [k, l] = [0, l + 1]
              third = data[l] ? []
            second = third[k] ? []
          first = second[j]   ? []
        x

    when 5
      i = j = k = l = m = 0
      fourth = data[m]   ? []
      third  = fourth[l] ? []
      second = third[k]  ? []
      first  = second[j] ? []

      () ->
        x = first[i++]
        if i == a
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
            if k == c
              [k, l] = [0, l + 1]
              if l == d
                [l, m] = [0, m + 1]
                fourth = data[m] ? []
              third = fourth[l]  ? []
            second = third[k]    ? []
          first = second[j]      ? []
        x



THREE.LineStripGeometry = (n, m, transpose) ->
  m ||= 1

  [n, m] = [m, n] if transpose

  triangles = (n - 1) * 2
  points = n * 2

  geometry = new THREE.BufferGeometry
  geometry.addAttribute 'index', Uint16Array, triangles * 3 * m, 1
  geometry.addAttribute 'position', Float32Array, points * m, 3
  geometry.addAttribute 'line', Float32Array, points * m, 2

  indices   = geometry.attributes.index.array;
  positions = geometry.attributes.position.array;
  lines     = geometry.attributes.line.array;

  for l in [0...m]
    base = l * triangles / 2
    j = base * 6

    for i in [0...triangles] by 2
      k = i + base * 2 + 2 * l

      indices[j++] = k
      indices[j++] = k + 1
      indices[j++] = k + 2

      indices[j++] = k + 2
      indices[j++] = k + 1
      indices[j++] = k + 3

    base = l * n
    j = base * 6
    k = base * 4
    for i in [0...n]
      [x, y] = if transpose then [l, i] else [i, l]

      edge = if (x == 0) then -1 else if (x == n - 1) then 1 else 0

      positions[j++] = x
      positions[j++] = y
      positions[j++] = 0

      positions[j++] = x
      positions[j++] = y
      positions[j++] = 0

      lines[k++] = edge
      lines[k++] = 1

      lines[k++] = edge
      lines[k++] = -1

  geometry.offsets = [
    index: 0
    start: 0
    count: triangles * 3 * m
  ]

  geometry


THREE.LinesGeometry = (n, m, transpose) ->
  n = Math.floor(n/2) * 2
  m ||= 1

  [n, m] = [m, n] if transpose

  points = n * 2
  triangles = n

  geometry = new THREE.BufferGeometry
  geometry.addAttribute 'index', Uint16Array, triangles * 3 * m, 1
  geometry.addAttribute 'position', Float32Array, points * m, 3
  geometry.addAttribute 'line', Float32Array, points * m, 2

  indices   = geometry.attributes.index.array;
  positions = geometry.attributes.position.array;
  lines     = geometry.attributes.line.array;

  base;
  for l in [0...m]
    base = l * n
    j = base * 6
    k = base * 4

    for i in [0...triangles]
      indices[j++] = k
      indices[j++] = k + 1
      indices[j++] = k + 2

      indices[j++] = k + 2
      indices[j++] = k + 1
      indices[j++] = k + 3
      
      k += 4

    base = l * n
    j = base * 6
    k = base * 4

    for i in [0...n]

      [x, y] = if transpose then [l, i] else [i, l]

      edge = if x%2 then 1 else -1

      positions[j++] = x
      positions[j++] = y
      positions[j++] = 0

      positions[j++] = x
      positions[j++] = y
      positions[j++] = 0

      lines[k++] = edge
      lines[k++] = 1

      lines[k++] = edge
      lines[k++] = -1

  geometry.offsets = [
    start: 0
    count: triangles * 3 * m
  ]

  geometry

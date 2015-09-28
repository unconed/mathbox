Classes =
  axis:              ['draw', 'Axis']
  face:              ['draw', 'Polygon face']
  grid:              ['draw', '2D line grid']
  line:              ['draw', 'Line']
  point:             ['draw', 'Point']
  strip:             ['draw', 'Triangle strip']
  surface:           ['draw', 'Surface']
  ticks:             ['draw', 'Ticks']
  vector:            ['draw', 'Vector']

  view:              ['view', 'View']
  cartesian:         ['view', 'Cartesian']
  cartesian4:        ['view', '4D cartesian']
  polar:             ['view', 'Polar']
  spherical:         ['view', 'Spherical']
  stereographic:     ['view', 'Stereographic']
  stereographic4:    ['view', '4D stereographic']

  transform:         ['transform','3D transform']
  transform4:        ['transform','4D transform']
  vertex:            ['transform','Vertex pass']
  fragment:          ['transform','Fragment pass']
  layer:             ['transform','Layer']

  array:             ['data','1D array']
  interval:          ['data','1D interval']
  matrix:            ['data','2D matrix']
  area:              ['data','2D area']
  voxel:             ['data','3D voxel']
  volume:            ['data','3D volume']
  scale:             ['data','Scale']

  html:              ['overlay','HTML source']
  dom:               ['overlay','DOM injector']

  text:              ['text','Text source']
  format:            ['text','Source formatter']
  retext:            ['text','Text reformatter']
  label:             ['text','GL label']

  grow:              ['operator','Grow data']
  join:              ['operator','Join rows']
  lerp:              ['operator','Linear interpolation']
  memo:              ['operator','Memoize']
  resample:          ['operator','Resample']
  repeat:            ['operator','Repeat']
  swizzle:           ['operator','Swizzle data']
  spread:            ['operator','Spread rows']
  split:             ['operator','Split rows']
  slice:             ['operator','Slice rows']
  transpose:         ['operator','Transpose']

  group:             ['base','Group']
  inherit:           ['base','Inherit trait']
  root:              ['base','Root']
  unit:              ['base','Unit calibration']

  shader:            ['shader','Shader snippet']

  camera:            ['camera','Camera interface']

  rtt:               ['rtt','Render to texture']
  compose:           ['rtt','Compose pass']

  clock:             ['time','Relative clock']
  now:               ['time','Absolute time']

  move:              ['present','Move transition']
  play:              ['present','Play animation']
  present:           ['present','Present slides']
  reveal:            ['present','Reveal transition']
  slide:             ['present','Presentation slide']
  step:              ['present','Step through animation']

module.exports = Classes
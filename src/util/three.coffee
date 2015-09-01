exports.paramToGL = (gl, p) ->

  if ( p == THREE.RepeatWrapping ) then return gl.REPEAT
  if ( p == THREE.ClampToEdgeWrapping ) then return gl.CLAMP_TO_EDGE
  if ( p == THREE.MirroredRepeatWrapping ) then return gl.MIRRORED_REPEAT

  if ( p == THREE.NearestFilter ) then return gl.NEAREST
  if ( p == THREE.NearestMipMapNearestFilter ) then return gl.NEAREST_MIPMAP_NEAREST
  if ( p == THREE.NearestMipMapLinearFilter ) then return gl.NEAREST_MIPMAP_LINEAR

  if ( p == THREE.LinearFilter ) then return gl.LINEAR
  if ( p == THREE.LinearMipMapNearestFilter ) then return gl.LINEAR_MIPMAP_NEAREST
  if ( p == THREE.LinearMipMapLinearFilter ) then return gl.LINEAR_MIPMAP_LINEAR

  if ( p == THREE.UnsignedByteType ) then return gl.UNSIGNED_BYTE
  if ( p == THREE.UnsignedShort4444Type ) then return gl.UNSIGNED_SHORT_4_4_4_4
  if ( p == THREE.UnsignedShort5551Type ) then return gl.UNSIGNED_SHORT_5_5_5_1
  if ( p == THREE.UnsignedShort565Type ) then return gl.UNSIGNED_SHORT_5_6_5

  if ( p == THREE.ByteType ) then return gl.BYTE
  if ( p == THREE.ShortType ) then return gl.SHORT
  if ( p == THREE.UnsignedShortType ) then return gl.UNSIGNED_SHORT
  if ( p == THREE.IntType ) then return gl.INT
  if ( p == THREE.UnsignedIntType ) then return gl.UNSIGNED_INT
  if ( p == THREE.FloatType ) then return gl.FLOAT

  if ( p == THREE.AlphaFormat ) then return gl.ALPHA
  if ( p == THREE.RGBFormat ) then return gl.RGB
  if ( p == THREE.RGBAFormat ) then return gl.RGBA
  if ( p == THREE.LuminanceFormat ) then return gl.LUMINANCE
  if ( p == THREE.LuminanceAlphaFormat ) then return gl.LUMINANCE_ALPHA

  if ( p == THREE.AddEquation ) then return gl.FUNC_ADD
  if ( p == THREE.SubtractEquation ) then return gl.FUNC_SUBTRACT
  if ( p == THREE.ReverseSubtractEquation ) then return gl.FUNC_REVERSE_SUBTRACT

  if ( p == THREE.ZeroFactor ) then return gl.ZERO
  if ( p == THREE.OneFactor ) then return gl.ONE
  if ( p == THREE.SrcColorFactor ) then return gl.SRC_COLOR
  if ( p == THREE.OneMinusSrcColorFactor ) then return gl.ONE_MINUS_SRC_COLOR
  if ( p == THREE.SrcAlphaFactor ) then return gl.SRC_ALPHA
  if ( p == THREE.OneMinusSrcAlphaFactor ) then return gl.ONE_MINUS_SRC_ALPHA
  if ( p == THREE.DstAlphaFactor ) then return gl.DST_ALPHA
  if ( p == THREE.OneMinusDstAlphaFactor ) then return gl.ONE_MINUS_DST_ALPHA

  if ( p == THREE.DstColorFactor ) then return gl.DST_COLOR
  if ( p == THREE.OneMinusDstColorFactor ) then return gl.ONE_MINUS_DST_COLOR
  if ( p == THREE.SrcAlphaSaturateFactor ) then return gl.SRC_ALPHA_SATURATE

  return 0

exports.paramToArrayStorage = (type) ->
  switch type
    when THREE.UnsignedByteType  then Uint8Array
    when THREE.ByteType          then Int8Array
    when THREE.ShortType         then Int16Array
    when THREE.UnsignedShortType then Uint16Array
    when THREE.IntType           then Int32Array
    when THREE.UnsignedIntType   then Uint32Array
    when THREE.FloatType         then Float32Array

exports.swizzleToEulerOrder = (swizzle) ->
  swizzle.map((i) -> ['', 'X', 'Y', 'Z'][i]).join ''

exports.transformComposer = () ->

  euler     = new THREE.Euler
  quat      = new THREE.Quaternion
  pos       = new THREE.Vector3
  scl       = new THREE.Vector3
  transform = new THREE.Matrix4

  (position, rotation, quaternion, scale, matrix, eulerOrder = 'XYZ') ->

    if rotation?
      eulerOrder = exports.swizzleToEulerOrder eulerOrder if eulerOrder instanceof Array
      euler.setFromVector3 rotation, eulerOrder
      quat.setFromEuler euler
    else
      quat.set 0, 0, 0, 1

    if quaternion?
      quat.multiply quaternion

    if position?
      pos.copy position
    else
      pos.set 0, 0, 0

    if scale?
      scl.copy scale
    else
      scl.set 1, 1, 1

    transform.compose pos, quat, scl
    transform.multiplyMatrices transform, matrix if matrix?

    transform

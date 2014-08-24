GLSL = MathBox.Util.GLSL

describe "util.glsl", () ->

  it 'swizzles vec4', () ->

    code = GLSL.swizzleVec4 [4, 3, 2, 1]
    expect(code).toContain("vec4(xyzw.w, xyzw.z, xyzw.y, xyzw.x)")

    code = GLSL.swizzleVec4 [4, 0, 2, 1]
    expect(code).toContain("vec4(xyzw.w, 0.0, xyzw.y, xyzw.x)")

    code = GLSL.swizzleVec4 [2, 4, 3], 4
    expect(code).toContain("vec4(xyzw.y, xyzw.w, xyzw.z, 0.0)")

    code = GLSL.swizzleVec4 [2, 4, 3]
    expect(code).toContain("vec3(xyzw.y, xyzw.w, xyzw.z)")

    code = GLSL.swizzleVec4 'yxwz'
    expect(code).toContain("vec4(xyzw.y, xyzw.x, xyzw.w, xyzw.z)")

    code = GLSL.swizzleVec4 'y0wz'
    expect(code).toContain("vec4(xyzw.y, 0.0, xyzw.w, xyzw.z)")

    code = GLSL.swizzleVec4 'ywz', 4
    expect(code).toContain("vec4(xyzw.y, xyzw.w, xyzw.z, 0.0)")

    code = GLSL.swizzleVec4 'ywz'
    expect(code).toContain("vec3(xyzw.y, xyzw.w, xyzw.z)")

  it 'invert swizzles vec4', () ->

    code = GLSL.invertSwizzleVec4 [2, 3, 4, 1]
    expect(code).toContain("vec4(xyzw.w, xyzw.x, xyzw.y, xyzw.z)")

    code = GLSL.invertSwizzleVec4 [2, 3, 4, 0]
    expect(code).toContain("vec4(0.0, xyzw.x, xyzw.y, xyzw.z)")

    code = GLSL.invertSwizzleVec4 [2, 3, 4], 4
    expect(code).toContain("vec4(0.0, xyzw.x, xyzw.y, xyzw.z)")

    code = GLSL.invertSwizzleVec4 'yzwx'
    expect(code).toContain("vec4(xyzw.w, xyzw.x, xyzw.y, xyzw.z)")

    code = GLSL.invertSwizzleVec4 'yzw0'
    expect(code).toContain("vec4(0.0, xyzw.x, xyzw.y, xyzw.z)")

    code = GLSL.invertSwizzleVec4 'yzw'
    expect(code).toContain("vec4(0.0, xyzw.x, xyzw.y, xyzw.z)")

export default /* glsl */ `vec4 alignXYZW(vec4 xyzw) {
  return floor(xyzw + .5);
}

`;

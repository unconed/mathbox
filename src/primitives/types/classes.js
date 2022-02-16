/* eslint-disable sort-imports */
import { Group, Inherit, Root, Unit } from "./base";
import { Camera } from "./camera";
import { Area, Array_, Interval, Matrix, Scale, Volume, Voxel } from "./data";
import {
  Axis,
  Face,
  Grid,
  Line,
  Point,
  Strip,
  Surface,
  Ticks,
  Vector,
} from "./draw";
import { DOM, HTML } from "./overlay";
import { Format, Label, Retext, Text } from "./text";
import { Clock, Now } from "./time";
import {
  Fragment,
  Layer,
  Mask,
  Transform3,
  Transform4,
  Vertex,
} from "./transform";
import {
  Clamp,
  Grow,
  Join,
  Lerp,
  Memo,
  Readback,
  Repeat,
  Resample,
  Slice,
  Split,
  Spread,
  Subdivide,
  Swizzle,
  Transpose,
} from "./operator";
import { Move, Play, Present, Reveal, Slide, Step } from "./present";
import { Compose, RTT } from "./rtt";
import {
  Cartesian,
  Cartesian4,
  Polar,
  Spherical,
  Stereographic,
  Stereographic4,
  View,
} from "./view";

import { Shader } from "./shader";

export const Classes = {
  axis: Axis,
  face: Face,
  grid: Grid,
  line: Line,
  point: Point,
  strip: Strip,
  surface: Surface,
  ticks: Ticks,
  vector: Vector,

  view: View,
  cartesian: Cartesian,
  cartesian4: Cartesian4,
  polar: Polar,
  spherical: Spherical,
  stereographic: Stereographic,
  stereographic4: Stereographic4,

  transform: Transform3,
  transform4: Transform4,
  vertex: Vertex,
  fragment: Fragment,
  layer: Layer,
  mask: Mask,

  array: Array_,
  interval: Interval,
  matrix: Matrix,
  area: Area,
  voxel: Voxel,
  volume: Volume,
  scale: Scale,

  html: HTML,
  dom: DOM,

  text: Text,
  format: Format,
  label: Label,
  retext: Retext,

  clamp: Clamp,
  grow: Grow,
  join: Join,
  lerp: Lerp,
  memo: Memo,
  readback: Readback,
  resample: Resample,
  repeat: Repeat,
  swizzle: Swizzle,
  spread: Spread,
  split: Split,
  slice: Slice,
  subdivide: Subdivide,
  transpose: Transpose,

  group: Group,
  inherit: Inherit,
  root: Root,
  unit: Unit,

  shader: Shader,

  camera: Camera,

  rtt: RTT,
  compose: Compose,

  clock: Clock,
  now: Now,

  move: Move,
  play: Play,
  present: Present,
  reveal: Reveal,
  slide: Slide,
  step: Step,
};

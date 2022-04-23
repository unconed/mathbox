import type * as TT from "./node_types";
import type {
  Alignments,
  AreaEmitter,
  ArrayEmitter,
  Axes,
  AxesWithZero,
  BlendingModes,
  IntervalEmitter,
  MatrixEmitter,
  Optional,
  VolumeEmitter,
  VoxelEmitter,
} from "./primitives/types/types_typed";
import { Classes } from "./primitives/types/classes";

export type NodeType = keyof typeof Classes;

export * from "./node_types";

export {
  AreaEmitter,
  ArrayEmitter,
  IntervalEmitter,
  MatrixEmitter,
  VolumeEmitter,
  VoxelEmitter,
};

/**
 * Placeholder for threestrap typings.
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Threestrap = any;

export type { Alignments, Axes, AxesWithZero, BlendingModes, Optional };

export type Props = {
  area: TT.AreaProps;
  array: TT.ArrayProps;
  axis: TT.AxisProps;
  camera: TT.CameraProps;
  cartesian: TT.CartesianProps;
  cartesian4: TT.Cartesian4Props;
  clamp: TT.ClampProps;
  clock: TT.ClockProps;
  compose: TT.ComposeProps;
  dom: TT.DomProps;
  face: TT.FaceProps;
  format: TT.FormatProps;
  fragment: TT.FragmentProps;
  grid: TT.GridProps;
  group: TT.GroupProps;
  grow: TT.GrowProps;
  html: TT.HtmlProps;
  inherit: TT.InheritProps;
  interval: TT.IntervalProps;
  join: TT.JoinProps;
  label: TT.LabelProps;
  latch: TT.LatchProps;
  layer: TT.LayerProps;
  lerp: TT.LerpProps;
  line: TT.LineProps;
  mask: TT.MaskProps;
  matrix: TT.MatrixProps;
  memo: TT.MemoProps;
  move: TT.MoveProps;
  now: TT.NowProps;
  play: TT.PlayProps;
  point: TT.PointProps;
  polar: TT.PolarProps;
  present: TT.PresentProps;
  readback: TT.ReadbackProps;
  repeat: TT.RepeatProps;
  resample: TT.ResampleProps;
  retext: TT.RetextProps;
  reveal: TT.RevealProps;
  reverse: TT.ReverseProps;
  root: TT.RootProps;
  rtt: TT.RttProps;
  scale: TT.ScaleProps;
  shader: TT.ShaderProps;
  slice: TT.SliceProps;
  slide: TT.SlideProps;
  spherical: TT.SphericalProps;
  split: TT.SplitProps;
  spread: TT.SpreadProps;
  step: TT.StepProps;
  stereographic: TT.StereographicProps;
  stereographic4: TT.Stereographic4Props;
  strip: TT.StripProps;
  subdivide: TT.SubdivideProps;
  surface: TT.SurfaceProps;
  swizzle: TT.SwizzleProps;
  text: TT.TextProps;
  ticks: TT.TicksProps;
  transform: TT.TransformProps;
  transform4: TT.Transform4Props;
  transpose: TT.TransposeProps;
  unit: TT.UnitProps;
  vector: TT.VectorProps;
  vertex: TT.VertexProps;
  view: TT.ViewProps;
  volume: TT.VolumeProps;
  voxel: TT.VoxelProps;
};

export type PropsNoramlized = {
  area: TT.AreaPropsNormalized;
  array: TT.ArrayPropsNormalized;
  axis: TT.AxisPropsNormalized;
  camera: TT.CameraPropsNormalized;
  cartesian: TT.CartesianPropsNormalized;
  cartesian4: TT.Cartesian4PropsNormalized;
  clamp: TT.ClampPropsNormalized;
  clock: TT.ClockPropsNormalized;
  compose: TT.ComposePropsNormalized;
  dom: TT.DomPropsNormalized;
  face: TT.FacePropsNormalized;
  format: TT.FormatPropsNormalized;
  fragment: TT.FragmentPropsNormalized;
  grid: TT.GridPropsNormalized;
  group: TT.GroupPropsNormalized;
  grow: TT.GrowPropsNormalized;
  html: TT.HtmlPropsNormalized;
  inherit: TT.InheritPropsNormalized;
  interval: TT.IntervalPropsNormalized;
  join: TT.JoinPropsNormalized;
  label: TT.LabelPropsNormalized;
  latch: TT.LatchPropsNormalized;
  layer: TT.LayerPropsNormalized;
  lerp: TT.LerpPropsNormalized;
  line: TT.LinePropsNormalized;
  mask: TT.MaskPropsNormalized;
  matrix: TT.MatrixPropsNormalized;
  memo: TT.MemoPropsNormalized;
  move: TT.MovePropsNormalized;
  now: TT.NowPropsNormalized;
  play: TT.PlayPropsNormalized;
  point: TT.PointPropsNormalized;
  polar: TT.PolarPropsNormalized;
  present: TT.PresentPropsNormalized;
  readback: TT.ReadbackPropsNormalized;
  repeat: TT.RepeatPropsNormalized;
  resample: TT.ResamplePropsNormalized;
  retext: TT.RetextPropsNormalized;
  reveal: TT.RevealPropsNormalized;
  reverse: TT.ReversePropsNormalized;
  root: TT.RootPropsNormalized;
  rtt: TT.RttPropsNormalized;
  scale: TT.ScalePropsNormalized;
  shader: TT.ShaderPropsNormalized;
  slice: TT.SlicePropsNormalized;
  slide: TT.SlidePropsNormalized;
  spherical: TT.SphericalPropsNormalized;
  split: TT.SplitPropsNormalized;
  spread: TT.SpreadPropsNormalized;
  step: TT.StepPropsNormalized;
  stereographic: TT.StereographicPropsNormalized;
  stereographic4: TT.Stereographic4PropsNormalized;
  strip: TT.StripPropsNormalized;
  subdivide: TT.SubdividePropsNormalized;
  surface: TT.SurfacePropsNormalized;
  swizzle: TT.SwizzlePropsNormalized;
  text: TT.TextPropsNormalized;
  ticks: TT.TicksPropsNormalized;
  transform: TT.TransformPropsNormalized;
  transform4: TT.Transform4PropsNormalized;
  transpose: TT.TransposePropsNormalized;
  unit: TT.UnitPropsNormalized;
  vector: TT.VectorPropsNormalized;
  vertex: TT.VertexPropsNormalized;
  view: TT.ViewPropsNormalized;
  volume: TT.VolumePropsNormalized;
  voxel: TT.VoxelPropsNormalized;
};

/**
 * MathBox (virtual)-DOM Nodes.
 *
 * Usually one interacts with these via a selection.
 */
export interface MathboxNode<T extends NodeType = NodeType> {
  type: string;
  props: PropsNoramlized[T];

  /**
   * @hidden @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: any;
}

/**
 * @typeParam Type The type(s) of MathBox nodes in this selection.
 */
export interface MathboxSelection<Type extends NodeType = NodeType> {
  /**
   * Set properties on all nodes in this selection.
   */
  set(props: Props[Type]): MathboxSelection<Type>;
  /**
   * Set a single property on all nodes in this selection
   */
  set<P extends keyof Props[Type]>(
    prop: P,
    value: Props[Type][P]
  ): MathboxSelection<Type>;
  /**
   * Return all props for the first node in this node.
   */
  get(): PropsNoramlized[Type];
  /**
   * Retrieve a specific property value for the first node in this selection.
   */
  get<P extends keyof PropsNoramlized[Type]>(prop: P): PropsNoramlized[Type][P];
  /**
   * Return an array of props for all nodes in this node.
   */
  getAll(): PropsNoramlized[Type][];
  remove: () => void;
  print: () => MathboxSelection<Type>;

  select<N extends NodeType = NodeType>(query: string): MathboxSelection<N>;

  /**
   * Print (in the console) the DOM nodes in this selection.
   * Called automatically on first load.
   */
  inspect(): void;

  /** Display a visual representation of all shader snippets, how they are wired, with the GLSL available on mouseover. */
  debug(): void;

  /** Is this selection wrapping a leaf node? */
  isLeaf: boolean;
  /** Is this selection wrapping the root node? */
  isRoot: boolean;

  three: Type extends "root" ? Threestrap : undefined;

  // array-esque interface
  [index: number]: MathboxNode<Type>;
  /**
   * The number of nodes contained in this selection.
   */
  length: number;

  /**
   * Iterate over a selection's nodes in document order and discard the return
   * values. Returns the original selection.
   */
  each(
    cb: (
      node: MathboxNode<Type>,
      i?: number,
      selection?: MathboxSelection<Type>
    ) => void
  ): MathboxSelection<Type>;

  /**
   * Iterate over a selection's nodes in document order and return the resulting
   * values as an array.
   * */
  map<S>(
    cb: (
      node: MathboxNode<Type>,
      i?: number,
      selection?: MathboxSelection<Type>
    ) => S
  ): S[];

  /**
   * Return the ith node in this selection, indexed from 0.
   */
  eq(i: number): MathboxSelection<Type>;

  // creation methods

  /**
   * Create new `area` node.
   *
   * See also {@link AreaProps} and {@link AreaPropsNormalized}.
   *
   * @category data
   */
  area(props?: TT.AreaProps): MathboxSelection<"area">;
  /**
   * Create new `array` node.
   *
   * See also {@link ArrayProps} and {@link ArrayPropsNormalized}.
   *
   * @category data
   */
  array(props?: TT.ArrayProps): MathboxSelection<"array">;
  /**
   * Create new `axis` node.
   *
   * See also {@link AxisProps} and {@link AxisPropsNormalized}.
   *
   * @category draw
   */
  axis(props?: TT.AxisProps): MathboxSelection<"axis">;
  /**
   * Create new `camera` node.
   *
   * See also {@link CameraProps} and {@link CameraPropsNormalized}.
   *
   * @category camera
   */
  camera(props?: TT.CameraProps): MathboxSelection<"camera">;
  /**
   * Create new `cartesian` node.
   *
   * See also {@link CartesianProps} and {@link CartesianPropsNormalized}.
   *
   * @category view
   */
  cartesian(props?: TT.CartesianProps): MathboxSelection<"cartesian">;
  /**
   * Create new `cartesian4` node.
   *
   * See also {@link Cartesian4Props} and {@link Cartesian4PropsNormalized}.
   *
   * @category view
   */
  cartesian4(props?: TT.Cartesian4Props): MathboxSelection<"cartesian4">;
  /**
   * Create new `clamp` node.
   *
   * See also {@link ClampProps} and {@link ClampPropsNormalized}.
   *
   * @category operator
   */
  clamp(props?: TT.ClampProps): MathboxSelection<"clamp">;
  /**
   * Create new `clock` node.
   *
   * See also {@link ClockProps} and {@link ClockPropsNormalized}.
   *
   * @category time
   */
  clock(props?: TT.ClockProps): MathboxSelection<"clock">;
  /**
   * Create new `compose` node.
   *
   * See also {@link ComposeProps} and {@link ComposePropsNormalized}.
   *
   * @category rtt
   */
  compose(props?: TT.ComposeProps): MathboxSelection<"compose">;
  /**
   * Create new `dom` node.
   *
   * See also {@link DomProps} and {@link DomPropsNormalized}.
   *
   * @category overlay
   */
  dom(props?: TT.DomProps): MathboxSelection<"dom">;
  /**
   * Create new `face` node.
   *
   * See also {@link FaceProps} and {@link FacePropsNormalized}.
   *
   * @category draw
   */
  face(props?: TT.FaceProps): MathboxSelection<"face">;
  /**
   * Create new `format` node.
   *
   * See also {@link FormatProps} and {@link FormatPropsNormalized}.
   *
   * @category text
   */
  format(props?: TT.FormatProps): MathboxSelection<"format">;
  /**
   * Create new `fragment` node.
   *
   * See also {@link FragmentProps} and {@link FragmentPropsNormalized}.
   *
   * @category transform
   */
  fragment(props?: TT.FragmentProps): MathboxSelection<"fragment">;
  /**
   * Create new `grid` node.
   *
   * See also {@link GridProps} and {@link GridPropsNormalized}.
   *
   * @category draw
   */
  grid(props?: TT.GridProps): MathboxSelection<"grid">;
  /**
   * Create new `group` node.
   *
   * See also {@link GroupProps} and {@link GroupPropsNormalized}.
   *
   * @category base
   */
  group(props?: TT.GroupProps): MathboxSelection<"group">;
  /**
   * Create new `grow` node.
   *
   * See also {@link GrowProps} and {@link GrowPropsNormalized}.
   *
   * @category operator
   */
  grow(props?: TT.GrowProps): MathboxSelection<"grow">;
  /**
   * Create new `html` node.
   *
   * See also {@link HtmlProps} and {@link HtmlPropsNormalized}.
   *
   * @category overlay
   */
  html(props?: TT.HtmlProps): MathboxSelection<"html">;
  /**
   * Create new `inherit` node.
   *
   * See also {@link InheritProps} and {@link InheritPropsNormalized}.
   *
   * @category base
   */
  inherit(props?: TT.InheritProps): MathboxSelection<"inherit">;
  /**
   * Create new `interval` node.
   *
   * See also {@link IntervalProps} and {@link IntervalPropsNormalized}.
   *
   * @category data
   */
  interval(props?: TT.IntervalProps): MathboxSelection<"interval">;
  /**
   * Create new `join` node.
   *
   * See also {@link JoinProps} and {@link JoinPropsNormalized}.
   *
   * @category operator
   */
  join(props?: TT.JoinProps): MathboxSelection<"join">;
  /**
   * Create new `label` node.
   *
   * See also {@link LabelProps} and {@link LabelPropsNormalized}.
   *
   * @category text
   */
  label(props?: TT.LabelProps): MathboxSelection<"label">;
  /**
   * Create new `latch` node.
   *
   * See also {@link LatchProps} and {@link LatchPropsNormalized}.
   *
   * @category data
   */
  latch(props?: TT.LatchProps): MathboxSelection<"latch">;
  /**
   * Create new `layer` node.
   *
   * See also {@link LayerProps} and {@link LayerPropsNormalized}.
   *
   * @category transform
   */
  layer(props?: TT.LayerProps): MathboxSelection<"layer">;
  /**
   * Create new `lerp` node.
   *
   * See also {@link LerpProps} and {@link LerpPropsNormalized}.
   *
   * @category operator
   */
  lerp(props?: TT.LerpProps): MathboxSelection<"lerp">;
  /**
   * Create new `line` node.
   *
   * See also {@link LineProps} and {@link LinePropsNormalized}.
   *
   * @category draw
   */
  line(props?: TT.LineProps): MathboxSelection<"line">;
  /**
   * Create new `mask` node.
   *
   * See also {@link MaskProps} and {@link MaskPropsNormalized}.
   *
   * @category transform
   */
  mask(props?: TT.MaskProps): MathboxSelection<"mask">;
  /**
   * Create new `matrix` node.
   *
   * See also {@link MatrixProps} and {@link MatrixPropsNormalized}.
   *
   * @category data
   */
  matrix(props?: TT.MatrixProps): MathboxSelection<"matrix">;
  /**
   * Create new `memo` node.
   *
   * See also {@link MemoProps} and {@link MemoPropsNormalized}.
   *
   * @category operator
   */
  memo(props?: TT.MemoProps): MathboxSelection<"memo">;
  /**
   * Create new `move` node.
   *
   * See also {@link MoveProps} and {@link MovePropsNormalized}.
   *
   * @category present
   */
  move(props?: TT.MoveProps): MathboxSelection<"move">;
  /**
   * Create new `now` node.
   *
   * See also {@link NowProps} and {@link NowPropsNormalized}.
   *
   * @category time
   */
  now(props?: TT.NowProps): MathboxSelection<"now">;
  /**
   * Create new `play` node.
   *
   * See also {@link PlayProps} and {@link PlayPropsNormalized}.
   *
   * @category present
   */
  play(props?: TT.PlayProps): MathboxSelection<"play">;
  /**
   * Create new `point` node.
   *
   * See also {@link PointProps} and {@link PointPropsNormalized}.
   *
   * @category draw
   */
  point(props?: TT.PointProps): MathboxSelection<"point">;
  /**
   * Create new `polar` node.
   *
   * See also {@link PolarProps} and {@link PolarPropsNormalized}.
   *
   * @category view
   */
  polar(props?: TT.PolarProps): MathboxSelection<"polar">;
  /**
   * Create new `present` node.
   *
   * See also {@link PresentProps} and {@link PresentPropsNormalized}.
   *
   * @category present
   */
  present(props?: TT.PresentProps): MathboxSelection<"present">;
  /**
   * Create new `readback` node.
   *
   * See also {@link ReadbackProps} and {@link ReadbackPropsNormalized}.
   *
   * @category operator
   */
  readback(props?: TT.ReadbackProps): MathboxSelection<"readback">;
  /**
   * Create new `repeat` node.
   *
   * See also {@link RepeatProps} and {@link RepeatPropsNormalized}.
   *
   * @category operator
   */
  repeat(props?: TT.RepeatProps): MathboxSelection<"repeat">;
  /**
   * Create new `resample` node.
   *
   * See also {@link ResampleProps} and {@link ResamplePropsNormalized}.
   *
   * @category operator
   */
  resample(props?: TT.ResampleProps): MathboxSelection<"resample">;
  /**
   * Create new `retext` node.
   *
   * See also {@link RetextProps} and {@link RetextPropsNormalized}.
   *
   * @category text
   */
  retext(props?: TT.RetextProps): MathboxSelection<"retext">;
  /**
   * Create new `reveal` node.
   *
   * See also {@link RevealProps} and {@link RevealPropsNormalized}.
   *
   * @category present
   */
  reveal(props?: TT.RevealProps): MathboxSelection<"reveal">;
  /**
   * Create new `reveal` node.
   *
   * See also {@link ReverseProps} and {@link ReversePropsNormalized}.
   *
   * @category operator
   */
  reverse(props?: TT.ReverseProps): MathboxSelection<"reverse">;
  /**
   * Create new `root` node.
   *
   * See also {@link RootProps} and {@link RootPropsNormalized}.
   *
   * @category base
   */
  root(props?: TT.RootProps): MathboxSelection<"root">;
  /**
   * Create new `rtt` node.
   *
   * See also {@link RttProps} and {@link RttPropsNormalized}.
   *
   * @category rtt
   */
  rtt(props?: TT.RttProps): MathboxSelection<"rtt">;
  /**
   * Create new `scale` node.
   *
   * See also {@link ScaleProps} and {@link ScalePropsNormalized}.
   *
   * @category data
   */
  scale(props?: TT.ScaleProps): MathboxSelection<"scale">;
  /**
   * Create new `shader` node.
   *
   * See also {@link ShaderProps} and {@link ShaderPropsNormalized}.
   *
   * @category shader
   */
  shader(props?: TT.ShaderProps): MathboxSelection<"shader">;
  /**
   * Create new `slice` node.
   *
   * See also {@link SliceProps} and {@link SlicePropsNormalized}.
   *
   * @category operator
   */
  slice(props?: TT.SliceProps): MathboxSelection<"slice">;
  /**
   * Create new `slide` node.
   *
   * See also {@link SlideProps} and {@link SlidePropsNormalized}.
   *
   * @category present
   */
  slide(props?: TT.SlideProps): MathboxSelection<"slide">;
  /**
   * Create new `spherical` node.
   *
   * See also {@link SphericalProps} and {@link SphericalPropsNormalized}.
   *
   * @category view
   */
  spherical(props?: TT.SphericalProps): MathboxSelection<"spherical">;
  /**
   * Create new `split` node.
   *
   * See also {@link SplitProps} and {@link SplitPropsNormalized}.
   *
   * @category operator
   */
  split(props?: TT.SplitProps): MathboxSelection<"split">;
  /**
   * Create new `spread` node.
   *
   * See also {@link SpreadProps} and {@link SpreadPropsNormalized}.
   *
   * @category operator
   */
  spread(props?: TT.SpreadProps): MathboxSelection<"spread">;
  /**
   * Create new `step` node.
   *
   * See also {@link StepProps} and {@link StepPropsNormalized}.
   *
   * @category present
   */
  step(props?: TT.StepProps): MathboxSelection<"step">;
  /**
   * Create new `stereographic` node.
   *
   * See also {@link StereographicProps} and {@link StereographicPropsNormalized}.
   *
   * @category view
   */
  stereographic(
    props?: TT.StereographicProps
  ): MathboxSelection<"stereographic">;
  /**
   * Create new `stereographic4` node.
   *
   * See also {@link Stereographic4Props} and {@link Stereographic4PropsNormalized}.
   *
   * @category view
   */
  stereographic4(
    props?: TT.Stereographic4Props
  ): MathboxSelection<"stereographic4">;
  /**
   * Create new `strip` node.
   *
   * See also {@link StripProps} and {@link StripPropsNormalized}.
   *
   * @category draw
   */
  strip(props?: TT.StripProps): MathboxSelection<"strip">;
  /**
   * Create new `subdivide` node.
   *
   * See also {@link SubdivideProps} and {@link SubdividePropsNormalized}.
   *
   * @category operator
   */
  subdivide(props?: TT.SubdivideProps): MathboxSelection<"subdivide">;
  /**
   * Create new `surface` node.
   *
   * See also {@link SurfaceProps} and {@link SurfacePropsNormalized}.
   *
   * @category draw
   */
  surface(props?: TT.SurfaceProps): MathboxSelection<"surface">;
  /**
   * Create new `swizzle` node.
   *
   * See also {@link SwizzleProps} and {@link SwizzlePropsNormalized}.
   *
   * @category operator
   */
  swizzle(props?: TT.SwizzleProps): MathboxSelection<"swizzle">;
  /**
   * Create new `text` node.
   *
   * See also {@link TextProps} and {@link TextPropsNormalized}.
   *
   * @category text
   */
  text(props?: TT.TextProps): MathboxSelection<"text">;
  /**
   * Create new `ticks` node.
   *
   * See also {@link TicksProps} and {@link TicksPropsNormalized}.
   *
   * @category draw
   */
  ticks(props?: TT.TicksProps): MathboxSelection<"ticks">;
  /**
   * Create new `transform` node.
   *
   * See also {@link TransformProps} and {@link TransformPropsNormalized}.
   *
   * @category transform
   */
  transform(props?: TT.TransformProps): MathboxSelection<"transform">;
  /**
   * Create new `transform4` node.
   *
   * See also {@link Transform4Props} and {@link Transform4PropsNormalized}.
   *
   * @category transform
   */
  transform4(props?: TT.Transform4Props): MathboxSelection<"transform4">;
  /**
   * Create new `transpose` node.
   *
   * See also {@link TransposeProps} and {@link TransposePropsNormalized}.
   *
   * @category operator
   */
  transpose(props?: TT.TransposeProps): MathboxSelection<"transpose">;
  /**
   * Create new `unit` node.
   *
   * See also {@link UnitProps} and {@link UnitPropsNormalized}.
   *
   * @category base
   */
  unit(props?: TT.UnitProps): MathboxSelection<"unit">;
  /**
   * Create new `vector` node.
   *
   * See also {@link VectorProps} and {@link VectorPropsNormalized}.
   *
   * @category draw
   */
  vector(props?: TT.VectorProps): MathboxSelection<"vector">;
  /**
   * Create new `vertex` node.
   *
   * See also {@link VertexProps} and {@link VertexPropsNormalized}.
   *
   * @category transform
   */
  vertex(props?: TT.VertexProps): MathboxSelection<"vertex">;
  /**
   * Create new `view` node.
   *
   * See also {@link ViewProps} and {@link ViewPropsNormalized}.
   *
   * @category view
   */
  view(props?: TT.ViewProps): MathboxSelection<"view">;
  /**
   * Create new `volume` node.
   *
   * See also {@link VolumeProps} and {@link VolumePropsNormalized}.
   *
   * @category data
   */
  volume(props?: TT.VolumeProps): MathboxSelection<"volume">;
  /**
   * Create new `voxel` node.
   *
   * See also {@link VoxelProps} and {@link VoxelPropsNormalized}.
   *
   * @category data
   */
  voxel(props?: TT.VoxelProps): MathboxSelection<"voxel">;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MathBoxOptions = any;

export declare function mathBox(
  opts?: MathBoxOptions
): MathboxSelection<"root">;

export declare const version: string;

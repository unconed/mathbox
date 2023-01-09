/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Manual typings for types.js.
 *
 * Why not name this types.d.ts? Because then it won't be included in the build,
 * see https://stackoverflow.com/a/56440335/2747370. dts files are good for
 * specifying types that are only consumed in our source code, but no good for
 * specifying types that should be included in the output.
 */
import type {
  Color,
  Matrix3,
  Matrix4,
  Quaternion,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import type { MathboxNode, MathboxSelection } from "../../types";

import { Types as TypesUntyped } from "./types";

type OnInvalid = () => void;
type Validate<In, Out> = (
  value: In,
  target: unknown,
  invalid: OnInvalid
) => Out;

export interface Type<In, Out> {
  validate: Validate<In, Out>;
  make(): Out;
}

export type Optional<T> = T | null | undefined;

export type BlendingModes =
  | "no"
  | "normal"
  | "add"
  | "subtract"
  | "multiply"
  | "custom";

export type Axes =
  | "x"
  | "y"
  | "z"
  | "w"
  | "W"
  | "H"
  | "D"
  | "I"
  | "width"
  | "height"
  | "depth"
  | "items"
  | 1
  | 2
  | 3
  | 4;
export type AxesWithZero = Axes | 0 | "zero" | "null";

/**
 * Values 'left' and 'right' correspond to -1 and +1, respectively.
 */
export type Alignments = "left" | "middle" | "right" | number;

/**
 * If specified as a number, should range between -1 ("enter") to +1 ("exit").
 */
export type TransitionStates = "enter" | "visible" | "exiit" | number;

/**
 * A representation of a color. Can be:
 *  - a string, which is parsed by THREE.Color
 *  - a THREE.Color instance
 *  - a number, which is interpreted as a hex value
 *  - an array of numbers, which is interpreted as an RGB value
 */
type ColorDescription = string | Color | number | number[];

type Vec2Like = number | number[] | Vector2;
type Vec3Like = number | number[] | Vector3;
type Vec4Like = number | number[] | Vector4;

export type TypeGenerators = {
  // Helpers
  nullable<I, O>(type: Type<I, O>): Type<null | I, null | O>;
  nullable<I, O>(type: Type<I, O>, make: true): Type<null | I, O>;
  array<I, O>(type: Type<I, O>, size?: number, value?: O): Type<I[], O[]>;

  // Primitives
  string(defaultValue?: string): Type<Optional<string>, string>;
  bool(defaultValue?: boolean): Type<Optional<boolean>, boolean>;
  number(defaultValue?: number): Type<Optional<number>, number>;

  // collection-esque
  enum<E extends string | number>(
    value: E,
    keys: E[],
    map?: Record<E, number>
  ): Type<Optional<E>, E>;
  enumber<E extends string | number>(
    value: E | number,
    keys: E[],
    map?: Record<E, number>
  ): Type<Optional<E | number>, E | number>;

  // Others
  classes(): Type<Optional<string | string[]>, string[]>;
  blending(
    defaultValue?: BlendingModes
  ): Type<Optional<BlendingModes>, BlendingModes>;
  anchor(defaultValue?: Alignments): Type<Optional<Alignments>, Alignments>;
  transitionState(
    defaultValue?: TransitionStates
  ): Type<Optional<TransitionStates>, TransitionStates>;
  // Internally, this axis type is not quite correct. When allowZero is true, the Axes enum should have an extra member.
  axis(value?: Axes, allowZero?: false): Type<Optional<Axes>, number>;
  axis(
    value: AxesWithZero,
    allowZero: true
  ): Type<Optional<AxesWithZero>, number>;
  select(
    defaultValue?: string
  ): Type<
    Optional<string | MathboxNode | MathboxSelection>,
    string | MathboxNode | MathboxSelection
  >;

  letters<I, O>(
    type: Type<I, O>,
    size?: number,
    value?: string
  ): Type<Optional<string | I[]>, O[]>;
  int(value?: number): Type<Optional<number>, number>;
  round(value?: number): Type<Optional<number>, number>;
  positive<I, O extends number>(type: Type<I, O>, strict?: boolean): Type<I, O>;

  func: any;
  emitter: any;

  object: any;
  timestamp: any;

  vec2(x?: number, y?: number): Type<Vec2Like, Vector2>;
  ivec2(x?: number, y?: number): Type<Vec2Like, Vector2>;
  vec3(x?: number, y?: number, z?: number): Type<Vec3Like, Vector3>;
  ivec3(x?: number, y?: number, z?: number): Type<Vec3Like, Vector3>;
  vec4(x?: number, y?: number, z?: number, w?: number): Type<Vec4Like, Vector4>;
  ivec4(
    x?: number,
    y?: number,
    z?: number,
    w?: number
  ): Type<Vec4Like, Vector4>;

  mat3(
    n11?: number,
    n12?: number,
    n13?: number,
    n21?: number,
    n22?: number,
    n23?: number,
    n31?: number,
    n32?: number,
    n33?: number
  ): Type<number[] | Matrix3, Matrix3>;
  mat4(
    n11?: number,
    n12?: number,
    n13?: number,
    n14?: number,
    n21?: number,
    n22?: number,
    n23?: number,
    n24?: number,
    n31?: number,
    n32?: number,
    n33?: number,
    n34?: number,
    n41?: number,
    n42?: number,
    n43?: number,
    n44?: number
  ): Type<number[] | Matrix4, Matrix4>;

  quat(
    x?: number,
    y?: number,
    z?: number,
    w?: number
  ): Type<Vec4Like | Quaternion, Quaternion>;
  color(
    r?: number,
    g?: number,
    b?: number,
    a?: number
  ): Type<ColorDescription, Color>;
  transpose(order?: string | Axes[]): Type<Optional<string | Axes[]>, number[]>;

  swizzle(
    order?: string | Axes[],
    size?: number
  ): Type<Optional<string | Axes[]>, number[]>;
  filter: any;
  type: any;
  scale: any;
  mapping: any;

  indexing: any;
  shape: any;
  join: any;
  stroke: any;
  vertexPass: any;

  fragmentPass: any;
  ease: any;
  fit: any;
  font: any;
  data: any;
};

export const Types: TypeGenerators = TypesUntyped;

type Emit = (...xyzw: number[]) => void;

export type ArrayEmitter = (
  emit: Emit,
  i: number,
  t: number,
  delta: number
) => void;
export type IntervalEmitter = (
  emit: Emit,
  x: number,
  i: number,
  t: number,
  delta: number
) => void;
export type MatrixEmitter = (
  emit: Emit,
  i: number,
  j: number,
  t: number,
  delta: number
) => void;
export type AreaEmitter = (
  emit: Emit,
  x: number,
  y: number,
  i: number,
  j: number,
  t: number,
  delta: number
) => void;
export type VoxelEmitter = (
  emit: Emit,
  i: number,
  j: number,
  k: number,
  t: number,
  delta: number
) => void;
export type VolumeEmitter = (
  emit: Emit,
  x: number,
  y: number,
  z: number,
  i: number,
  j: number,
  k: number,
  t: number,
  delta: number
) => void;

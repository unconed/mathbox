/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Manual typings for types.js.
 *
 * Why not name this types.d.ts? Because then it won't be included in the build,
 * see https://stackoverflow.com/a/56440335/2747370. dts files are good for
 * specifying types that are only consumed in our source code, but no good for
 * specifying types that should be included in the output.
 */
import { number } from "src/util/pretty";
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

  vec2: any;
  ivec2: any;
  vec3: any;
  ivec3: any;
  vec4: any;
  ivec4: any;

  mat3: any;
  mat4: any;

  quat: any;
  color: any;
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

export class Swizzle extends Operator {
    make(): string | undefined;
    swizzler: string | null | undefined;
    unmake(): null;
}
import { Operator } from "./operator.js";

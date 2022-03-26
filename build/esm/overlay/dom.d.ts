export class DOM extends Overlay {
    static initClass(): void;
    init(_options: any): null;
    last: any;
    mount(): HTMLDivElement;
    overlay: HTMLDivElement | null | undefined;
    unmount(_overlay: any): null;
    render(el: any): void;
}
import { Overlay } from "./overlay.js";

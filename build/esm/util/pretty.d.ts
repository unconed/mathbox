export namespace JSX {
    export { prettyJSXProp as prop };
    export { prettyJSXBind as bind };
}
declare function prettyJSXProp(k: any, v: any): string;
declare function prettyJSXBind(k: any, v: any): string;
declare function prettyMarkup(markup: any): any[];
declare function prettyNumber(options: any): (v: any) => any;
declare function prettyPrint(markup: any, level: any): any;
declare function prettyFormat(str: any, ...args: any[]): string;
export { prettyMarkup as markup, prettyNumber as number, prettyPrint as print, prettyFormat as format };

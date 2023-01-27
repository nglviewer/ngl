/**
 * @file Parse Xml
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare type XMLNodeAttributes = {
    [k: string]: any;
};
export interface XMLNode {
    name?: string;
    content?: string;
    attributes: XMLNodeAttributes;
    children?: XMLNode[];
}
export declare function parseXml(xml: string): {
    declaration: XMLNode | undefined;
    root: XMLNode | undefined;
};

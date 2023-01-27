/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare function createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[], attribs?: string[], locations?: number[]): WebGLProgram | null | undefined;
export declare function loadShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader | null | undefined;
export declare function getErrorDescription(gl: WebGLRenderingContext, error: number): "no error" | "invalid enum" | "invalid value" | "invalid operation" | "invalid framebuffer operation" | "out of memory" | "context lost" | "unknown error";
export declare function getExtension(gl: WebGLRenderingContext, name: string): any;
export declare function testTextureSupport(type: number): boolean;

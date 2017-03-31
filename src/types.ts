/// <reference types="node" />
type Callback<T> = (err?: Error, data?: T) => void

declare module 'camelize' {
	function camelize(from: string): string
	function camelize(object: Object): Object
	export = camelize
}
declare module 'canvas' {
	class Canvas {
		constructor (width: number, height: number)
		constructor (width: number, height: number, pdf: 'pdf')
		getContext(contextId: '2d', contextAttributes?: {}): Canvas.NodeCanvasRenderingContext2D
		toBuffer(): Buffer
		height: number
		width: number
		toDataURL(type?: string, ...args: any[]): string
		addPage(): void
	}
	namespace Canvas {
		export class Image {
			border: string
			readonly complete: boolean
			readonly currentSrc: string
			height: number
			hspace: number
			isMap: boolean
			longDesc: string
			lowsrc: string
			name: string
			readonly naturalHeight: number
			readonly naturalWidth: number
			sizes: string
			srcset: string
			useMap: string
			vspace: number
			width: number
			readonly x: number
			readonly y: number

			src: string | Buffer
			dataMode: number

			pngStream(): NodeJS.ReadableStream
			jpegStream(opt?: Canvas.JPEGStreamOptions): NodeJS.ReadableStream
			syncJPEGStream(opt?: Canvas.JPEGStreamOptions): NodeJS.ReadableStream

			toBuffer(callback: Callback<Buffer>): void
			toBuffer(type?: 'raw' | undefined, zlibCompressionLevel?: number, whatFilter?: any): Buffer

			toDataURL(): string
			toDataURL(callback: Callback<string>): void
			toDataURL(fileType: 'image/png'): string
			toDataURL(fileType: 'image/png', callback: Callback<string>): void
			toDataURL(fileType: 'image/jpeg', opt?: Canvas.JPEGStreamOptions): string
			toDataURL(fileType: 'image/jpeg', quality?: number): string
			toDataURL(fileType: 'image/jpeg', opt: Canvas.JPEGStreamOptions, callback: Callback<string>): void
			toDataURL(fileType: 'image/jpeg', quality: number, callback: Callback<string>): void

			static registerFont(path: string, opt: {family: string}): void

			static MODE_IMAGE: number
			static MODE_MIME: number
		}
		export interface JPEGStreamOptions {
			bufsize?: number,
			quality?: number,
			progressive: boolean
		}
		export class NodeCanvasRenderingContext2D extends CanvasRenderingContext2D {
			drawImage(image: Image | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, offsetX: number, offsetY: number, width?: number, height?: number, canvasOffsetX?: number, canvasOffsetY?: number, canvasImageWidth?: number, canvasImageHeight?: number): void
			patternQuality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
			textDrawingMode: 'path' | 'glyph'
			filter: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'
		}
	}
	export = Canvas
}

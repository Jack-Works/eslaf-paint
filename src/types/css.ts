export interface Attrs {
	[key: string]: any
}
export interface Canvas extends Attrs {
	x?: number
	y?: number
}
export interface Image extends Attrs {
	x?: number
	y?: number
	width?: number
	height?: number
}
export interface Text extends Attrs {
	textOverflow?: 'break-line' | 'clip' | 'break-lined'

	x: number
	y: number
	width?: number
	height?: number

	fontSize?: number
	fontFamily?: string
	fontWeight?: number
	fontStyle?: string
	lineHeight?: number
	/* use in text-overflow: break-line */

	color?: string
	textShadow?: string
	textAlign?: 'center' | 'left' | 'right'

	strokeColor?: string
	strokeWeight: number
}
export type Object = Text | Image | Canvas

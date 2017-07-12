import Canvas = require('canvas')
import { Image } from 'canvas'
import * as CSS from '../types/css'
import { AbstractEslafPaintCanvas } from './abstract.painter'

export class EslafPaintCanvasForNode extends AbstractEslafPaintCanvas {
	canvas: Canvas
	context: Canvas.NodeCanvasRenderingContext2D

	constructor(params: { buffer?: Buffer | string, width?: number, height?: number }) {
		super(params)
		let { buffer, width, height } = params
		if (buffer) {
			const img = this.GetImageFrom(buffer)
			this.canvas = new Canvas(width || img.width, height || img.height)
			this.context = this.canvas.getContext('2d')
			this.context.drawImage(img, 0, 0, img.width, img.height)
		} else {
			this.canvas = new Canvas(width || 100, height || 100)
			this.context = this.canvas.getContext('2d')
		}
		this.context.patternQuality = 'best'
		this.context.lineJoin = 'round'
	}
	drawImage(image: Buffer, CSS: CSS.Image) {
		super.drawImage(image, CSS)
	}
	GetImageFrom(buffer: Buffer | string, img = new Image): Canvas.Image {
		img.src = buffer as string
		return img
	}
	static readonly Image = Image
	static readonly Canvas = Canvas
}

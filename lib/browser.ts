import * as CSS from '../types/css'
import { AbstractEslafPaintCanvas } from './abstract.painter'

export class EslafPaintForBrowser extends AbstractEslafPaintCanvas {
	canvas: HTMLCanvasElement

	constructor(params: { canvas: HTMLCanvasElement, background?: string, width?: number, height?: number }) {
		super(params)
		let { canvas, background, width, height } = params
		this.canvas = canvas
		this.context = this.canvas.getContext('2d')
		if (background) {
			const img = this.GetImageFrom(background)
			this.canvas.width = img.width
			this.canvas.height = img.height
			this.context.drawImage(img, 0, 0, img.width, img.height)
		}
		this.context.lineJoin = 'round'
	}
	drawImage(image: string, CSS: CSS.Image) {
		super.drawImage(image, CSS)
	}
	GetImageFrom(image: string, img?: HTMLImageElement, width?: number, height?: number): HTMLImageElement {
		if (!img) img = new Image(width, height)
		img.src = image
		return img
	}
}

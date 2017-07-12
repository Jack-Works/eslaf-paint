import clone = require('lodash.clonedeep')

import { AbstractEslafPaintCanvas } from './lib/abstract.painter'

import * as css from './types/css'
import * as profile from './types/profile'

export const map = (obj: { [key: string]: any }, fn: (<T>(item: T, index: string) => T)) => {
	obj = clone(obj)
	for (let i in obj) obj[i] = fn(obj[i], i)
	return obj
}

export const drawType = {
	text: (canvasContext: AbstractEslafPaintCanvas, { text, styles }: { text: string, styles: css.Text }) =>
		canvasContext.drawText(text, styles, { stroke: !!styles.strokeWeight }),

	img: (canvasContext: AbstractEslafPaintCanvas, { styles, src }: { styles: css.Image, src: Buffer }) =>
		canvasContext.drawImage(src, styles)
}

export const getTypeof = (orig: profile.Task): [Function, profile.Task] => {
	if (orig.type == 'text') return [drawType.text, orig]
	if (orig.type == 'img') return [drawType.img, orig]
	throw new TypeError(`Unknown paint type ${orig.type}`)
}

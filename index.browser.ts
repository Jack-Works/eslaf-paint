import merge = require('lodash.defaultsdeep')
import clone = require('lodash.clonedeep')

import { EslafPaintForBrowser } from "./lib/browser"
import { AbstractEslafPaintCanvas } from './lib/abstract.painter'
import parseStyles from './lib/style'

import * as css from './types/css'
import * as profile from './types/profile'
import { ISolvedFileType } from './lib/solve.file'

const map = (obj: { [key: string]: any }, fn: (<T>(item: T, index: string) => T)) => {
	obj = clone(obj)
	for (let i in obj) obj[i] = fn(obj[i], i)
	return obj
}

const drawType = {
	text: (canvasContext: AbstractEslafPaintCanvas, { text, styles }: { text: string, styles: css.Text }) =>
		canvasContext.drawText(text, styles, { stroke: !!styles.strokeWeight }),

	img: (canvasContext: AbstractEslafPaintCanvas, { styles, src }: { styles: css.Image, src: Buffer }) =>
		canvasContext.drawImage(src, styles)
}

const getTypeof = (orig: profile.Task): [Function, profile.Task] => {
	if (orig.type == 'text') return [drawType.text, orig]
	if (orig.type == 'img') return [drawType.img, orig]
	throw new TypeError(`Unknown paint type ${orig.type}`)
}

function staticPainer(
	{ staticConfig, image, canvas: { width, height }, element }:
		{ staticConfig: profile.Task[], image: string, canvas: css.Canvas, element: HTMLCanvasElement }) {
	const canvas = new EslafPaintForBrowser({
		background: image, width, height, canvas: element
	})
	staticConfig.map(getTypeof)
		.forEach(([paintFunction, data]) => paintFunction(canvas, data))
	return element
}

export default async (argv: {
	_: {
		background: string,
		css: string,
		config: profile.Profile,
		element: HTMLCanvasElement
	}, [anyArg: string]: any, lib?: Function
}, stepCallback = (name: string, data: HTMLCanvasElement) => { }) => {
	let { background: image, css: Css, config: Configs } = argv._
	const Styles = parseStyles(Css || 'canvas {}')

	argv.lib = AbstractEslafPaintCanvas
	if (Configs instanceof Function) Configs = Configs(argv)
	Configs = await Configs

	for (let key in Configs) {
		let config = await Configs[key]
		for (let op of config) {
			op.styles = merge(op.styles, Styles('.' + op.use))
		}
	}

	let cfg: { [key: string]: { staticConfig: profile.Task[], image: string, canvas: css.Canvas, element: HTMLCanvasElement } } = {}
	Object.keys(Configs).forEach(async name => cfg[name] = {
		staticConfig: await Configs[name],
		image,
		canvas: {
			width: Styles('canvas').width,
			height: Styles('canvas').height
		},
		element: argv._.element
	})

	let result: { [key: string]: Buffer } = {}
	Object.keys(cfg).forEach(name => {
		const to = staticPainer(cfg[name])
		stepCallback(name, to)
		return to
	})
	return result
}
export const lib = AbstractEslafPaintCanvas

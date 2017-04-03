import merge = require('lodash.defaultsdeep')
import clone = require('lodash.clonedeep')
import Jimp = require('jimp')

import { EslafPaintCanvas } from './lib/canvas'
import parseStyles from './lib/style'
import fileSolve from './lib/solve.file'

import * as css from './types/css'
import * as profile from './types/profile'
import { ISolvedFileType } from './lib/solve.file'

const map = (obj: {[key: string]: any}, fn: (<T>(item: T, index: string) => T)) => {
	obj = clone(obj)
	for (let i in obj) obj[i] = fn(obj[i], i)
	return obj
}

const drawType = {
	text: (canvasContext: EslafPaintCanvas, {text, styles}: {text: string, styles: css.Text}) =>
		canvasContext.drawText(text, styles, { stroke: !!styles.strokeWeight }),

	img: (canvasContext: EslafPaintCanvas, {styles, src}: {styles: css.Image, src: Buffer}) =>
		canvasContext.drawImage(src, styles)
}

const getTypeof = (orig: profile.Task): [Function, profile.Task] => {
	if(orig.type == 'text') return [drawType.text, orig]
	if(orig.type == 'img') return [drawType.img, orig]
	throw new TypeError(`Unknown paint type ${orig.type}`)
}

function staticPainer(
	{staticConfig, image, canvas: {width, height}}:
		{staticConfig: profile.Task[], image: string | Buffer, canvas: css.Canvas})
{
	const canvas = new EslafPaintCanvas({
		buffer: image, width, height
	})
	staticConfig.map(getTypeof)
		.forEach(([paintFunction, data]) => paintFunction(canvas, data))
	return canvas.canvas.toBuffer()
}

async function getPNGBuffer(img: Jimp): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => img.getBuffer(Jimp.MIME_PNG, (err, data) => {
		if(err) reject(err)
		else resolve(data)
	}))
}

export default async (argv: {_: Array<string | ISolvedFileType>, [anyArg: string]: any, lib?: Function}, stepCallback = (name: string, data: Buffer) => {}) => {
	console.log(argv)
	let {img: image, css: Css, js: Configs} = await fileSolve(argv._)
	const Styles = parseStyles(Css || 'canvas {}')

	argv.lib = EslafPaintCanvas
	if(Configs instanceof Function) Configs = Configs(argv)
	Configs = await Configs

	for (let key in Configs) {
		let config = Configs[key]
		for (let op of config) {
			op.styles = merge(op.styles, Styles('.' + op.use))

			if (op.type == 'img') {
				let src = op.src
				let img = await Jimp.read(typeof src === 'string' ? src : await src)
				op.src = await getPNGBuffer(img)
			}
		}
	}

	let cfg: {[key: string]: {staticConfig: profile.Task[], image: string | Buffer, canvas: css.Canvas}} = {}
	Object.keys(Configs).forEach(name => cfg[name] = {
		staticConfig: Configs[name],
		image,
		canvas: {
			width: Styles('canvas').width,
			height: Styles('canvas').height
		}
	})

	let result: {[key: string]: Buffer} = {}
	Object.keys(cfg).forEach(name => {
		const to = staticPainer(cfg[name])
		stepCallback(name, to)
		return to
	})
	return result
}
export const lib = EslafPaintCanvas

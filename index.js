const merge = require('lodash.defaultsdeep')
const clone = require('lodash.clonedeep')
const path = require('path')
const fs = require('fs')
const co = require('co')
const EslafPaintCanvas = require('./lib/canvas.js')

const map = (obj, fn) => {
	obj = clone(obj)
	for(let i in obj) obj[i] = fn(obj[i], i)
	return obj	
}

const length = obj => {
	let i = 0
	for(let n in obj) i ++
	return i
}

const drawType = {
	text: (canvasContext, {text, styles}) =>
		canvasContext.drawText(text, styles, {stroke: !!styles.strokeWeight}),

	img: (canvasContext, {styles, raw}) => 
		canvasContext.drawImage(raw, styles)
}

const getTypeof = orig => {
	if (orig.type == 'text') return [drawType.text, orig]
	if (orig.type == 'img') return [drawType.img, orig]
	throw new TypeError(`Unknown paint type ${orig.type}`)
}

function staticPainer ({staticConfig, image, canvas: {width, height}}) {
	const canvas = new EslafPaintCanvas({
		buffer: image, width, height
	})
	staticConfig.map(getTypeof)
	.forEach(
		([paintFunction, data]) => paintFunction(canvas, data)
	)
	return canvas.canvas.toBuffer()
}

module.exports = co.wrap(function* (argv, stepCallback = () => void 0) {
	let [error, {img: image, css: Css, js: Configs}] = require('./lib/solve.file.js')(argv._)
	const Styles = require('./lib/style.js')(Css || 'canvas {}')
	if (error) throw error

	argv.lib = EslafPaintCanvas
	if (Configs instanceof Function) Configs = Configs(argv)
	
	const transformOldTextTypeToNew =
		op =>
			({type: 'text', text: op[0], styles: op[2], use: op[1]})

	const staticConfig = map(yield Configs, config =>
		config.map(op => Array.isArray(op) ? transformOldTextTypeToNew(op) : op)
			.map(op => {
				op.styles = merge(op.styles, Styles('.' + op.use))
				return op
			})
	)
	
	return map(
		map(
			staticConfig, x => ({
				staticConfig: x,
				image, canvas: {
					width: Styles('canvas').width,
					height: Styles('canvas').height
				}}
			)
		), (data, name) => {
			const to = staticPainer(data,  name)
			stepCallback(name, to)
			return to
		})
})
module.exports.lib = EslafPaintCanvas

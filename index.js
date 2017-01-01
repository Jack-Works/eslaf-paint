const merge = require('lodash.defaultsdeep')
const clone = require('lodash.clonedeep')
const fs = require('fs')
const co = require('co')
const Jimp = require('jimp')
const EslafPaintCanvas = require('./lib/canvas.js')
const parseStyles = require('./lib/style.js')

const map = (obj, fn) => {
	obj = clone(obj)
	for (let i in obj) obj[i] = fn(obj[i], i)
	return obj
}

const drawType = {
	text: (canvasContext, {text, styles}) =>
		canvasContext.drawText(text, styles, { stroke: !!styles.strokeWeight }),

	img: (canvasContext, {styles, src}) =>
		canvasContext.drawImage(src, styles)
}

const getTypeof = orig => {
	dt = drawType[orig.type]
	if(dt) return [dt, orig]
	throw new TypeError(`Unknown paint type ${orig.type}`)
}

function staticPainer({staticConfig, image, canvas: {width, height}}) {
	const canvas = new EslafPaintCanvas({
		buffer: image, width, height
	})
	staticConfig.map(getTypeof)
		.forEach(
		([paintFunction, data]) => paintFunction(canvas, data)
		)
	return canvas.canvas.toBuffer()
}

function isString(x) {
	return Object.prototype.toString.call(x) === "[object String]"
}

function getPNGBuffer(img) {
	return new Promise(function (fulfill, reject) {
		img.getBuffer(Jimp.MIME_PNG, (err, buf) => {
			if(err) {
				reject(err)
			} else {
				fulfill(buf)
			}
		})
	})
}

module.exports = co.wrap(function* (argv, stepCallback = () => void 0) {
	let {img: image, css: Css, js: Configs} = yield require('./lib/solve.file.js')(argv)
	const Styles = parseStyles(Css || 'canvas {}')

	argv.lib = EslafPaintCanvas
	if (Configs instanceof Function) Configs = Configs(argv)
	Configs = yield Configs

	for (let key in Configs) {
		let config = Configs[key]
		for (let op of config) {
			op.styles = merge(op.styles, Styles('.' + op.use))

			if (op.type == 'img') {
				let src = op.src
				let img = yield Jimp.read(isString(src) ? src : yield src)
				op.src = yield getPNGBuffer(img)
			}
		}
	}

	let cfg = map(Configs, x => ({
		staticConfig: x,
		image,
		canvas: {
			width: Styles('canvas').width,
			height: Styles('canvas').height
		}
	}))

	return map(cfg, (data, name) => {
		const to = staticPainer(data, name)
		stepCallback(name, to)
		return to
	})
})

module.exports.lib = EslafPaintCanvas

'use strict'
const Canvas = require('canvas')
const Image = Canvas.Image
const unit = parent => raw => {
	let [num, unit] = require('parse-unit')(raw)
	if(unit == '%') num = num / 100 * parent
	if(unit == 'em') num *= 16
	if(num < 0) num += parent
	return num
}
const unitResolver = (widthAttrs, heightAttrs, canvas) =>
	_ => {
		widthAttrs.forEach(attr => _.CSS[attr] = unit(canvas.width)(_.CSS[attr]))
		heightAttrs.forEach(attr => _.CSS[attr] = unit(canvas.height)(_.CSS[attr]))
	}
const PluginInjecterGenerator = function (value, each = () => {}) {
	const exec = (fns = []) => {
		for(let fn of fns) {
			value.canvas = this
			value = fn(value) || value
			if (each(value)) return true
		}
	}
	return (injections, originAction) => {
		if (exec(injections.before)) return true
		if (exec([originAction])) return true
		if (exec(injections.after)) return true
		return false
	}
}
const PluginInjecterExecutor = (PluginInjecter, fns = []) => fns.reduce((stopToRun, [Plugins, origin]) => {
	if (!stopToRun) return PluginInjecter(Plugins, origin)
	return true
}, false)

class EslafPaintCanvas {
	constructor ({buffer, width, height}) {
		if (buffer) {
			const img = EslafPaintCanvas.GetImageFrom(buffer)
			this.canvas = new Canvas(width || img.width, height || img.height)
			this.context = this.canvas.getContext('2d')
			this.context.drawImage(img, 0, 0, img.width, img.height)
		} else {
			this.canvas = new Canvas(width, height)
			this.context = this.canvas.getContext('2d')
		}
		this.context.patternQuality = 'best'
		this.context.lineJoin = 'round'
	}
	_setShadow(x = 0, y = 0, b = 0, ...c) {
		let ctx = this.context
		ctx.shadowColor = c.join(' ')
		ctx.shadowOffsetX = x
		ctx.shadowOffsetY = y
		ctx.shadowBlur = b
	}
	_setFont(style, weight, size, family) {
		let font = `${size}px ${family || 'sans-serif'}`
		if (weight) font = weight + ' ' + font
		if (style) font = style + ' ' + font
		this.context.font = font
	}
	drawText (text, CSS, settings) {
		let ctx = this.context
		CSS = Object.assign({
			textOverflow: 'break-line',
			textShadow: '0px 0px 0px transparent'
		}, CSS)

		const PluginInjecter = PluginInjecterGenerator.bind(this)({CSS, text, settings}, value => {
			if (Array.isArray(value)) {
				value.forEach((v, i) => this.drawText(v.text, v.CSS, v.settings))
				return true
			}
			return false
		})

		const Plugins = EslafPaintCanvas.Plugins.text
		PluginInjecterExecutor(PluginInjecter, [
			[Plugins.calcUnit, unitResolver(
				['x', 'strokeWeight', 'fontSize', 'maxWidth', 'width'],
				['y', 'lineHeight'], this.canvas)],
			[Plugins.set.fontWeight, x => {x.CSS.lineHeight = x.CSS.lineHeight || x.CSS.fontSize + 12}],
			[Plugins.set.alignment, x => {
				this.context.textBaseline = 'top'
				this.context.textAlign = x.CSS.textAlign || 'left'}],
			[Plugins.set.textShadow, x => {this._setShadow(...x.CSS.textShadow.split(' ').map(v => v.endsWith('px') ? parseInt(v) : v))}],
			[Plugins.set.font, x => {
				ctx.lineWidth = x.CSS.fontWeight || 1
				this._setFont(x.CSS.fontStyle, x.CSS.fontWeight, x.CSS.fontSize, x.CSS.fontFamily)}],
			[Plugins.set.textOverflow, x => {
				let CSS = x.CSS
				let settings = x.settings
				let text = x.text
				if(CSS.textOverflow == 'break-line' || CSS.textOverflow == 'clip') {
					let t = text.split('')
					let res = []
					let temp = []

					while (t.length > 0) {
						if (ctx.measureText(temp.join('')).width >= CSS.maxWidth) {
							if (temp.length == 0) temp.push(t.shift()) // prevent a loop
							res.push(temp.join(''))
							temp = []
						} else {
							temp.push(t.shift())
						}
					}
					res.push(temp.join(''))
					if(CSS.textOverflow == 'clip') res = [res[0]]

					return res.map(text => ({text, CSS, settings})).map((x, i) => {
						x.CSS.y = x.CSS.y + i * x.CSS.lineHeight
						x.CSS.textOverflow = 'break-lined'
						return x
					})
				}}],
			[Plugins.set.color, x => {ctx.fillStyle = x.CSS.color}],
			[Plugins.set.strokeColor, x => {ctx.strokeStyle = x.CSS.strokeColor}],
			[Plugins.set.strokeWeight, x => {ctx.lineWidth = x.CSS.strokeWeight || 0}],
			[Plugins.text, x => {ctx.fillText(x.text, x.CSS.x, x.CSS.y)}],
			[Plugins.stroke, x => {if (settings.stroke) ctx.strokeText(x.text, x.CSS.x, x.CSS.y)}]
		])
	}
	drawImage (buffer, CSS) {
		const PluginInjecter = PluginInjecterGenerator.bind(this)({
			CSS, image: buffer
		})
		const Plugins = EslafPaintCanvas.Plugins.image
		PluginInjecterExecutor(PluginInjecter, [
			[Plugins.calcUnit, unitResolver(['x', 'width'], ['y', 'height'], this.canvas)],
			[Plugins.image, _ => {
				this.context.drawImage(
					EslafPaintCanvas.GetImageFrom(_.image),
					_.CSS.x,
					_.CSS.y,
					_.CSS.width || _.image.width,
					_.CSS.height || _.image.height
				)
			}]
		])
	}
}
EslafPaintCanvas.Image = Image
EslafPaintCanvas.Canvas = Canvas
EslafPaintCanvas.loadPlugin = p => p(EslafPaintCanvas.Plugins)
EslafPaintCanvas.GetImageFrom = (buffer, img = new Image) => {
	img.src = buffer
	return img
}
EslafPaintCanvas.Plugins = {
	text: {
		calcUnit: {before: [], after: []},
		set: {
			fontWeight: {before: [], after: []},
			alignment: {before: [], after: []},
			textShadow: {before: [], after: []},
			font: {before: [], after: []},
			textOverflow: {before: [], after: []},
			color: {before: [], after: []},
			strokeColor: {before: [], after: []},
			strokeWeight: {before: [], after: []}
		},
		text: {before: []},
		stroke: {before: []}
	},
	image: {
		calcUnit: {before: [], after: []},
		image: {before: [], after: []}
	},
	helper: {unit}
}

module.exports = EslafPaintCanvas

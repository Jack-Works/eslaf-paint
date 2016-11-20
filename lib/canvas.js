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
	_alignfix (alignment) {
		// map alignment to baseline and text align
		let align = [
			'bottom-right', 'bottom-center', 'bottom-left',
			'middle-right', 'middle-center', 'middle-left',
			'top-right', 'top-center', 'top-left'
		].map(x => x.split('-'))[alignment - 1]

		if (!align) align = alignment.split('-')
		this.context.textBaseline = align[0]
		this.context.textAlign = align[1]
		return align
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
			maxWidth: Infinity,
			textShadow: '0px 0px 0px transparent'
		}, CSS)

		const reduceActions = (injections, origin, noAfterHook = false) => {
			const reducePlugins = (fns = []) => {
				let result = {CSS, text, settings}
				for (let fn of fns) {
					result.canvas = this
					result = fn(result) || result
					if (Array.isArray(result)) {
						result.forEach((v, i) => this.drawText(v.text, v.CSS, v.settings))
						return true
					} else if (result !== undefined) {
						CSS = result.CSS
						text = result.text
						settings = result.settings
					}
				}
				return false
			}
			if (reducePlugins(injections.before)) return true
			if (reducePlugins([origin])) return true
			if (reducePlugins(injections.after)) return true
			return false
		}

		const Plugins = EslafPaintCanvas.Plugins.text
		;[
			[Plugins.calcUnit, x => {
				;['x', 'strokeWeight', 'fontSize', 'maxWidth', 'width', 'minFontSize'].forEach(attr => x.CSS[attr] = unit(this.canvas.width)(x.CSS[attr]))
				;['y', 'lineHeight'].forEach(attr => x.CSS[attr] = unit(this.canvas.height)(x.CSS[attr]))}],
			[Plugins.set.fontWeight, x => {x.CSS.lineHeight = x.CSS.lineHeight || x.CSS.fontSize + 12}],
			[Plugins.set.alignment, x => {this._alignfix(x.CSS.align || 3, x.CSS.x, x.CSS.y)}],
			[Plugins.set.textShadow, x => {this._setShadow(...x.CSS.textShadow.split(' ').map(v => v.endsWith('px') ? parseInt(v) : v))}],
			[Plugins.set.font, x => {
				ctx.lineWidth = x.CSS.fontWeight || 1
				this._setFont(x.CSS.fontStyle, x.CSS.fontWeight, x.CSS.fontSize, x.CSS.fontFamily)
			}],
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
				}
			}],
			[Plugins.set.color, x => {ctx.fillStyle = x.CSS.color}],
			[Plugins.set.strokeColor, x => {ctx.strokeStyle = x.CSS.strokeColor}],
			[Plugins.text, x => {ctx.fillText(x.text, x.CSS.x, x.CSS.y)}],
			[Plugins.stroke, x => {if (settings.stroke) ctx.strokeText(x.text, x.CSS.x, x.CSS.y)}]
		].reduce((restarted, [Plugins, origin]) => {
			if (!restarted) return reduceActions(Plugins, origin)
			return true
		}, false)
	}
	drawImage (buffer, {x, y, width, height}) {
		const img = EslafPaintCanvas.GetImageFrom(buffer)
		;[x, y, width, height] = [x, y, width, height].map(x => parseInt(x))
		if (x < 0) x = this.canvas.width + x
		if (y < 0) y = this.canvas.height + y
		this.context.drawImage(img, x, y, width || img.width, height || img.height)
	}
}
EslafPaintCanvas.Image = Image
EslafPaintCanvas.Canvas = Canvas
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
			strokeColor: {before: [], after: []}
		},
		text: {before: []},
		stroke: {before: []}
	}
}

module.exports = EslafPaintCanvas
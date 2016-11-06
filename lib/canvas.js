'use strict'
const Canvas = require('canvas')
const Image = Canvas.Image

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
	_setShadow(x, y, b, ...c) {
		let ctx = this.context
		ctx.shadowColor = c.join(' ')
		ctx.shadowOffsetX = x
		ctx.shadowOffsetY = y
		ctx.shadowBlur = b
	}
	drawText (text, {
		textOverflow = 'break-line',
		minFontSize = 0,
		maxWidth = Infinity,
		x, y,
		align,
		fontSize,
		fontFamily,
		color,
		fontWeight,
		strokeColor,
		strokeWeight,
		lineHeight,
		textShadow = '0px 0px 0px transparent',
	}, {stroke}) {
		let ctx = this.context
		let orig = ctx.lineWidth
		
		;[x, y, strokeWeight, fontSize, lineHeight, maxWidth, minFontSize] = 
		[x, y, strokeWeight, fontSize, lineHeight, maxWidth, minFontSize].map(x => parseInt(x)) 		
		
		lineHeight = lineHeight || fontSize + 12

		if (x < 0) x = this.canvas.width + x
		if (y < 0) y = this.canvas.height + y

		if(textOverflow == 'break-line' || textOverflow == 'clip') {
			let t = text.split('')
			let res = []
			let temp = []

			while (t.length > 0) {
				if (ctx.measureText(temp.join('')).width >= maxWidth) {
					if (temp.length == 0) temp.push(t.shift()) // prevent a loop
					res.push(temp.join(''))
					temp = []
				} else {
					temp.push(t.shift())
				}
			}
			res.push(temp.join(''))

			if(textOverflow == 'clip') res = [res[0]]

			res.forEach((v, i) => this.drawText(v, {
				textOverflow: 'break-lined',
				minFontSize: fontSize,
				maxWidth,
				x, y: y + i * lineHeight,
				align,
				fontSize,
				fontFamily,
				color,
				fontWeight,
				strokeColor,
				strokeWeight,
				textShadow
			}, {stroke}))
			return
		}
		
		this._alignfix(align || 3, x, y)
		this._setShadow(...textShadow.split(' ').map(v => v.endsWith('px') ? parseInt(v) : v))

		ctx.lineWidth = fontWeight || 1
		ctx.font = fontSize + 'px ' + fontFamily
		let origSize = fontSize

		while(ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
			fontSize -= 1
			ctx.font = fontSize + 'px ' + fontFamily
		}
		const scale = x => x * fontSize / origSize
		ctx.lineWidth = scale(ctx.lineWidth)

		ctx.fillStyle = color
		ctx.fillText(text, x, y)
		if(stroke) {
			ctx.strokeStyle = strokeColor
			ctx.lineWidth = scale(strokeWeight)
			ctx.strokeText(text, x, y)
		}

		ctx.lineWidth = orig

		this._setShadow('', 0, 0, 0)
	}
	drawImage (buffer, {x, y, width, height}) {
		const img = EslafPaintCanvas.GetImageFrom(buffer)
		// the lost of ; spend me 3.5 hours to debug
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

module.exports = EslafPaintCanvas
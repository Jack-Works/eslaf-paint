'use strict'
// Read Picture
const fs = require('fs')
const Canvas = require('canvas')
const Image = Canvas.Image

const srcToBuffer = fs.readFileSync
const bufferToImage = (buffer) => {
	const img = new Image()
	img.src = buffer
	return img
}
const imageToCanvas = (img) => {
	const canvas = new Canvas(img.width, img.height)
	const ctx = canvas.getContext('2d')
	ctx.drawImage(img, 0, 0, img.width, img.height)
	return {canvas, context: ctx}
}

module.exports = class _ {
	constructor (src) {
		const obj = imageToCanvas(bufferToImage(srcToBuffer(src)))
		this.context = obj.context
		this.canvas = obj.canvas
		this.context.patternQuality = 'best'
		this.context.lineJoin = 'round'
	}
	toFile (src) {fs.writeFileSync(src, this.canvas.toBuffer())}
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
		
		x = parseInt(x)
		y = parseInt(y)
		
		fontSize = parseInt(fontSize)
		lineHeight = parseInt(lineHeight) || fontSize + 12
		maxWidth = parseInt(maxWidth)
		minFontSize = parseInt(minFontSize)

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
	drawImage (src, {x, y}) {
		let ctx = this.context
		let img = bufferToImage(srcToBuffer(src))
		
		x = parseInt(x)
		y = parseInt(y)
		if (x < 0) x = this.canvas.width + x
		if (y < 0) y = this.canvas.height + y
		
		ctx.drawImage(img, x, y, img.width, img.height)
	}
}
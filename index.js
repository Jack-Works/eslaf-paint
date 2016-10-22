module.exports = (...files) => {
	'use strict'
	const merge = require('lodash.defaultsdeep')
	const path = require('path')
	const fs = require('fs')

	const Canvas = require('./lib/canvas.js')
	const {checkFile, checkSrcType} = require('./lib/check.js')

	const Styles = require('./lib/style.js')((
		(css, _) => 
			checkFile('No CSS file found')(css, _) ||
			fs.readFileSync(css, 'utf-8'))
		(...files.filter(checkSrcType('css'))))

	const config =
		((c, _) =>
			checkFile('No config file found')(c, _) ||
			require(path.resolve(process.cwd(), c))
		)
		(...files.filter(checkSrcType('requirable')))

	const drawType = {
		text: (canvasContext, {text, styles}) =>
			canvasContext.drawText(text, styles, {stroke: !!styles.strokeWeight}),

		img: (canvasContext, {src, styles}) =>
			canvasContext.drawImage(src, styles)
	}
	const getTypeof = orig => {
		if (orig.type == 'text') return drawType.text
		if (orig.type == 'img') return drawType.img
		throw new TypeError(`Unknown paint type ${orig.type}`)
	}
	const oldTextTypeToNew = op => ({type: 'text', text: op[0], styles: op[2], use: op[1]})
	// for each img
	files.filter(v => !(checkSrcType('css')(v) || checkSrcType('requirable')(v))).forEach(image => {
		const src = path.normalize('./' + image)
		const ext = path.extname(src)
		const base = path.basename(src, ext)
		// each text profile
		for(let profile in config) {
			let canvas = new Canvas(src)
			const task = config[profile]
			// each operation
			task
			.map(op => Array.isArray(op) ? oldTextTypeToNew(op) : op)
			.map(op => {
				op.styles = merge(op.styles, Styles('.' + op.use))
				return op
			})
			.map(op => [getTypeof(op), op])
			.forEach(([f, op]) => f(canvas, op))

			const outputPattern = profile.replace(/\$/g, base)
			const base_out = path.basename(outputPattern)
			const outputDir = path.dirname(outputPattern)
			const final = path.join(outputDir, base_out + ext)
			if (!fs.existsSync(outputDir)){
				console.log('Creating "' + outputDir + '" ...')
				fs.mkdirSync(outputDir)
			}
			console.log('Output: ' + final)
			canvas.toFile(final)
		}
	})
}
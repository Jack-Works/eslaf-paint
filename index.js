#!/usr/bin/env node
'use strict'
const merge = require('lodash.defaultsdeep')
const path = require('path')
const fs = require('fs')

const Canvas = require('./lib/canvas.js')

const argv = require('minimist')(process.argv.slice(2))
console.log(process.argv)
const Styles = require('./lib/style.js')(((css, _) => {
	if (!css) throw new Error('No CSS File provided')
	if (_) console.warn(`Only ${css} will be used to draw the image`)
	return fs.readFileSync(css, 'utf-8')
})(...argv._.filter(v => path.extname(v) == '.css')))

const text = require('./' + argv.text)

// for each img
argv._.filter(v => path.extname(v) != '.css').forEach(image => {
	const src = path.normalize('./' + image)
	const ext = path.extname(src)
	const base = path.basename(src, ext)
	// each text profile
	for(let profile in text) {
		let canvas = new Canvas(src)
		const task = text[profile]
		// each operation
		task.forEach(op => 
			function (canvasContext, text, styles) {
				canvasContext.drawText(text, styles, {stroke: !!styles.strokeWeight})
			}(
				canvas, 
				op[0], 
				merge(op[2], Styles('.' + op[1]))
			)
		)
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

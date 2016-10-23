module.exports = (...files) => {
	const merge = require('lodash.defaultsdeep')
	const path = require('path')
	const fs = require('fs')
	const co = require('co')
	const ProgressBar = require('progress')

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

		img: (canvasContext, {src, styles, raw}) =>
			canvasContext.drawImage(src, raw, styles)
	}
	const getTypeof = orig => {
		const resolvePromise = (dataTypeHandler, ...attrs) => Promise.all(
			attrs
				.map(attr => ({promise: orig[attr] || new Promise(resolve => resolve(orig[attr])), attr: attr}))
				// from {cfpm, attr} to promise(op)
				.map(({attr, promise}) => co(function* (){
					if(promise instanceof Promise) orig[attr] = yield promise
					else orig[attr] = promise
					return [dataTypeHandler, orig]
				}))
		)
		if (orig.type == 'text') return resolvePromise(drawType.text, 'text')
		if (orig.type == 'img') return resolvePromise(drawType.img, 'raw', 'src')
		throw new TypeError(`Unknown paint type ${orig.type}`)
	}
	const oldTextTypeToNew = op => ({type: 'text', text: op[0], styles: op[2], use: op[1]})
	// for each img
	files.filter(v => !(checkSrcType('css')(v) || checkSrcType('requirable')(v))).forEach(image => co(function* () {
		const bar = new ProgressBar(
			`[eslaf-paint]: :current/:total [:bar] ${image} => :output`,
			{total: 0, width: 50, complete: '=', incomplete: ' '})
		const src = path.normalize('./' + image)
		const ext = path.extname(src)
		const base = path.basename(src, ext)
		// each text profile
		let length = 0
		for(let profile in config) length ++
		bar.total = length

		for(let profile in config) {
			let canvas = new Canvas(src)
			const task = config[profile]
			// each operation
			let ops = yield Promise.all(
				task
					.map(op => Array.isArray(op) ? oldTextTypeToNew(op) : op)
					.map(op => {
						op.styles = merge(op.styles, Styles('.' + op.use))
						return op
					})
					.map(getTypeof)
			)

			ops.forEach(
				op => op.forEach(
					([f, op]) => f(canvas, op)
				)
			)

			const outputPattern = profile.replace(/\$/g, base)
			const base_out = path.basename(outputPattern)
			const outputDir = path.dirname(outputPattern)
			const final = path.join(outputDir, base_out + ext)
			if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
			canvas.toFile(final)
			bar.tick({output: final})
		}
	}))
}
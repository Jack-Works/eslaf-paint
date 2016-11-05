// const cluster = require('cluster')
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

/*const clusterPainer = co.wrap(function*  (works, cpus = require('os').cpus().length) {
	function array2obj (o) {
		const result = {}
		o.forEach(x => result[x.name] = x)
		return result
	}
	works = Object.keys(works.staticConfig).map(name => ({
		name, staticConfig: works.staticConfig[name], image: works.image, canvas: works.canvas
	}))
	
	if (works.length == 1 || cpus == 1) return array2obj(works.map(staticPainer))
	else {
		let workers = Array(Math.min(length(works), cpus)).fill(true)
			.map(x => ({worker: cluster.fork(), busy: false}))

		const tasks = {}
		workers.forEach(({worker}) => worker.on('message', ({name, result}) => tasks[name](result)))

		const sendWork = (worker, work, name) => {
			let r_
			let p_ = new Promise(r => r_ = r)
			let p = new Promise(resolve => {
				worker.busy = p_
				tasks[name] = data => {
					worker.busy = false
					r_(resolve(data))
				}
				worker.worker.send({work, name})
			})
			return p_
		}

		return array2obj(yield works.map(co.wrap(function* (data) {
			yield Promise.race(workers.map(x => x.busy))
			const myWorker = workers.filter(x => x.busy == false)[0]
			return yield sendWork(myWorker, data, data.name)
		})))
	}
})*/

/*
if (cluster.isWorker) {
	console.log('Hele')
	process.on('message', ({work, name}) => {
	console.log(`Task ${name} received ${work}`)
	process.send({name, result: staticPainer(work)})})
}
*/

module.exports = co.wrap(function* (argv) {
	let [error, {img: image, css: Css, js: Configs}] = require('./lib/solve.file.js')(argv._)
	const Styles = require('./lib/style.js')(Css)
	if (error) throw error

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
	
	return map((map(staticConfig, x => ({
		staticConfig: x,
		image, canvas: {
			width: Styles('canvas').width,
			height: Styles('canvas').height
		}})
	)), staticPainer)
})
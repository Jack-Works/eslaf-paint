const path = require('path')
const fs = require('fs-promise')
const co = require('co')
// these three Symbol means path, not resolved
const cssPath = 'css_path'
const profPath = 'profile_path'
const imgPath = 'image_path'

function getType(file) {
	if (file.type) return file // {type, data}
	if (typeof file == 'string') {
		const ext = path.extname(file)
		if (ext == '.css') return { type: cssPath, data: file }
		if (ext == '.js' || ext == '.json') return { type: profPath, data: file }
		return { type: imgPath, data: file }
	}
	if (file instanceof Buffer) return { type: 'image', data: file }
	return {}
}

module.exports = co.wrap(function* solveFile(argv) {
	let profile = {}
	argv = argv.map(getType)
	const type = name => argv.filter(f => f.type == name).map(f => f.data)[0]

	const getResSafe = (name, callback) => {
		resData = type(name)
		if(!resData) return null
		return callback(resData)
	}

	profile.css = type('css') || (yield getResSafe(cssPath, p => fs.readFile(p, 'utf8')))
	profile.img = type('image') || (yield getResSafe(imgPath, p => fs.readFile(p)))
	profile.js = type('profile') || getResSafe(profPath, p => global.require(path.resolve(process.cwd(), p)))

	if (!profile.js) throw new Error('No Profile')
	return profile
})
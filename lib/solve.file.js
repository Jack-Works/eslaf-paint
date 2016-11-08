const path = require('path')
const fs = require('fs')
// these three Symbol means path, not resolved
const cssPath = 'css_path'
const profPath = 'profile_path'
const imgPath = 'image_path'

function getType (file) {
	if (file.type) return file // {type, data}
	if (typeof file == 'string') {
		const ext = path.extname(file)
		if (ext == '.css') return {type: cssPath, data: file}
		if (ext == '.js' || ext == '.json') return {type: profPath, data: file}
		return {type: imgPath, data: file}
	}
	if (file instanceof Buffer) return {type: 'image', data: file}
	return {type: undefined}
}

module.exports = f => {
	const Profiles = {}
	f = f.map(getType)
	const type = (x, _) => f.filter(f => f.type == x).forEach(x => _(x.data))

	type('css', x => Profiles.css = x)
	type('image', x => Profiles.img = x)
	type('profile', x => Profiles.js = x)

	try {
		type(cssPath, x => Profiles.css = fs.readFileSync(x, 'utf8'))
		type(profPath, x => Profiles.js = require(path.resolve(process.cwd(), x)))
		type(imgPath, x => Profiles.img = fs.readFileSync(x))
	} catch (e) {
		return [e, {}]
	}

	if (!Profiles.js) return [new Error('No Profile'), {}]
	return [null, Profiles]
}
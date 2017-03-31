import { extname, resolve } from 'path'
import { readFile } from 'fs-promise'

// these three Symbol means path, not resolved
const Path = {
	css: 'css_path',
	profile: 'profile_path',
	img: 'image_path'
}
const Data = {
	img: 'image',
	css: 'css',
	profile: 'profile'
}

export interface ISolvedFileType {
	type: string,
	data: string | Buffer
}
function getType(file: string | ISolvedFileType | Buffer): ISolvedFileType {
	const SolvedFile: ISolvedFileType = {type: null, data: null}

	if (typeof file == 'string') {
		const ext = extname(file)
		SolvedFile.data = file
		if (ext == '.css') SolvedFile.type = Path.css
		else if (ext == '.js' || ext == '.json') SolvedFile.type = Path.profile
		else SolvedFile.type = Path.img
	}
	else if (file instanceof Buffer) return {type: Data.img, data: file}
	else if (file.type) return file

	if(SolvedFile.data) return SolvedFile
	else return null
}

export interface ISolvedFiles {
	css: string,
	img: Buffer,
	js: any
}
export default async function solveFile(argv: Array<string | Buffer | ISolvedFileType>): Promise<ISolvedFiles> {
	let profile: ISolvedFiles = {css: undefined, img: undefined, js: undefined}

	const SolvedFiles = argv.map(getType)
	
	const getFirstFileOf = (name: string) => SolvedFiles.filter(f => f.type == name).map(f => f.data)[0]
	const getFrom = <T>(name: string, resourceGetter: (src: string) => T) => {
		const src = getFirstFileOf(name)
		if(!src || !(typeof src == 'string')) return null
		return resourceGetter(src)
	}

	{
		let css = getFirstFileOf(Data.css)
		profile.css = typeof css == 'string' ? css : (await getFrom<Promise<string>>(Path.css, p => readFile(p, 'utf8')))
	}{
		let img = getFirstFileOf(Data.img)
		profile.img = img instanceof Buffer ? img : (await getFrom<Promise<Buffer>>(Path.img, p => readFile(p)))	
	}
	profile.js = getFirstFileOf(Data.profile) || getFrom(Path.profile, p => require(resolve(process.cwd(), p)))

	if (!profile.js) throw new ReferenceError('No Profile found')
	return profile
}
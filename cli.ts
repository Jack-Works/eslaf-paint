#!/usr/bin/env node
'use strict'

import * as path from 'path'
import * as fs from 'fs'
import * as eslaf from './index'
const argv = require('minimist')(process.argv.slice(2))

const t = (v: string) =>
	v.endsWith('.json') === false &&
	v.endsWith('.css') === false &&
	v.endsWith('.js') === false

if (!argv.help && !argv.h)
argv._.filter(t).forEach((img: string) => {
	let _argv = argv
	_argv._ = _argv._.filter((x: string) => !t(x))
	_argv._.push(img)
	eslaf.default(_argv, (name: string, data: Buffer) => {
		const output = name.replace(/\$/g, path.basename(img))
		const outputDir = path.dirname(output)
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
		fs.writeFileSync(output, data)
		console.log(`eslaf-paint: Generated ${output}`)
	}).catch(err => {
		console.error(err)
	})
})

else console.log(`
Eslaf-paint ${require('../package.json').version} Usage:
eslaf-paint profile(.js|.json) cssfile(.css) picture1 (picture2...)
The order of the parameter doesn't matter
`)
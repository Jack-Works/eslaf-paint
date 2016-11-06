#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))

const t = v =>
	v.endsWith('.json') === false &&
	v.endsWith('.css') === false &&
	v.endsWith('.js') === false

if (!argv.help && !argv.h)
argv._.filter(t).forEach(img => {
	let _argv = argv
	_argv._ = _argv._.filter(x => !t(x))
	_argv._.push(img)
	require('./index.js')(_argv).then(data => {
		for(var name in data) {
			const b = data[name]
			const output = name.replace(/\$/g, path.basename(img))
			const outputDir = path.dirname(output)
			if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
			fs.writeFileSync(output, b)
		}
	})
})

else console.log(`
Usage:
eslaf-paint profile(.js|.json) cssfile(.css) picture1 (picture2...)
The order of the parameter doesn't matter
`)
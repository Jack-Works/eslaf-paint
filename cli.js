#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))

const t = v =>
	v.endsWith('.json') === false &&
	v.endsWith('.css') === false &&
	v.endsWith('.js') === false

argv._.filter(t).map(img => {
	argv._.map(v => {
		if(!t(v)) img
		else v
	})
	require('./index.js')(argv).then(data => {
		for(var name in data) {
			const b = data[name]
			const output = name.replace(/$/g, path.basename(img))
			const outputDir = path.dirname(output)
			if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
			fs.writeFileSync(output, b)
		}
	})
})
argv._.filter(t).length == 0 && require('./index.js')(argv).then(data => {
		for(var name in data) {
			const b = data[name]
			const output = name.replace(/$/g, path.basename(img))
			const outputDir = path.dirname(output)
			if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)
			fs.writeFileSync(output, b)
		}
	})
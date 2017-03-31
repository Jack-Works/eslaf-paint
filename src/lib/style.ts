import css = require('css')
import * as ast from './ast'
import merge = require('lodash.defaultsdeep')
import reduceRight = require('lodash.reduceright')
import camelize = require('camelize')

// const checkMedia = (cond, actual) => true
const checkRule = (cond: string[], actual: string) => cond.some(v => v == actual || v == '*')

const search = function (CSSSelector: string) {
	return camelize(reduceRight(this, (prev, curr) => {
		if (curr instanceof ast.Rule)
			checkRule(curr.selector, CSSSelector) && merge(prev, curr.rules)
		return prev
	}, {}))
}

export default (code: string) => search.bind(ast.parse(css.parse(code)))
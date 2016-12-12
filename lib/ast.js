class Media {constructor (media, rules) {Object.assign(this, {media, rules})}}
class Rule {constructor (selector, rules) {Object.assign(this, {selector, rules})}}

const parse = ast => (({
	stylesheet: () => ast.stylesheet.rules.map(parse),
	rule: () => new Rule(ast.selectors, Object.assign({}, ...ast.declarations.map(parse))),
	declaration: () => ({[ast.property]: ast.value}),
	comment: () => undefined,
	media: () => new Media(ast.media, ast.rules.map(parse))
}[ast.type]) || (() => undefined))()

module.exports = {
	Media, Rule,
	parse
}

import css = require('css')

export class Rule {
	constructor (public selector: string[], public rules: css.Declaration[]) {}
}

const actions: ({[name: string]: Function}) = {
	stylesheet: ({stylesheet}: css.Stylesheet) => stylesheet.rules.map(parse),
	rule: ({selectors, declarations}: css.Rule) => new Rule(selectors, Object.assign({}, ...declarations.map(parse))
	),
	declaration: (ast: css.Declaration) => ({[ast.property]: ast.value}),
	comment: (ast: any): undefined => undefined,
	// media: () => new Media(ast.media, ast.rules.map(parse))
}
export const parse = (ast: css.Stylesheet | css.Rule | css.Declaration | css.Comment) => {
	let react = actions[ast.type]
	if(react) return react(ast)
	else return undefined
}
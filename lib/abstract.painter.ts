import unitParse = require('parse-unit')
import * as CSS from '../types/css'
import * as Plugin from '../types/plugin'

export const unit = (parent: number) => (raw: string) => {
	let [num, unit] = unitParse(raw)
	if (unit == '%') num = num / 100 * parent
	if (unit == 'em') num *= 16
	if (num < 0) num += parent
	return num
}

export const unitResolver = (widthAttrs: string[], heightAttrs: string[], canvas: ICanvas) =>
	(_: Plugin.Args<CSS.Object>) => {
		widthAttrs.forEach(attr => _.CSS[attr] = unit(canvas.width)(_.CSS[attr]))
		heightAttrs.forEach(attr => _.CSS[attr] = unit(canvas.height)(_.CSS[attr]))
	}

export type Injector<T extends Plugin.Args<CSS.Object>> = (injections: Plugin.PluginsSet<T>, originAction: Plugin.Plugin<T>) => boolean
export function PluginInjectorGenerator<ArgType extends Plugin.Args<CSS.Object>>
	(canvas: AbstractEslafPaintCanvas,
	value: ArgType,
	iterator: (data: ArgType | ArgType[]) => boolean = () => false
	): Injector<ArgType> {
	const exec = (fns: Plugin.Plugin<ArgType>[] = []) => {
		let changedValue: ArgType | ArgType[]
		for (let fn of fns) {
			value.canvas = canvas
			changedValue = fn(value) || value
			if (iterator(changedValue)) return true
		}
	}
	return (injections, originAction) => {
		if (exec(injections.before)) return true
		if (exec([originAction])) return true
		if (exec(injections.after)) return true
		return false
	}
}
export function PluginInjectorExecutor<ArgType extends Plugin.Args<CSS.Object>>(Injector: Injector<ArgType>, fns: [Plugin.PluginsSet<ArgType>, Plugin.Plugin<ArgType>][]): boolean {
	return fns.reduce((stopToRun, [Plugins, origin]) => {
		if (!stopToRun) return Injector(Plugins, origin)
		return true
	}, false)
}

export interface ICanvas {
	getContext(contextId: "2d", contextAttributes?: Canvas2DContextAttributes): CanvasRenderingContext2D,
	height: number,
	width: number
}
export abstract class AbstractEslafPaintCanvas {
	canvas: ICanvas
	context: CanvasRenderingContext2D

	constructor({ width, height }: { picture?: string, width?: number, height?: number }) { }
	_setShadow(x = 0, y = 0, blur = 0, color: string) {
		let ctx = this.context
		ctx.shadowColor = color
		ctx.shadowOffsetX = x
		ctx.shadowOffsetY = y
		ctx.shadowBlur = blur
	}
	_setFont(size: number = 12, family: string = 'sans-serif', style?: 'italic' | string, weight?: number, ) {
		let font = `${size}px ${family}`
		if (weight) font = weight + ' ' + font
		if (style) font = style + ' ' + font
		this.context.font = font
	}
	drawText(text: string | number, CSS: CSS.Text, settings: any) {
		if (typeof text == 'number') text = text.toString()
		let ctx = this.context
		CSS = Object.assign({
			textOverflow: 'break-line',
			textShadow: '0px 0px 0px transparent'
		}, CSS)

		const PluginInjector = PluginInjectorGenerator<Plugin.Text>(this, { CSS, text, settings, canvas: this }, value => {
			if (Array.isArray(value)) {
				value.forEach((v, i) => this.drawText(v.text, v.CSS, v.settings))
				return true
			}
			return false
		})

		const Plugins = AbstractEslafPaintCanvas.Plugins.text
		PluginInjectorExecutor<Plugin.Text>(PluginInjector, [
			[Plugins.calcUnit, unitResolver(
				['x', 'strokeWeight', 'fontSize', 'width'],
				['y', 'lineHeight'], this.canvas)],
			[Plugins.set['fontWeight'], x => {
				if (typeof x.CSS.fontSize == 'number')
					x.CSS.lineHeight = x.CSS.lineHeight || x.CSS.fontSize + 12
			}],
			[Plugins.set['alignment'], x => {
				this.context.textBaseline = 'top'
				this.context.textAlign = x.CSS.textAlign || 'left'
			}],
			[Plugins.set['textShadow'], _ => {
				let [x, y, b, c] = ((_.CSS.textShadow).split(' ').map((v: string) => v.endsWith('px') ? parseInt(v) : v) as [number, number, number, string])
				this._setShadow(x, y, b, c)
			}],
			[Plugins.set['font'], x => {
				ctx.lineWidth = x.CSS.fontWeight || 1
				this._setFont(x.CSS.fontSize, x.CSS.fontFamily, x.CSS.fontStyle, x.CSS.fontWeight, )
			}],
			[Plugins.set['textOverflow'], x => {
				let CSS = x.CSS
				let settings = x.settings
				let text = x.text
				if (CSS.textOverflow == 'break-line' || CSS.textOverflow == 'clip') {
					let t = text.split('')
					let res: string[] = []
					let temp: string[] = []

					while (t.length > 0) {
						if (CSS.width && ctx.measureText(temp.join('')).width >= CSS.width) {
							if (ctx.measureText(temp[0]).width < CSS.width) t.unshift(temp.pop())
							// undo last char to prevent overflow

							if (temp.length == 0) temp.push(t.shift())
							// prevent a loop

							res.push(temp.join(''))
							temp = []
						} else {
							temp.push(t.shift())
						}
					}
					res.push(temp.join(''))
					if (CSS.textOverflow == 'clip') res = [res[0]]

					return res.map(text => ({ text, CSS, settings })).map((x, i) => {
						x.CSS = Object.assign({}, x.CSS)
						x.CSS.y = x.CSS.y + i * (x.CSS.lineHeight || 1)
						x.CSS.textOverflow = 'break-lined'
						return x
					})
				}
			}],
			[Plugins.set['color'], x => { ctx.fillStyle = x.CSS.color }],
			[Plugins.set['strokeColor'], x => { ctx.strokeStyle = x.CSS.strokeColor }],
			[Plugins.set['strokeWeight'], x => { ctx.lineWidth = x.CSS.strokeWeight || 0 }],
			[Plugins.text, x => { ctx.fillText(x.text, x.CSS.x, x.CSS.y) }],
			[Plugins.stroke, x => { if (settings.stroke) ctx.strokeText(x.text, x.CSS.x, x.CSS.y) }]
		])
	}
	drawImage(image: string | Buffer, CSS: CSS.Image) {
		const PluginInjecter = PluginInjectorGenerator<Plugin.Image>(this, {
			CSS, image: this.GetImageFrom(image), settings: {}, canvas: this
		})
		const Plugins = AbstractEslafPaintCanvas.Plugins.image
		PluginInjectorExecutor<Plugin.Image>(PluginInjecter, [
			[Plugins['calcUnit'], unitResolver(['x', 'width'], ['y', 'height'], this.canvas)],
			[Plugins['image'], _ => {
				this.context.drawImage(
					_.image,
					_.CSS.x,
					_.CSS.y,
					_.CSS.width || _.image.width,
					_.CSS.height || _.image.height
				)
			}]
		])
	}
	abstract GetImageFrom(picture: string | Buffer, img?: HTMLImageElement): HTMLImageElement
	static loadPlugin(p: Function) { p(AbstractEslafPaintCanvas.Plugins) }
	static Plugins: {
		text: {
			calcUnit: Plugin.PluginsSet<Plugin.Text>,
			set: { [key: string]: Plugin.PluginsSet<Plugin.Text> },
			text: Plugin.PluginsSet<Plugin.Text>,
			stroke: Plugin.PluginsSet<Plugin.Text>
		},
		image: { [key: string]: Plugin.PluginsSet<Plugin.Image> },
		helper: { [key: string]: Function }
	} = {
		text: {
			calcUnit: { before: [], after: [] },
			set: {
				fontWeight: { before: [], after: [] },
				alignment: { before: [], after: [] },
				textShadow: { before: [], after: [] },
				font: { before: [], after: [] },
				textOverflow: { before: [], after: [] },
				color: { before: [], after: [] },
				strokeColor: { before: [], after: [] },
				strokeWeight: { before: [], after: [] }
			},
			text: { before: [], after: [] },
			stroke: { before: [], after: [] }
		},
		image: {
			calcUnit: { before: [], after: [] },
			image: { before: [], after: [] }
		},
		helper: { unit }
	}
}

import * as CSS from './css'
import { EslafPaintCanvas } from '../lib/canvas'
import canvas = require('canvas')

export interface Args<CSSObject extends CSS.Attrs> {
	CSS: CSSObject
	settings: any
	canvas: EslafPaintCanvas
}
export interface Text extends Args<CSS.Text> {
	text: string
}
export interface Image extends Args<CSS.Image> {
	image: canvas.Image
}
export interface UntypedArgs extends Args<CSS.Attrs> {}

export type Plugin<T extends Args<CSS.Attrs>> = ((data: T) => void | T[])
export type UntypedPlugin = Plugin<UntypedArgs>
export type TextPlugin = Plugin<Text>
export type ImagePlugin = Plugin<Image>

export interface PluginsSet<T extends Args<CSS.Attrs>> {
	before: Plugin<T>[],
	after: Plugin<T>[]
}
export interface UntypedPluginsSet extends PluginsSet<UntypedArgs> {}
export interface TextPluginsSet extends PluginsSet<Text> {}
export interface ImagePluginsSet extends PluginsSet<Image> {}

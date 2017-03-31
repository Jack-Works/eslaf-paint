import { Object, Image, Text } from './css'

export interface Task {
	type: string
	use?: string | Promise<string>
	styles?: Object | Promise<Object>
}

export interface Text extends Task {
	type: 'text'
	text: string | Promise<string>
	styles?: Text | Promise<Text>
}

export interface Image extends Task {
	type: 'img'
	src: string | Buffer | Promise<string | Buffer>
	styles?: Image | Promise<Image>
}
export interface Profile {
	[name: string]: Task[] | Promise<Task[]>
}
export type Arg =
	// path to profile
	string | 
	{type: 'profile', data: Profile} |
	{type: 'profile', data: Promise<Profile>} |
	{type: 'profile', data: (args?: any) => Profile} |
	{type: 'profile', data: (args?: any) => Promise<Profile>}
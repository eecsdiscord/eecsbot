import { Command } from '@sapphire/framework'
import type { Message } from 'discord.js'

export class FooCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'foo' })
	}

	async messageRun(message: Message) {
		await message.reply('bar')
	}
}

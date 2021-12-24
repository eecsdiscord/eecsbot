import { Command, Listener } from '@sapphire/framework'
import type { Message } from 'discord.js'

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Listener.Options) {
		super(context, { ...options, name: 'foo' })
	}

	async messageRun(message: Message) {
		return message.reply('bar')
	}
}

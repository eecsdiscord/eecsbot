import { Command } from '@sapphire/framework'
import type { Message } from 'discord.js'

export class UserCommand extends Command {
	constructor(context: Command.Context) {
		super(context, { name: 'foo' })
	}

	async messageRun(message: Message) {
		return message.reply('bar')
	}
}

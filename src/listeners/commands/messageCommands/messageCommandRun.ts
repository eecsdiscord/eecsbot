import { Command, Events, Listener, MessageCommandRunPayload } from '@sapphire/framework'
import { cyan } from 'colorette'
import type { Message } from 'discord.js'

export class UserEvent extends Listener<typeof Events.MessageCommandRun> {
	async run(message: Message, command: Command, _: MessageCommandRunPayload) {
		this.container.logger.debug(`[${command.constructor.name}] - (${cyan(command.name)}) ${message.author.tag} [${cyan(message.author.id)}]`)
	}
}

import { Command, CommandRunPayload, Events, Listener } from '@sapphire/framework'
import { cyan } from 'colorette'
import type { Message } from 'discord.js'

export class UserEvent extends Listener<typeof Events.CommandRun> {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, { ...options, event: Events.CommandRun })
	}

	async run(message: Message, command: Command, _: CommandRunPayload) {
		this.container.logger.debug(`[${command.constructor.name}] - (${cyan(command.name)}): ${message.author.tag} [${cyan(message.author.id)}]`)
	}
}

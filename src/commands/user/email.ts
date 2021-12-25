import { Args, Command, UserError } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { extractbMailUsername, sendLoadingMessage } from '../../lib/utils'
import { emailCode } from '../../lib/verification'

const HELP_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: '> Please enter a valid Berkeley email! Example: `$email foo@berkeley.edu`' }
})

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'email', cooldownDelay: 15_000, preconditions: ['DMOnly'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const email = await args.pick('string').catch(() => {
			throw HELP_ERROR
		})
		const bMailUsername = extractbMailUsername(email)
		if (bMailUsername === '' || !args.finished) throw HELP_ERROR

		const loadingMessage = await sendLoadingMessage(message)
		const resultMessage = await emailCode(message, bMailUsername)
		return await loadingMessage.edit({ embeds: [resultMessage] })
	}
}

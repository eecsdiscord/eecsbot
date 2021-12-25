import { Args, Command } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { extractbMailUsername, sendLoadingMessage } from '../../lib/utils'
import { emailCode } from '../../lib/verification'

const HELP_MESSAGE = '> Please enter a valid Berkeley email! Example: `$email foo@berkeley.edu`'

export class UserCommand extends Command {
	constructor(context: Command.Context) {
		super(context, { name: 'email', cooldownDelay: 10_000, preconditions: ['DMOnly'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const emailResult = await args.pickResult('string')
		if (!emailResult.success || !args.finished) return message.channel.send(HELP_MESSAGE)
		const bMailUsername = extractbMailUsername(emailResult.value)
		if (bMailUsername === '') return message.channel.send(HELP_MESSAGE)

		const loadingMessage = await sendLoadingMessage(message)
		const resultMessage = await emailCode(message, bMailUsername)
		return loadingMessage.edit({ embeds: [resultMessage] })
	}
}

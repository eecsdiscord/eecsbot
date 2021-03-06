import { Args, Command } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'

import { ERROR_RED, SUCCESS_GREEN } from '../../lib/constants'
import { sendLoadingMessage } from '../../lib/utils'
import { emailCode, extractbMailUsername, HELP_ERROR } from '../../lib/verification'

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'email', cooldownDelay: 15_000, preconditions: ['DMOnly', 'isNotVerified'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const email = await args.pick('string').catch(() => {
			throw HELP_ERROR
		})
		const bMailUsername = extractbMailUsername(email)
		if (bMailUsername === '' || !args.finished) throw HELP_ERROR

		const loadingMessage = await sendLoadingMessage(message)
		const result = await emailCode(message.author, bMailUsername)

		return await loadingMessage.edit({
			embeds: [
				result
					? new MessageEmbed({
							title: 'Email sent!',
							description:
								`Verification code successfully sent for \`${message.author.tag}\`\n\n` +
								'Once you receive your temporary verification code, please verify using\n' +
								`\`$code ******\``,
							color: SUCCESS_GREEN
					  })
					: new MessageEmbed({ title: 'Error sending email!', color: ERROR_RED })
			]
		})
	}
}

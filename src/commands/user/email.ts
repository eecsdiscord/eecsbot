import { Args, Command } from '@sapphire/framework'
import { EmbedBuilder, Message } from 'discord.js'

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
					? new EmbedBuilder({
							title: 'Email sent!',
							description:
								`Verification code successfully sent for \`${message.author.tag}\`\n` +
								'\n' +
								'Once you receive your temporary verification code, please verify using\n' +
								`\`$code ******\`\n` +
								'\n' +
								'Not receiving your email? Dots __**do**__ matter for school Gmail addresses:\n' +
								'https://support.google.com/mail/answer/7436150\n' +
								'There are other reasons as well, message a mod if you are having trouble!',
							color: SUCCESS_GREEN
					  })
					: new EmbedBuilder({ title: 'Error sending email!', color: ERROR_RED })
			]
		})
	}
}

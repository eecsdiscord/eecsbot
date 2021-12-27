import { Args, Command, UserError } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'

import { BMAIL_DOMAIN, ERROR_RED, SUCCESS_GREEN } from '../../lib/constants'
import { sendLoadingMessage } from '../../lib/utils'
import { emailCode } from '../../lib/verification'

const HELP_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Please enter a valid Berkeley email! Example: `$email foo@berkeley.edu`' }
})

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'email', cooldownDelay: 15_000, preconditions: ['DMOnly', 'isNotVerified'] })
	}

	/**
	 * Extracts the bMail username from an email. Removes periods, ignores + extensions, and lowercases
	 * @param email Email string
	 * @returns bMail username
	 */
	extractbMailUsername(email: string): string {
		const splitted = email.split('@')
		if (splitted.length !== 2) return ''
		const [username, domain] = splitted
		if (domain !== BMAIL_DOMAIN) return ''

		return username.replaceAll('.', '').split('+')[0].toLowerCase()
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const email = await args.pick('string').catch(() => {
			throw HELP_ERROR
		})
		const bMailUsername = this.extractbMailUsername(email)
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

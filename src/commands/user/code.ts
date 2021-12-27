import { Args, Command, UserError } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'

import { ERROR_RED, SUCCESS_GREEN } from '../../lib/constants'
import { VERIFIED_ROLE_ID } from '../../lib/discordConfig'
import { getGuild, sendLoadingMessage } from '../../lib/utils'
import { verifyCode } from '../../lib/verification'

const HELP_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Please enter a valid code! Example: `$code ******`' }
})

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'code', cooldownDelay: 15_000, preconditions: ['DMOnly', 'isNotVerified'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const code = await args.pick('integer').catch(() => {
			throw HELP_ERROR
		})
		if (!args.finished) throw HELP_ERROR

		const loadingMessage = await sendLoadingMessage(message)
		const result = verifyCode(message.author, code)

		if (result) await getGuild().members.resolve(message.author.id)?.roles.add(VERIFIED_ROLE_ID)

		return await loadingMessage.edit({
			embeds: [
				result
					? new MessageEmbed({
							title: 'Verification Successful!',
							description:
								`User \`${message.author.tag}\` has been verified!\n\n` +
								'Please flair your status and pick the classes you want to see in `#roles`\n' +
								'If you plan on leaving and rejoining at a later date, please ping a mod to let us know!',
							color: SUCCESS_GREEN
					  })
					: new MessageEmbed({ title: 'Error verifying code!', color: ERROR_RED })
			]
		})
	}
}

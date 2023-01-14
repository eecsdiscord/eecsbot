import { Args, Command } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { sendLoadingMessage } from '../../lib/utils'
import { checkEmail, extractbMailUsername, VCHECK_HELP_ERROR } from '../../lib/verification'

export class KernelCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'vcheck', preconditions: ['GuildOnly', 'isMod'] })
	}

	async messageRun(message: Message, args: Args) {
		await message.delete()

		const email = await args.pick('string').catch(() => {
			throw VCHECK_HELP_ERROR
		})
		const bMailUsername = extractbMailUsername(email)
		if (bMailUsername === '' || !args.finished) throw VCHECK_HELP_ERROR

		const loadingMessage = await sendLoadingMessage(message)
		const resultEmbed = checkEmail(bMailUsername)

		return await loadingMessage.edit({
			embeds: [
				resultEmbed.setAuthor({
					name: message.author.username,
					iconURL: message.member?.displayAvatarURL() ?? message.author.displayAvatarURL()
				})
			]
		})
	}
}

import { Precondition, PreconditionResult } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { VERIFIED_ROLE_ID } from '../lib/discordConfig'
import { getGuild } from '../lib/utils'

export class UserPrecondition extends Precondition {
	messageRun(message: Message): PreconditionResult {
		return getGuild().members.resolve(message.author.id)?.roles.resolve(VERIFIED_ROLE_ID)
			? this.error({ message: 'You are already verified!' })
			: this.ok()
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isNotVerified: never
	}
}

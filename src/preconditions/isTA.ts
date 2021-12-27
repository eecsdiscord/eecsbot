import { Precondition, PreconditionResult } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { TA_ROLE_ID } from '../lib/discordConfig'
import { getGuild } from '../lib/utils'

export class UserPrecondition extends Precondition {
	run(message: Message): PreconditionResult {
		return getGuild().members.resolve(message.author.id)?.roles.resolve(TA_ROLE_ID) ? this.ok() : this.error({ context: { silent: true } })
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isTA: never
	}
}

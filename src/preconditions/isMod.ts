import { Precondition, PreconditionResult } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { isMod } from '../lib/utils'

export class UserPrecondition extends Precondition {
	messageRun(message: Message): PreconditionResult {
		return isMod(message.author.id) ? this.ok() : this.error({ context: { silent: true } })
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isMod: never
	}
}

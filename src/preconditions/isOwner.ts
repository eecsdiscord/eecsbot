import { Precondition, PreconditionResult } from '@sapphire/framework'
import type { Message } from 'discord.js'

export class UserPrecondition extends Precondition {
	run(message: Message): PreconditionResult {
		return process.env.BOT_OWNER_ID && message.author.id === process.env.BOT_OWNER_ID ? this.ok() : this.error({ context: { silent: true } })
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		isOwner: never
	}
}

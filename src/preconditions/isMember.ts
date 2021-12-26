import { PieceContext, Precondition, PreconditionResult } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { getGuild } from '../lib/utils'

export class UserPrecondition extends Precondition {
	public constructor(context: PieceContext) {
		super(context, { position: 11 })
	}

	run(message: Message): PreconditionResult {
		return getGuild().members.resolve(message.author.id)
			? this.ok()
			: this.error({ message: 'You were not found in the server cache, please speak anywhere in it before using commands!' })
	}
}

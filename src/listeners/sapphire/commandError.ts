import { CommandErrorPayload, Events } from '@sapphire/framework'
import { Listener, UserError } from '@sapphire/framework'

export class UserEvent extends Listener<typeof Events.CommandError> {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, { ...options, event: Events.CommandError })
	}

	async run(error: UserError, payload: CommandErrorPayload) {
		const { context } = error
		const { name, location } = payload.piece
		if (Reflect.get(Object(context), 'help')) {
			await payload.message.channel.send(Reflect.get(Object(context), 'helpMessage'))
		} else {
			this.container.logger.error(`Encountered error on command "${name}" at path "${location.full}"`, error)
			// TODO: Send error to mod channel
		}
	}
}

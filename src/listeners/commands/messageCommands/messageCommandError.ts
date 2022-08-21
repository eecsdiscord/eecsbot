import { Events, Listener, MessageCommandErrorPayload, UserError } from '@sapphire/framework'

export class UserEvent extends Listener<typeof Events.MessageCommandError> {
	async run(error: UserError, payload: MessageCommandErrorPayload) {
		const { context } = error
		const { commandName } = payload.context

		if (Reflect.get(Object(context), 'help')) {
			await payload.message.channel.send(Reflect.get(Object(context), 'helpMessage'))
		} else {
			this.container.logger.error(`Encountered error on command "${commandName}"`, error)
			// TODO: Send error to mod channel
		}
	}
}

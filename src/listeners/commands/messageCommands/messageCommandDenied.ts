import { Events, Listener, MessageCommandDeniedPayload, UserError } from '@sapphire/framework'

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
	async run(error: UserError, payload: MessageCommandDeniedPayload) {
		const { context, message: content } = error
		const { message } = payload

		// `context: { silent: true }` should make UserError silent:
		if (Reflect.get(Object(context), 'silent')) return

		await message.channel.send({ content, allowedMentions: { users: [message.author.id], roles: [] } })
	}
}

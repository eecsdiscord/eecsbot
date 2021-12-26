import { CommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework'

export class UserEvent extends Listener<typeof Events.CommandDenied> {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, { ...options, event: Events.CommandDenied })
	}

	async run(error: UserError, payload: CommandDeniedPayload) {
		const { context, message: content } = error
		const { message } = payload

		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return

		await message.channel.send({ content, allowedMentions: { users: [message.author.id], roles: [] } })
	}
}

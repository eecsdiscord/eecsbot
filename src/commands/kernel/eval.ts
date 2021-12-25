import { Args, Command, Listener } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { inspect } from 'util'

const HELP_MESSAGE = '> Invalid eval code!'
const ASYNC_MESSAGE = "> Falsy result, don't forget to add `return` in the last statement when using the `--async` flag!"
const DB_MESSAGE = '> Using the `--db` flag requires `--async` as well!'
const DB_CODE = "const { db } = await import('../../lib/database.js');"

export class KernelCommand extends Command {
	constructor(context: Command.Context, options: Listener.Options) {
		super(context, { ...options, name: 'eval', flags: ['async', 'db'], options: ['depth'], preconditions: ['DMOnly', 'ownerOnly'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const codeResult = await args.restResult('string')
		if (!codeResult.success) return message.channel.send(HELP_MESSAGE)
		const async = args.getFlags('async')
		const db = args.getFlags('db')
		const depth = Number(args.getOption('depth')) ?? 0

		const innerCode = `${db ? DB_CODE : ''}${codeResult.value}`
		const code = async ? `(async () => {\n${innerCode}\n})();` : innerCode
		if (!async && db) return message.channel.send(DB_MESSAGE)

		let result = null
		try {
			const evaluated = await eval(code)
			if (!evaluated && async) await message.channel.send(ASYNC_MESSAGE)
			result = inspect(evaluated, { depth: depth })
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.client.logger.error(error)
			}
			result = error
		}

		const output = inspect(result, { depth: depth })
		const resultMessage = `\`\`\`js\n${result}\`\`\``
		if (resultMessage.length > 2000) {
			return message.channel.send({
				content: 'Output was too long, sending the result as a file!',
				files: [{ attachment: Buffer.from(output), name: 'output.js' }]
			})
		} else {
			return message.channel.send(resultMessage)
		}
	}
}

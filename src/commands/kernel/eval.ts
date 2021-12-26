import { Args, Command, Listener } from '@sapphire/framework'
import type { Message } from 'discord.js'

import { inspect } from 'util'

const HELP_MESSAGE = '> Invalid eval code!'
const FALSY_MESSAGE = "> Falsy result, don't forget to add `return` in the last statement!"

import { db as DB } from '../../lib/database'
import { codes } from '../../lib/verification'

export class KernelCommand extends Command {
	constructor(context: Command.Context, options: Listener.Options) {
		super(context, { ...options, name: 'eval', flags: ['async'], options: ['depth'], preconditions: ['DMOnly', 'ownerOnly'] })
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const codeResult = await args.restResult('string')
		if (!codeResult.success) return await message.channel.send(HELP_MESSAGE)
		const async = args.getFlags('async')
		const depth = Number(args.getOption('depth')) ?? 0
		const parsedCommand = `$eval ${async ? '--async ' : ''}${depth > 0 ? `--depth=${depth} ` : ''}${codeResult.value}`

		const code = async ? `return (async () => {\n${codeResult.value}\n})();` : codeResult.value
		let result = null
		try {
			const evaluated = await Function('container, db, codes', `${code}`)(this.container, DB, codes)
			if (!evaluated) await message.channel.send(FALSY_MESSAGE)
			result = inspect(evaluated, { depth: depth })
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.logger.error(error)
			}
			result = error
		}

		const output = inspect(result, { depth: depth })
		const resultMessage = `**Parsed code:**\n\`\`\`js\n${parsedCommand}\`\`\`**Result:**\n\`\`\`js\n${result}\`\`\``
		if (resultMessage.length > 2000) {
			return await message.channel.send({
				content: 'Output was too long, sending the result as a file!',
				files: [{ attachment: Buffer.from(output), name: 'output.js' }]
			})
		} else {
			return await message.channel.send(resultMessage)
		}
	}
}

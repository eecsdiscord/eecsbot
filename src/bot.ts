import { LogLevel, SapphireClient } from '@sapphire/framework'

import './lib/init'

const client = new SapphireClient({
	defaultPrefix: '$',
	intents: [
		'GUILDS',
		'GUILD_MESSAGES',
		'DIRECT_MESSAGES'
		// 'GUILD_MESSAGE_REACTIONS',
		// 'DIRECT_MESSAGE_REACTIONS',
		// 'GUILD_EMOJIS_AND_STICKERS'
	],
	partials: ['CHANNEL'],
	logger: { level: LogLevel.Debug }
})

const main = async () => {
	try {
		client.logger.info('Logging in...')
		await client.login(process.env.BOT_TOKEN)
		client.logger.info('Logged in!')
	} catch (error) {
		client.logger.fatal(error)
		client.destroy()
		process.exit(1)
	}
}

main()

import { LogLevel, SapphireClient } from '@sapphire/framework'

import './lib/init'

const client = new SapphireClient({
	typing: true,
	defaultPrefix: '$',
	intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
	partials: ['CHANNEL'],
	logger: { level: LogLevel.Debug },
	loadDefaultErrorListeners: false,
	loadMessageCommandListeners: true
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

import { LogLevel, SapphireClient } from '@sapphire/framework'
import { GatewayIntentBits, Partials } from 'discord.js'

import './lib/init'

const client = new SapphireClient({
	typing: true,
	defaultPrefix: '$',
	intents: [
		// https://discord.com/developers/docs/topics/gateway#gateway-intents
		GatewayIntentBits.Guilds, // Server, channels, and roles
		GatewayIntentBits.GuildMembers, // Member roles
		GatewayIntentBits.GuildMessages, // Messages
		GatewayIntentBits.DirectMessages, // Direct messages
		GatewayIntentBits.MessageContent // Content for message commands
	],
	partials: [Partials.Channel],
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

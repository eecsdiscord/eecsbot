import { container } from '@sapphire/framework'
import { Guild, Message, MessageEmbed } from 'discord.js'

import { BERKELEY_BLUE, BMAIL_DOMAIN, CALIFORNIA_GOLD, LOADING_MESSAGES } from './constants'
import { GUILD_ID } from './discordConfig'

/**
 * Returns the Guild
 * @returns A Guild
 */
export function getGuild(): Guild {
	const result = container.client.guilds.resolve(GUILD_ID)
	if (!result) throw 'Unable to resolve GUILD_ID to the Guild!'
	return result
}

/**
 * Returns a random item from an array
 * @param array Array to pick an item from
 * @returns A randomly picked item
 */
export function pickRandom<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]
}

/**
 * Sends an embed with a loading message
 * @param message Discord.js message
 * @returns Sent Discord.js message
 */
export async function sendLoadingMessage(message: Message): Promise<Message> {
	return await message.channel.send({
		embeds: [new MessageEmbed({ description: pickRandom(LOADING_MESSAGES), color: pickRandom([BERKELEY_BLUE, CALIFORNIA_GOLD]) })]
	})
}

/**
 * Extracts the bMail username from an email. Removes periods, ignores + extensions, and lowercases
 * @param email Email string
 * @returns bMail username
 */
export function extractbMailUsername(email: string): string {
	const splitted = email.split('@')
	if (splitted.length !== 2) return ''
	const [username, domain] = splitted
	if (domain !== BMAIL_DOMAIN) return ''

	return username.replaceAll('.', '').split('+')[0].toLowerCase()
}

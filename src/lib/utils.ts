import { container } from '@sapphire/framework'
import { Guild, Message, MessageEmbed, TextChannel } from 'discord.js'

import { BERKELEY_BLUE, CALIFORNIA_GOLD, LOADING_MESSAGES } from './constants'
import { GUILD_ID, MOD_ROLE_ID, STDOUT_CHANNEL_ID } from './discordConfig'

/**
 * Returns the Guild
 */
export function getGuild(): Guild {
	const guild = container.client.guilds.resolve(GUILD_ID)
	if (!guild) {
		const msg = 'Unable to resolve GUILD_ID to the Guild!'
		container.logger.error(msg)
		throw msg
	}
	return guild
}

/**
 * Returns the STDOUT Discord channel
 */
export function getSTDOUT(): TextChannel {
	const channel = getGuild().channels.resolve(STDOUT_CHANNEL_ID)
	if (!channel) {
		const msg = 'Unable to resolve STDOUT_CHANNEL_ID to a channel!'
		container.logger.error(msg)
		throw msg
	}
	return channel as TextChannel
}

/**
 * Returns true if the Discord user is a moderator
 * @param id DIscord id of the user
 */
export function isMod(id: string): boolean {
	return Boolean(getGuild().members.resolve(id)?.roles.resolve(MOD_ROLE_ID))
}

/**
 * Picks a random item from an array
 * @param array Array to pick an item from
 */
export function pickRandom<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]
}

/**
 * Sends an embed with a loading message
 * @param message Discord.js message
 */
export async function sendLoadingMessage(message: Message): Promise<Message> {
	return await message.channel.send({
		embeds: [new MessageEmbed({ description: pickRandom(LOADING_MESSAGES), color: pickRandom([BERKELEY_BLUE, CALIFORNIA_GOLD]) })]
	})
}

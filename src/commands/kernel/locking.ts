import { Args, UserError } from '@sapphire/framework'
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands'
import { CategoryChannel, Message, MessageEmbed, Permissions, TextChannel } from 'discord.js'

import { BERKELEY_BLUE, CALIFORNIA_GOLD, COURSE_NUMBER_REGEX } from '../../lib/constants'
import { CLASS_CATEGORY_CHANNEL_IDS } from '../../lib/discordConfig'
import { getGuild, getSTDOUT } from '../../lib/utils'

const HELP_LIST_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Unknown arguments. Example usage: `$lock (list | [acquire | release] #channel)`' }
})
const HELP_ACQUIRE_RELEASE_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Please enter a valid channel! Example: `$lock [acquire | release] #cs61a`' }
})
const HELP_INVALID_CHANNEL_ERROR = (channel: string) =>
	new UserError({
		identifier: 'ArgumentError',
		context: { help: true, helpMessage: `${channel} is not a valid course channel!` }
	})
const HELP_DOUBLE_ACQUIRE_RELEASE_ERROR = (channel: TextChannel, acquire: boolean) =>
	new UserError({
		identifier: 'ArgumentError',
		context: { help: true, helpMessage: `${channel.toString()} is already ${acquire ? 'locked' : 'unlocked'}!` }
	})

/**
 * Returns a CategoryChannel array corresponding to the course categories
 */
function getCourseCategories(): CategoryChannel[] {
	return CLASS_CATEGORY_CHANNEL_IDS.map((id: string) => getGuild().channels.resolve(id) as CategoryChannel)
}

/**
 * Returns true if the provided channel is locked (everyone role cannot send messages)
 * @param channel Discord Guild Channel
 */
function isLocked(channel: TextChannel): boolean {
	return channel.permissionOverwrites.resolve(getGuild().roles.everyone.id)?.deny.has(Permissions.FLAGS.SEND_MESSAGES) || false
}

/**
 * Locks or unlocks the channel provided in the Args
 * @param args message Args
 * @param acquire true to acquire, false to release
 */
async function lockAcquireOrRelease(message: Message, args: Args, acquire: boolean): Promise<Message> {
	const guildChannel = await args.pick('guildChannel').catch(() => {
		throw HELP_ACQUIRE_RELEASE_ERROR
	})
	if (!args.finished) throw HELP_ACQUIRE_RELEASE_ERROR
	if (!guildChannel.isText() || !getCourseCategories().some((category: CategoryChannel) => category.children.has(guildChannel.id)))
		throw HELP_INVALID_CHANNEL_ERROR(guildChannel.toString())

	const channel = guildChannel as TextChannel
	const locked = isLocked(channel)
	if ((acquire && locked) || (!acquire && !locked)) throw HELP_DOUBLE_ACQUIRE_RELEASE_ERROR(channel, acquire)

	channel.permissionOverwrites.edit(getGuild().roles.everyone, { SEND_MESSAGES: acquire ? false : null })

	await getSTDOUT().send({
		embeds: [
			new MessageEmbed({
				title: `Lock ${acquire ? 'acquired' : 'released'}!`,
				description: `__**Resource:**__ ${channel.toString()}`,
				color: acquire ? CALIFORNIA_GOLD : BERKELEY_BLUE
			})
		]
	})

	return await message.channel.send(`${acquire ? 'Locked' : 'Unlocked'} ${channel.toString()}`)
}

export class KernelCommand extends SubCommandPluginCommand {
	constructor(context: SubCommandPluginCommand.Context, options: SubCommandPluginCommand.Options) {
		super(context, {
			...options,
			name: 'lock',
			preconditions: ['GuildOnly', ['isTA', 'isMod']],
			subCommands: [{ input: 'list', default: true }, 'acquire', 'release']
		})
	}

	async list(message: Message, args: Args): Promise<Message> {
		if (!args.finished) throw HELP_LIST_ERROR
		const categories: string[] = []
		getCourseCategories().forEach((category: CategoryChannel) => {
			const lockedChannels = category.children
				.sorted((a, b) => (a.name.match(COURSE_NUMBER_REGEX)?.[0] || '').localeCompare(b.name.match(COURSE_NUMBER_REGEX)?.[0] || ''))
				.filter((channel) => channel.isText() && isLocked(channel as TextChannel))
				.map((channel) => channel.toString())
			if (lockedChannels.length > 0) categories.push(`${category.name}:\n${lockedChannels.join('\n')}`)
		})

		return await message.channel.send(
			categories.length > 0 ? `Locked Channels:\n${categories.join('\n\n')}` : 'No channels are currently locked!'
		)
	}

	async acquire(message: Message, args: Args): Promise<Message> {
		return await lockAcquireOrRelease(message, args, true)
	}

	async release(message: Message, args: Args): Promise<Message> {
		return await lockAcquireOrRelease(message, args, false)
	}
}
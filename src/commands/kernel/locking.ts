import type { GuildBasedChannelTypes } from '@sapphire/discord.js-utilities'
import { Args, UserError } from '@sapphire/framework'
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands'
import type { CategoryChannel, Message } from 'discord.js'

import { COURSE_NUMBER_REGEX } from '../../lib/constants'
import { CLASS_CATEGORY_CHANNEL_IDS } from '../../lib/discordConfig'
import { getGuild } from '../../lib/utils'

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
		context: { help: true, helpMessage: `Channel ${channel} is not a valid course channel!` }
	})

/**
 * Returns a CategoryChannel array corresponding to the course categories
 */
function getCourseCategories(): CategoryChannel[] {
	return CLASS_CATEGORY_CHANNEL_IDS.map((id: string) => getGuild().channels.resolve(id) as CategoryChannel)
}

/**
 * Returns true if the provided channel is a child of any of the course category channels
 * @param channel Discord Channel
 */
function isValidCourseChannel(channel: GuildBasedChannelTypes): boolean {
	return getCourseCategories().some((category: CategoryChannel) => category.children.has(channel.id))
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
		const result = getCourseCategories()
			.map((category: CategoryChannel) =>
				category.children
					.sorted((a, b) => (a.name.match(COURSE_NUMBER_REGEX)?.[0] || '').localeCompare(b.name.match(COURSE_NUMBER_REGEX)?.[0] || ''))
					.map((channel) => channel.toString())
			)
			.join('\n')

		return await message.channel.send(result)
	}

	async acquire(message: Message, args: Args) {
		const channel = await args.pick('guildChannel').catch(() => {
			throw HELP_ACQUIRE_RELEASE_ERROR
		})
		if (!args.finished) throw HELP_ACQUIRE_RELEASE_ERROR
		if (!isValidCourseChannel(channel)) throw HELP_INVALID_CHANNEL_ERROR(channel.toString())

		return await message.channel.send(channel.toString())
	}

	async release(message: Message, args: Args) {
		const channel = await args.pick('guildChannel').catch(() => {
			throw HELP_ACQUIRE_RELEASE_ERROR
		})
		if (!args.finished) throw HELP_ACQUIRE_RELEASE_ERROR
		if (!isValidCourseChannel(channel)) throw HELP_INVALID_CHANNEL_ERROR(channel.toString())

		return await message.channel.send(channel.toString())
	}
}

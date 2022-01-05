import { fetch } from '@sapphire/fetch'
import { Args, Command, container, UserError } from '@sapphire/framework'
import { jaroWinkler } from '@skyra/jaro-winkler'
import { green } from 'colorette'
import { Message, MessageEmbed } from 'discord.js'

import { BERKELEY_BLUE, CALIFORNIA_GOLD, ERROR_RED } from '../../lib/constants'
import { isMod, sendLoadingMessage } from '../../lib/utils'

interface BerkeleytimeCatalogResponse {
	courses: { abbreviation: string; course_number: string; id: number }[]
}

interface BerkeleytimeCourseResponse {
	course: {
		title: string
		description: string
		units: string
		grade_average: number
		letter_average: string
		enrolled_max: number
		enrolled_percentage: number
		waitlisted: number
	}
	last_enrollment_update: string
}

let catalog: { [key: string]: { [key: string]: number } }
const laymanMappings: { [key: string]: string } = {
	ASTRO: 'ASTRON',
	CS: 'COMPSCI',
	MCB: 'MCELLBI',
	NUTRISCI: 'NUSCTX',
	BIOE: 'BIO ENG',
	'BIO E': 'BIO ENG',
	'BIO P': 'BIO PHY',
	BIOENG: 'BIO ENG',
	BIO: 'BIOLOGY',
	CIVE: 'CIV ENG',
	'CIV E': 'CIV ENG',
	CHEME: 'CHM ENG',
	'CHEM E': 'CHM ENG',
	CHMENG: 'CHM ENG',
	CIVENG: 'CIV ENG',
	CLASSICS: 'CLASSIC',
	COGSCI: 'COG SCI',
	'COLLEGE WRITING': 'COLWRIT',
	COMPLIT: 'COM LIT',
	COMLIT: 'COM LIT',
	CYPLAN: 'CY PLAN',
	CP: 'CY PLAN',
	DESINV: 'DES INV',
	DESIGN: 'DES INV',
	DEVENG: 'DEV ENG',
	DEVSTD: 'DEV STD',
	DS: 'DATASCI',
	EALANG: 'EA LANG',
	ED: 'ENV DES',
	EE: 'EL ENG',
	ERG: 'ENE,RES',
	ER: 'ENE,RES',
	ENERES: 'ENE,RES',
	E: 'ENGIN',
	ENGINEERING: 'ENGIN',
	ENVSCI: 'ENV SCI',
	ETHSTD: 'ETH STD',
	EURAST: 'EURA ST',
	GEOLOGY: 'GEOG',
	HINURD: 'HIN-URD',
	HUMBIO: 'HUM BIO',
	IB: 'INTEGBI',
	IE: 'IND ENG',
	IEOR: 'IND ENG',
	LING: 'LINGUIS',
	'L&S': 'L & S',
	LS: 'L & S',
	MALAYI: 'MALAY/I',
	MATSCI: 'MAT SCI',
	MS: 'MAT SCI',
	MSE: 'MAT SCI',
	MECENG: 'MEC ENG',
	MECHE: 'MEC ENG',
	'MECH E': 'MEC ENG',
	ME: 'MEC ENG',
	MEDST: 'MED ST',
	MESTU: 'M E STU',
	'MIDDLE EASTERN STUDIES': 'M E STU',
	MILAFF: 'MIL AFF',
	MILSCI: 'MIL SCI',
	NEUROSCI: 'NEUROSC',
	NE: 'NUC ENG',
	NESTUD: 'NE STUD',
	MEDIA: 'MEDIAST',
	PE: 'PHYS ED',
	PHYSED: 'PHYS ED',
	PHILO: 'PHILOS',
	PHIL: 'PHILOS',
	'POLI ECON': 'POLECON',
	POLIECON: 'POLECON',
	PHILOSOPHY: 'PHILO',
	PMB: 'PLANTBI',
	POLI: 'POL SCI',
	POLSCI: 'POL SCI',
	POLISCI: 'POL SCI',
	'POLI SCI': 'POL SCI',
	PS: 'POL SCI',
	PUBPOL: 'PUB POL',
	PP: 'PUB POL',
	'PUBLIC POLICY': 'PUB POL',
	PUBAFF: 'PUB AFF',
	PSYCHOLOGY: 'PSYCH',
	SASIAN: 'S ASIAN',
	SSEASN: 'S,SEASN',
	STATS: 'STAT',
	TDPS: 'THEATER',
	HAAS: 'UGBA',
	VIETNAMESE: 'VIETNMS',
	VISSCI: 'VIS SCI',
	VISSTD: 'VIS STD'
}

const HELP_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Please enter a valid course! Example: `$course cs 61a`' }
})

/**
 * Fetches the course catalog from Berkeleytime
 */
export async function getCatalog(): Promise<boolean> {
	try {
		const response = await fetch<BerkeleytimeCatalogResponse>('https://berkeleytime.com/api/catalog/catalog_json/')
		const newCatalog: { [key: string]: { [key: string]: number } } = {}
		response.courses.forEach((course) => {
			if (!newCatalog[course.abbreviation]) newCatalog[course.abbreviation] = {}
			newCatalog[course.abbreviation][course.course_number] = course.id
		})
		catalog = newCatalog
		container.logger.info(green('Course catalog updated!'))
	} catch (error) {
		container.logger.error(error)
		return false
	}
	return true
}

/**
 * Returns a MessageEmbed with subject suggestions
 * @param subject Subject query string
 * @param subjects Matched subjects list
 */
function getSuggestionsEmbed(subject: string, subjects: [number, string][]): MessageEmbed {
	return new MessageEmbed({
		description: `Couldn't find an exact match for subject \`${subject}\`, did you mean:\n${subjects
			.map((entry) => `\`${entry[1]}\``)
			.join(' | ')}`,
		color: CALIFORNIA_GOLD
	})
}

/**
 * Returns true if the number exists and is non-negative
 * @param number to check
 */
function nonNeg(n: number | undefined) {
	return n !== undefined && n >= 0
}

export class UserCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, { ...options, name: 'course', aliases: ['c'], cooldownDelay: 3_000, preconditions: ['GuildOnly'] })
		setInterval(getCatalog, 24 * 60 * 60 * 1000)
	}

	async messageRun(message: Message, args: Args): Promise<Message> {
		const parsedArgs = await args.repeat('string').catch(() => {
			throw HELP_ERROR
		})
		if (parsedArgs.length < 2) throw HELP_ERROR
		if (parsedArgs[0] === 'REFRESH' && isMod(message.author.id)) {
			return await message.channel.send((await getCatalog()) ? 'Course catalog refreshed!' : 'Error fetching course catalog!')
		}
		const subject = parsedArgs.slice(0, -1).join(' ').toUpperCase()
		const course = parsedArgs[parsedArgs.length - 1].toUpperCase()

		const loadingMessage = await sendLoadingMessage(message)

		const subjects = Object.keys(catalog)
			.concat(Object.keys(laymanMappings))
			.map((catalogSubject: string) => [jaroWinkler(subject, catalogSubject), catalogSubject] as [number, string])
			.sort(([a0, a1], [b0, b1]) => b0 - a0 || a1.localeCompare(b1))
			.slice(0, 5)
		let subjectMatch = subjects[0][1]
		if (subjectMatch in laymanMappings) subjectMatch = laymanMappings[subjectMatch]

		if (!(course in catalog[subjectMatch])) {
			return await loadingMessage.edit({
				embeds: [
					new MessageEmbed({ description: `Course \`${course}\` not found in subject \`${subjectMatch}\``, color: ERROR_RED }),
					getSuggestionsEmbed(subject, subjects)
				]
			})
		}

		try {
			const response: BerkeleytimeCourseResponse = await fetch(
				`https://berkeleytime.com/api/catalog/catalog_json/course_box/?course_id=${catalog[subjectMatch][course]}`
			)
			const { course: responseCourse, last_enrollment_update } = response
			const { description, units, letter_average } = responseCourse
			const { grade_average, enrolled_max, enrolled_percentage, waitlisted } = responseCourse

			let grade = 'Unknown'
			if (letter_average) {
				grade = nonNeg(grade_average) ? `${grade_average.toFixed(3)} - ${letter_average}` : letter_average
			}

			let lastUpdated = 'Unknown'
			if (last_enrollment_update) {
				const date = new Date(last_enrollment_update)
				lastUpdated = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}`
			}

			const embeds = [
				new MessageEmbed({
					color: BERKELEY_BLUE,
					title: `${subjectMatch} ${course}`,
					url: `https://berkeleytime.com/catalog/${subjectMatch}/${course}/`.replace(' ', '%20'),
					thumbnail: { url: 'https://brand.berkeley.edu/wp-content/uploads/2016/10/ucbseal_139_540.png' },
					description: response.course.title,
					fields: [
						{
							name: 'Description',
							value: description
								? description.length > 256
									? description.substring(0, 256 - 3) + '...'
									: description
								: 'No description'
						},
						{ name: 'Units', inline: true, value: units || 'Unknown' },
						{ name: 'Average Grade', inline: true, value: grade },
						{ name: 'Last Updated', inline: true, value: lastUpdated },
						{
							name: 'Enrolled',
							inline: true,
							value: nonNeg(enrolled_percentage) ? `${Math.round(enrolled_percentage * 100)}%` : 'Unknown'
						},
						{ name: 'Capacity', inline: true, value: nonNeg(enrolled_max) ? enrolled_max.toString() : 'Unknown' },
						{ name: 'Waitlisted', inline: true, value: nonNeg(waitlisted) ? waitlisted.toString() : 'Unknown' }
					],
					footer: { text: 'Berkeleytime.com', icon_url: 'https://berkeleytime.com/favicon.png' }
				})
			]

			if (!(subject in laymanMappings) && subject !== subjectMatch) {
				embeds.push(getSuggestionsEmbed(subject, subjects))
			}

			return await loadingMessage.edit({ embeds: embeds })
		} catch (error) {
			container.logger.error(error)
			return await loadingMessage.edit({ embeds: [new MessageEmbed({ title: 'Error fetching course data!', color: ERROR_RED })] })
		}
	}
}

import { container, UserError } from '@sapphire/framework'
import { green, red } from 'colorette'
import crypto from 'crypto'
import { MessageEmbed, User } from 'discord.js'
import nodemailer from 'nodemailer'

import { BMAIL_DOMAIN, ERROR_RED, SUCCESS_GREEN } from './constants'
import { db } from './database'

export const codes: { [key: string]: Verification } = {}

interface Verification {
	code: number
	hash: string
}

export const HELP_ERROR = new UserError({
	identifier: 'ArgumentError',
	context: { help: true, helpMessage: 'Please enter a valid Berkeley email! Example: `$email foo@berkeley.edu`' }
})

/**
 * Extracts the bMail username from an email. Ignores + extensions and lowercases
 * @param email Email string
 */
export function extractbMailUsername(email: string): string {
	const splitted = email.split('@')
	if (splitted.length !== 2) return ''
	const [username, domain] = splitted
	if (domain !== BMAIL_DOMAIN) return ''

	return username.split('+')[0].toLowerCase()
}

let transporter: nodemailer.Transporter

export async function initializeNodemailer() {
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
	})

	try {
		await transporter.verify()
		container.logger.info(green('Nodemailer initialized!'))
	} catch (error) {
		container.logger.error(red('Nodemailer initialization failed!'))
		container.logger.error(error)
	}
}

export async function emailCode(author: User, bMailUsername: string): Promise<boolean> {
	let success = false
	const code = Math.floor(Math.random() * 1_000_000)
	const email = `${bMailUsername}@${BMAIL_DOMAIN}`
	try {
		if (!process.env.PEPPER) throw 'PEPPER environment variable missing!'
		const hash = crypto
			.createHash('sha256')
			.update(process.env.PEPPER + email)
			.digest('hex')

		const row = db.prepare('SELECT * FROM verification_hashes WHERE hash = ?').get(hash)
		if (row) throw `Duplicate email submitted by user ${author.tag}`

		await transporter.sendMail({
			from: 'bot@eecsdiscord.berkeley.edu',
			to: email,
			subject: 'EECS Discord Verification Code',
			text: `Please use the code ${code} to complete your verification. This code will expire in 5 minutes!`
		})

		codes[author.id] = { code: code, hash: hash }
		setTimeout(() => {
			if (codes[author.id] && codes[author.id].code === code) {
				delete codes[author.id]
			}
		}, 5 * 60 * 1000)

		success = true
	} catch (error) {
		container.logger.error(error)
	}

	return success
}

export function verifyCode(author: User, code: number): boolean {
	if (codes[author.id] && codes[author.id].code === code) {
		try {
			db.prepare('INSERT INTO verification_hashes (hash, timestamp) VALUES (?, ?)').run(codes[author.id].hash, Date.now())
			delete codes[author.id]
			return true
		} catch (error) {
			container.logger.error(error)
			return false
		}
	}
	return false
}

export function checkEmail(bMailUsername: string): MessageEmbed {
	const email = `${bMailUsername}@${BMAIL_DOMAIN}`
	if (!process.env.PEPPER) throw 'PEPPER environment variable missing!'
	const hash = crypto
		.createHash('sha256')
		.update(process.env.PEPPER + email)
		.digest('hex')
	const row = db.prepare('SELECT * FROM verification_hashes WHERE hash = ?').get(hash)

	return row
		? new MessageEmbed({
				title: 'Email was verified before!',
				description: `Email \`${bMailUsername[0]}${bMailUsername
					.slice(1)
					.replaceAll(/[^\.]/g, '*')}@${BMAIL_DOMAIN}\` was verified on ${new Date(row.timestamp).toLocaleString()}`,
				color: SUCCESS_GREEN
		  })
		: new MessageEmbed({ title: 'Email was never verified!', color: ERROR_RED })
}

import { container } from '@sapphire/framework'
import { green, red } from 'colorette'
import crypto from 'crypto'
import { Message, MessageEmbed } from 'discord.js'
import nodemailer from 'nodemailer'

import { BMAIL_DOMAIN, ERROR_RED, SUCCESS_GREEN } from './constants'
import type { Verification } from './interfaces'

let transporter: nodemailer.Transporter
const codes: { [key: string]: Verification } = {}

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

export async function emailCode(message: Message, bMailUsername: string): Promise<MessageEmbed> {
	let success = false
	const code = Math.floor(Math.random() * 1_000_000)
	const email = `${bMailUsername}@${BMAIL_DOMAIN}`
	try {
		if (!process.env.PEPPER) throw 'PEPPER ENV VARIABLE MISSING'
		await transporter.sendMail({
			from: 'bot@eecsdiscord.berkeley.edu',
			to: email,
			subject: 'EECS Discord Verification Code',
			text: `Please use the code ${code} to complete your verification. This code will expire in 5 minutes!`
		})

		const hash = crypto
			.createHash('sha256')
			.update(process.env.PEPPER + email)
			.digest('hex')
		codes[message.author.id] = { code: code, hash: hash }
		setTimeout(() => {
			if (codes[message.author.id] && codes[message.author.id].code === code) {
				delete codes[message.author.id]
			}
		}, 5 * 60 * 1000)

		success = true
	} catch (error) {
		container.logger.error(error)
	}

	return success
		? new MessageEmbed({
				title: 'Email received!',
				description:
					`Verification code successfully sent for \`${message.author.tag}\`\n\n` +
					'Once you receive your temporary verification code, please verify using\n' +
					`\`$code ******\``,
				color: SUCCESS_GREEN
		  })
		: new MessageEmbed({
				title: 'Error sending email!',
				color: ERROR_RED
		  })
}

import type { ILogger } from '@sapphire/framework'
import { green } from 'colorette'
import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter

export async function initializeNodemailer(logger: ILogger) {
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS
		}
	})

	try {
		await transporter.verify()
		logger.info(green('Nodemailer initialized!'))
	} catch (error) {
		logger.error('Nodemailer initialization failed!')
		logger.error(error)
	}
}

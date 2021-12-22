import { container } from '@sapphire/framework'
import '@sapphire/plugin-logger/register'
import dotenv from 'dotenv'

import { initializeNodemailer } from './verification'

export async function initServices() {
	const logger = container.logger

	await initializeNodemailer(logger)
}

dotenv.config()

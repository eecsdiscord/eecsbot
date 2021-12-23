import { container } from '@sapphire/framework'
import '@sapphire/plugin-logger/register'
import dotenv from 'dotenv'

import { initializeBetterSqlite3 } from './database'
import { initializeNodemailer } from './verification'

export async function initServices() {
	const logger = container.logger

	await initializeNodemailer(logger)
	await initializeBetterSqlite3(logger)
}

dotenv.config()

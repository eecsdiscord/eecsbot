import '@sapphire/plugin-logger/register'
import dotenv from 'dotenv'

import { initializeBetterSqlite3 } from './database'
import { initializeNodemailer } from './verification'

export async function initServices() {
	await initializeNodemailer()
	await initializeBetterSqlite3()
}

dotenv.config()

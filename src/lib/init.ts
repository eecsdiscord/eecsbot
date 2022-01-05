import '@sapphire/plugin-logger/register'
import dotenv from 'dotenv'

import { getCatalog } from '../commands/user/course'
import { initializeBetterSqlite3 } from './database'
import { initializeNodemailer } from './verification'

export async function initServices() {
	await initializeNodemailer()
	initializeBetterSqlite3()
	getCatalog()
}

dotenv.config()

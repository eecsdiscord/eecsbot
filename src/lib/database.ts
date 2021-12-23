import type { ILogger } from '@sapphire/framework'
import BetterSqlite3 from 'better-sqlite3'
import { blue, green, red, yellow } from 'colorette'

import fs from 'fs'
import { DB_DIR, DB_FILE } from './constants'

let db: BetterSqlite3.Database

export async function initializeBetterSqlite3(logger: ILogger) {
	if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR)
	try {
		db = BetterSqlite3(DB_FILE, {
			verbose: (message) => logger.info(`${blue('SQLite3')} - ${yellow(message)}`)
		})
		initializeDatabase()
		logger.info(green('SQLite3 database initialized!'))
	} catch (error) {
		logger.error(red('SQLite3 database initialization failed!'))
		logger.error(error)
	}
}

function initializeDatabase() {
	initializeTables()
}

function initializeTables() {
	db.prepare('CREATE TABLE IF NOT EXISTS verification_hashes (hash TEXT, timestamp INTEGER)').run()
}

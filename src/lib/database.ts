import type { ILogger } from '@sapphire/framework'
import BetterSqlite3 from 'better-sqlite3'
import { blue, green, red, yellow } from 'colorette'

import fs from 'fs'
import { join } from 'path'
import { ROOT_DIR } from './constants'

const DB_DIR = join(ROOT_DIR, 'db')
const DB_FILE = join(DB_DIR, 'data.db')

let db: BetterSqlite3.Database

function initializeDatabase() {
	initializeTables()
}

function initializeTables() {
	db.prepare('CREATE TABLE IF NOT EXISTS verification_hashes (hash TEXT, timestamp INTEGER)').run()
}

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

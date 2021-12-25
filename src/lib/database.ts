import { container } from '@sapphire/framework'
import BetterSqlite3 from 'better-sqlite3'
import { blue, green, red, yellow } from 'colorette'

import fs from 'fs'
import { join } from 'path'
import { ROOT_DIR } from './constants'

const DB_DIR = join(ROOT_DIR, 'db')
const DB_FILE = join(DB_DIR, 'data.db')

export let db: BetterSqlite3.Database

function initializeDatabase() {
	initializeTables()
}

function initializeTables() {
	db.prepare('CREATE TABLE IF NOT EXISTS verification_hashes (hash TEXT, timestamp INTEGER)').run()
}

export function initializeBetterSqlite3() {
	if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR)
	try {
		db = BetterSqlite3(DB_FILE, {
			verbose: (message) => container.logger.info(`${blue('SQLite3')} - ${yellow(message)}`)
		})
		initializeDatabase()
		container.logger.info(green('SQLite3 database initialized!'))
	} catch (error) {
		container.logger.error(red('SQLite3 database initialization failed!'))
		container.logger.error(error)
	}
}

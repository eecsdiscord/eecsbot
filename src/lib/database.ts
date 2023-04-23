import { container } from '@sapphire/framework'
import BetterSqlite3 from 'better-sqlite3'
import { blue, green, red, yellow } from 'colorette'
import * as cron from 'node-cron'

import fs from 'fs'
import { join } from 'path'
import { ROOT_DIR } from './constants'

export let db: BetterSqlite3.Database

const DB_DIR = join(ROOT_DIR, 'db')
const DB_FILE = join(DB_DIR, 'data.db')
const DB_BACKUPS_DIR = join(DB_DIR, 'backups')

export function initializeBetterSqlite3() {
	if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR)
	if (!fs.existsSync(DB_BACKUPS_DIR)) fs.mkdirSync(DB_BACKUPS_DIR)
	try {
		db = BetterSqlite3(DB_FILE, {
			verbose: (message) => container.logger.info(`[${blue('SQLite3')}] - ${yellow(message as string)}`)
		})
		initializeDatabase()
		container.logger.info(green('SQLite3 database initialized!'))
	} catch (error) {
		container.logger.error(red('SQLite3 database initialization failed!'))
		container.logger.error(error)
	}
}

function initializeDatabase() {
	initializeTables()
	scheduleBackups()
}

function initializeTables() {
	db.prepare('CREATE TABLE IF NOT EXISTS verification_hashes (hash TEXT, timestamp INTEGER)').run()
}

function scheduleBackups() {
	cron.schedule('0 0 1 * *', async () => {
		await db.backup(join(DB_BACKUPS_DIR, `backup-${Date.now()}.db`))
		container.logger.info(green('SQLite3 database backed up!'))
	})
}

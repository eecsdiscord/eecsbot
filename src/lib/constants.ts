import { join } from 'path'

export const ROOT_DIR = join(__dirname, '..', '..')
export const DB_DIR = join(ROOT_DIR, 'db')

export const DB_FILE = join(DB_DIR, 'data.db')

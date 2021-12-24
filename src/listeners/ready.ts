import { Events, Listener, Store } from '@sapphire/framework'
import { blue, gray, magenta, yellow } from 'colorette'

import { initServices } from '../lib/init'

export class BotEvent extends Listener<typeof Events.ClientReady> {
	constructor(context: Listener.Context, options: Listener.Options) {
		super(context, { ...options, event: Events.ClientReady, once: true })
	}

	printInfo() {
		const { logger, stores } = this.container
		const storeValues = [...stores.values()]
		const lastStore = storeValues.pop()!
		const styleStore = (store: Store<any>, last: boolean) => {
			logger.info(`${gray(last ? '└─ Loaded ' : '├─ Loaded ')}${yellow(store.size.toString().padEnd(3, ' '))} ${store.name}`)
		}

		console.log()
		this.container.logger.info(`${blue('ee')}${yellow('cs')}bot ${magenta(process.env.npm_package_version || '')}`)
		storeValues.forEach((store: Store<any>) => styleStore(store, false))
		styleStore(lastStore, true)
		console.log()
	}

	async run() {
		this.printInfo()
		await initServices()
	}
}

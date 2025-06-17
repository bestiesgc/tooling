import util from 'node:util'
import { spawn } from 'node:child_process'

export function toValidPackageName(name) {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/^[._]/, '')
		.replace(/[^a-z0-9~.-]+/g, '-')
}

export function prettyJSON(data) {
	return JSON.stringify(data, null, '\t') + '\n'
}

export const commandExists = util.promisify(
	(await import('command-exists')).default
)

export function getGitUser() {
	return new Promise((resolve, reject) => {
		const cmd = spawn('git', ['config', 'user.name'])
		let err = ''
		let name = ''
		cmd.stdout.on('data', data => (name += data))
		cmd.stderr.on('data', data => (err += data))
		cmd.on('close', code => {
			if (code == 0) resolve(name.trim())
			else reject(err)
		})
	})
}

export function sortKeys(obj) {
	return Object.fromEntries(
		Object.keys(obj)
			.sort()
			.map(key => {
				return [key, obj[key]]
			})
	)
}

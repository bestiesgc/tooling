import util from 'node:util'

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

#!/usr/bin/env node
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import path from 'node:path'
import { getGitUser, toValidPackageName } from './utils.js'
import create from './index.js'
import meow from 'meow'
import licenses from './licenses.js'
import link from './link.js'

const defaultLicense = 'LicenseRef-OQL-1.2'

const cli = meow(
	`
	Create new besties projects instantly.

	${pc.bold(pc.underline('Usage'))}
	  ${pc.gray('$')} ${pc.magenta('pnpm')} init besties ${pc.gray('[project-name]')}

	${pc.bold(pc.underline('Options'))}
	  ${pc.bold('-t, --type <type>')}   	specify the project type to create ${pc.gray('(app, lib)')}
	  ${pc.bold('-a, --author <name>')} 	specify the author of the project
	  ${pc.bold('-l, --license <spdx>')}	specify the license of the project ${pc.gray(`(default: ${defaultLicense})`)}

	${pc.bold(pc.underline('Examples'))}
	  ${pc.gray('$')} ${pc.magenta('pnpm')} init besties ${pc.gray('my-amazing-app')}
	  respond to the prompts to decide how to create your new project 🌈
	  ${pc.gray('$')} ${pc.magenta('pnpm')} init besties ${pc.gray(
			'my-amazing-app --type app'
		)}
	  make a new web-app project

	made with ${pc.magenta('♥')} by ${link('besties', 'https://besties.house')}

`,
	{
		importMeta: import.meta,
		flags: {
			type: {
				type: 'string',
				shortFlag: 't',
				choices: ['app', 'lib']
			},
			author: {
				type: 'string',
				shortFlag: 'a'
			},
			license: {
				type: 'string',
				shortFlag: 'l'
			}
		}
	}
)

let cwd = cli.input[0] || '.'

const { version, homepage } = JSON.parse(
	fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8')
)
console.log(`
${pc.gray(`${link('create-besties', homepage, false)} v${version}`)}
`)
p.intro(pc.bgMagenta(pc.black('hey bestie')))

if (cwd === '.') {
	const dir = await p.text({
		message: 'Where would you like your project?',
		placeholder: '  (hit Enter to use current directory)'
	})

	if (p.isCancel(dir)) process.exit(1)

	if (dir) {
		cwd = dir
	}
}

if (fs.existsSync(cwd)) {
	if (fs.readdirSync(cwd).length > 0) {
		const force = await p.confirm({
			message: 'Directory not empty. Continue?',
			initialValue: false
		})

		// bail if `force` is `false` or the user cancelled with Ctrl-C
		if (force !== true) {
			process.exit(1)
		}
	}
}

cwd = path.resolve(cwd)

const name = toValidPackageName(path.basename(cwd))

const projectType =
	cli.flags.type ??
	(await p.select({
		message: 'Pick a project type.',
		options: [
			{ value: 'app', label: 'App', hint: 'a SvelteKit website' },
			{ value: 'lib', label: 'Library' }
		]
	}))

let authorName = cli.flags.author
if (authorName === undefined) {
	authorName = await p.text({
		message: "Who's authoring this project?",
		placeholder: '  (hit Enter to use git user.name)'
	})
}
if (!authorName) {
	try {
		authorName = await getGitUser()
	} catch (error) {
		console.error(
			'No git user.name set. Please specify an author with the --author flag.'
		)
		process.exit(1)
	}
}

let license = cli.flags.license
if (license === undefined) {
	license = await p.select({
		message: 'What license should this project use?',
		placeholder: `  (default: ${defaultLicense})`,
		options: licenses.map(license => {
			let description = license.description
			if (license.copyleft) {
				description = `${pc.magenta('🄯')}  ${description}`
			}

			return {
				value: license.spdx,
				label: license.name,
				hint: description
			}
		})
	})
}
if (!license) {
	license = defaultLicense
}

console.log(pc.gray('│'))

if (cli.flags.author === '') {
	console.log(
		pc.gray('│  -a specified without value, using git user.name as author')
	)
}

if (cli.flags.license === '') {
	console.log(
		pc.gray(
			`│  -l specified without value, using default license (${defaultLicense})`
		)
	)
}

const options = {
	type: projectType,
	name,
	author: authorName,
	license: license,
	log: text => {
		console.log(pc.gray(`│  ${text}`))
	}
}

await create(cwd, options)

p.outro('Done! happy hacking x3')

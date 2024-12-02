#!/usr/bin/env node
import fs from 'node:fs'
import * as p from '@hazycora/prompts'
import pc from 'picocolors'
import path from 'node:path'
import { getGitUser, toValidPackageName } from './utils.js'
import create from './index.js'
import meow from 'meow'
import licenses from './licenses.js'
import link from './link.js'

p.config.colors.symbol.initial = 'blue'
p.config.colors.symbol.active = 'blue'
p.config.colors.bar.initial = 'blue'
p.config.colors.bar.active = 'blue'
p.config.colors.checkbox.active = 'blue'

p.config.colors.symbol.submit = 'magenta'
p.config.colors.log.success = 'magenta'
p.config.colors.log.step = 'magenta'
p.config.colors.radio.active = 'magenta'
p.config.colors.checkbox.selected = 'magenta'
p.config.colors.key.active = ['inverse', 'bgMagenta', 'gray']

const defaultLicense = 'LicenseRef-OQL-1.2'
const defaultAuthor = await getGitUser().catch(() => undefined)

const { version, homepage } = JSON.parse(
	fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8')
)

const cli = meow(
	`
	${pc.bold(pc.underline('Usage'))}
	  ${pc.dim('$')} ${pc.magenta('pnpm')} create besties ${pc.dim('[project-name]')}

	${pc.bold(pc.underline('Options'))}
	  ${pc.bold('-t, --type <type>')}   	${pc.dim('(app, lib)')}
	  ${pc.bold('-a, --author <name>')} 	${pc.dim(`(default: ${defaultAuthor})`)}
	  ${pc.bold('-l, --license <spdx>')}	${pc.dim(`(default: ${defaultLicense})`)}

	${pc.bold(pc.underline('Examples'))}
	  ${pc.dim('$')} ${pc.magenta('pnpm')} create besties ${pc.dim('my-amazing-app')}
	  respond to the prompts to decide how to create your new project 🌈
	  ${pc.dim('$')} ${pc.magenta('pnpm')} create besties ${pc.dim(
			'my-amazing-app --type app'
		)}
	  make a new web-app project

	made with ${pc.magenta('♥')} by ${link('besties', 'https://besties.house')}

`,
	{
		importMeta: import.meta,
		description: 'Create new besties projects instantly.',
		version: `${pc.dim(link('create-besties', homepage))} v${version}`,
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
			},
			version: {
				type: 'boolean',
				shortFlag: 'v'
			}
		}
	}
)

if (cli.flags.help) {
	console.log(cli.help)
	process.exit(0)
}

let cwd = cli.input[0] || '.'

console.log(`
${pc.dim(`${link('create-besties', homepage, false)} v${version}`)}
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
	if (defaultAuthor) {
		authorName = defaultAuthor
	} else {
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

if (cli.flags.author === '') {
	p.log.warn(
		pc.dim('-a specified without value, using git user.name as author')
	)
}

if (cli.flags.license === '') {
	p.log.warn(
		pc.dim(
			`-l specified without value, using default license (${defaultLicense})`
		)
	)
}

const options = {
	type: projectType,
	name,
	author: authorName,
	license: license,
	log: text => {
		p.log.message(pc.dim(text))
	}
}

await create(cwd, options)

p.outro('Done! happy hacking x3')

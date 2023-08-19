#!/usr/bin/env node
import fs from 'node:fs'
import * as p from '@clack/prompts'
import { grey, bgMagenta, black, magenta, underline, bold } from 'kleur/colors'
import path from 'node:path'
import { toValidPackageName } from './utils.js'
import create from './index.js'
import meow from 'meow'

const cli = meow(
	`
	Create new besties projects instantly.

	${bold(underline('Usage'))}
	  ${grey('$')} ${magenta('pnpm')} init besties ${grey('[project-name]')}

	${bold(underline('Options'))}
	  ${bold('-t, --type <type>')}  	specify the project type to create (app or lib)

	${bold(underline('Examples'))}
	  ${grey('$')} ${magenta('npm')} init besties ${grey('my-amazing-app')}
	  respond to the prompts to decide how to create your new project 🌈
	  ${grey('$')} ${magenta('npm')} init besties ${grey(
			'my-amazing-app --type app'
		)}
	  make a new web-app project

	made with ${magenta('♥')} by besties

`,
	{
		importMeta: import.meta,
		flags: {
			type: {
				type: 'string',
				shortFlag: 't',
				choices: ['app', 'lib']
			}
		}
	}
)

let cwd = cli.input[0] || '.'

const { version } = JSON.parse(
	fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8')
)
console.log(`
${grey(`create-besties v${version}`)}
`)
p.intro(bgMagenta(black('hey bestie')))

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

console.log(grey('│'))

await create(cwd, name, projectType, text => {
	console.log(grey(`│  ${text}`))
})

p.outro('Done! happy hacking x3')

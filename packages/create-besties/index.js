import fs from 'node:fs'
import path from 'node:path'
import { create as createSvelte } from 'create-svelte'
import { prettyJSON, commandExists, getGitUser } from './utils.js'

const defaultLicense = {
	id: 'OQL-1.1',
	text: licensor => `# 🏳️‍🌈 Opinionated Queer License v1.1

© Copyright ${licensor}

## Permissions

The creators of this Work (“The Licensor”) grant permission
to any person, group or legal entity that doesn't violate the prohibitions below (“The User”),
to do everything with this Work that would otherwise infringe their copyright or any patent claims,
subject to the following conditions:

## Obligations

The User must give appropriate credit to the Licensor,
provide a copy of this license or a (clickable, if the medium allows) link to
[oql.avris.it/license/v1.1](https://oql.avris.it/license/v1.1),
and indicate whether and what kind of changes were made.
The User may do so in any reasonable manner,
but not in any way that suggests the Licensor endorses the User or their use.

## Prohibitions

No one may use this Work for prejudiced or bigoted purposes, including but not limited to:
racism, xenophobia, queerphobia, queer exclusionism, homophobia, transphobia, enbyphobia, misogyny.

No one may use this Work to inflict or facilitate violence or abuse of human rights as defined in the
[Universal Declaration of Human Rights](https://www.un.org/en/about-us/universal-declaration-of-human-rights).

No law enforcement, carceral institutions, immigration enforcement entities, military entities or military contractors
may use the Work for any reason. This also applies to any individuals employed by those entities.

No business entity where the ratio of pay (salaried, freelance, stocks, or other benefits)
between the highest and lowest individual in the entity is greater than 50 : 1
may use the Work for any reason.

No private business run for profit with more than a thousand employees
may use the Work for any reason.

Unless the User has made substantial changes to the Work,
or uses it only as a part of a new work (eg. as a library, as a part of an anthology, etc.),
they are prohibited from selling the Work.
That prohibition includes processing the Work with machine learning models.

## Sanctions

If the Licensor notifies the User that they have not complied with the rules of the license,
they can keep their license by complying within 30 days after the notice.
If they do not do so, their license ends immediately.

## Warranty

This Work is provided “as is”, without warranty of any kind, express or implied.
The Licensor will not be liable to anyone for any damages related to the Work or this license,
under any kind of legal claim as far as the law allows.
`
}

const packageManager = (await commandExists('pnpm')) ? 'pnpm' : 'npm'

export default async function create(cwd, options = {}) {
	const type = options.type
	const name = options.name
	if (!name) throw new Error('Project name is required')
	const log = options.log ?? (() => {})
	function copyFile(fromPath, toPath) {
		fs.writeFileSync(
			path.join(cwd, toPath),
			fs.readFileSync(new URL(fromPath, import.meta.url)),
			'utf-8'
		)
	}
	const pkgPath = path.join(cwd, 'package.json')
	let pkg
	const author = options.author ?? (await getGitUser())
	if (type == 'app') {
		log?.('Creating SvelteKit app')
		await createSvelte(cwd, {
			name,
			template: 'skeleton',
			types: 'typescript',
			prettier: true,
			eslint: true,
			playwright: false,
			vitest: false
		})
		log?.('Updating config files')
		pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
		pkg.author = author
		pkg.devDependencies = {
			'@besties/eslint-config': '0.2.4',
			'@hazycora/vite-plugin-svelte-svg': '^2.4.0',
			postcss: '^8.4.38',
			autoprefixer: '^10.4.19',
			'postcss-nesting': '^12.1.4',
			...pkg.devDependencies
		}
		pkg.devDependencies.prettier = '^3.2.5'
		pkg.devDependencies['eslint-plugin-svelte'] = '^2.32.4'
		pkg.devDependencies['prettier-plugin-svelte'] = '^3.0.3'
		copyFile('template/app/.prettierrc', '.prettierrc')
		copyFile('template/app/.eslintrc.cjs', '.eslintrc.cjs')
		copyFile('template/app/src/routes/+page.svelte', 'src/routes/+page.svelte')
		copyFile(
			'template/app/src/routes/+layout.svelte',
			'src/routes/+layout.svelte'
		)
		copyFile('template/app/src/app.pcss', 'src/app.pcss')
		copyFile('template/app/src/app.d.ts', 'src/app.d.ts')
		copyFile('template/app/vite.config.ts', 'vite.config.ts')
		copyFile('template/app/postcss.config.cjs', 'postcss.config.cjs')
	} else if (type == 'lib') {
		log?.('Initialising project')
		pkg = {
			name: name,
			author: author,
			description: '',
			main: 'build/index.ts',
			scripts: {
				build: 'tsc -p tsconfig.json'
			},
			type: 'module',
			keywords: [],
			devDependencies: {
				'@besties/eslint-config': '^0.2.4',
				'@typescript-eslint/eslint-plugin': '^6.13.2',
				'@typescript-eslint/parser': '^6.13.2',
				eslint: '^9.2.0',
				typescript: '^5.4.5',
				prettier: '^3.2.5'
			}
		}
		fs.mkdirSync(cwd, { recursive: true })
		fs.mkdirSync(path.join(cwd, 'src'), { recursive: true })
		log?.('Adding config files')
		copyFile('template/lib/.prettierrc', '.prettierrc')
		copyFile('template/lib/.prettierignore', '.prettierignore')
		copyFile('template/lib/.eslintrc.cjs', '.eslintrc.cjs')
		copyFile('template/lib/.eslintignore', '.eslintignore')
		copyFile('template/lib/gitignore', '.gitignore')
		copyFile('template/lib/tsconfig.json', 'tsconfig.json')
	} else {
		throw new Error('Unknown project type')
	}
	pkg.version = '0.1.0'
	pkg.license = defaultLicense.id
	pkg.scripts = pkg.scripts ?? {}
	pkg.scripts.lint = 'prettier --check . && eslint .'
	pkg.scripts.format = 'prettier --write .'
	if (packageManager == 'pnpm') pkg.scripts.preinstall = 'npx only-allow pnpm'
	fs.writeFileSync(path.join(cwd, 'README.md'), `# ${name}\n`, 'utf-8')
	fs.writeFileSync(
		path.join(cwd, 'LICENSE.md'),
		defaultLicense.text(author),
		'utf-8'
	)
	fs.writeFileSync(pkgPath, prettyJSON(pkg), 'utf-8')
}

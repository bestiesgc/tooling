import fs from 'node:fs'
import path from 'node:path'
import { create as createSvelte } from 'sv'
import { prettyJSON, commandExists, getGitUser } from './utils.js'

const defaultLicense = 'OQL-1.1'

const packageManager = (await commandExists('pnpm')) ? 'pnpm' : 'npm'

export default async function create(cwd, options = {}) {
	const type = options.type
	const name = options.name
	const license = options.license ?? defaultLicense
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
	const licenseText = fs
		.readFileSync(new URL('template/LICENSE.md', import.meta.url), 'utf-8')
		.replace('{Licensor}', author)
	if (type == 'app') {
		log?.('Creating SvelteKit app')
		await createSvelte(cwd, {
			name,
			template: 'minimal',
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
			'@besties/eslint-config': '^0.2.5',
			'@hazycora/vite-plugin-svelte-svg': '^2.4.2',
			postcss: '^8.4.49',
			autoprefixer: '^10.4.20',
			'postcss-nesting': '^13.0.1',
			...pkg.devDependencies
		}
		// pkg.devDependencies.prettier = '^3.4.1'
		// pkg.devDependencies['eslint-plugin-svelte'] = '^2.32.4'
		// pkg.devDependencies['prettier-plugin-svelte'] = '^3.0.3'
		copyFile('template/app/.prettierrc', '.prettierrc')
		copyFile('template/app/eslint.config.mjs', 'eslint.config.mjs')
		copyFile('template/app/src/routes/+page.svelte', 'src/routes/+page.svelte')
		copyFile(
			'template/app/src/routes/+layout.svelte',
			'src/routes/+layout.svelte'
		)
		copyFile('template/app/src/app.pcss', 'src/app.pcss')
		copyFile('template/app/src/app.d.ts', 'src/app.d.ts')
		copyFile('template/app/vite.config.ts', 'vite.config.ts')
		copyFile('template/app/postcss.config.mjs', 'postcss.config.mjs')
	} else if (type == 'lib') {
		log?.('Initialising project')
		pkg = {
			name: name,
			version: '0.1.0',
			author: author,
			description: '',
			main: 'build/index.ts',
			scripts: {
				build: 'tsc -p tsconfig.json'
			},
			type: 'module',
			keywords: [],
			dependencies: {},
			devDependencies: {
				'@besties/eslint-config': '^0.2.5',
				'@typescript-eslint/eslint-plugin': '^8.16.0',
				'@typescript-eslint/parser': '^8.16.0',
				eslint: '^8.0.0',
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
	pkg.license = license
	pkg.scripts = pkg.scripts ?? {}
	pkg.scripts.lint = 'prettier --check . && eslint .'
	pkg.scripts.format = 'prettier --write .'
	fs.writeFileSync(path.join(cwd, 'README.md'), `# ${name}\n`, 'utf-8')
	fs.writeFileSync(path.join(cwd, 'LICENSE.md'), licenseText, 'utf-8')
	fs.writeFileSync(pkgPath, prettyJSON(pkg), 'utf-8')
}

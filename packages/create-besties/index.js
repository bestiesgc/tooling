import fs from 'node:fs'
import path from 'node:path'
import { create as createSvelte } from 'create-svelte'
import { prettyJSON, commandExists } from './utils.js'

const defaultLicense = 'GPL-3.0-or-later'

const packageManager = (await commandExists('pnpm')) ? 'pnpm' : 'npm'

export default async function create(cwd, name, type = 'app', log = false) {
	function copyFile(fromPath, toPath) {
		fs.writeFileSync(
			path.join(cwd, toPath),
			fs.readFileSync(new URL(fromPath, import.meta.url)),
			'utf-8'
		)
	}
	const pkgPath = path.join(cwd, 'package.json')
	let pkg
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
		pkg.license = defaultLicense
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
		copyFile('template/app/vite.config.ts', 'vite.config.ts')
		copyFile('template/app/postcss.config.cjs', 'postcss.config.cjs')
	} else if (type == 'lib') {
		log?.('Initialising project')
		pkg = {
			name: name,
			description: '',
			main: 'build/index.ts',
			scripts: {
				build: 'tsc -p tsconfig.json'
			},
			type: 'module',
			keywords: [],
			author: '',
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
	copyFile('LICENSE', 'LICENSE')
	pkg.version = '0.1.0'
	pkg.license = defaultLicense
	pkg.scripts = pkg.scripts ?? {}
	pkg.scripts.lint = 'prettier --check . && eslint .'
	pkg.scripts.format = 'prettier --write .'
	if (packageManager == 'pnpm') pkg.scripts.preinstall = 'npx only-allow pnpm'
	fs.writeFileSync(path.join(cwd, 'README.md'), `# ${name}\n`, 'utf-8')
	fs.writeFileSync(pkgPath, prettyJSON(pkg), 'utf-8')
}

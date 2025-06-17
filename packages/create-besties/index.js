import fs from 'node:fs'
import path from 'node:path'
import { create as createSvelte } from 'sv'
import { prettyJSON, getGitUser, sortKeys } from './utils.js'
import licenses from './licenses.js'

export default async function create(cwd, options = {}) {
	const type = options.type
	const name = options.name
	const licenseSpdx = options.license
	if (!name) throw new Error('Project name is required')
	const log = options.log ?? (() => {})
	function copyFile(fromPath, toPath) {
		fs.writeFileSync(
			path.join(cwd, toPath),
			fs.readFileSync(new URL(fromPath, import.meta.url)),
			'utf-8'
		)
	}
	function sedFile(filePath, findExpression, replaceString) {
		filePath = path.join(cwd, filePath)
		const current = fs.readFileSync(filePath, 'utf-8')
		fs.writeFileSync(
			filePath,
			current.replaceAll(findExpression, replaceString),
			'utf-8'
		)
	}
	const pkgPath = path.join(cwd, 'package.json')
	let pkg
	const author = options.author ?? (await getGitUser())
	let licenseText

	const license = licenses.find(licenseSpdx)
	if (!license) {
		throw new Error(`License ${licenseSpdx} not found`)
	}

	const currentYear = new Date().getFullYear()
	licenseText = license.text(author, currentYear)

	if (type == 'app') {
		log?.('Creating SvelteKit app')
		await createSvelte(cwd, {
			name,
			template: 'minimal',
			types: 'typescript'
		})
		log?.('Updating config files')
		pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
		pkg.author = author
		pkg.devDependencies = sortKeys({
			...pkg.devDependencies,
			'@besties/eslint-config': '^0.3.0',
			'@eslint/js': '^9.29.0',
			'@hazycora/vite-plugin-svelte-svg': '^2.4.2',
			autoprefixer: '^10.4.20',
			eslint: '^9.29.0',
			'eslint-config-prettier': '^10.1.5',
			'eslint-plugin-svelte': '^3.9.2',
			globals: '^16.2.0',
			postcss: '^8.4.49',
			'postcss-nesting': '^13.0.1',
			prettier: '^3.5.3',
			'prettier-plugin-svelte': '^3.4.0',
			'typescript-eslint': '^8.34.1'
		})
		sedFile('svelte.config.js', /;$/gm, '')
		copyFile('template/app/.prettierrc', '.prettierrc')
		copyFile('template/app/.prettierignore', '.prettierignore')
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
			devDependencies: sortKeys({
				'@besties/eslint-config': '^0.3.0',
				'@eslint/js': '^9.29.0',
				eslint: '^9.29.0',
				'eslint-config-prettier': '^10.1.5',
				globals: '^16.2.0',
				prettier: '^3.2.5',
				typescript: '^5.0.0',
				'typescript-eslint': '^8.34.1'
			})
		}
		fs.mkdirSync(cwd, { recursive: true })
		fs.mkdirSync(path.join(cwd, 'src'), { recursive: true })
		log?.('Adding config files')
		copyFile('template/lib/.prettierrc', '.prettierrc')
		copyFile('template/lib/.prettierignore', '.prettierignore')
		copyFile('template/lib/eslint.config.mjs', 'eslint.config.mjs')
		copyFile('template/lib/gitignore', '.gitignore')
		copyFile('template/lib/tsconfig.json', 'tsconfig.json')
	} else {
		throw new Error('Unknown project type')
	}
	pkg.version = '0.1.0'
	pkg.license = license.spdx
	pkg.scripts = pkg.scripts ?? {}
	pkg.scripts.lint = 'prettier --check . && eslint .'
	pkg.scripts.format = 'prettier --write .'
	fs.writeFileSync(path.join(cwd, 'README.md'), `# ${name}\n`, 'utf-8')
	fs.writeFileSync(
		path.join(cwd, license.markdown ? 'LICENSE.md' : 'LICENSE'),
		licenseText,
		'utf-8'
	)
	fs.writeFileSync(pkgPath, prettyJSON(pkg), 'utf-8')
}

import fs from 'node:fs'

const licenses = [
	{
		spdx: 'LicenseRef-OQL-1.2',
		name: 'Opinionated Queer License v1.2',
		copyleft: true,
		markdown: true,
		description:
			'A license prohibiting the use of this software by bigots and oppressors.'
	},
	{
		spdx: 'AGPL-3.0',
		name: 'GNU Affero General Public License v3.0',
		copyleft: true,
		description:
			'A strong copyleft license that requires the distribution of the source code of the software. Perfect for networked software.'
	},
	{
		spdx: 'GPL-3.0',
		name: 'GNU General Public License v3.0',
		copyleft: true,
		description:
			'A strong copyleft license that requires the distribution of the source code of the software.'
	},
	{
		spdx: 'MIT',
		name: 'MIT License',
		copyleft: false,
		description:
			'A permissive license that is short and to the point, requiring a copyright notice and attribution.'
	},
	{
		spdx: '0BSD',
		name: 'BSD Zero Clause License',
		copyleft: false,
		description: 'A public-domain-equivalent license.'
	}
].map(license => {
	const spdx = license.spdx
	const licensePath = new URL(`licenses/${spdx}`, import.meta.url)
	const text = fs.readFileSync(licensePath, 'utf-8').trimEnd() + '\n'

	return {
		...license,
		text: (licensor, year) =>
			text.replace(/\{Year\}/g, year).replace(/\{Licensor\}/g, licensor)
	}
})

function findLicense(spdx) {
	for (const license of licenses) {
		if (license.spdx === spdx) {
			return license
		}
	}
	return undefined
}

licenses.find = findLicense

export { licenses, licenses as default }

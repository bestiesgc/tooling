import { stdout as stdoutSupportsHyperlink } from 'supports-hyperlinks'
import { grey, underline } from 'kleur/colors'

const OSC = `\u001B]`
const SEP = ';'
const ST = `\u001B\\`

export default function link(text, url, mdFallback = true) {
	if (!stdoutSupportsHyperlink) {
		if (!mdFallback) {
			return text
		}
		return `${grey('[')}${text}${grey('](')}${underline(url)}${grey(')')}`
	}

	const link = `${OSC}8${SEP}${SEP}${url}${ST}${text}${OSC}8${SEP}${SEP}${ST}`

	// Adding an underline
	return underline(link)
}

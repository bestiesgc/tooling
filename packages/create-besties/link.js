import { stdout as stdoutSupportsHyperlink } from 'supports-hyperlinks'
import pc from 'picocolors'

const OSC = `\u001B]`
const SEP = ';'
const ST = `\u001B\\`

export default function link(text, url, mdFallback = true) {
	if (!stdoutSupportsHyperlink) {
		if (!mdFallback) {
			return text
		}
		return `${pc.gray('[')}${text}${pc.gray('](')}${pc.underline(url)}${pc.gray(')')}`
	}

	const link = `${OSC}8${SEP}${SEP}${url}${ST}${text}${OSC}8${SEP}${SEP}${ST}`

	// Adding an underline
	return pc.underline(link)
}

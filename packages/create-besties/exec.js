import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
export default promisify(execCb)

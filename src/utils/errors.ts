import chalk from "chalk";
import { error } from "./error";

export class CLIError extends Error {
	name = this.constructor.name

	constructor(message: string, type: string = "") {
		super()

		error(`${chalk.blue(type)} ${message}`)

		process.exit(1)
	}
}
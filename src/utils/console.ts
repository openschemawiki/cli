import chalk from "chalk";

export function ensureNoConsoleOverrun(str: string) {
	if (str.length > process.stdout.columns) {
		return str.slice(0, process.stdout.columns / 2 - 5) + "[...]" + str.slice(-process.stdout.columns / 2 + 5);
	} else {
		return str
	}
}

export function warn(str: string) {
	console.log(`${chalk.bold(`openschema`)} ${chalk.yellow("warn")} ${str}`)
}
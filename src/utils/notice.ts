import chalk from "chalk";

export function notice(str: string) {
	console.log(`${chalk.bold(`openschema`)} ${chalk.cyan("notice")} ${str}`)
}
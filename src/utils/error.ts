import chalk from "chalk";

export function error(str: string) {
	console.log(`${chalk.bold(`openschema`)} ${chalk.red("error")} ${str}`)
}
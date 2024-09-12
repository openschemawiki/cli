import chalk from "chalk";

export function success(str: string) {
	console.log(`${chalk.bold(`openschema`)} ${chalk.green("success")} ${str}`)
}
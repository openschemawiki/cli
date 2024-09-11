import chalk from "chalk";
import { Command, program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import * as fs from "fs"
import * as tar from "tar"
import * as path from "path"

export const pullCommand = new Command("pull")
	.description("Pull a schema from the OpenSchema Store")
	.argument("<name>", "name of the schema")
	.argument("[location]", "location to save the schema to", process.cwd())
	.action(async (name, location) => {
		const spinner = ora("Pulling schema").start();

		let result: Response;
		// Check if the name contains version information
		if (name.indexOf(":") > -1) {
			const [identifier, version] = name.split(":");

			name = identifier;

			result = await fetch(
				`http://localhost:3000/api/schema.json?name=${identifier}&version=${version}`,
				{
					method: "GET",
				}
			);
		} else {
			result = await fetch(
				`http://localhost:3000/api/schema.json?name=${name}`,
				{
					method: "GET",
				}
			);
		}

		if (!result.ok) {
			spinner.fail("Something went wrong.");
			console.log(await result.text());
			return;
		}
		

		const schema = await result.json();

		spinner.stop();

		if (fs.existsSync(location)) {
			const answers = await inquirer.prompt([
				{
					type: "confirm",
					message: `The desired location at '${location}' is not empty, do you want to save anyways?`,
					name: "overwrite",
					default: false,
				},
			]);

			if (answers.overwrite === false) {
				console.log(chalk.red("Aborted"));
				return;
			}
		}

		// The tarball is base64 encoded.
		// We need to convert it to a buffer and write it to the directory
		const buffer = Buffer.from(schema.tarballBase64, "base64");

		const extract = tar.extract()

		extract.end(buffer)

		console.log(`Schema '${chalk.bold(name)}' saved to '${chalk.bold(location)}'`);
	});
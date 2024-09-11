import chalk from "chalk";
import { Argument, Command } from "commander";
import * as fs from "fs"
import semver from "semver";
import { join } from "path"

export const versionCommand = new Command("version")
	.addArgument(new Argument("<type>", "what modification to apply to the version number").choices(["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"]))
	.action(async (type) => {
		// Make sure the cwd has an "openschema.json" config file
		const cwd = process.cwd()

		const configFilePath = join(cwd, "openschema.json")

		if (!fs.existsSync(configFilePath)) {
			console.log(chalk.bold.red("The current working directory does not contain an 'openschema.json' config file."))
			return
		}

		const configText = fs.readFileSync(configFilePath, "utf-8")

		try {
			const configJson = JSON.parse(configText)

			if (!("version" in configJson)) {
				console.log(chalk.bold.red("The config file does not contain a version field. Please add one manually."));
				return
			}

			const parsedVersion = semver.parse(configJson.version)

			if (parsedVersion === null) {
				console.log(chalk.bold.red("The version field of your config file could not be parsed. Please make sure it's a valid semantic version number."));
				return
			}

			parsedVersion.inc(type)

			configJson.version = parsedVersion.toString()
			fs.writeFileSync(configFilePath, JSON.stringify(configJson, null, 2), "utf-8");
			console.log(chalk.bold.green("Successfully bumped the version number of your schema."));
		} catch(e){
			console.log(chalk.bold.red("Something went wrong parsing the 'openschema.json' config file, make sure it's valid json and try again."));
		}
	})
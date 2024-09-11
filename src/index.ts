import chalk from "chalk";
import { Command } from "commander";
import * as fs from "fs"
import inquirer from "inquirer";
import ora from "ora";
import ZSchema from "z-schema";
import * as path from "path"
import semver from "semver";

const version = require("../package.json").version;
export const program = new Command();

program
	.name("openschema")
	.description("The CLI for the OpenSchema Store")
	.version(version, "-v, --version", "output the current version");

program
	.command("pull")
	.description("Pull a schema from the OpenSchema Store")
	.argument("<name>", "name of the schema")
	.argument("[file]", "file to save the schema to", undefined)
	.action(async (name, file) => {
		const spinner = ora("Pulling schema").start();

		let result: Response;
		// Check if the name contains version information
		if (name.indexOf(":") > -1) {
			const [identifier, version] = name.split(":")

			name = identifier

			result = await fetch(`http://localhost:3000/api/schema.json?name=${identifier}&version=${version}`, {
				method: "GET",
			})
		} else {
			result = await fetch(`http://localhost:3000/api/schema.json?name=${name}`, {
				method: "GET",
			})
		}

		

		if (!result.ok) {
			spinner.fail("Something went wrong.")
			console.log(await result.text())
			return
		}
		
		const schema = await result.json()

		spinner.stop();

		if (file === undefined) {
			// No file name was specified, just write to a file with the schema name
			file = `${name}.json`
		}

		if (fs.existsSync(file)) {
			const answers = await inquirer.prompt([
				{
					type: "confirm",
					message: `File '${file}' already exists, do you want to overwrite it?`,
					name: "overwrite",
					default: false
				}
			])

			if (answers.overwrite === false) {
				console.log(chalk.red("Aborted"))
				return
			}
		}

		fs.writeFileSync(file, JSON.stringify(schema, null, 2))

		console.log(chalk.green(`Schema '${name}' saved to '${file}'`))
	});

	program
	.command("find")
	.description("Search the OpenSchema Store for a schema")
	.argument("[name]", "name of the schema")
	.option("--version <version>", "A version constraint for your search query. (>... will result in all versions greater than the one searched for)")
	.option("--category <category>", "Category constraint")
	.option("--tags <tags...>", "Tags constraint")
	.action(async (name, options) => {
		const spinner = ora("Looking everywhere 👀").start();

		const body: {
			name: string,
			version?: string,
			category?: string,
			tags?: string[]
		} = {
			name
		}

		if (options.version) {
			body.version = options.version
		} else if (options.category) {
			body.category = options.category
		} else if (options.tags) {
			body.tags = options.tags
		}

		const result = await fetch(`http://localhost:3000/api/search`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json"
			}
		})

		spinner.stop();

		if (!result.ok) {
			console.log(chalk.redBright("Something went wrong!"))
			console.log(await result.text());
			return
		}
		
		const schemas = await result.json()

		for (const schema of schemas) {
			console.log(`${chalk.bold.blue(schema.name)}`)

			if (schema.description) {
				console.log(`${schema.description || ""}`);
			}

			console.log(`Version ${chalk.blue(schema.version)} published ${chalk.blue(schema.created)}`);
			

			if (schema.tags.length > 0) {
				console.log(`Tags: ${chalk.blue(schema.tags.join(", "))}`);
			}

			console.log(`Category: ${chalk.blue(schema.category)}`);

			console.log(`Status: ${chalk.bold.blue(schema.status)} and ${chalk.blue(schema.downloads)} downloads`);
			console.log(chalk.blue(`https://openschema.wiki/schemas/${schema.name}/${schema.version}`));
		
			console.log();
		}
	});


	program.command("push")
		.argument("<file>", "the file path to the schema you want to upload")
		.action(async (file) => {
			if (!fs.existsSync(file)) {
				console.log(`File '${file}' does not exist.`)
				return
			}

			const content = fs.readFileSync(file, "utf-8");
			const json = JSON.parse(content)

			const validator = new ZSchema({
				strictMode: false
			})

			// Check if the schema has an $id property. it should not have one since we will set one by ourselves
			if ("$id" in json) {
				const { overwrite } = await inquirer.prompt([
					{
						type: "confirm",
						message: "Your schema contains an $id field. This will be automatically set by OpenSchema after the schema was pushed. Do you want to continue? This will remove the $id field and replace it after we're done.",
						default: false,
						name: "overwrite"
					}
				])

				if (!overwrite) {
					return;
				}
			}

			if (!validator.validateSchema(json)) {
				console.log("Your schema could not be validated!");
			}

			// Collect some additional information using inquirer
			const { name } = await inquirer.prompt([
				{
					type: "input",
					message: "What is your schema's identifier? (name)",
					name: "name",
					required: true,
					default: path.parse(file).name
				}
			])

			// Try to find the latest version of the package
			const request = await fetch("http://localhost:3000/api/search", {
				method: "POST",
				body: JSON.stringify({
					name
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})
			
			let defaultVersion: string | null = null
			if (request.ok) {
				try {
					const json = await request.json()

					// Make sure we got the right package
					if (json.length > 0 || json[0].name === name) {
						// Infer the version by bumping the version number by a patch
						const version = semver.parse(json[0].version)

						if (version !== null) {
							defaultVersion = version.inc("patch").toString();
						}	
					}
				} catch(e) {}
			}

			const {  version, description, category, tags } = await inquirer.prompt([
				{
					type: "input",
					message: "What version do you intend to push?",
					name: "version",
					required: true,
					default: defaultVersion || ""
				},
				{
					type: "input",
					message: "Write a short description for your schema.",
					name: "description",
					required: true,
					default: json.description || ""
				},
				{
					type: "input",
					message: "What category does your schema belong to?",
					name: "category"
				},
				{
					type: "input",
					message: "What tags would describe your schema best (separated by commas)?",
					name: "tags"
				},
			]);

			console.clear()

			const spinner = ora("Please hang tight while we verify and upload your schema.").start()

			const response = await fetch("http://localhost:3000/api/schema.json", {
				method: "PUT",
				body: JSON.stringify({
					name,
					version,
					description,
					category,
					tags: (tags as string).split(",").map(category => category.trim()).filter(x => x),
					schema: json
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})

			if (response.ok) {
				spinner.succeed("Alrighty! Looks like we're good to go! Your schema was submitted for review.")
			} else {
				spinner.fail("Looks like something went wrong...")
				console.log(await response.text());
			}
		})
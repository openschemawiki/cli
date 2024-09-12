import chalk from "chalk";
import { Command, program } from "commander";
import ora from "ora";
import { API_URL } from "./shared";


export const findCommand = new Command("find")
	.description("Search the OpenSchema Store for a schema")
	.argument("[name]", "name of the schema")
	.option(
		"--version <version>",
		"A version constraint for your search query. (>... will result in all versions greater than the one searched for)"
	)
	.option("--category <category>", "Category constraint")
	.option("--tags <tags...>", "Tags constraint")
	.action(async (name, options) => {
		const spinner = ora("Looking everywhere 👀").start();

		const body: {
			name: string;
			version?: string;
			category?: string;
			tags?: string[];
		} = {
			name,
		};

		if (options.version) {
			body.version = options.version;
		} else if (options.category) {
			body.category = options.category;
		} else if (options.tags) {
			body.tags = options.tags;
		}

		const result = await fetch(`${API_URL}/search`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"Content-Type": "application/json",
			},
		});

		spinner.stop();

		if (!result.ok) {
			console.log(chalk.redBright("Something went wrong!"));
			console.log(await result.text());
			return;
		}

		const schemas = await result.json();

		for (const schema of schemas) {
			console.log(`${chalk.bold.blue(schema.name)}`);

			if (schema.description) {
				console.log(`${schema.description || ""}`);
			}

			console.log(
				`Version ${chalk.blue(schema.version)} published ${chalk.blue(
					schema.created
				)}`
			);

			if (schema.tags.length > 0) {
				console.log(`Tags: ${chalk.blue(schema.tags.join(", "))}`);
			}

			console.log(`Category: ${chalk.blue(schema.category)}`);

			console.log(
				`Status: ${chalk.bold.blue(schema.status)} and ${chalk.blue(
					schema.downloads
				)} downloads`
			);
			console.log(
				chalk.blue(
					`https://openschema.wiki/schemas/${schema.name}/${schema.version}`
				)
			);

			console.log();
		}
	});
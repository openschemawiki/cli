import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { CLIError } from "./utils/errors";
import { Mime } from "mime";
import tsj from "ts-json-schema-generator";
import { warn } from "./utils/console";
import inquirer from "inquirer";

export const compileCommand = new Command("compile")
	.description("Search the OpenSchema Store for a schema")
	.argument(
		"<file>",
		"The schema file to compile to a compatible JSON schema."
	)
	.option(
		"-o, --output <file>",
		"The output file to write the JSON schema to.",
		"schema.json"
	)
	.option("-t, --type <type>", "The type to generate the schema for.", "*")
	.option(
		"-c, --config <file>",
		"The tsconfig.json file to use.",
		"tsconfig.json"
	)
	.action(async (file, options) => {
		const filePath = path.resolve(file);

		if (!fs.existsSync(filePath)) {
			throw new CLIError(`could not find '${filePath}'`);
		}

		const mime = new Mime();
		mime.define({
			"application/typescript": ["ts"],
		});

		const mimeType = mime.getType(filePath);

		if (mimeType === "application/typescript") {
			const config: tsj.Config = {
				path: filePath,
				tsconfig: options.config,
				type: options.type,
			};

			const schema = tsj
				.createGenerator(config)
				.createSchema(config.type);

			// Check if there is already a schema.json file
			const out = options.output;
			if (fs.existsSync(out)) {
				warn(`schema file '${out}' already exists`);
				const { overwrite } = await inquirer.prompt([
					{
						message:
							"Do you want to overwrite the existing schema.json file?",
						type: "confirm",
						name: "overwrite",
						default: false,
					},
				]);

				if (!overwrite) {
					return;
				}
			}

			fs.writeFileSync(out, JSON.stringify(schema, null, 2));
		} else {
			throw new CLIError(`unsupported mime type '${mimeType}'`);
		}
	});

import { Command } from "commander";
import inquirer from "inquirer";
import * as fs from "fs"
import ZSchema from "z-schema"
import semver from "semver"
import { getConfig } from "./lib/getConfig";
import { getSchema } from "./lib/getSchema";
import * as tar from "tar"
import { notice } from "./utils/notice";
import { formatByteSize } from "./utils/bytesize";
import { success } from "./utils/success";
import { error } from "./utils/error";
import chalk from "chalk";
import { CLIError } from "./utils/errors";
import crypto from "crypto";
import { ensureNoConsoleOverrun } from "./utils/console";

export const pushCommand = new Command("push")
	.argument("[dir]", "the directory where all the schema files are located", process.cwd())
	.description("Pushes the schema inside the current working directory to the OpenSchema registry.")
	.action(async (dir) => {
		// Try finding the config file
		const config = getConfig(dir);

		if (config === null) {
			throw new CLIError("Could not find a openschema.json file in the current working directory.", "enoent");
		}

		if (!("name" in config)) {
			throw new CLIError("Your openschema.json file is missing a name field.");
		}

		if (!("version" in config)) {
			throw new CLIError("Your openschema.json file is missing a version field.");
		}

		if (!("description" in config) || !config.description) {
			throw new CLIError("Your openschema.json file is missing a description field.");
		}

		if (!("category" in config)) {
			throw new CLIError("Your openschema.json file is missing a category field.");
		}

		// Check if the schema file exists
		const schema = getSchema(dir)

		if (!schema) {
			throw new CLIError("Could not find a schema.json file in the current working directory.", "enoent");
		}

		// Check if the schema has an $id property. it should not have one since we will set one by ourselves
		if ("$id" in schema) {
			const { overwrite } = await inquirer.prompt([
				{
					type: "confirm",
					message:
						"Your schema contains an $id field. This will be automatically set by OpenSchema after the schema was pushed. Do you want to continue? This will remove the $id field and replace it after we're done.",
					default: false,
					name: "overwrite",
				},
			]);

			if (!overwrite) {
				return;
			}
		}

		const validator = new ZSchema({
			strictMode: false
		});

		if ("$schema" in schema) {
			// ZSchema can not handle an existing $schema property as it uses draft-04 when meta-validating schemas.
			// So we need to delete it, prefetch the schema and provide it like that.
			try {
				const request = await fetch(schema.$schema as string)

				const validationSchema = await request.json()
				
				delete validationSchema.$schema
				delete schema.$schema;

				if (!validator.validate(schema, validationSchema)) {
					throw new CLIError("Your schema could not be validated!");
				}
			} catch(e) {
				error(`Attempting to use ${schema.$schema} as validation schema resulted in an error.`)
				throw new CLIError((e as Error).message);
			}
		} else {
			if (!validator.validateSchema(schema)) {
				throw new CLIError("Your schema could not be validated!");
			}
		}


		// Try to find the latest version of the package
		const request = await fetch("http://localhost:3000/api/search", {
			method: "POST",
			body: JSON.stringify({
				name: config.name,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		let defaultVersion: string | null = null;
		if (request.ok) {
			try {
				const json = await request.json();

				// Make sure we got the right package
				if (json.length > 0 || json[0].name === name) {
					// Infer the version by bumping the version number by a patch
					const version = semver.parse(json[0].version);

					if (version !== null) {
						defaultVersion = version.inc("patch").toString();
					}
				}
			} catch (e) {}
		}

		// Enter the directory so that we don't have any trailing paths and we can easily lstat
		process.chdir(dir)

		const paths = fs.readdirSync(".")

		notice(`📦 ${config.name}`)
		notice(chalk.blue("Tarball Contents"))

		let size = 0;
		let fileCount = 0;
		const zipped = tar.create({
			gzip: true,
			preservePaths: false,
			follow: true,
			portable: true,
			async onWriteEntry(entry) {
				// Get the entry size
				const stats = fs.lstatSync(entry.path)

				notice(`${formatByteSize(stats.size)} ${entry.path}`)
				size += stats.size;
				fileCount++
			}
		}, paths)

		const buffer = await new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = []
			zipped.on("data", (chunk) => chunks.push(chunk))
			zipped.on("end", () => resolve(Buffer.concat(chunks)))
			zipped.on("error", reject)
		})

		notice(`unpacked size: ${chalk.bold(formatByteSize(size))}`)
		notice(`package size: ${chalk.bold(formatByteSize(buffer.byteLength))}`)

		const sha512 = crypto.createHash("sha512").update(buffer).digest("hex")
		const sha512Buffer = Buffer.from(sha512)
		const integrity = `sha512-${sha512Buffer.toString("base64")}`

		notice(`sha512: ${ensureNoConsoleOverrun(sha512)}`)
		notice(`integrity: ${ensureNoConsoleOverrun(integrity)}`)
		notice(`total files: ${fileCount}`)
		notice("")
		notice(`Publishing to https://openschema.wiki/ with tag latest and default access`)


		const body = new FormData()
		body.set("tarball", new Blob([buffer]))
		body.set("name", config.name)
		body.set("description", config.description)
		body.set("category", config.category)
		body.set("tags", config.tags?.join(","))
		body.set("version", config.version)

		const response = await fetch("http://localhost:3000/api/schema.json", {
			method: "PUT",
			body
		});

		if (response.ok) {
			success(
				"Your schema was successfully submitted for review."
			);
		} else {
			error("Looks like something went wrong...");
			error(await response.text());
		}
	});



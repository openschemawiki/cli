import { Command, program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import * as fs from "fs"
import ZSchema from "z-schema"
import * as path from "path"
import semver from "semver"
import { getConfig } from "./lib/getConfig";
import { getSchema } from "./lib/getSchema";
import * as tar from "tar"

export const pushCommand = new Command("push")
	.argument("[dir]", "the directory where all the schema files are located", process.cwd())
	.description("Pushes the schema inside the current working directory to the OpenSchema registry.")
	.action(async (dir) => {
		// Try finding the config file
		const config = getConfig(dir);

		if (config === null) {
			console.log("Could not find a openschema.json file in the current working directory.");
			return;
		}

		if (!("name" in config)) {
			console.log("Your openschema.json file is missing a name field.");
			return;
		}

		if (!("version" in config)) {
			console.log("Your openschema.json file is missing a version field.");
			return;
		}

		if (!("description" in config) || !config.description) {
			console.log("Your openschema.json file is missing a description field.");
			return;
		}

		if (!("category" in config)) {
			console.log("Your openschema.json file is missing a category field.");
			return;
		}

		// Check if the schema file exists
		const schema = getSchema(dir)

		if (!schema) {
			console.log("Could not find a schema.json file in the current working directory.");
			return;
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

		if (!validator.validateSchema(schema)) {
			console.log("Your schema could not be validated!");
			return
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

		console.clear();

		const spinner = ora(
			"Please hang tight while we verify and upload your schema."
		).start();

		const zipped = tar.create({
			gzip: false
		}, [dir])
		// Retrieve the buffer without writing to disk
		const buffer = await new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = []
			zipped.on("data", (chunk) => chunks.push(chunk))
			zipped.on("end", () => resolve(Buffer.concat(chunks)))
			zipped.on("error", reject)
		})

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
			spinner.succeed(
				"Alrighty! Looks like we're good to go! Your schema was submitted for review."
			);
		} else {
			spinner.fail("Looks like something went wrong...");
			console.log(await response.text());
		}
	});



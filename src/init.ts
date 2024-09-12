import chalk from "chalk";
import { Command, program } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import * as fs from "fs"
import { findLicense, getLicense } from "license";
import { join } from "path"
import { notice } from "./utils/notice";
import { success } from "./utils/success";

export const initCommand = new Command("init")
.action(async () => {
	console.log("Let's get started!\n");

	// Only alphanumeric characters, hyphen and underscore are allowed.
	const disallowedCharacters = /[^a-zA-Z0-9-_]/g;

	const { name } = await inquirer.prompt([
		{
			name: "name",
			type: "input",
			message:
				"What should your new Schema be called? Only alphanumeric, hyphen and underscore are allowed.",
			required: true,
			validate(value) {
				return !value.match(disallowedCharacters);
			},
		},
	]);

	const { path } = await inquirer.prompt([
		{
			message: "Where do you want to create your new project?",
			name: "path",
			type: "input",
			default: `./${name}`,
		},
	]);

	if (fs.existsSync(path)) {
		const { overwrite } = await inquirer.prompt([
			{
				type: "confirm",
				message:
					"The directory you entered already exists. Do you want to overwrite it?",
				default: false,
				name: "overwrite",
			},
		]);

		if (!overwrite) {
			return;
		}
	}

	// Create the directory
	fs.mkdirSync(path, {
		recursive: true,
	});

	// Create the schema file, the README, CHANGELOG and LICENSE
	// Check if we should generate a license
	const { generateLicense } = await inquirer.prompt([
		{
			type: "confirm",
			message:
				"Would you like to generate a license for your new schema?",
			default: true,
			name: "generateLicense",
		},
	]);

	if (generateLicense) {
		// Get the license
		const { license, author } = await inquirer.prompt([
			{
				name: "license",
				message: "Let's choose a license for your new schema.",
				type: "search",
				source(term: string | undefined, opt) {
					if (term === undefined) {
						return [];
					}

					return findLicense(term);
				},
			},
			{
				message: "What author should your license refer to?",
				name: "author",
				type: "input",
			},
		]);

		const licenseText = getLicense(license, {
			author,
			year: new Date().getFullYear().toString(),
		});

		fs.writeFileSync(join(path, "LICENSE"), licenseText, "utf-8");
	}

	const { typescript } = await inquirer.prompt([
		{
			type: "confirm",
			message:
				"Are you planning on using typescript?",
			default: false,
			name: "typescript",
		},
	]);

	if (typescript) {
		fs.writeFileSync(
			join(path, "tsconfig.json"),
			JSON.stringify({
				"compilerOptions": {
					// Enable latest features
					"lib": ["ESNext", "DOM"],
					"target": "ESNext",
					"module": "ESNext",
					"moduleDetection": "force",
					"allowJs": true,
			
					// Best practices
					"strict": true,
					"skipLibCheck": true,
					"noFallthroughCasesInSwitch": true,
			
					// Some stricter flags (disabled by default)
					"noUnusedLocals": false,
					"noUnusedParameters": false,
					"noPropertyAccessFromIndexSignature": false,
				},
				"files": ["./schema.ts"]
			}, null, 2),
			"utf-8"
		);

		fs.writeFileSync(
			join(path, "schema.ts"),
			`export interface ${name} {\n\n}`,
			"utf-8"
		);

		notice("initialized with typescript support");
		notice("use 'openschema compile schema.ts' to compile to a json schema");
	}

	fs.writeFileSync(
		join(path, "README.md"),
		`# ${name}\n\nThis is the readme for your new schema. Customize it how you see fit.`
	);
	fs.writeFileSync(join(path, "CHANGELOG.md"), "", "utf-8");
	fs.writeFileSync(
		join(path, "schema.json"),
		JSON.stringify({
			$schema: "https://json-schema.org/draft/2020-12/schema",
			description: "Put your own schema description here...",
			type: "object",
			required: [],
			properties: {},
		}, null, 2),
		"utf-8"
	);
	fs.writeFileSync(join(path, "openschema.json"), JSON.stringify({
		name,
		description: "",
		version: "0.0.1",
		category: ""
	}, null, 2), "utf-8")

	success(`Amazing! We're all done here. Take a look at your new schema!`);
	notice(`use 'cd ${path}' to navigate to your new schema`);
});

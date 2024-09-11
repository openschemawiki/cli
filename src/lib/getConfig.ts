import { join } from "path";
import { readFileSync } from "fs";

export type Config = {
	version: string,
	description: string,
	name: string,
	category: string,
	tags: string[]
}

export function getConfig(cwd: string): Config | null {
	const configPath = join(cwd, "openschema.json");
	try {
		return JSON.parse(readFileSync(configPath, "utf-8"));
	} catch (e) {
		return null;
	}
}
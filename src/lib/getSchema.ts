import { readFileSync } from "fs";
import { join } from "path";

export function getSchema(cwd: string): Object | null {
	const schemaPath = join(cwd, "schema.json");
	try {
		return JSON.parse(readFileSync(schemaPath, "utf-8"));
	} catch (e) {
		return null;
	}
}
import { Command } from "commander";
import { findCommand } from "./find";
import { versionCommand } from "./version";
import { initCommand } from "./init";
import { pullCommand } from "./pull";
import { pushCommand } from "./push";

const version = require("../package.json").version;
export const program = new Command();

program
	.name("openschema")
	.description("The CLI for the OpenSchema Store")
	.version(version, "-v, --version", "output the current version");

program.addCommand(findCommand)
program.addCommand(versionCommand)
program.addCommand(initCommand)
program.addCommand(pullCommand)
program.addCommand(pushCommand)

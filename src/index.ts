#!/usr/bin/env node

import { Command } from "commander";
import { findCommand } from "./find";
import { versionCommand } from "./version";
import { initCommand } from "./init";
import { pullCommand } from "./pull";
import { pushCommand } from "./push";
import { compileCommand } from "./compile"

export const program = new Command();

program
	.name("openschema")
	.description("The CLI for the OpenSchema Store")

program.addCommand(findCommand)
program.addCommand(versionCommand)
program.addCommand(initCommand)
program.addCommand(pullCommand)
program.addCommand(pushCommand)
program.addCommand(compileCommand)

program.parse();
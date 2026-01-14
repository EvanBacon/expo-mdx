import { boolish } from "getenv";
import process from "process";

export async function typings(task) {
  await task.source("./tsconfig.json").shell({
    cmd: "tsc -p $glob --outDir build",
    preferLocal: true,
    glob: true,
  });
}

export async function server(task, opts) {
  await task
    .source("src/server/**/*.+(js|ts|tsx)", {
      ignore: ["**/__tests__/**", "**/__mocks__/**", "**/__typetests__/**"],
    })
    .swc("cli", { dev: opts.dev })
    .target("build/server");
}

export async function react(task, opts) {
  await task.source("./tsconfig-react.json").shell({
    cmd: "tsc -p $glob --outDir build/react",
    preferLocal: true,
    glob: true,
  });
}

export async function build(task, opts) {
  await task.parallel(["server", "react", "typings"], opts);
}

export default async function (task) {
  const opts = { dev: true };
  await task.clear("build");
  await task.start("build", opts);
  if (
    process.stdout.isTTY &&
    !boolish("CI", false) &&
    !boolish("EXPO_NONINTERACTIVE", false)
  ) {
    await task.watch("src/**/*.+(js|ts|tsx)", "build", opts);
  }
}

export async function release(task) {
  await task.clear("build").start("build");
}

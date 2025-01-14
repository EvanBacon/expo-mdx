const path = require("path");
const assert = require("assert");
const { transform } = require("@swc/core");

module.exports = function (task) {
  const ENVIRONMENTS = {
    cli: {
      output: "build",
      options: {
        module: {
          type: "commonjs",
          lazy: true,
          ignoreDynamic: true, // Leave dynamic imports in place
        },
        env: {
          targets: {
            node: "16.8.0",
          },
        },
        jsc: {
          loose: true,
          parser: {
            syntax: "typescript",
            dynamicImport: true, // Allow parsing of dynamic imports
          },
        },
      },
    },
  };

  const matcher = new RegExp(`^(${Object.keys(ENVIRONMENTS).join("|")})$`);

  task.plugin(
    "swc",
    {},
    function* (file, environment, { stripExtension } = {}) {
      if (file.base.endsWith(".d.ts")) return;
      assert.match(environment, matcher);

      const setting = ENVIRONMENTS[environment];
      const filePath = path.join(file.dir, file.base);
      const inputFilePath = path.join(__dirname, filePath);
      const outputFilePath = path.dirname(
        path.join(__dirname, setting.output, filePath)
      );

      const options = {
        filename: path.join(file.dir, file.base),
        sourceMaps: true,
        sourceFileName: path.relative(outputFilePath, inputFilePath),
        ...setting.options,
      };

      if (file.data == null) {
        throw new Error(`File "${file.base}" is empty.`);
      }
      const output = yield transform(file.data.toString("utf-8"), options);
      const ext = path.extname(file.base);

      if (ext) {
        const extRegex = new RegExp(ext.replace(".", "\\.") + "$", "i");
        file.base = file.base.replace(extRegex, stripExtension ? "" : ".js");
      }

      if (output.map) {
        const map = `${file.base}.map`;
        output.code += Buffer.from(`\n//# sourceMappingURL=${map}`);
        this._.files.push({
          base: map,
          dir: file.dir,
          data: Buffer.from(output.map),
        });
      }

      file.data = Buffer.from(output.code);
    }
  );
};

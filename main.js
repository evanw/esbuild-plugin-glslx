const glslx = require('glslx');

module.exports = (options = {}) => ({
  name: 'glslx',
  setup(build) {
    const initialOptions = build.initialOptions;
    const minifyIdentifiers = initialOptions.minify || initialOptions.minifyIdentifiers;
    const minifySyntax = initialOptions.minify || initialOptions.minifySyntax;
    const minifyWhitespace = initialOptions.minify || initialOptions.minifyWhitespace;

    const renaming = options.renaming;
    const disableRewriting = options.disableRewriting;
    const prettyPrint = options.prettyPrint;
    const writeTypeDeclarations = options.writeTypeDeclarations;

    const path = require('path');
    const fs = require('fs');

    build.onLoad({ filter: /\.glslx$/ }, async (args) => {
      const contents = await fs.promises.readFile(args.path, 'utf8');
      const input = [{ name: args.path, contents }];
      const errors = [];
      const warnings = [];
      const watchFiles = [];
      const cache = Object.create(null);
      cache[args.path] = contents;

      const fileAccess = (filePath, relativeTo) => {
        const name = path.join(path.dirname(relativeTo), filePath);
        let contents = cache[name];
        if (contents === undefined) {
          watchFiles.push(name);
          try {
            contents = fs.readFileSync(name, 'utf8');
          } catch {
            return null;
          }
          cache[name] = contents;
        }
        return { name, contents };
      };

      for (const { kind, text, range } of glslx.compileIDE(input, { fileAccess }).diagnostics) {
        const message = { text };

        if (range) {
          const lineText = cache[range.source].split(/\r|\n|\r\n/g)[range.start.line];
          message.location = {
            file: range.source,
            line: range.start.line + 1,
            column: range.start.column,
            length: range.end.line === range.start.line ? range.end.column - range.start.column : 0,
            lineText,
          };
        }

        if (kind === 'error') errors.push(message);
        if (kind === 'warning') warnings.push(message);
      }

      if (errors.length > 0) return { errors, warnings, watchFiles };

      const json = JSON.parse(glslx.compile(input, {
        format: 'json',
        fileAccess,
        renaming: renaming !== undefined ? renaming : (minifyIdentifiers ? 'internal-only' : 'none'),
        disableRewriting: disableRewriting !== undefined ? disableRewriting : !minifySyntax,
        prettyPrint: prettyPrint !== undefined ? prettyPrint : !minifyWhitespace,
      }).output);

      let js = '';
      let ts = '';
      let newline = false;
      for (const shader of json.shaders) {
        js += `export const ${shader.name} = ${JSON.stringify(shader.contents)};\n`;
        ts += `export const ${shader.name}: string;\n`;
        newline = true;
      }
      for (const key in json.renaming) {
        if (newline) {
          js += '\n';
          ts += '\n';
          newline = false;
        }
        const value = json.renaming[key]
        js += `export const ${key} = ${JSON.stringify(value)};\n`;
        ts += `export const ${key} = ${JSON.stringify(key)};\n`;
      }
      if (writeTypeDeclarations) {
        await fs.promises.writeFile(args.path + '.d.ts', ts);
      }
      return { contents: js, warnings, watchFiles };
    });
  },
});

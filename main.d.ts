declare function glslxPlugin(options?: {
  // Controls which symbols are renamed, if any. There are three possible values:
  //
  // - "none": All symbols use their original names.
  // - "internal-only": Only varying and local names are renamed to shorter names.
  // - "all": All names are renamed to shorter names, and you'll need to import
  //   the names as constants from the ".glslx" file to access the updated names.
  //
  // Default: "internal-only" if esbuild's "minifyIdentifiers" is enabled, and
  // "none" otherwise.
  renaming?: 'all' | 'internal-only' | 'none';

  // If true, disable syntax compression (which uses equivalent shorter GLSLX
  // syntax). Default: false if esbuild's "minifySyntax" is enabled, and true
  // otherwise.
  disableRewriting?: boolean;

  // If true, GLSLX code in strings will contain newlines and indents. Default:
  // false if esbuild's "minifyWhitespace" is enabled, and true otherwise.
  prettyPrint?: boolean;

  // If true, write out "*.glslx.d.ts" files next to imported ".glslx" files.
  writeTypeDeclarations?: boolean;
}): {
  name: string;
  setup(build: any): void;
};

export = glslxPlugin;

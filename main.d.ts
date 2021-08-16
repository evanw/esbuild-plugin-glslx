declare function glslxPlugin(options?: {
  // If true, write out "*.glslx.d.ts" files
  writeTypeDeclarations?: boolean;
  prettyPrint?: boolean;
  disableRewriting?: boolean;
  renaming?: 'all' | 'internal-only' | 'none';
}): {
  name: string;
  setup(build: any): void;
};

export = glslxPlugin;

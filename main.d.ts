export default function glslxPlugin(options?: {
  // If true, write out "*.glslx.d.ts" files
  writeTypeDeclarations?: boolean;
}): {
  name: string;
  setup(build: any): void;
};

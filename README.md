# esbuild-plugin-glslx

A plugin for [esbuild](https://github.com/evanw/esbuild) that adds support for `*.glslx` file imports including shader type checking at build time. [GLSLX](https://github.com/evanw/glslx) is a language extension for GLSL that lets you write multiple WebGL 1.0 shaders in the same file using the `export` keyword. It comes with a [GLSLX Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=evanw.glslx-vscode) that enables standard IDE features for GLSLX including type checking, go-to-definition, symbol renaming, and format-on-save. GLSLX code looks something like this:

```glsl
uniform sampler2D tex;
attribute vec3 pos;
varying vec2 coord;

export void yourVertexShader() {
  coord = pos.xy;
  gl_Position = vec4(pos, 1);
}

export void yourFragmentShader() {
  gl_FragColor = texture2D(tex, coord);
}
```

## Basic Usage

1. Add this plugin to your esbuild build script:

    ```diff
    +const glslxPlugin = require('esbuild-plugin-glslx')
     ...
     esbuild.build({
       ...
       plugins: [
    +    glslxPlugin(),
       ],
     })
    ```

2. Import your `*.glslx` file from JavaScript:

    ```js
    import { yourVertexShader, yourFragmentShader } from './shaders.glslx'

    // Each shader is a string that you can pass to your WebGL 1.0 rendering engine of choice
    const material = THREE.RawShaderMaterial({
      vertexShader: yourVertexShader,
      fragmentShader: yourFragmentShader,
    })
    ```

## Usage with TypeScript

If you would like to use GLSLX with TypeScript, you'll have to tell the TypeScript compiler how to interpret imports from `*.glslx` files. You have two options:

* One way to do this is to add a blanket type declaration for all `*.glslx` files such that every import is considered to be a string:

    ```ts
    // Save this as the file "glslx.d.ts" alongside your source code
    declare module "*.glslx" {
      var values: Record<string, string>;
      export = values;
    }
    ```

    This means you can't use named imports anymore, but you can still use namespace imports like this:

    ```js
    import * as shaders from './shaders.glslx'
    console.log(shaders.yourVertexShader, shaders.yourFragmentShader)
    ```

* Another way to do this is to generate a `*.glslx.d.ts` file for each `*.glslx` file with a type declaration for each exported shader. This plugin can do that for you if you enable the `writeTypeDeclarations` option:

    ```diff
     const glslxPlugin = require('esbuild-plugin-glslx')

     esbuild.build({
       ...
       plugins: [
         glslxPlugin({
    +      writeTypeDeclarations: true,
         }),
       ],
     })
    ```

    Then you can use any kind of imports in TypeScript including named imports.

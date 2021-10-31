import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import { terser } from "rollup-plugin-terser";
import { name, main, module, browser } from "./package.json";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: main,
      name: main,
      format: "cjs",
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: module,
      name: name,
      format: "es",
      sourcemap: true,
    },
    {
      file: browser,
      name: name,
      format: "umd",
      sourcemap: true,
    },
  ],

  plugins: [
    resolve({
      jsnext: true,
      main: true,
    }),
    typescript({
      typescript: require("typescript"),
      sourceMap: true,
    }),
    commonjs({
      include: "node_modules/**",
      extensions: [".js"],
      ignoreGlobal: false,
      sourceMap: false,
    }),
  ],
};

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import { name, main, module, browser } from "./package.json";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: main,
      name: main,
      format: "cjs",
      plugins: [isProduction && terser()],
    },
    {
      file: module,
      name: name,
      format: "es",
    },
    {
      file: browser,
      name: name,
      format: "umd",
    },
  ],

  plugins: [
    json(),
    resolve({
      jsnext: true,
      main: true,
    }),
    typescript({
      typescript: require("typescript"),
      sourceMap: !isProduction,
    }),
    commonjs({
      include: "node_modules/**",
      extensions: [".js"],
      ignoreGlobal: false,
      sourceMap: false,
    }),
  ],
};

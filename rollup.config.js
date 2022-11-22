import resolve from "rollup-plugin-node-resolve";
import vue from "rollup-plugin-vue";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-css-only";
import buble from '@rollup/plugin-buble'; // 解析称es5

let config = {
  input: "./packages/components/index.js",
  output: {
    file: "dist/vue-text-ellipsis-ie.js",
    name: "vueTextEllipsis",
    format: "umd",
    globals: {
      vue: "Vue",
    },
  },
  external: ["vue"],
  plugins: [
    resolve(),
    vue({
      preprocessStyles: true
    }),
    css({
      output: 'component.css'
    }),
    babel({
      exclude: "**/node_modules/**",
    }),
    commonjs(),
    buble()
  ],
};
export default config;

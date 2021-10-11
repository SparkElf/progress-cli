// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
export default {
  input: "src/main.ts",
  output: {
    file: "build/progress-cli.js",
    banner: "#!/usr/bin/env node",
    format: "esm", //因为用nodejs运行所以要转换成cjs
  },
  plugins: [
    replace({
      "#!/usr/bin/env node": " ",
    }),
    json(),
    typescript(),
  ],
};

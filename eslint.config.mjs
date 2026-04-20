import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const compat = new FlatCompat({
  baseDirectory: currentDirectory
});

const config = [
  {
    ignores: [".next/**", "next-env.d.ts"]
  },
  ...compat.config(nextVitals),
  ...compat.config(nextTypescript)
];

export default config;

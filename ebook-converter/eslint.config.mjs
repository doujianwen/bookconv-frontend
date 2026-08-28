import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 诊断/临时产物（本次会话生成），不属项目源码
    ".qc/**",
  ]),
  // ── 分层：Node CJS 脚本（require 合法）─────────────────────
  {
    files: ["scripts/**/*.js", "scripts/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  // ── 分层：worker/ 后台脚本（Node 运行时，混合风格）──────────
  {
    files: ["worker/**/*.ts", "worker/**/*.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // ── 分层：测试文件（动态 require + mock 常用 any）───────────
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // ── 分层：配置文件（next.config 等，any 在配置中常见）──────
  {
    files: ["next.config.ts", "*.config.ts", "*.config.mjs", "*.config.cjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;

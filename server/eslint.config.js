import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

// Lint the server source only; generated Prisma client, build output and the
// integration test harness are excluded.
export default defineConfig([
  globalIgnores(["dist", "src/generated", "tests", "prisma/migrations"]),
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Express/Passport type augmentation legitimately needs `declare global`
      // namespaces, so this rule is off rather than worked around.
      "@typescript-eslint/no-namespace": "off",
      // Pragmatic for an Express/Prisma codebase: warn rather than block on `any`
      // and allow intentionally-unused args prefixed with "_".
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

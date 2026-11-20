import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "playwright-report/**", "test-results/**",
    "node_modules/**", "npm-cache/**", "tmp/**", ".runtime-logs/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["**/*.{ts,tsx,js,mjs}"], languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node } } },
  { files: ["src/**/*.{ts,tsx}"], plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: { ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["error", { allowConstantExport: true }],
      "no-restricted-globals": ["error", "fetch", "XMLHttpRequest", "WebSocket", "EventSource"],
      "no-restricted-imports": ["error", { paths: ["@supabase/supabase-js"], patterns: ["**/admin-web/**", "**/BE/**"] }]
    } }
);

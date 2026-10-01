import js from "@eslint/js";
export default [
  js.configs.recommended,
  {
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true
            }
        }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off"
    }
  }
];

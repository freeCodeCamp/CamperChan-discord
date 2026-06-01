import NaomisConfig from "@nhcarrigan/eslint-config";

export default [
  ...NaomisConfig,
  {
    ignores: ["test/__mocks__"]
  },
  {
    rules: {
      complexity: "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "jsdoc/require-file-overview": "off"
    },
  },
  {
    files: ["test/__mocks__/Database.mock.ts"],
    rules: {
      "require-await": "off"
    }
  },
  {
    files: ["src/commands/subcommands/github/*.ts"],
    rules: {
      camelcase: ["error", { allow: ["issue_number", "state_reason"] }]
    }
  },
  {
    files: ["src/contexts/translate.ts"],
    rules: {
      camelcase: ["error", { allow: ["api_key"] }]
    }
  },
  {
    files: ["test/**/*.spec.ts"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "max-nested-callbacks": "off",
      // TODO: migrate the tests and turn these on...
      "vitest/prefer-expect-assertions": "off",
    }
  }
];

module.exports = [
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        "no-unused-vars": "warn",
        "no-console": "off",
        "semi": ["error", "always"],
        "quotes": ["error", "double"],
        "coverage/coverage": [
        "error",
        {
          threshold: 80, // Set your desired coverage threshold (e.g., 80%)
        },
      ],
      },
    },
  ];
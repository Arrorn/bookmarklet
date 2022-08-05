module.exports = {
    "env": {
        "es6": true,
        "browser": true
    },
    "extends": [
      "eslint:recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "ecmaFeatures": {
          "impliedStrict": true
        }
    },
    "rules": {
      "semi": ["error", "always"]
    }
};

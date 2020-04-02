module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        "prettier",
        "prettier/react",
        "prettier/@typescript-eslint",
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        'react',
        "prettier",
        '@typescript-eslint',
    ],
    rules: {
        "prettier/prettier": "error",
        "camelcase": [0],
        "jsx-a11y/no-static-element-interactions": [0],
        "jsx-a11y/click-events-have-key-events": [0],
        "jsx-a11y/no-noninteractive-element-interactions": [0],
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".tsx"] }],
        "react/prop-types": [0],
        "react/jsx-props-no-spreading": [0],
        "import/prefer-default-export": [0],
        "react/destructuring-assignment": ["off"],
        "prefer-object-spread": [0],
        "max-len": ["error", { "code": 200 }],
        "react/button-has-type": [0],
        'no-console': [0],
        "@typescript-eslint/no-unused-vars": "error",
        "jsx-a11y/anchor-is-valid": 0,
        "global-require": 0,
        "no-restricted-globals": ["error", "isNAN"],
        "no-underscore-dangle": 0,
        "no-plusplus": 0,
        "@typescript-eslint/no-unused-vars": 0
    },
}

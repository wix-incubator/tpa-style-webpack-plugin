module.exports = {
  extends: ['eslint-config-prettier', './eslint-test'],

  plugins: ['prettier', 'import'],

  env: {
    commonjs: true,
    es6: true,
    node: true,
  },

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      generators: true,
    },
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },

  rules: {
    // http://eslint.org/docs/rules/
    'array-callback-return': 'warn',
    'default-case': ['warn', {commentPattern: '^no default$'}],
    eqeqeq: ['warn', 'allow-null'],
    'no-array-constructor': 'warn',
    'no-caller': 'warn',
    curly: 'warn',
    'no-const-assign': 'warn',
    'no-control-regex': 'warn',
    'no-delete-var': 'warn',
    'no-dupe-args': 'warn',
    'no-dupe-class-members': 'warn',
    'no-dupe-keys': 'warn',
    'no-duplicate-case': 'warn',
    'no-empty-character-class': 'warn',
    'no-empty-pattern': 'warn',
    'no-eval': 'warn',
    'no-ex-assign': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-fallthrough': 'warn',
    'no-func-assign': 'warn',
    'no-implied-eval': 'warn',
    'no-invalid-regexp': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': ['warn', {allowLoop: true, allowSwitch: false}],
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-multi-str': 'warn',
    'no-native-reassign': 'warn',
    'no-negated-in-lhs': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-symbol': 'warn',
    'no-new-wrappers': 'warn',
    'no-obj-calls': 'warn',
    'no-octal': 'warn',
    'no-octal-escape': 'warn',
    'no-redeclare': 'warn',
    'no-regex-spaces': 'warn',
    'no-restricted-syntax': ['warn', 'WithStatement', 'SequenceExpression'],
    'no-script-url': 'warn',
    'no-self-assign': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-shadow': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-sparse-arrays': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-this-before-super': 'warn',
    'no-throw-literal': 'warn',
    'no-undef': 'error',
    'no-restricted-globals': ['error'],
    'no-unreachable': 'warn',
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-labels': 'warn',
    'no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': [
      'warn',
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      },
    ],
    'no-var': 'warn',
    'no-with': 'warn',
    'prefer-const': 'warn',
    'require-yield': 'warn',
    strict: ['warn', 'never'],
    'use-isnan': 'warn',
    'valid-typeof': 'warn',
    'getter-return': 'warn',
    'no-cond-assign': ['error', 'always'],
    'constructor-super': 'error',
    'no-return-await': 'error',
    'dot-notation': 'error',
    'no-unsafe-finally': 'error',
    'prefer-object-spread': 'error',
    radix: 'error',
    'no-undef-init': 'error',
    'object-shorthand': 'error',
    'no-constant-condition': 'error',
    'no-extra-boolean-cast': 'error',
    'no-proto': 'error',
    'no-irregular-whitespace': 'error',
    'no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],

    // https://github.com/benmosher/eslint-plugin-import
    'import/no-unresolved': ['error', {commonjs: true, caseSensitive: true}],
    'import/no-amd': 'error',
    'import/no-duplicates': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-extraneous-dependencies': 'error',

    // https://eslint.org/docs/rules/spaced-comment
    'spaced-comment': ['warn', 'always', {markers: ['/']}],

    // https://github.com/prettier/eslint-plugin-prettier
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },

      plugins: ['@typescript-eslint'],

      rules: {
        // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
        'default-case': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
        'no-dupe-class-members': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
        'no-undef': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/1624#issuecomment-589731039)
        'import/no-unresolved': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'warn',
        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'warn',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'warn',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'warn',
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
          },
        ],
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'none',
            ignoreRestSiblings: true,
          },
        ],
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',

        // Add TypeScript rules (With no ESLint equivalents)
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/array-type': ['error', {default: 'array'}],
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/member-delimiter-style': 'error',
        '@typescript-eslint/prefer-ts-expect-error': 'warn',
        '@typescript-eslint/ban-tslint-comment': 'warn',
      },
    },
  ],
};

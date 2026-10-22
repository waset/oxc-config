/** @type {import('oxlint').OxlintConfig} */
const config = {
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'promise', 'node'],
  rules: {
    'eslint/accessor-pairs': [
      2,
      {
        enforceForTSTypes: false,
        enforceForClassMembers: true,
        getWithoutSet: false,
        setWithoutGet: true,
      },
    ],
    'eslint/array-callback-return': [
      2,
      {
        allowImplicit: false,
        checkForEach: false,
        allowVoid: false,
      },
    ],
    'eslint/block-scoped-var': [2],
    'eslint/constructor-super': [2],
    'eslint/default-case-last': [2],
    'eslint/eqeqeq': [2, 'smart'],
    'eslint/new-cap': [
      2,
      {
        capIsNew: false,
        capIsNewExceptions: [],
        newIsCap: true,
        newIsCapExceptions: [],
        properties: true,
      },
    ],
    'eslint/no-alert': [2],
    'eslint/no-array-constructor': [2],
    'eslint/no-async-promise-executor': [2],
    'eslint/no-caller': [2],
    'eslint/no-case-declarations': [2],
    'eslint/no-class-assign': [2],
    'eslint/no-compare-neg-zero': [2],
    'eslint/no-cond-assign': [2, 'always'],
    'eslint/no-console': [
      1,
      {
        allow: ['warn', 'error'],
      },
    ],
    'eslint/no-const-assign': [2],
    'eslint/no-control-regex': [2],
    'eslint/no-debugger': [2],
    'eslint/no-delete-var': [2],
    'eslint/no-dupe-class-members': [2],
    'eslint/no-dupe-keys': [2],
    'eslint/no-duplicate-case': [2],
    'eslint/no-empty-character-class': [2],
    'eslint/no-empty': [
      2,
      {
        allowEmptyCatch: true,
      },
    ],
    'eslint/no-empty-pattern': [
      2,
      {
        allowObjectPatternsAsParameters: false,
      },
    ],
    'eslint/no-eval': [
      2,
      {
        allowIndirect: false,
      },
    ],
    'eslint/no-ex-assign': [2],
    'eslint/no-extend-native': [
      2,
      {
        exceptions: [],
      },
    ],
    'eslint/no-extra-bind': [2],
    'eslint/no-extra-boolean-cast': [2, {}],
    'eslint/no-fallthrough': [
      2,
      {
        allowEmptyCase: false,
        reportUnusedFallthroughComment: false,
      },
    ],
    'eslint/no-func-assign': [2],
    'eslint/no-global-assign': [
      2,
      {
        exceptions: [],
      },
    ],
    'eslint/no-implied-eval': [2],
    'eslint/no-import-assign': [2],
    'eslint/no-invalid-regexp': [2],
    'eslint/no-irregular-whitespace': [
      2,
      {
        skipComments: false,
        skipJSXText: false,
        skipRegExps: false,
        skipStrings: true,
        skipTemplates: false,
      },
    ],
    'eslint/no-iterator': [2],
    'eslint/no-labels': [
      2,
      {
        allowLoop: false,
        allowSwitch: false,
      },
    ],
    'eslint/no-lone-blocks': [2],
    'eslint/no-loss-of-precision': [2],
    'eslint/no-misleading-character-class': [
      2,
      {
        allowEscape: false,
      },
    ],
    'eslint/no-multi-str': [2],
    'eslint/no-new': [2],
    'eslint/no-new-func': [2],
    'eslint/no-new-native-nonconstructor': [2],
    'eslint/no-new-wrappers': [2],
    'eslint/no-obj-calls': [2],
    'eslint/no-proto': [2],
    'eslint/no-prototype-builtins': [2],
    'eslint/no-redeclare': [
      2,
      {
        builtinGlobals: false,
      },
    ],
    'eslint/no-regex-spaces': [2],
    'eslint/no-restricted-globals': [
      2,
      {
        message: 'Use `globalThis` instead.',
        name: 'global',
      },
      {
        message: 'Use `globalThis` instead.',
        name: 'self',
      },
    ],
    'eslint/no-restricted-properties': [
      2,
      {
        message: 'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.',
        property: '__proto__',
      },
      {
        message: 'Use `Object.defineProperty` instead.',
        property: '__defineGetter__',
      },
      {
        message: 'Use `Object.defineProperty` instead.',
        property: '__defineSetter__',
      },
      {
        message: 'Use `Object.getOwnPropertyDescriptor` instead.',
        property: '__lookupGetter__',
      },
      {
        message: 'Use `Object.getOwnPropertyDescriptor` instead.',
        property: '__lookupSetter__',
      },
    ],
    'eslint/no-self-assign': [
      2,
      {
        props: true,
      },
    ],
    'eslint/no-self-compare': [2],
    'eslint/no-sequences': [
      2,
      {
        allowInParentheses: true,
      },
    ],
    'eslint/no-shadow-restricted-names': [
      2,
      {
        reportGlobalThis: true,
      },
    ],
    'eslint/no-sparse-arrays': [2],
    'eslint/no-template-curly-in-string': [2],
    'eslint/no-this-before-super': [2],
    'eslint/no-throw-literal': [2],
    'eslint/no-undef': [
      2,
      {
        typeof: false,
      },
    ],
    'eslint/no-unexpected-multiline': [2],
    'eslint/no-unmodified-loop-condition': [
      2,
      {
        checkConditionalExpressions: false,
      },
    ],
    'eslint/no-unneeded-ternary': [
      2,
      {
        defaultAssignment: false,
      },
    ],
    'eslint/no-unreachable': [2],
    'eslint/no-unreachable-loop': [
      2,
      {
        ignore: [],
      },
    ],
    'eslint/no-unsafe-finally': [2],
    'eslint/no-unsafe-negation': [
      2,
      {
        enforceForOrderingRelations: false,
      },
    ],
    'eslint/no-unused-expressions': [
      2,
      {
        allowShortCircuit: true,
        allowTaggedTemplates: true,
        allowTernary: true,
      },
    ],
    'eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'eslint/no-use-before-define': [
      2,
      {
        classes: false,
        functions: false,
        variables: true,
        allowNamedExports: false,
        enums: true,
        typedefs: true,
        ignoreTypeReferences: true,
      },
    ],
    'eslint/no-useless-backreference': [2],
    'eslint/no-useless-call': [2],
    'eslint/no-useless-catch': [2],
    'eslint/no-useless-computed-key': [
      2,
      {
        enforceForClassMembers: true,
      },
    ],
    'eslint/no-useless-constructor': [2],
    'eslint/no-useless-rename': [
      2,
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      },
    ],
    'eslint/no-useless-return': [2],
    'eslint/no-var': [2],
    'eslint/no-with': [2],
    'eslint/object-shorthand': [
      2,
      'always',
      {
        avoidQuotes: true,
        ignoreConstructors: false,
      },
    ],
    'eslint/one-var': [
      2,
      {
        initialized: 'never',
      },
    ],
    'eslint/prefer-arrow-callback': [
      2,
      {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      },
    ],
    'eslint/prefer-const': [
      2,
      {
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
      },
    ],
    'eslint/prefer-exponentiation-operator': [2],
    'eslint/prefer-promise-reject-errors': [
      2,
      {
        allowEmptyReject: false,
      },
    ],
    'eslint/prefer-regex-literals': [
      2,
      {
        disallowRedundantWrapping: true,
      },
    ],
    'eslint/prefer-rest-params': [2],
    'eslint/prefer-spread': [2],
    'eslint/prefer-template': [2],
    'eslint/symbol-description': [2],
    'eslint/unicode-bom': [2, 'never'],
    'eslint/use-isnan': [
      2,
      {
        enforceForIndexOf: true,
        enforceForSwitchCase: true,
      },
    ],
    'eslint/valid-typeof': [
      2,
      {
        requireStringLiterals: true,
      },
    ],
    'eslint/vars-on-top': [2],
    'eslint/yoda': [
      2,
      'never',
      {
        exceptRange: false,
        onlyEquality: false,
      },
    ],
    'import/consistent-type-specifier-style': [2, 'prefer-top-level'],
    'import/first': [2],
    'import/no-duplicates': [2],
    'import/no-mutable-exports': [2],
    'import/no-self-import': [2],
    'import/no-webpack-loader-syntax': [2],
    'import/no-named-default': [2],
    'jsdoc/check-access': [1],
    'jsdoc/check-property-names': [1],
    'jsdoc/empty-tags': [1],
    'jsdoc/implements-on-classes': [1],
    'jsdoc/no-defaults': [1],
    'jsdoc/require-param-name': [1],
    'jsdoc/require-property': [1],
    'jsdoc/require-property-description': [1],
    'jsdoc/require-property-name': [1],
    'jsdoc/require-returns-description': [1],
    'node/handle-callback-err': [2, '^(err|error)$'],
    'node/no-exports-assign': [2],
    'node/no-new-require': [2],
    'node/no-path-concat': [2],
    'typescript/ban-ts-comment': [
      2,
      {
        'ts-expect-error': 'allow-with-description',
      },
    ],
    'typescript/consistent-type-definitions': [2, 'interface'],
    'typescript/consistent-type-imports': [
      2,
      {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
        prefer: 'type-imports',
      },
    ],
    'typescript/method-signature-style': [2, 'property'],
    'typescript/no-duplicate-enum-values': [2],
    'typescript/no-empty-object-type': [
      2,
      {
        allowInterfaces: 'always',
      },
    ],
    'typescript/no-extra-non-null-assertion': [2],
    'typescript/no-import-type-side-effects': [2],
    'typescript/no-misused-new': [2],
    'typescript/no-namespace': [2],
    'typescript/no-non-null-asserted-nullish-coalescing': [2],
    'typescript/no-non-null-asserted-optional-chain': [2],
    'typescript/no-require-imports': [2],
    'typescript/no-this-alias': [2],
    'typescript/no-unnecessary-type-constraint': [2],
    'typescript/no-unsafe-declaration-merging': [2],
    'typescript/no-unsafe-function-type': [2],
    'typescript/no-wrapper-object-types': [2],
    'typescript/prefer-as-const': [2],
    'typescript/prefer-literal-enum-member': [2],
    'typescript/prefer-namespace-keyword': [2],
    'unicorn/consistent-empty-array-spread': [2],
    'unicorn/error-message': [2],
    'unicorn/new-for-builtins': [2],
    'unicorn/no-instanceof-builtins': [
      2,
      {
        useErrorIsError: false,
        strategy: 'loose',
        include: [],
        exclude: [],
      },
    ],
    'unicorn/no-new-array': [2],
    'unicorn/no-new-buffer': [2],
    'unicorn/prefer-dom-node-text-content': [2],
    'unicorn/prefer-includes': [2],
    'unicorn/prefer-node-protocol': [2],
    'unicorn/prefer-number-properties': [
      2,
      {
        checkInfinity: false,
        checkNaN: false,
      },
    ],
    'unicorn/prefer-string-starts-ends-with': [2],
    'unicorn/prefer-type-error': [2],
    'unicorn/throw-new-error': [2],
  },
  categories: {
    correctness: 'off',
  },
}

export default config

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/typescript',
    '@vue/airbnb',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    /* airbnb */
    'no-var': 'off',// fix
    'no-redeclare': 'off',// fix
    'vars-on-top': 'off',// fix
    'no-inner-declarations': 'off',
    'no-self-assign': 'off',
    'no-undef': 'off',
    'getter-return': 'off',
    'no-inner-declaration': 'off',
    'no-lone-blocks': 'off',// fix
    'no-return-await': 'off',
    'no-new': 'off',
    'no-await-in-loop': 'off',
    'no-array-constructor': 'off',
    'import/export': 'off',
    'no-empty-function': 'off',// fix
    'computed-property-spacing': 'off',
    'no-empty-pattern': 'off',
    'space-unary-ops': 'off',
    'radix': 'off',
    'prefer-arrow-callback': 'off',
    'no-cond-assign': 'off',
    'one-var-declaration-per-line': 'off',
    'no-irregular-whitespace': 'off',// fix
    'guard-for-in': 'off',// fix
    'no-useless-concat': 'off',// fix
    'no-new-func': 'off',// fix
    'no-bitwise': 'off',// fix
    'no-extra-semi': 'off',// fix
    'no-loop-func': 'off',// fix
    'no-constant-condition': 'off',// fix
    'no-eval': 'off',// fix
    'curly': 'off',// fix
    'yoda': 'off',// fix
    'no-useless-constructor': 'off',// fix
    'no-case-declarations': 'off',// fix
    'no-extra-sem': 'off',// fix
    'no-unreachable': 'off',
    'array-bracket-spacing': 'off',
    'no-confusing-arrow': 'off',
    'no-labels': 'off',
    'no-useless-return': 'off',
    'object-curly-spacing': 'off',
    'operator-assignment': 'off',
    'no-extra-boolean-cast': 'off', // fix
    'no-duplicate-case': 'off', // fix
    'no-continue': 'off', // fix
    'quote-props': 'off', // fix
    'no-debugger': 'off', // fix
    'strict': 'off',
    'semi-spacing': 'off',
    'no-unused-vars': 'off', // fix
    'no-lonely-if': 'off',
    'no-else-return': 'off',
    'no-nested-ternary': 'off',
    'import/newline-after-import': 'off',
    'no-multiple-empty-lines': 'off',
    'block-scoped-var': 'off', // fix
    'prefer-const': 'off', // fix
    'no-undef-init': 'off',
    'dot-notation': 'off',
    'template-curly-spacing': 'off',
    'no-empty': 'off',
    'default-case': 'off',
    'no-multi-assign': 'off',
    'function-paren-newline': 'off',
    'object-curly-newline': 'off',
    'no-multi-spaces': 'off',
    'space-in-parens': 'off',
    'comma-spacing': 'off',
    'spaced-comment': 'off',
    'block-spacing': 'off',
    'space-infix-ops': 'off',
    'eol-last': 'off',
    'key-spacing': 'off',
    'no-trailing-spaces': 'off',
    'space-before-function-paren': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'arrow-spacing': 'off',
    'keyword-spacing': 'off',
    'arrow-body-style': 'off',
    'no-unneeded-ternary': 'off',
    'arrow-parens': 'off',
    'space-before-blocks': 'off',
    'prefer-template': 'off',
    'padded-blocks': 'off',
    'prefer-destructuring': 'off',
    'semi': 'off',
    'quotes': 'off',
    'space-before-block': 'off',
    'global-require': 'off',
    'import/no-mutable-exports': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'no-restricted-syntax': 'off',
    'no-fallthrough': 'off',
    'array-callback-return': 'off',
    'brace-style': 'off',
    'import/no-duplicates': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-unused-expressions': 'off',
    'import/no-named-as-default': 'off',
    'no-prototype-builtins': 'off',
    'import/first': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    /* airbnb */
    'no-useless-escape': 'off',
    'import/no-named-as-default-member': 'off',
    'no-return-assign': 'off',
    'no-console': 'off',
    // 'no-': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 'off',
    /* 允许阴影变量state */
    'no-shadow': 'off',
    'no-tabs': 0,
    'no-underscore-dangle': 0,
    'no-mixed-operators': 0,
    'no-param-reassign': 0,
    'no-new-object': 0,
    'consistent-return': 0,
    'max-len': 0,
    /* 剪裁最后一个属性的逗号 */
    'comma-dangle': 0,
    /* 驼峰命名：关闭 */
    'camelcase': 0,
    // 'no-plusplus': 0,
    'no-restricted-globals': 0,
    'class-methods-use-this': 0,
    'import/no-extraneous-dependencies': 0,
    /* NOTE: 以下规则依赖于eslint-plugin-vue，eslint-plugin-html */
    'vue/attribute-hyphenation': ['never'],
    /* html标签关闭前强制换行：单行不执行，多行执行 */
    'vue/html-closing-bracket-newline': 'off',
    /* html标签关闭前后不允许空格： < i />不被允许 */
    'vue/html-closing-bracket-spacing': 'off',
    /* 强制html标签结束 */
    'vue/html-end-tags': 'off',
    /* 禁止定义无用参数：过于严格，可以不使用 */
    'vue/no-unused-vars': 'off',
    /* template内部缩进2个空格，属性间隔开1个空格，自动对其属性缩进 */
    'vue/html-indent': 'off',
    'indent': 'off',
    // <div>{{text}}</div>
    'vue/mustache-interpolation-spacing': 'off',
    /* 禁止重复空格 */
    'vue/no-multi-spaces': 'off',
    'vue/v-bind-style': 1,
    'vue/v-on-style': 1,
    /* 每行最多2个属性，超出则单个属性一行进行分行对齐 */
    'vue/max-attributes-per-line':'off',
    /* html属性必须用双引号括起来 */
    'vue/attribute-hyphenation':'off',
    /* 计算属性中禁止包含异步方法 */
    'vue/no-async-in-computed-properties': 2,
    /* 禁止在对象字面量中出现重复的键 */
    'vue/no-dupe-keys': 2,
    /* 禁止出现语法错误 */
    'vue/no-parsing-error': [2, {
      'x-invalid-end-tag': false,
    }],
    /* 禁止覆盖保留字 */
    'vue/no-reserved-keys': 2,
    /* 禁止在textarea出现{{value}} */
    'vue/no-textarea-mustache': 2,

    /* <component> 必须绑定is传参 */
    'vue/require-component-is': 2,
    /* render函数必须有返回值 */
    'vue/require-render-return': 2,
    /* v-for必须定义key */
    'vue/require-v-for-key': 2,
    /* 校验template的根节点：必须唯一且合法 */
    'vue/valid-template-root': 2,
    'vue/valid-v-bind': 2,
    'vue/valid-v-cloak': 2,
    'vue/valid-v-else-if': 2,
    'vue/valid-v-else': 2,
    'vue/valid-v-for': 2,
    'vue/valid-v-html': 2,
    'vue/valid-v-if': 2,
    'vue/valid-v-model': 2,
    'vue/valid-v-on': 2,
    'vue/valid-v-once': 2,
    'vue/valid-v-pre': 2,
    'vue/valid-v-show': 2,
    'vue/valid-v-text': 2,
    /* 关闭v-if必须是计算属性 */
    'vue/no-use-v-if-with-v-for': 0,
    /* html属性值必须用双括号括起来 */
    'vue/html-quotes': 2,
    /* 禁止出现无法理解的v-for或v-if */
    // 'vue/no-confusing-v-for-v-if': 2,

    // 接口和类型字面量中每一行都必须以分号结尾
    // 'typescript/member-delimiter-style': 'off',
    // // 属性和方法必须按照排序规则排序
    // 'typescript/member-ordering': 'error',
    // // 类型定义的冒号前后是否需要空格
    // // 默认冒号前必须没有空格，冒号后必须有空格
    // 'typescript/type-annotation-spacing': 'error',
  },
  };

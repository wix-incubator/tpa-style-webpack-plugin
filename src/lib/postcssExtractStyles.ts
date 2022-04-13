export const extractStylesPlugin = opts => {
  return {
    postcssPlugin: 'postcss-extract-styles',
    Once: (css, { result, postcss }) => {
      opts.pattern = [].concat(opts.pattern || []);

      const extractedCSS = postcss.root();
      extractStyles(css, extractedCSS, opts);

      result.root = css;
      result.messages.push({
        plugin: 'postcss-extract-styles',
        extracted: extractedCSS,
      })
    },
  };
};

function extractStyles(css, newcss, opts) {
  css.each(rule => {
    if (rule.type === 'atrule' && rule.walkRules && rule.nodes) {
      const newAtRule = cloneRule(rule);

      extractStyles(rule, newAtRule, opts);
      appendIfNotEmpty(newAtRule, newcss);
      removeIfEmpty(rule);
    } else if (rule.type === 'rule' && rule.walkDecls) {
      const newRule = cloneRule(rule);

      extractFromDeclarations(rule, newRule, opts);
      appendIfNotEmpty(newRule, newcss);
    }
  });
}

function extractFromDeclarations(rule, newRule, options) {
  rule.walkDecls(decl => {
    const shouldExtractDecl = options.pattern.some(p => p.test(decl.toString()));
    if (shouldExtractDecl) {
      const newDecl = decl.clone();
      newDecl.raws = decl.raws;
      newRule.append(newDecl);

      decl.remove();
      removeIfEmpty(rule);
    }
  });
}

function cloneRule(rule) {
  const newRule = rule.clone();

  newRule.removeAll();

  return newRule;
}

function appendIfNotEmpty(rule, newcss) {
  if (rule.nodes.length) {
    newcss.append(rule);
  }
}

function removeIfEmpty(rule) {
  if (rule.nodes.length === 0) {
    rule.remove();
  }
}

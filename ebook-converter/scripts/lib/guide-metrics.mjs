import ts from 'typescript';

// Read literal TS fields without executing content modules. Quoting a key or
// using a different string delimiter must not change the audit result.
export function guideMetrics(source) {
  const file = ts.createSourceFile('guide.ts', source, ts.ScriptTarget.Latest, true);
  if (file.parseDiagnostics.length) throw new Error('Guide contains TypeScript parse errors');
  const strings = new Map();
  let keyTakeaways = 0;
  const text = node => ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : null;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'es') return;
    if (ts.isPropertyAssignment(node)) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : null;
      const value = text(node.initializer);
      if (name && value !== null) strings.set(name, [...(strings.get(name) || []), value]);
      if (name === 'keyTakeaways' && ts.isArrayLiteralExpression(node.initializer)) keyTakeaways += node.initializer.elements.filter(e => text(e) !== null).length;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'keyTakeaways' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) keyTakeaways += node.initializer.elements.filter(e => text(e) !== null).length;
    ts.forEachChild(node, visit);
  }
  visit(file);
  const body = (strings.get('body') || []).join(' ');
  return {
    headings: strings.get('heading') || [],
    faqCount: (strings.get('question') || []).length,
    wordCount: body.split(/\s+/).filter(w => /^[a-zA-Z]{3,}$/.test(w)).length,
    keyTakeaways,
    hasIntro: (strings.get('intro') || []).some(Boolean),
    hasLastVerified: (strings.get('lastVerified') || []).some(Boolean),
    hasCredentials: (strings.get('credentials') || []).some(Boolean),
  };
}

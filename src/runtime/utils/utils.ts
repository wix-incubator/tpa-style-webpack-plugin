export function isCssVar(key: string) {
  return key.indexOf('--') === 0;
}

export function isJsonLike(value: any) {
  return typeof value === 'string' && value[0] === '{' && value.slice(-1) === '}';
}

export function parseJson(
  strValue: string
): {theme: string; size?: string; lineHeight?: string; style?: string; weight: string} {
  return strValue
    .slice(1, -1)
    .split(',')
    .reduce((json, current) => {
      const [key, value] = current.split(':');
      json[key.trim()] = value.trim().replace(/^["|'](.*)["|']$/, '$1');
      return json;
    }, {}) as any;
}

export function isNumber(value: any): boolean {
  return typeof value === 'number';
}

export function forEach(obj: Object, iteratee: (value, key) => void) {
  Object.keys(obj).forEach(key => iteratee(obj[key], key));
}

export function pickBy<T>(obj: Object, predicate: (value: any) => boolean): {[s: string]: T} {
  return Object.keys(obj || {}).reduce((result, key) => {
    if (predicate(obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

export function escapeHtml(str: string): string {
  return str && str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function parenthesisAreBalanced(str: string): boolean {
  const parentheses = '(){}';
  const stack = [];
  let character;

  for (let i = 0; (character = str[i]); i++) {
    const bracePosition = parentheses.indexOf(character);

    if (bracePosition === -1) {
      continue;
    }

    if (bracePosition % 2 === 0) {
      stack.push(bracePosition + 1); // push next expected brace position
    } else if (stack.length === 0 || stack.pop() !== bracePosition) {
      return false;
    }
  }

  return stack.length === 0;
}

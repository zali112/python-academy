export type TokenType =
  "kw" | "str" | "com" | "num" | "fn" | "builtin" | "self" | "decorator" | "op" | "plain";

export interface PythonToken {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
  "True",
  "False",
  "None",
]);

const BUILTINS = new Set([
  "print",
  "len",
  "range",
  "int",
  "float",
  "str",
  "bool",
  "list",
  "dict",
  "set",
  "tuple",
  "type",
  "input",
  "open",
  "sorted",
  "sum",
  "min",
  "max",
  "abs",
  "round",
  "enumerate",
  "zip",
  "any",
  "all",
  "isinstance",
  "map",
  "filter",
  "reversed",
  "repr",
  "id",
  "hash",
  "iter",
  "next",
  "super",
  "property",
  "staticmethod",
  "classmethod",
  "object",
  "Exception",
  "ValueError",
  "TypeError",
  "KeyError",
  "IndexError",
  "FileNotFoundError",
  "ZeroDivisionError",
  "AttributeError",
  "AssertionError",
  "ConnectionRefusedError",
  "TimeoutError",
  "StopIteration",
  "RuntimeError",
]);

const OPERATORS = [
  "**=",
  "//=",
  "==",
  "!=",
  "<=",
  ">=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**",
  "//",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ":",
  ",",
  ".",
  ";",
  "@",
  "->",
];

/**
 * Простая токенизация Python для подсветки синтаксиса.
 * Работает построчно: однострочные комментарии и строки корректно выделяются.
 */
export function tokenizePython(line: string): PythonToken[] {
  const tokens: PythonToken[] = [];
  let i = 0;

  const push = (type: TokenType, text: string) => {
    if (text.length > 0) tokens.push({ type, text });
  };

  while (i < line.length) {
    const ch = line[i];

    // Комментарий до конца строки
    if (ch === "#") {
      push("com", line.slice(i));
      break;
    }

    // Строки (включая префиксы f, r, b)
    const strMatch = /^(?:[frbuFRBU]{0,2})("""|'''|"|')/.exec(line.slice(i));
    if (strMatch) {
      const quote = strMatch[1];
      const prefixLen = strMatch[0].length;
      let j = i + prefixLen;
      let closed = false;
      while (j < line.length) {
        if (line[j] === "\\" && quote.length === 1) {
          j += 2;
          continue;
        }
        if (line.startsWith(quote, j)) {
          j += quote.length;
          closed = true;
          break;
        }
        j++;
      }
      if (!closed) j = line.length;
      push("str", line.slice(i, j));
      i = j;
      continue;
    }

    // Числа
    const numMatch = /^\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(line.slice(i));
    if (numMatch && !/[A-Za-z_]/.test(line[i - 1] ?? "")) {
      push("num", numMatch[0]);
      i += numMatch[0].length;
      continue;
    }

    // Декоратор
    if (ch === "@" && /[A-Za-z_]/.test(line[i + 1] ?? "")) {
      const m = /^@[A-Za-z_][A-Za-z0-9_.]*/.exec(line.slice(i))!;
      push("decorator", m[0]);
      i += m[0].length;
      continue;
    }

    // Идентификаторы и ключевые слова
    const wordMatch = /^[A-Za-z_\u0400-\u04FF][A-Za-z0-9_\u0400-\u04FF]*/.exec(line.slice(i));
    if (wordMatch) {
      const word = wordMatch[0];
      const rest = line.slice(i + word.length);
      if (KEYWORDS.has(word)) push("kw", word);
      else if (word === "self" || word === "cls") push("self", word);
      else if (BUILTINS.has(word)) push("builtin", word);
      else if (/^\s*\(/.test(rest)) push("fn", word);
      else if (/^\s*$/.test(rest) && tokens.length > 0 && tokens[tokens.length - 1].text === "def")
        push("fn", word);
      else push("plain", word);
      i += word.length;
      continue;
    }

    const opMatch = OPERATORS.find((o) => line.startsWith(o, i));
    if (opMatch) {
      push("op", opMatch);
      i += opMatch.length;
      continue;
    }

    push("plain", ch);
    i++;
  }

  return tokens;
}

/** Подсветка многострочного кода с сохранением переводов строк. */
export function highlightPython(code: string): PythonToken[][] {
  return code.split("\n").map(tokenizePython);
}

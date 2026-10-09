/**
 * pythonLite — учебный интерпретатор подмножества Python 3.
 *
 * Зачем он нужен: платформа работает как статическое приложение без сервера,
 * поэтому для кнопки «Запустить» используется безопасный интерпретатор,
 * который выполняет код прямо в браузере, без доступа к сети и файлам.
 *
 * Поддерживаемая часть языка: литералы, арифметика, строки и f-строки,
 * списки/кортежи/словари/множества, условия, циклы, функции (включая *args/**kwargs
 * и lambda), классы с наследованием, try/except, assert, import из белого списка.
 *
 * Если встречается конструкция вне подмножества — интерпретатор честно сообщает
 * об этом и предлагает включить Pyodide в настройках для полного Python.
 */

export class PythonError extends Error {
  line?: number;
  constructor(message: string, line?: number, name = "RuntimeError") {
    super(message);
    this.name = name;
    this.line = line;
  }
}

type Value =
  | number
  | PyFloat
  | string
  | boolean
  | null
  | Value[]
  | PyTuple
  | Map<Value, Value>
  | Set<Value>
  | FunctionValue
  | BuiltinFunction
  | ClassValue
  | Instance;

export class PyTuple extends Array {
  /**
   * Явный конструктор обязателен: наследник Array иначе трактует единственный
   * числовой аргумент как длину массива — new PyTuple(5) создал бы пустой кортеж.
   */
  constructor(...items: Value[]) {
    super();
    if (items.length > 0) this.push(...items);
  }
  static get [Symbol.species]() {
    return Array;
  }
  toString(): string {
    return `(${this.map(pyRepr).join(", ")}${this.length === 1 ? "," : ""})`;
  }
}

/**
 * Python-число с плавающей точкой.
 *
 * Наследуем Number: все существующие вызовы Number(v), арифметика и сравнения
 * продолжают работать автоматически (JS приводит объект к примитиву), а
 * наследование сохраняет различие int/float — иначе str(1.0) печатало бы «1»,
 * как в JS, а не «1.0», как в CPython.
 */
export class PyFloat extends Number {
  /** Формат как в CPython: целые значения получают «.0». */
  toString(): string {
    const n = Number(this);
    if (Number.isInteger(n) && Math.abs(n) < 1e16) return `${n}.0`;
    return String(n);
  }
}

/** Объект импортированного модуля: атрибут читается из членов модуля. */
export class PyModule extends Map<Value, Value> {}

/** Число (включая float) — годится для арифметики и сравнений. */
function isNum(v: Value): v is number | PyFloat {
  return typeof v === "number" || v instanceof PyFloat;
}

/** «Голое» JS-число из значения (int или float). */
function numv(v: Value): number {
  return typeof v === "number" ? v : Number(v as PyFloat);
}

/** Обернуть результат арифметики во float, если хотя бы один операнд — float. */
function keepFloat(n: number, a: Value, b?: Value): Value {
  const floatish = a instanceof PyFloat || b instanceof PyFloat;
  return floatish ? new PyFloat(n) : n;
}

/** Нормализация ключа словаря: как в Python, 1 и 1.0 — один и тот же ключ. */
function dictKey(k: Value): Value {
  return k instanceof PyFloat ? Number(k) : k;
}

/** Поддерживается ли перебор: list, tuple, str, dict (по ключам), set, __iter__. */
function isIterable(v: Value): boolean {
  if (Array.isArray(v) || typeof v === "string" || v instanceof Map || v instanceof Set)
    return true;
  if (v && typeof v === "object" && "__instance" in v)
    return findMethod(v as Instance, "__iter__") !== undefined;
  return false;
}

/**
 * Элементы итерируемого значения как список (для list/sorted/sum/min/max/reversed
 * и цикла for). Объекты пользовательских классов перебираются через __iter__.
 */
function toList(v: Value): Value[] {
  if (Array.isArray(v)) return [...v];
  if (typeof v === "string") return v.split("");
  if (v instanceof Map) return [...v.keys()];
  if (v instanceof Set) return [...v];
  if (v && typeof v === "object" && "__instance" in v) {
    const it = findMethod(v as Instance, "__iter__");
    if (it) return toList(it.call([], new Map()));
  }
  throw new PythonError(`Объект типа ${typeOf(v)} не итерируется`, undefined, "TypeError");
}

export interface FunctionValue {
  __fn: true;
  name: string;
  params: { name: string; default?: Expr }[];
  varargs?: string;
  kwargs?: string;
  body: Stmt[];
  scope: Env;
}

export interface BuiltinFunction {
  __builtin: true;
  name: string;
  call: (args: Value[], kwargs: Map<string, Value>, line?: number) => Value;
}

export interface ClassValue {
  __class: true;
  name: string;
  base?: ClassValue;
  methods: Map<string, FunctionValue>;
  decorators?: string[];
}

export interface Instance {
  __instance: true;
  cls: ClassValue;
  attrs: Map<string, Value>;
}

/* ============================ ЛЕКСЕР ============================ */

type TokType = "ident" | "num" | "str" | "op" | "nl" | "indent" | "dedent" | "eof";
interface Token {
  t: TokType;
  v: string;
  line: number;
  fstr?: boolean;
  /** Числовой литерал с точкой/экспонентой — float, а не int. */
  flt?: boolean;
}

const OPS3 = ["//=", "**=", "..."];
const OPS2 = ["**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "->", ":="];
const OPS1 = "+-*/%<>=().,:[]{}@";

const KEYWORDS = new Set([
  "if",
  "elif",
  "else",
  "while",
  "for",
  "in",
  "def",
  "return",
  "break",
  "continue",
  "pass",
  "class",
  "import",
  "from",
  "as",
  "try",
  "except",
  "finally",
  "raise",
  "global",
  "nonlocal",
  "lambda",
  "None",
  "True",
  "False",
  "and",
  "or",
  "not",
  "is",
  "with",
  "assert",
  "yield",
  "del",
]);

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const indents = [0];
  let line = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    line = i + 1;
    let pos = 0;

    // Отступ -> INDENT/DEDENT
    if (raw.trim().length === 0 || raw.trim().startsWith("#")) {
      if (raw.trim().length === 0 && i < lines.length - 1) continue;
      if (raw.trim().startsWith("#")) continue;
      continue;
    }
    while (pos < raw.length && (raw[pos] === " " || raw[pos] === "\t")) pos++;
    const indent = pos;
    if (indent > indents[indents.length - 1]) {
      indents.push(indent);
      tokens.push({ t: "indent", v: "", line });
    } else if (indent < indents[indents.length - 1]) {
      while (indents.length > 1 && indent < indents[indents.length - 1]) {
        indents.pop();
        tokens.push({ t: "dedent", v: "", line });
      }
      if (indent !== indents[indents.length - 1]) {
        throw new PythonError("Несогласованные отступы", line, "IndentationError");
      }
    }

    while (pos < raw.length) {
      const ch = raw[pos];
      if (ch === " " || ch === "\t") {
        pos++;
        continue;
      }
      if (ch === "#") break;

      // Строковые литералы (в т.ч. f-строки и префиксы r/f/b)
      const prefixMatch = /^([frbuFRBU]{0,2})("""|'''|"|')/.exec(raw.slice(pos));
      if (prefixMatch) {
        const [full, prefixes, quote] = prefixMatch;
        const isF = prefixes.toLowerCase().includes("f");
        const isRaw = prefixes.toLowerCase().includes("r");
        let value = "";
        let j = pos + full.length;
        let closed = false;
        if (quote.length === 3) {
          while (j < raw.length) {
            if (raw.startsWith(quote, j) && !isRaw) {
              const prev = raw[j - 1];
              if (prev !== "\\") {
                j += 3;
                closed = true;
                break;
              }
            }
            if (j >= raw.length) break;
            value += raw[j];
            j++;
          }
        } else {
          while (j < raw.length) {
            const c = raw[j];
            if (c === quote && !(isRaw && j > pos + full.length && raw[j - 1] === "\\")) {
              if (raw[j - 1] === "\\" && !isRaw) {
                // падение обратно не нужно: обработаем escape ниже
              } else {
                j++;
                closed = true;
                break;
              }
            }
            if (c === "\\" && !isRaw && j + 1 < raw.length) {
              const next = raw[j + 1];
              const map: Record<string, string> = {
                n: "\n",
                t: "\t",
                r: "\r",
                "\\": "\\",
                "'": "'",
                '"': '"',
                "0": "\0",
              };
              if (isRaw) value += c;
              else value += map[next] ?? next;
              j += 2;
              continue;
            }
            value += c;
            j++;
          }
        }
        if (!closed && quote.length === 3) {
          throw new PythonError("Незакрытая строка", line, "SyntaxError");
        }
        if (!closed) {
          throw new PythonError("Незакрытая строка", line, "SyntaxError");
        }
        tokens.push({ t: "str", v: value, line, fstr: isF });
        pos = j;
        continue;
      }

      // Числа
      if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(raw[pos + 1] ?? ""))) {
        const m = /^(0[xob][0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(raw.slice(pos));
        if (!m) throw new PythonError("Некорректный числовой литерал", line, "SyntaxError");
        const text = m[0].replace(/_/g, "");
        let num: number;
        let flt = false;
        if (/^0x/i.test(text)) num = parseInt(text.slice(2), 16);
        else if (/^0b/i.test(text)) num = parseInt(text.slice(2), 2);
        else if (/^0o/i.test(text)) num = parseInt(text.slice(2), 8);
        else {
          num = Number(text);
          // 1.0 и 1e3 — float; 100 — int
          flt = /[.eE]/.test(text);
        }
        tokens.push({ t: "num", v: String(num), line, flt });
        pos += m[0].length;
        continue;
      }

      // Идентификаторы / ключевые слова
      if (/[A-Za-z_\u0400-\u04FF]/.test(ch)) {
        const m = /^[A-Za-z_\u0400-\u04FF][A-Za-z0-9_\u0400-\u04FF]*/.exec(raw.slice(pos))!;
        const word = m[0];
        tokens.push({ t: "ident", v: word, line });
        pos += word.length;
        continue;
      }

      const three = raw.slice(pos, pos + 3);
      const two = raw.slice(pos, pos + 2);
      if (OPS3.includes(three)) {
        tokens.push({ t: "op", v: three, line });
        pos += 3;
        continue;
      }
      if (OPS2.includes(two)) {
        tokens.push({ t: "op", v: two, line });
        pos += 2;
        continue;
      }
      if (OPS1.includes(ch)) {
        tokens.push({ t: "op", v: ch, line });
        pos++;
        continue;
      }
      if (ch === ";") {
        pos++;
        continue;
      }
      throw new PythonError(`Неожиданный символ «${ch}»`, line, "SyntaxError");
    }
    tokens.push({ t: "nl", v: "", line });
  }

  // Закрываем незавершённые блоки
  while (indents.length > 1) {
    indents.pop();
    tokens.push({ t: "dedent", v: "", line });
  }
  tokens.push({ t: "eof", v: "", line });
  return tokens;
}

/* ============================ АСТ ============================ */

type Expr =
  | { k: "num"; v: number | PyFloat; line: number }
  | { k: "str"; v: string; fstr: boolean; line: number }
  | { k: "name"; v: string; line: number }
  | { k: "bool"; v: boolean; line: number }
  | { k: "none"; line: number }
  | { k: "list"; items: Expr[]; line: number }
  | { k: "tuple"; items: Expr[]; line: number }
  | { k: "dict"; pairs: [Expr, Expr][]; line: number }
  | { k: "set"; items: Expr[]; line: number }
  | { k: "bin"; op: string; left: Expr; right: Expr; line: number }
  | { k: "unary"; op: string; operand: Expr; line: number }
  | { k: "boolop"; op: "and" | "or"; left: Expr; right: Expr; line: number }
  | { k: "cmp"; op: string; left: Expr; right: Expr; line: number }
  | { k: "condexpr"; test: Expr; then: Expr; other: Expr; line: number }
  | { k: "call"; func: Expr; args: Expr[]; kwargs: [string, Expr][]; line: number }
  | { k: "index"; obj: Expr; index: Expr; line: number }
  | { k: "slice"; obj: Expr; start?: Expr; stop?: Expr; step?: Expr; line: number }
  | { k: "attr"; obj: Expr; name: string; line: number }
  | { k: "lambda"; params: { name: string; default?: Expr }[]; body: Expr; line: number }
  | { k: "fstring"; parts: (string | Expr)[]; line: number };

type Stmt =
  | { k: "assign"; target: Expr; value: Expr; line: number }
  | { k: "augassign"; target: Expr; op: string; value: Expr; line: number }
  | { k: "expr"; value: Expr; line: number }
  | { k: "if"; branches: [Expr, Stmt[]][]; otherwise?: Stmt[]; line: number }
  | { k: "while"; cond: Expr; body: Stmt[]; line: number }
  | { k: "for"; target: Expr; iter: Expr; body: Stmt[]; line: number }
  | { k: "break"; line: number }
  | { k: "continue"; line: number }
  | { k: "pass"; line: number }
  | { k: "return"; value?: Expr; line: number }
  | { k: "def"; fn: FunctionValue; line: number }
  | { k: "class"; cls: ClassValue; body: Stmt[]; line: number }
  | {
      k: "try";
      body: Stmt[];
      handlers: { type?: Expr; body: Stmt[] }[];
      finallyBody?: Stmt[];
      line: number;
    }
  | { k: "raise"; value?: Expr; line: number }
  | { k: "assert"; cond: Expr; msg?: Expr; line: number }
  | { k: "import"; module: string; alias?: string; line: number }
  | { k: "from"; module: string; names: { name: string; alias?: string }[]; line: number }
  | { k: "global"; names: string[]; line: number }
  | { k: "delete"; target: Expr; line: number }
  | { k: "print"; args: Expr[]; kwargs: [string, Expr][]; line: number };

class Parser {
  private pos = 0;
  constructor(private toks: Token[]) {}

  private peek(offset = 0): Token {
    return this.toks[Math.min(this.toks.length - 1, this.pos + offset)];
  }
  private next(): Token {
    return this.toks[this.pos++];
  }
  private at(type: TokType, value?: string): boolean {
    const t = this.peek();
    return t.t === type && (value === undefined || t.v === value);
  }
  private eat(type: TokType, value?: string): boolean {
    if (this.at(type, value)) {
      this.pos++;
      return true;
    }
    return false;
  }
  private expect(type: TokType, value?: string): Token {
    if (!this.at(type, value)) {
      const t = this.peek();
      throw new PythonError(
        `Ожидалось «${value ?? type}», получено «${t.v || t.t}»`,
        t.line,
        "SyntaxError",
      );
    }
    return this.next();
  }
  private skipNewlines(): void {
    while (this.at("nl")) this.next();
  }

  parseProgram(): Stmt[] {
    const body: Stmt[] = [];
    this.skipNewlines();
    while (!this.at("eof")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    return body;
  }

  private parseBlock(): Stmt[] {
    this.skipNewlines();
    this.expect("indent");
    const body: Stmt[] = [];
    this.skipNewlines();
    while (!this.at("dedent") && !this.at("eof")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    this.expect("dedent");
    return body;
  }

  private parseStatement(): Stmt {
    const line = this.peek().line;
    if (this.at("ident", "if")) return this.parseIf();
    if (this.at("ident", "while")) {
      this.next();
      const cond = this.parseExpr();
      this.expect("op", ":");
      return { k: "while", cond, body: this.parseBlock(), line };
    }
    if (this.at("ident", "for")) {
      this.next();
      const target = this.parseTargetList();
      if (!this.eat("ident", "in"))
        throw new PythonError("Ожидалось «in» в цикле for", line, "SyntaxError");
      const iter = this.parseExpr();
      this.expect("op", ":");
      return { k: "for", target, iter, body: this.parseBlock(), line };
    }
    if (this.at("ident", "def")) return this.parseDef();
    if (this.at("ident", "class")) return this.parseClass();
    if (this.at("ident", "try")) {
      this.next();
      this.expect("op", ":");
      const body = this.parseBlock();
      const handlers: { type?: Expr; body: Stmt[] }[] = [];
      this.skipNewlines();
      while (this.at("ident", "except")) {
        const hLine = this.next().line;
        let type: Expr | undefined;
        if (!this.at("op", ":")) type = this.parseExpr();
        this.expect("op", ":");
        handlers.push({ type, body: this.parseBlock() });
        this.skipNewlines();
        void hLine;
      }
      let finallyBody: Stmt[] | undefined;
      if (this.at("ident", "finally")) {
        this.next();
        this.expect("op", ":");
        finallyBody = this.parseBlock();
      }
      if (handlers.length === 0 && !finallyBody)
        throw new PythonError("try без except/finally", line, "SyntaxError");
      return { k: "try", body, handlers, finallyBody, line };
    }
    if (this.at("ident", "with")) {
      // with поддерживается в упрощённом виде: with EXPR as NAME:
      this.next();
      const expr = this.parseExpr();
      let alias: string | undefined;
      if (this.eat("ident", "as")) alias = this.expect("ident").v;
      this.expect("op", ":");
      const body = this.parseBlock();
      const inner: Stmt[] = [
        ...(alias
          ? [{ k: "assign", target: { k: "name", v: alias, line }, value: expr, line } as Stmt]
          : []),
        ...body,
      ];
      return {
        k: "try",
        body: inner,
        handlers: [],
        line,
      };
    }
    if (this.at("ident", "return")) {
      this.next();
      if (this.at("nl") || this.at("dedent") || this.at("eof")) return { k: "return", line };
      const value = this.parseTupleExpr();
      return { k: "return", value, line };
    }
    if (this.at("ident", "break")) {
      this.next();
      return { k: "break", line };
    }
    if (this.at("ident", "continue")) {
      this.next();
      return { k: "continue", line };
    }
    if (this.at("ident", "pass")) {
      this.next();
      return { k: "pass", line };
    }
    if (this.at("ident", "raise")) {
      this.next();
      if (this.at("nl")) return { k: "raise", line };
      return { k: "raise", value: this.parseExpr(), line };
    }
    if (this.at("ident", "global")) {
      this.next();
      const names = [this.expect("ident").v];
      while (this.eat("op", ",")) names.push(this.expect("ident").v);
      return { k: "global", names, line };
    }
    if (this.at("ident", "nonlocal")) {
      this.next();
      const names = [this.expect("ident").v];
      while (this.eat("op", ",")) names.push(this.expect("ident").v);
      return { k: "global", names, line };
    }
    if (this.at("ident", "assert")) {
      this.next();
      const cond = this.parseExpr();
      let msg: Expr | undefined;
      if (this.eat("op", ",")) msg = this.parseExpr();
      return { k: "assert", cond, msg, line };
    }
    if (this.at("ident", "import")) {
      this.next();
      const module = this.expect("ident").v;
      let alias: string | undefined;
      if (this.eat("ident", "as")) alias = this.expect("ident").v;
      return { k: "import", module, alias, line };
    }
    if (this.at("ident", "from")) {
      this.next();
      const module = this.expect("ident").v;
      this.expect("ident", "import");
      const names: { name: string; alias?: string }[] = [];
      do {
        const name = this.expect("ident").v;
        let al: string | undefined;
        if (this.eat("ident", "as")) al = this.expect("ident").v;
        names.push({ name, alias: al });
      } while (this.eat("op", ","));
      return { k: "from", module, names, line };
    }
    if (this.at("ident", "del")) {
      this.next();
      const target = this.parsePrimary();
      return { k: "delete", target, line };
    }

    // Присваивание / выражение (в том числе кортежное: a, b = 1, 2)
    const first = this.parseTupleExpr();
    // Аннотация переменной: x: int = 5 — тип разбирается и отбрасывается
    if (this.at("op", ":")) {
      this.next();
      this.parseExpr();
      if (this.eat("op", "=")) {
        const value = this.parseTupleExpr();
        return { k: "assign", target: first, value, line };
      }
      return { k: "pass", line };
    }
    if (this.at("op", "=")) {
      this.next();
      const value = this.parseTupleExpr();
      return { k: "assign", target: first, value, line };
    }
    const aug = OPS2.find((op) => op.endsWith("=") && op !== "==" && this.at("op", op));
    if (aug) {
      this.next();
      const value = this.parseExpr();
      return { k: "augassign", target: first, op: aug.slice(0, -1), value, line };
    }
    return { k: "expr", value: first, line };
  }

  private parseIf(): Stmt {
    const line = this.next().line;
    const branches: [Expr, Stmt[]][] = [];
    const cond = this.parseExpr();
    this.expect("op", ":");
    branches.push([cond, this.parseBlock()]);
    this.skipNewlines();
    while (this.at("ident", "elif")) {
      this.next();
      const c = this.parseExpr();
      this.expect("op", ":");
      branches.push([c, this.parseBlock()]);
      this.skipNewlines();
    }
    let otherwise: Stmt[] | undefined;
    if (this.at("ident", "else")) {
      this.next();
      this.expect("op", ":");
      otherwise = this.parseBlock();
    }
    return { k: "if", branches, otherwise, line };
  }

  private parseParams(): {
    params: { name: string; default?: Expr }[];
    varargs?: string;
    kwargs?: string;
  } {
    this.expect("op", "(");
    const params: { name: string; default?: Expr }[] = [];
    let varargs: string | undefined;
    let kwargs: string | undefined;
    while (!this.at("op", ")")) {
      if (this.eat("op", "*")) {
        if (this.eat("op", "*")) kwargs = this.expect("ident").v;
        else varargs = this.expect("ident").v;
      } else {
        const name = this.expect("ident").v;
        let def: Expr | undefined;
        // Аннотация типа параметра: n: int = 5 — тип разбирается и отбрасывается
        if (this.eat("op", ":")) this.parseExpr();
        if (this.eat("op", "=")) def = this.parseExpr();
        params.push({ name, default: def });
      }
      if (!this.eat("op", ",")) break;
    }
    this.expect("op", ")");
    return { params, varargs, kwargs };
  }

  private parseDef(): Stmt {
    const line = this.next().line;
    const name = this.expect("ident").v;
    const { params, varargs, kwargs } = this.parseParams();
    if (this.eat("op", "->")) this.parseExpr();
    this.expect("op", ":");
    const body = this.parseBlock();
    return {
      k: "def",
      fn: { __fn: true, name, params, varargs, kwargs, body, scope: null as unknown as Env },
      line,
    };
  }

  private parseClass(): Stmt {
    const line = this.next().line;
    const name = this.expect("ident").v;
    let base: Expr | undefined;
    if (this.eat("op", "(")) {
      base = this.parseExpr();
      this.eat("op", ",");
      this.expect("op", ")");
    }
    this.expect("op", ":");
    const body = this.parseBlock();
    const cls: ClassValue = { __class: true, name, methods: new Map() };
    if (base) {
      // базовый класс резолвится при исполнении
      (cls as unknown as { baseExpr?: Expr }).baseExpr = base;
    }
    return { k: "class", cls, body, line };
  }

  private parseTargetList(): Expr {
    const first = this.parseUnary();
    if (this.at("op", ",")) {
      const items = [first];
      while (this.eat("op", ",")) {
        if (this.at("op", ":") || this.at("ident", "in")) break;
        items.push(this.parseUnary());
      }
      return { k: "tuple", items, line: first.line };
    }
    return first;
  }

  /** Выражение или кортеж через запятую: `a, b = 1, 2`, `return 1, 2`. */
  private parseTupleExpr(): Expr {
    const first = this.parseExpr();
    if (!this.at("op", ",")) return first;
    const items = [first];
    while (this.eat("op", ",")) {
      if (this.at("op", "=") || this.at("op", ":") || this.at("nl") || this.at("dedent")) break;
      items.push(this.parseExpr());
    }
    return { k: "tuple", items, line: first.line };
  }

  /** Публичный вход для разбора выражения из f-строк ({...}). */
  parseExpr(): Expr {
    return this.parseConditional();
  }

  /** Условное выражение: `a if cond else b` (правая часть рекурсивна). */
  private parseConditional(): Expr {
    const then = this.parseOr();
    if (!this.at("ident", "if")) return then;
    const line = this.next().line;
    const test = this.parseOr();
    this.expect("ident", "else");
    const other = this.parseConditional();
    return { k: "condexpr", test, then, other, line };
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.at("ident", "or")) {
      const line = this.next().line;
      const right = this.parseAnd();
      left = { k: "boolop", op: "or", left, right, line };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.at("ident", "and")) {
      const line = this.next().line;
      const right = this.parseNot();
      left = { k: "boolop", op: "and", left, right, line };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.at("ident", "not")) {
      const line = this.next().line;
      const operand = this.parseNot();
      return { k: "unary", op: "not", operand, line };
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    let left = this.parseAdd();
    for (;;) {
      const t = this.peek();
      let op: string | null = null;
      if (t.t === "op" && ["==", "!=", "<", ">", "<=", ">="].includes(t.v)) op = t.v;
      else if (t.t === "ident" && ["in", "is"].includes(t.v)) op = t.v;
      else if (t.t === "ident" && t.v === "not" && this.peek(1).v === "in") op = "not in";
      if (!op) return left;
      this.next();
      // «not in» — два слова: после «not» обязательно поглощаем «in»
      if (op === "not in" && this.at("ident", "in")) this.next();
      // «is not» — отдельный оператор, а не «is» + выражение «not …»
      if (op === "is" && this.peek().t === "ident" && this.peek().v === "not") {
        this.next();
        op = "is not";
      }
      const line = this.peek().line;
      const right = this.parseAdd();
      left = { k: "cmp", op, left, right, line };
    }
  }

  private parseAdd(): Expr {
    let left = this.parseMul();
    while (this.at("op", "+") || this.at("op", "-")) {
      const t = this.next();
      const right = this.parseMul();
      left = { k: "bin", op: t.v, left, right, line: t.line };
    }
    return left;
  }

  private parseMul(): Expr {
    let left = this.parseUnary();
    while (this.at("op", "*") || this.at("op", "/") || this.at("op", "//") || this.at("op", "%")) {
      const t = this.next();
      const right = this.parseUnary();
      left = { k: "bin", op: t.v, left, right, line: t.line };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.at("op", "-") || this.at("op", "+")) {
      const t = this.next();
      const operand = this.parseUnary();
      return { k: "unary", op: t.v, operand, line: t.line };
    }
    if (this.at("op", "~")) {
      const t = this.next();
      const operand = this.parseUnary();
      return { k: "unary", op: t.v, operand, line: t.line };
    }
    return this.parsePower();
  }

  private parsePower(): Expr {
    const base = this.parsePostfix();
    if (this.at("op", "**")) {
      const t = this.next();
      const exp = this.parseUnary();
      return { k: "bin", op: "**", left: base, right: exp, line: t.line };
    }
    return base;
  }

  private parsePostfix(): Expr {
    let node = this.parsePrimary();
    for (;;) {
      if (this.at("op", "(")) {
        const line = this.next().line;
        const args: Expr[] = [];
        const kwargs: [string, Expr][] = [];
        while (!this.at("op", ")")) {
          if (
            this.at("ident") &&
            this.peek(1).t === "op" &&
            this.peek(1).v === "=" &&
            !this.peek(2).v.startsWith("=")
          ) {
            const name = this.next().v;
            this.next();
            kwargs.push([name, this.parseExpr()]);
          } else if (this.eat("op", "**")) {
            kwargs.push(["**", this.parseExpr()]);
          } else if (this.eat("op", "*")) {
            args.push({ k: "unary", op: "*", operand: this.parseExpr(), line });
          } else {
            args.push(this.parseExpr());
          }
          if (!this.eat("op", ",")) break;
        }
        this.expect("op", ")");
        node = { k: "call", func: node, args, kwargs, line };
        continue;
      }
      if (this.at("op", "[")) {
        const line = this.next().line;
        // Формы среза: [:], [:stop], [::step], [:stop:step]
        if (this.at("op", ":")) {
          this.next();
          const stop = this.at("op", "]") || this.at("op", ":") ? undefined : this.parseExpr();
          let step: Expr | undefined;
          if (this.eat("op", ":")) step = this.at("op", "]") ? undefined : this.parseExpr();
          this.expect("op", "]");
          node = { k: "slice", obj: node, stop, step, line };
          continue;
        }
        const start = this.parseExpr();
        if (this.at("op", ":")) {
          this.next();
          const stop = this.at("op", "]") || this.at("op", ":") ? undefined : this.parseExpr();
          let step: Expr | undefined;
          if (this.eat("op", ":")) step = this.at("op", "]") ? undefined : this.parseExpr();
          this.expect("op", "]");
          node = { k: "slice", obj: node, start, stop, step, line };
        } else {
          this.expect("op", "]");
          node = { k: "index", obj: node, index: start, line };
        }
        continue;
      }
      if (this.at("op", ".")) {
        const line = this.next().line;
        const name = this.expect("ident").v;
        node = { k: "attr", obj: node, name, line };
        continue;
      }
      return node;
    }
  }

  private parsePrimary(): Expr {
    const t = this.peek();
    if (t.t === "num") {
      this.next();
      const n = Number(t.v);
      return { k: "num", v: t.flt ? new PyFloat(n) : n, line: t.line };
    }
    if (t.t === "str") {
      this.next();
      let expr: Expr = { k: "str", v: t.v, fstr: !!t.fstr, line: t.line };
      if (t.fstr) expr = this.parseFStringTail(t, expr);
      return expr;
    }
    if (t.t === "ident") {
      if (KEYWORDS.has(t.v)) {
        if (t.v === "None") {
          this.next();
          return { k: "none", line: t.line };
        }
        if (t.v === "True") {
          this.next();
          return { k: "bool", v: true, line: t.line };
        }
        if (t.v === "False") {
          this.next();
          return { k: "bool", v: false, line: t.line };
        }
        if (t.v === "lambda") {
          this.next();
          const params: { name: string; default?: Expr }[] = [];
          while (!this.at("op", ":")) {
            const name = this.expect("ident").v;
            let def: Expr | undefined;
            if (this.eat("op", "=")) def = this.parseExpr();
            params.push({ name, default: def });
            if (!this.eat("op", ",")) break;
          }
          this.expect("op", ":");
          const body = this.parseExpr();
          return { k: "lambda", params, body, line: t.line };
        }
      }
      this.next();
      return { k: "name", v: t.v, line: t.line };
    }
    if (t.t === "op" && t.v === "(") {
      this.next();
      if (this.at("op", ")")) {
        this.next();
        return { k: "tuple", items: [], line: t.line };
      }
      const first = this.parseExpr();
      if (this.at("op", ",")) {
        const items = [first];
        while (this.eat("op", ",")) {
          if (this.at("op", ")")) break;
          items.push(this.parseExpr());
        }
        this.expect("op", ")");
        return { k: "tuple", items, line: t.line };
      }
      this.expect("op", ")");
      return first;
    }
    if (t.t === "op" && t.v === "[") {
      this.next();
      const items: Expr[] = [];
      while (!this.at("op", "]")) {
        items.push(this.parseExpr());
        if (!this.eat("op", ",")) break;
      }
      this.expect("op", "]");
      return { k: "list", items, line: t.line };
    }
    if (t.t === "op" && t.v === "{") {
      this.next();
      if (this.at("op", "}")) {
        this.next();
        // В Python пустой литерал {} — это словарь, а не множество
        return { k: "dict", pairs: [], line: t.line };
      }
      const first = this.parseExpr();
      if (this.at("op", ":")) {
        this.next();
        const firstVal = this.parseExpr();
        const pairs: [Expr, Expr][] = [[first, firstVal]];
        while (this.eat("op", ",")) {
          if (this.at("op", "}")) break;
          const k = this.parseExpr();
          this.expect("op", ":");
          pairs.push([k, this.parseExpr()]);
        }
        this.expect("op", "}");
        return { k: "dict", pairs, line: t.line };
      }
      const items = [first];
      while (this.eat("op", ",")) {
        if (this.at("op", "}")) break;
        items.push(this.parseExpr());
      }
      this.expect("op", "}");
      return { k: "set", items, line: t.line };
    }
    throw new PythonError(`Неожиданное начало выражения: «${t.v || t.t}»`, t.line, "SyntaxError");
  }

  /** Сбор хвоста f-строки: поддерживаем только один литерал целиком. */
  private parseFStringTail(tok: Token, base: Expr): Expr {
    const parts: (string | Expr)[] = [];
    const raw = tok.v;
    let buf = "";
    let i = 0;
    while (i < raw.length) {
      const ch = raw[i];
      if (ch === "{") {
        if (raw[i + 1] === "{") {
          buf += "{";
          i += 2;
          continue;
        }
        if (buf) {
          parts.push(buf);
          buf = "";
        }
        let depth = 1;
        let j = i + 1;
        let inner = "";
        while (j < raw.length && depth > 0) {
          if (raw[j] === "{") depth++;
          if (raw[j] === "}") depth--;
          if (depth === 0) break;
          inner += raw[j];
          j++;
        }
        parts.push(parseExpressionString(inner, tok.line));
        i = j + 1;
        continue;
      }
      if (ch === "}" && raw[i + 1] === "}") {
        buf += "}";
        i += 2;
        continue;
      }
      buf += ch;
      i++;
    }
    if (buf) parts.push(buf);
    void base;
    return { k: "fstring", parts, line: tok.line };
  }
}

/** Разбор выражения из строки (используется для содержимого {…} в f-строках). */
function parseExpressionString(src: string, line: number): Expr {
  const toks = tokenize(src.endsWith("\n") ? src : `${src}\n`);
  const p = new Parser(toks);
  const e = p.parseExpr();
  void line;
  return e;
}

/* ============================ ОКРУЖЕНИЕ ============================ */

class Env {
  vars = new Map<string, Value>();
  constructor(
    public parent?: Env,
    public moduleName = false,
  ) {}
  get(name: string): Value | undefined {
    const v = this.vars.get(name);
    if (v !== undefined) return v;
    return this.parent ? this.parent.get(name) : undefined;
  }
  has(name: string): boolean {
    if (this.vars.has(name)) return true;
    return this.parent ? this.parent.has(name) : false;
  }
  set(name: string, value: Value): void {
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    this.vars.set(name, value);
  }
  define(name: string, value: Value): void {
    this.vars.set(name, value);
  }
}

class BreakSignal {
  constructor(public line: number) {}
}
class ContinueSignal {
  constructor(public line: number) {}
}
class ReturnSignal {
  constructor(
    public value: Value,
    public line: number,
  ) {}
}

/* ============================ ФОРМАТИРОВАНИЕ ============================ */

/** Интерфейс метода экземпляра: объект с методом call (не сама функция). */
interface CallableMethod {
  call: (args: Value[], kwargs: Map<string, Value>) => Value;
}

/**
 * Мост между модульными функциями форматирования (pyRepr/pyStr) и интерпретатором:
 * методы классов и вызов функций живут внутри исполняющего контура, поэтому
 * интерпретатор регистрирует их здесь при каждом запуске.
 */
let methodLookup: ((inst: Instance, name: string) => CallableMethod | undefined) | null = null;
let functionCall:
  ((fnVal: Value, args: Value[], kwargs: Map<string, Value>, line?: number) => Value) | null = null;

function findMethod(inst: Instance, name: string): CallableMethod | undefined {
  return methodLookup ? methodLookup(inst, name) : undefined;
}

export function pyRepr(v: Value): string {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (v instanceof PyFloat) return v.toString();
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    // Как в CPython: предпочтительны одинарные кавычки, двойные — если есть «'»
    const quote = v.includes("'") && !v.includes('"') ? '"' : "'";
    const escaped = v
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t")
      .replace(new RegExp(quote, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  }
  if (v instanceof PyTuple) return v.toString();
  if (Array.isArray(v)) return `[${v.map(pyRepr).join(", ")}]`;
  if (v instanceof Map) {
    const items = [...v.entries()].map(([k, val]) => `${pyRepr(k)}: ${pyRepr(val)}`);
    return `{${items.join(", ")}}`;
  }
  if (v instanceof Set) {
    if (v.size === 0) return "set()";
    return `{${[...v].map(pyRepr).join(", ")}}`;
  }
  if (typeof v === "object" && v !== null && "__instance" in v) {
    const inst = v as Instance;
    const strMethod = findMethod(inst, "__str__");
    if (strMethod) return pyStr(strMethod.call([], new Map()));
    return `<${inst.cls.name} object>`;
  }
  if (typeof v === "object" && v !== null && "__class" in v)
    return `<class '${(v as ClassValue).name}'>`;
  if (typeof v === "object" && v !== null && "__fn" in v)
    return `<function ${(v as FunctionValue).name}>`;
  if (typeof v === "object" && v !== null && "__builtin" in v)
    return `<built-in function ${(v as BuiltinFunction).name}>`;
  return String(v);
}

export function pyStr(v: Value, line?: number): string {
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "__instance" in v) {
    const inst = v as Instance;
    const strMethod = findMethod(inst, "__str__");
    if (strMethod) return pyStr(strMethod.call([], new Map()), line);
    const reprMethod = findMethod(inst, "__repr__");
    if (reprMethod) return pyStr(reprMethod.call([], new Map()), line);
    return `<${inst.cls.name} object>`;
  }
  return pyRepr(v);
}

function pyTruth(v: Value): boolean {
  if (v === null || v === false) return false;
  if (isNum(v)) return numv(v) !== 0;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (v instanceof Map || v instanceof Set) return v.size > 0;
  return true;
}

function pyEq(a: Value, b: Value): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => pyEq(x, b[i]));
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !pyEq(v, b.get(k)!)) return false;
    }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    return [...a].every((x) => b.has(dictKey(x)));
  }
  if (isNum(a) && isNum(b)) return numv(a) === numv(b);
  if (typeof a !== typeof b) return false;
  return a === b;
}

/* ============================ ВСТРОЕННЫЕ ФУНКЦИИ ============================ */

function builtin(
  name: string,
  fn: (args: Value[], kwargs: Map<string, Value>, line?: number) => Value,
): BuiltinFunction {
  return { __builtin: true, name, call: fn };
}

function requireCount(name: string, args: Value[], min: number, max = min): void {
  if (args.length < min || args.length > max) {
    throw new PythonError(
      `${name} ожидает от ${min} до ${max} аргументов, получено ${args.length}`,
      undefined,
      "TypeError",
    );
  }
}

const STDLIB: Record<string, Record<string, Value>> = {
  math: {
    pi: Math.PI,
    e: Math.PI * 0 + Math.E,
    sqrt: builtin("sqrt", (a) => Math.sqrt(Number(a[0]))),
    floor: builtin("floor", (a) => Math.floor(Number(a[0]))),
    ceil: builtin("ceil", (a) => Math.ceil(Number(a[0]))),
    abs: builtin("abs", (a) => Math.abs(Number(a[0]))),
    pow: builtin("pow", (a) => Math.pow(Number(a[0]), Number(a[1]))),
    log: builtin("log", (a) => Math.log(Number(a[0]))),
    sin: builtin("sin", (a) => Math.sin(Number(a[0]))),
    cos: builtin("cos", (a) => Math.cos(Number(a[0]))),
    isnan: builtin("isnan", (a) => Number.isNaN(Number(a[0]))),
    isfinite: builtin("isfinite", (a) => Number.isFinite(Number(a[0]))),
  },
  random: {
    random: builtin("random", () => Math.random()),
    randint: builtin("randint", (a) => {
      const lo = Number(a[0]);
      const hi = Number(a[1]);
      return Math.floor(Math.random() * (hi - lo + 1)) + lo;
    }),
    choice: builtin("choice", (a) => {
      const seq = a[0];
      if (!Array.isArray(seq) || seq.length === 0)
        throw new PythonError("choice: пустая последовательность", undefined, "IndexError");
      return seq[Math.floor(Math.random() * seq.length)];
    }),
    shuffle: builtin("shuffle", (a) => {
      const seq = a[0] as Value[];
      if (!Array.isArray(seq)) throw new PythonError("shuffle: нужен список");
      for (let i = seq.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seq[i], seq[j]] = [seq[j], seq[i]];
      }
      return null;
    }),
  },
  json: {
    dumps: builtin("dumps", (a) => pyToJson(a[0])),
    loads: builtin("loads", (a) => jsonToPy(String(a[0]))),
  },
  datetime: {
    now: builtin("now", () => new Date().toISOString().replace("T", " ").slice(0, 19)),
  },
};

function pyToJson(v: Value): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(pyToJson).join(",")}]`;
  if (v instanceof Map) {
    return `{${[...v.entries()]
      .map(([k, val]) => `${JSON.stringify(pyStr(k))}:${pyToJson(val)}`)
      .join(",")}}`;
  }
  return JSON.stringify(pyStr(v));
}

function jsonToPy(src: string): Value {
  const data = JSON.parse(src);
  const convert = (v: unknown): Value => {
    if (v === null) return null;
    if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return v;
    if (Array.isArray(v)) return v.map(convert);
    if (typeof v === "object")
      return new Map(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, convert(x)]));
    return null;
  };
  return convert(data);
}

/** Имена встроенных исключений: доступны без импорта, как в CPython. */
const EXCEPTION_NAMES = [
  "Exception",
  "BaseException",
  "ValueError",
  "TypeError",
  "KeyError",
  "IndexError",
  "AttributeError",
  "NameError",
  "ZeroDivisionError",
  "ArithmeticError",
  "LookupError",
  "RuntimeError",
  "OSError",
  "IOError",
  "FileNotFoundError",
  "StopIteration",
  "AssertionError",
  "NotImplementedError",
  "ImportError",
  "ModuleNotFoundError",
  "UnboundLocalError",
  "IndentationError",
  "SyntaxError",
  "MemoryError",
  "OverflowError",
];

/** Иерархия исключений: какой тип ловит какую ошибку в `except`. */
const EXC_PARENTS: Record<string, string[]> = {
  BaseException: ["Exception"],
  Exception: [],
  ArithmeticError: ["ZeroDivisionError", "OverflowError"],
  LookupError: ["KeyError", "IndexError"],
  OSError: ["FileNotFoundError", "IOError"],
  IOError: ["OSError", "FileNotFoundError"],
};

/** Соответствует ли тип(ы) в `except` имени возникшей ошибки. */
function exceptionMatches(typeVal: Value, errName: string): boolean {
  const names: string[] = [];
  const collect = (v: Value): void => {
    if (v && typeof v === "object" && "__exc" in v) names.push((v as BuiltinFunction).name);
    else if (Array.isArray(v)) for (const item of v) collect(item);
    else names.push(typeof v === "string" ? v : pyStr(v));
  };
  collect(typeVal);
  return names.some(
    (t) =>
      t === "Exception" ||
      t === "BaseException" ||
      t === errName ||
      (EXC_PARENTS[t] ?? []).includes(errName),
  );
}

function createBuiltins(): Map<string, Value> {
  const m = new Map<string, Value>();
  m.set(
    "print",
    builtin("print", (args, kwargs, line) => {
      const sep = kwargs.has("sep") ? pyStr(kwargs.get("sep")!) : " ";
      const end = kwargs.has("end") ? pyStr(kwargs.get("end")!) : "\n";
      const text = args.map((a) => pyStr(a, line)).join(sep) + end;
      emitOutput(text);
      return null;
    }),
  );
  m.set(
    "len",
    builtin("len", (a) => {
      requireCount("len", a, 1);
      const v = a[0];
      if (typeof v === "string") return v.length;
      if (Array.isArray(v)) return v.length;
      if (v instanceof Map || v instanceof Set) return v.size;
      throw new PythonError(`len() не поддерживается для ${typeOf(v)}`, undefined, "TypeError");
    }),
  );
  m.set(
    "range",
    builtin("range", (a) => {
      let start = 0;
      let stop = 0;
      let step = 1;
      if (a.length === 1) stop = Number(a[0]);
      else if (a.length >= 2) {
        start = Number(a[0]);
        stop = Number(a[1]);
        if (a.length > 2) step = Number(a[2]);
      }
      if (step === 0)
        throw new PythonError("range(): шаг не может быть 0", undefined, "ValueError");
      const out: number[] = [];
      if (step > 0) for (let i = start; i < stop; i += step) out.push(i);
      else for (let i = start; i > stop; i += step) out.push(i);
      if (out.length > 100000)
        throw new PythonError(
          "range слишком велик (лимит 100000 элементов)",
          undefined,
          "MemoryError",
        );
      return out;
    }),
  );
  m.set(
    "int",
    builtin("int", (a) => {
      requireCount("int", a, 1);
      const v = a[0];
      if (isNum(v)) return Math.trunc(numv(v));
      const s = pyStr(v).trim();
      const n = /^0x/i.test(s) ? parseInt(s.slice(2), 16) : s === "" ? NaN : Number(s);
      if (Number.isNaN(n))
        throw new PythonError(`invalid literal for int(): '${s}'`, undefined, "ValueError");
      return Math.trunc(n);
    }),
  );
  m.set(
    "float",
    builtin("float", (a) => {
      requireCount("float", a, 1);
      const s = pyStr(a[0]).trim();
      const n = s === "" ? NaN : Number(s);
      if (Number.isNaN(n) && s !== "nan")
        throw new PythonError(`could not convert string to float: '${s}'`, undefined, "ValueError");
      return new PyFloat(n);
    }),
  );
  m.set(
    "str",
    builtin("str", (a) => (a.length === 0 ? "" : pyStr(a[0]))),
  );
  m.set(
    "bool",
    builtin("bool", (a) => (a.length === 0 ? false : pyTruth(a[0]))),
  );
  m.set(
    "type",
    builtin("type", (a) => typeOf(a[0]) as unknown as Value),
  );
  m.set(
    "abs",
    builtin("abs", (a) =>
      isNum(a[0]) ? keepFloat(Math.abs(numv(a[0])), a[0]) : Math.abs(Number(a[0])),
    ),
  );
  m.set(
    "sum",
    builtin("sum", (a) => {
      const seq = a[0];
      const items = isIterable(seq) ? toList(seq) : null;
      if (!items) throw new PythonError("sum() ожидает список", undefined, "TypeError");
      const start = a.length > 1 ? a[1] : 0;
      const total = items.reduce<number>((acc, x) => acc + numv(x), numv(start));
      const asFloat = start instanceof PyFloat || items.some((x) => x instanceof PyFloat);
      return asFloat ? new PyFloat(total) : total;
    }),
  );
  m.set(
    "min",
    builtin("min", (a) => {
      const seq = a.length === 1 && isIterable(a[0]) ? toList(a[0]) : a;
      if (seq.length === 0)
        throw new PythonError("min() ожидает непустую последовательность", undefined, "ValueError");
      return seq.reduce((acc, x) => (compare(acc, x) <= 0 ? acc : x));
    }),
  );
  m.set(
    "max",
    builtin("max", (a) => {
      const seq = a.length === 1 && isIterable(a[0]) ? toList(a[0]) : a;
      if (seq.length === 0)
        throw new PythonError("max() ожидает непустую последовательность", undefined, "ValueError");
      return seq.reduce((acc, x) => (compare(acc, x) >= 0 ? acc : x));
    }),
  );
  m.set(
    "round",
    builtin("round", (a) => {
      const digits = a.length > 1 ? Number(a[1]) : 0;
      const f = Math.pow(10, digits);
      return Math.round(Number(a[0]) * f) / f;
    }),
  );
  m.set(
    "sorted",
    builtin("sorted", (a, kwargs) => {
      const seq = a[0];
      if (!isIterable(seq))
        throw new PythonError("sorted() ожидает список", undefined, "TypeError");
      const copy = toList(seq);
      const key = kwargs.get("key");
      const callFn = functionCall;
      if (key !== undefined && callFn) {
        const kf = (v: Value): Value => callFn(key, [v], new Map());
        copy.sort((x, y) => compare(kf(x), kf(y)));
      } else {
        copy.sort(compare);
      }
      if (pyTruth(kwargs.get("reverse") ?? false)) copy.reverse();
      return copy;
    }),
  );
  m.set(
    "reversed",
    builtin("reversed", (a) => {
      const seq = a[0];
      if (!isIterable(seq)) throw new PythonError("reversed() ожидает список");
      return toList(seq).reverse();
    }),
  );
  m.set(
    "list",
    builtin("list", (a) => {
      if (a.length === 0) return [];
      const v = a[0];
      if (v instanceof PyTuple) return [...v];
      return toList(v);
    }),
  );
  m.set(
    "dict",
    builtin("dict", (a) => {
      if (a.length === 0) return new Map();
      if (a[0] instanceof Map) return new Map(a[0] as Map<Value, Value>);
      throw new PythonError("dict() в демо поддерживает только вызов без аргументов");
    }),
  );
  m.set(
    "set",
    builtin("set", (a) => {
      if (a.length === 0) return new Set();
      const v = a[0];
      if (Array.isArray(v)) return new Set(v);
      if (typeof v === "string") return new Set(v.split(""));
      if (v instanceof Set) return new Set(v);
      throw new PythonError("set() не поддерживается для этого значения", undefined, "TypeError");
    }),
  );
  m.set(
    "tuple",
    builtin("tuple", (a) => {
      if (a.length === 0) return new PyTuple();
      const v = a[0];
      if (Array.isArray(v)) return new PyTuple(...v);
      throw new PythonError("tuple() ожидает список", undefined, "TypeError");
    }),
  );
  m.set(
    "enumerate",
    builtin("enumerate", (a) => {
      const seq = a[0];
      if (!Array.isArray(seq) && typeof seq !== "string")
        throw new PythonError("enumerate() ожидает последовательность");
      const start = a.length > 1 ? Number(a[1]) : 0;
      return (Array.isArray(seq) ? seq : (seq as string).split("")).map(
        (v, i) => new PyTuple(start + i, v as Value),
      );
    }),
  );
  m.set(
    "zip",
    builtin("zip", (a) => {
      const arrays = a.filter((x): x is Value[] => Array.isArray(x));
      if (arrays.length === 0) return [];
      const len = Math.min(...arrays.map((x) => x.length));
      const out: Value[] = [];
      for (let i = 0; i < len; i++) out.push(new PyTuple(...arrays.map((x) => x[i])));
      return out;
    }),
  );
  m.set(
    "any",
    builtin("any", (a) => (a[0] as Value[]).some(pyTruth)),
  );
  m.set(
    "all",
    builtin("all", (a) => (a[0] as Value[]).every(pyTruth)),
  );
  m.set(
    "isinstance",
    builtin("isinstance", (a) => {
      const v = a[0];
      const t = a[1];
      if (typeof t === "string") return typeOf(v) === t;
      if (t && typeof t === "object" && "__class" in t) {
        let cls: ClassValue | undefined = (v as Instance).cls;
        const target = t as ClassValue;
        while (cls) {
          if (cls === target) return true;
          cls = cls.base;
        }
        return false;
      }
      if (Array.isArray(t)) return t.some((x) => pyEq(x as Value, typeOf(v) as unknown as Value));
      return false;
    }),
  );
  m.set(
    "input",
    builtin("input", (a, _kwargs, line) => {
      const prompt = a.length > 0 ? pyStr(a[0]) : "";
      emitOutput(`${prompt}\n`);
      emitOutput(
        `[демо-режим] input(): ввод с клавиатуры недоступен в браузере — возвращена пустая строка${
          line ? ` (строка ${line})` : ""
        }\n`,
      );
      return "";
    }),
  );
  m.set(
    "open",
    builtin("open", () => {
      throw new PythonError(
        "Доступ к файлам в браузере отключён по соображениям безопасности. Работу с файлами проверяй локально или через Pyodide (песочница браузера).",
        undefined,
        "OSError",
      );
    }),
  );
  m.set(
    "id",
    builtin("id", () => Math.floor(Math.random() * 100000)),
  );
  m.set(
    "repr",
    builtin("repr", (a) => pyRepr(a[0])),
  );
  m.set(
    "hex",
    builtin("hex", (a) => `0x${Number(a[0]).toString(16)}`),
  );
  m.set(
    "oct",
    builtin("oct", (a) => `0o${Number(a[0]).toString(8)}`),
  );
  m.set(
    "bin",
    builtin("bin", (a) => `0b${Number(a[0]).toString(2)}`),
  );
  m.set(
    "ord",
    builtin("ord", (a) => pyStr(a[0]).charCodeAt(0) as unknown as Value),
  );
  m.set(
    "chr",
    builtin("chr", (a) => String.fromCharCode(Number(a[0]))),
  );
  m.set(
    "sorted_reversed_marker",
    builtin("sorted_reversed_marker", () => null),
  );
  // Исключения: работают и как тип в `except ValueError:`,
  // и как конструктор в `raise ValueError("сообщение")`.
  for (const name of EXCEPTION_NAMES) {
    const exc = builtin(name, (args, _kwargs, line) => {
      throw new PythonError(args.length > 0 ? pyStr(args[0]) : name, line, name);
    }) as BuiltinFunction & { __exc?: boolean };
    exc.__exc = true;
    m.set(name, exc);
  }
  return m;
}

function typeOf(v: Value): string {
  if (v === null) return "NoneType";
  if (typeof v === "boolean") return "bool";
  if (v instanceof PyFloat) return "float";
  if (typeof v === "number") return Number.isInteger(v) ? "int" : "float";
  if (typeof v === "string") return "str";
  if (v instanceof PyTuple) return "tuple";
  if (Array.isArray(v)) return "list";
  if (v instanceof Map) return "dict";
  if (v instanceof Set) return "set";
  if (typeof v === "object" && v !== null) {
    if ("__class" in v) return "type";
    if ("__instance" in v) return (v as Instance).cls.name;
    if ("__fn" in v) return "function";
    if ("__builtin" in v) return "builtin_function_or_method";
  }
  return "object";
}

function compare(a: Value, b: Value): number {
  if (isNum(a) && isNum(b)) return numv(a) - numv(b);
  if (typeof a === "string" && typeof b === "string") return a < b ? -1 : a > b ? 1 : 0;
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const c = compare(a[i], b[i]);
      if (c !== 0) return c;
    }
    return a.length - b.length;
  }
  const sa = pyRepr(a);
  const sb = pyRepr(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}

/* ============================ ИСПОЛНИТЕЛЬ ============================ */

let outputSink: ((text: string) => void) | null = null;
function emitOutput(text: string): void {
  outputSink?.(text);
}

export interface RunOptions {
  /** Максимальное число шагов защиты от зацикливания */
  maxSteps?: number;
}

export interface RunOutcome {
  output: string;
  error?: { type: string; message: string; line?: number };
}

export function runPythonLite(code: string, options: RunOptions = {}): RunOutcome {
  const maxSteps = options.maxSteps ?? 3_000_000;
  let output = "";
  outputSink = (text) => {
    output += text;
  };
  const started = performance.now();

  let steps = 0;
  const tick = (line?: number) => {
    steps++;
    if (steps > maxSteps) {
      throw new PythonError(
        "Превышен лимит шагов — вероятно, бесконечный цикл",
        line,
        "RuntimeError",
      );
    }
    if (performance.now() - started > 4000) {
      throw new PythonError("Слишком долгое выполнение (лимит 4 секунды)", line, "RuntimeError");
    }
  };

  try {
    const toks = tokenize(code);
    const program = new Parser(toks).parseProgram();
    const builtins = createBuiltins();
    const moduleEnv = new Env(undefined, true);
    for (const [k, v] of builtins) moduleEnv.define(k, v);

    const globals = moduleEnv;

    const execBlock = (stmts: Stmt[], env: Env): void => {
      for (const s of stmts) execStmt(s, env);
    };

    const makeFunction = (fn: FunctionValue, env: Env): FunctionValue => ({ ...fn, scope: env });

    const callFunction = (
      fn: FunctionValue,
      args: Value[],
      kwargs: Map<string, Value>,
      line?: number,
    ): Value => {
      const local = new Env(fn.scope);
      fn.params.forEach((p, i) => {
        if (i < args.length) local.define(p.name, args[i]);
        else if (p.default) local.define(p.name, evalExpr(p.default, fn.scope));
        else
          throw new PythonError(
            `Функция «${fn.name}» ожидала аргумент «${p.name}»`,
            line,
            "TypeError",
          );
      });
      if (fn.varargs) {
        const rest = args.slice(fn.params.length);
        local.define(fn.varargs, new PyTuple(...rest));
      } else {
        if (args.length > fn.params.length)
          throw new PythonError(
            `Функция «${fn.name}» получила лишние аргументы`,
            line,
            "TypeError",
          );
      }
      if (fn.kwargs) {
        const map = new Map<Value, Value>();
        for (const [k, v] of kwargs) map.set(k, v);
        local.define(fn.kwargs, map);
      } else if (kwargs.size > 0) {
        throw new PythonError(
          `Функция «${fn.name}» не принимает именованные аргументы`,
          line,
          "TypeError",
        );
      }
      try {
        execBlock(fn.body, local);
      } catch (sig) {
        if (sig instanceof ReturnSignal) return sig.value;
        throw sig;
      }
      return null;
    };

    const findMethodOn = (cls: ClassValue | undefined, name: string): FunctionValue | undefined => {
      let c = cls;
      while (c) {
        const m = c.methods.get(name);
        if (m) return m;
        c = c.base;
      }
      return undefined;
    };

    const findMethodOnInstance = (inst: Instance, name: string): CallableMethod | undefined => {
      const m = findMethodOn(inst.cls, name);
      if (!m) return undefined;
      return {
        call: (args, kwargs) => callFunction(m, [inst, ...args], kwargs),
      };
    };

    // Отдаём контур исполнения модульному слою форматирования и сортировки.
    methodLookup = findMethodOnInstance;
    functionCall = (fnVal, args, kwargs, line) => callValue(fnVal, args, kwargs, line);

    const instantiate = (
      cls: ClassValue,
      args: Value[],
      kwargs: Map<string, Value>,
      line?: number,
    ): Instance => {
      const inst: Instance = { __instance: true, cls, attrs: new Map() };
      const init = findMethodOn(cls, "__init__");
      if (init) callFunction(init, [inst, ...args], kwargs, line);
      else if (args.length > 0)
        throw new PythonError(
          `У класса ${cls.name} нет __init__, аргументы не нужны`,
          line,
          "TypeError",
        );
      return inst;
    };

    const getAttribute = (obj: Value, name: string, line?: number): Value => {
      if (obj && typeof obj === "object" && "__instance" in obj) {
        const inst = obj as Instance;
        if (inst.attrs.has(name)) return inst.attrs.get(name)!;
        const m = findMethodOn(inst.cls, name);
        if (m)
          return builtin(name, (args, kwargs) => callFunction(m, [inst, ...args], kwargs, line));
        throw new PythonError(
          `'${inst.cls.name}' object has no attribute '${name}'`,
          line,
          "AttributeError",
        );
      }
      if (obj && typeof obj === "object" && "__class" in obj) {
        const cls = obj as ClassValue;
        const m = findMethodOn(cls, name);
        if (m) return m;
        throw new PythonError(
          `У класса ${cls.name} нет атрибута '${name}'`,
          line,
          "AttributeError",
        );
      }
      if (typeof obj === "string") return stringAttribute(obj, name, line);
      if (Array.isArray(obj)) return listAttribute(obj, name, line);
      if (obj instanceof PyModule) {
        if (obj.has(name)) return obj.get(name)!;
        throw new PythonError(`Модуль не содержит атрибута '${name}'`, line, "AttributeError");
      }
      if (obj instanceof Map) return dictAttribute(obj, name, line);
      if (obj instanceof Set) return setMethodsAttribute(obj, name, line);
      throw new PythonError(
        `У значения типа ${typeOf(obj)} нет атрибута '${name}'`,
        line,
        "AttributeError",
      );
    };

    const setAttribute = (obj: Value, name: string, value: Value, line?: number): void => {
      if (obj && typeof obj === "object" && "__instance" in obj) {
        (obj as Instance).attrs.set(name, value);
        return;
      }
      throw new PythonError(
        `Нельзя задать атрибут «${name}» для ${typeOf(obj)}`,
        line,
        "AttributeError",
      );
    };

    const execStmt = (s: Stmt, env: Env): void => {
      tick(s.line);
      switch (s.k) {
        case "assign": {
          const value = evalExpr(s.value, env);
          assignTo(s.target, value, env, s.line);
          return;
        }
        case "augassign": {
          const current = evalExpr(s.target, env);
          const value = evalExpr(s.value, env);
          assignTo(s.target, binOp(s.op, current, value, s.line), env, s.line);
          return;
        }
        case "expr": {
          evalExpr(s.value, env);
          return;
        }
        case "if": {
          for (const [cond, body] of s.branches) {
            if (pyTruth(evalExpr(cond, env))) {
              execBlock(body, new Env(env));
              return;
            }
          }
          if (s.otherwise) execBlock(s.otherwise, new Env(env));
          return;
        }
        case "while": {
          while (pyTruth(evalExpr(s.cond, env))) {
            tick(s.line);
            try {
              execBlock(s.body, new Env(env));
            } catch (sig) {
              if (sig instanceof BreakSignal) break;
              if (sig instanceof ContinueSignal) continue;
              throw sig;
            }
          }
          return;
        }
        case "for": {
          const iterable = evalExpr(s.iter, env);
          const items = toSequence(iterable, s.line);
          for (const item of items) {
            tick(s.line);
            assignTo(s.target, item, env, s.line);
            try {
              execBlock(s.body, new Env(env));
            } catch (sig) {
              if (sig instanceof BreakSignal) break;
              if (sig instanceof ContinueSignal) continue;
              throw sig;
            }
          }
          return;
        }
        case "break":
          throw new BreakSignal(s.line);
        case "continue":
          throw new ContinueSignal(s.line);
        case "pass":
          return;
        case "return":
          throw new ReturnSignal(s.value ? evalExpr(s.value, env) : null, s.line);
        case "def":
          env.define(s.fn.name, makeFunction(s.fn, env));
          return;
        case "class": {
          const baseExpr = (s.cls as unknown as { baseExpr?: Expr }).baseExpr;
          const cls: ClassValue = {
            __class: true,
            name: s.cls.name,
            methods: new Map(),
            base: undefined,
          };
          if (baseExpr) {
            const baseVal = evalExpr(baseExpr, env);
            if (baseVal && typeof baseVal === "object" && "__class" in baseVal)
              cls.base = baseVal as ClassValue;
            else throw new PythonError("Базовый класс должен быть классом", s.line, "TypeError");
          }
          const classEnv = new Env(env);
          for (const stmt of s.body) {
            if (stmt.k === "def") classEnv.define(stmt.fn.name, makeFunction(stmt.fn, classEnv));
          }
          for (const [name, value] of classEnv.vars) {
            if (value && typeof value === "object" && "__fn" in value)
              cls.methods.set(name, value as FunctionValue);
          }
          env.define(cls.name, cls as unknown as Value);
          return;
        }
        case "try": {
          try {
            execBlock(s.body, new Env(env));
          } catch (err) {
            let handled = false;
            for (const h of s.handlers) {
              if (!h.type) {
                handled = true;
                execBlock(h.body, new Env(env));
                break;
              }
              const typeVal = evalExpr(h.type, env);
              const errName = err instanceof PythonError ? err.name : "RuntimeError";
              if (exceptionMatches(typeVal, errName)) {
                handled = true;
                execBlock(h.body, new Env(env));
                break;
              }
            }
            if (!handled) throw err;
          } finally {
            if (s.finallyBody) execBlock(s.finallyBody, new Env(env));
          }
          return;
        }
        case "raise": {
          if (!s.value)
            throw new PythonError("Ошибка (raise без сообщения)", s.line, "RuntimeError");
          const val = evalExpr(s.value, env);
          if (typeof val === "string") throw new PythonError(val, s.line, "Exception");
          if (val && typeof val === "object" && "__exc" in val) {
            const name = (val as BuiltinFunction).name;
            throw new PythonError(name, s.line, name);
          }
          if (val && typeof val === "object" && "__class" in val) {
            const cls = val as ClassValue;
            throw new PythonError(`${cls.name}`, s.line, cls.name);
          }
          throw new PythonError(pyStr(val), s.line, "Exception");
        }
        case "assert": {
          if (!pyTruth(evalExpr(s.cond, env))) {
            const msg = s.msg ? pyStr(evalExpr(s.msg, env)) : "Assertion failed";
            throw new PythonError(msg, s.line, "AssertionError");
          }
          return;
        }
        case "import": {
          const module = STDLIB[s.module];
          if (!module)
            throw new PythonError(
              `Модуль «${s.module}» недоступен в демо-режиме. Включи Pyodide в настройках или запусти код локально.`,
              s.line,
              "ModuleNotFoundError",
            );
          const holder = new PyModule(
            Object.entries(module).map(([k, v]) => [k, v] as [Value, Value]),
          );
          env.define(s.alias ?? s.module, holder as unknown as Value);
          return;
        }
        case "from": {
          const module = STDLIB[s.module];
          if (!module)
            throw new PythonError(
              `Модуль «${s.module}» недоступен в демо-режиме. Включи Pyodide в настройках.`,
              s.line,
              "ModuleNotFoundError",
            );
          for (const { name, alias } of s.names) {
            const v = module[name];
            if (v === undefined)
              throw new PythonError(
                `cannot import name '${name}' from '${s.module}'`,
                s.line,
                "ImportError",
              );
            env.define(alias ?? name, v);
          }
          return;
        }
        case "global": {
          for (const name of s.names) {
            const v = globals.get(name);
            if (v !== undefined) env.vars.set(name, v);
          }
          return;
        }
        case "delete": {
          if (s.target.k === "name") env.vars.delete(s.target.v);
          return;
        }
        case "print":
          return;
        default:
          return;
      }
    };

    const assignTo = (target: Expr, value: Value, env: Env, line?: number): void => {
      if (target.k === "name") {
        if (target.v.startsWith("__")) env.define(target.v, value);
        else env.set(target.v, value);
        return;
      }
      if (target.k === "tuple" || target.k === "list") {
        const values = toSequence(value, line);
        if (values.length !== target.items.length)
          throw new PythonError(
            `Нельзя распаковать ${values.length} значений в ${target.items.length}`,
            line,
            "ValueError",
          );
        target.items.forEach((t, i) => assignTo(t, values[i], env, line));
        return;
      }
      if (target.k === "index") {
        const obj = evalExpr(target.obj, env);
        const idx = evalExpr(target.index, env);
        if (Array.isArray(obj)) {
          const i = normalizeIndex(idx, obj.length, line);
          obj[i] = value;
          return;
        }
        if (obj instanceof Map) {
          obj.set(idx, value);
          return;
        }
        throw new PythonError(`Нельзя присвоить по индексу для ${typeOf(obj)}`, line, "TypeError");
      }
      if (target.k === "attr") {
        const obj = evalExpr(target.obj, env);
        setAttribute(obj, target.name, value, line);
        return;
      }
      throw new PythonError("Недопустимая цель присваивания", line, "SyntaxError");
    };

    const normalizeIndex = (idx: Value, length: number, line?: number): number => {
      if (!isNum(idx)) throw new PythonError("Индекс должен быть числом", line, "TypeError");
      const n = numv(idx);
      if (!Number.isInteger(n))
        throw new PythonError("Индекс должен быть целым числом", line, "TypeError");
      const i = n < 0 ? length + n : n;
      if (i < 0 || i >= length)
        throw new PythonError(
          `Индекс ${pyStr(idx)} вне диапазона (длина ${length})`,
          line,
          "IndexError",
        );
      return i;
    };

    const toSequence = (v: Value, line?: number): Value[] => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string") return v.split("");
      if (v instanceof Map) return [...v.keys()];
      if (v instanceof Set) return [...v];
      if (v && typeof v === "object" && "__instance" in v) {
        const it = findMethod(v as Instance, "__iter__");
        if (it) return toSequence(it.call([], new Map()), line);
      }
      throw new PythonError(`Объект типа ${typeOf(v)} не итерируется`, line, "TypeError");
    };

    const evalExpr = (e: Expr, env: Env): Value => {
      tick(e.line);
      switch (e.k) {
        case "num":
          return e.v;
        case "bool":
          return e.v;
        case "none":
          return null;
        case "str": {
          if (!e.fstr) return e.v;
          return e.v;
        }
        case "name": {
          const v = env.get(e.v);
          if (v === undefined)
            throw new PythonError(`Имя «${e.v}» не определено`, e.line, "NameError");
          return v;
        }
        case "list":
          return e.items.map((i) => evalExpr(i, env));
        case "tuple":
          return new PyTuple(...e.items.map((i) => evalExpr(i, env)));
        case "set":
          return new Set(e.items.map((i) => dictKey(evalExpr(i, env))));
        case "dict": {
          const map = new Map<Value, Value>();
          for (const [k, v] of e.pairs) map.set(dictKey(evalExpr(k, env)), evalExpr(v, env));
          return map;
        }
        case "fstring": {
          return e.parts
            .map((p) => (typeof p === "string" ? p : pyStr(evalExpr(p, env), e.line)))
            .join("");
        }
        case "unary": {
          if (e.op === "not") return !pyTruth(evalExpr(e.operand, env));
          const v = evalExpr(e.operand, env);
          if (e.op === "-") return isNum(v) ? keepFloat(-numv(v), v) : -Number(v);
          if (e.op === "+") return v;
          if (e.op === "~") return ~numv(v);
          if (e.op === "*") {
            // распаковка аргументов обрабатывается в call
            return v;
          }
          return v;
        }
        case "bin":
          return binOp(e.op, evalExpr(e.left, env), evalExpr(e.right, env), e.line);
        case "boolop": {
          const left = evalExpr(e.left, env);
          if (e.op === "and") return pyTruth(left) ? evalExpr(e.right, env) : left;
          return pyTruth(left) ? left : evalExpr(e.right, env);
        }
        case "condexpr":
          return pyTruth(evalExpr(e.test, env)) ? evalExpr(e.then, env) : evalExpr(e.other, env);
        case "cmp": {
          const left = evalExpr(e.left, env);
          const right = evalExpr(e.right, env);
          switch (e.op) {
            case "==":
              return pyEq(left, right);
            case "!=":
              return !pyEq(left, right);
            case "<":
              return compare(left, right) < 0;
            case ">":
              return compare(left, right) > 0;
            case "<=":
              return compare(left, right) <= 0;
            case ">=":
              return compare(left, right) >= 0;
            case "in":
              return contains(right, left, e.line);
            case "not in":
              return !contains(right, left, e.line);
            case "is":
              return left === right;
            case "is not":
              return left !== right;
            default:
              throw new PythonError(`Неизвестный оператор ${e.op}`, e.line, "SyntaxError");
          }
        }
        case "lambda":
          return {
            __fn: true,
            name: "<lambda>",
            params: e.params,
            body: [{ k: "return", value: e.body, line: e.line }],
            scope: env,
          } as FunctionValue;
        case "index": {
          const obj = evalExpr(e.obj, env);
          const idx = evalExpr(e.index, env);
          return itemAt(obj, idx, e.line);
        }
        case "slice": {
          const obj = evalExpr(e.obj, env);
          const len =
            Array.isArray(obj) || typeof obj === "string" ? (obj as { length: number }).length : 0;
          const start = e.start ? Number(evalExpr(e.start, env)) : 0;
          const stop = e.stop ? Number(evalExpr(e.stop, env)) : len;
          const step = e.step ? Number(evalExpr(e.step, env)) : 1;
          return applySlice(obj, start, stop, step, len, e.line);
        }
        case "attr":
          return getAttribute(evalExpr(e.obj, env), e.name, e.line);
        case "call": {
          const fnVal = evalExpr(e.func, env);
          const args: Value[] = [];
          for (const a of e.args) {
            if (a.k === "unary" && a.op === "*")
              args.push(...toSequence(evalExpr(a.operand, env), e.line));
            else args.push(evalExpr(a, env));
          }
          const kwargs = new Map<string, Value>();
          for (const [name, expr] of e.kwargs) {
            if (name === "**") {
              const spread = evalExpr(expr, env);
              if (spread instanceof Map) for (const [k, v] of spread) kwargs.set(pyStr(k), v);
            } else kwargs.set(name, evalExpr(expr, env));
          }
          return callValue(fnVal, args, kwargs, e.line);
        }
        default:
          throw new PythonError("Неизвестное выражение", (e as Expr).line, "SyntaxError");
      }
    };

    const callValue = (
      fnVal: Value,
      args: Value[],
      kwargs: Map<string, Value>,
      line?: number,
    ): Value => {
      if (fnVal && typeof fnVal === "object" && "__builtin" in fnVal) {
        return (fnVal as BuiltinFunction).call(args, kwargs, line);
      }
      if (fnVal && typeof fnVal === "object" && "__fn" in fnVal) {
        return callFunction(fnVal as FunctionValue, args, kwargs, line);
      }
      if (fnVal && typeof fnVal === "object" && "__class" in fnVal) {
        return instantiate(fnVal as ClassValue, args, kwargs, line);
      }
      if (fnVal instanceof Map) {
        // вызов вида module.func()
        throw new PythonError("Объект модуля не является функцией", line, "TypeError");
      }
      throw new PythonError(`Объект типа ${typeOf(fnVal)} нельзя вызвать`, line, "TypeError");
    };

    const contains = (container: Value, item: Value, line?: number): boolean => {
      if (typeof container === "string") return container.includes(pyStr(item));
      if (Array.isArray(container)) return container.some((x) => pyEq(x, item));
      if (container instanceof Map) return container.has(dictKey(item));
      if (container instanceof Set) return container.has(dictKey(item));
      throw new PythonError(
        `Оператор in не поддерживается для ${typeOf(container)}`,
        line,
        "TypeError",
      );
    };

    const itemAt = (obj: Value, idx: Value, line?: number): Value => {
      if (Array.isArray(obj)) return obj[normalizeIndex(idx, obj.length, line)];
      if (typeof obj === "string") return obj[normalizeIndex(idx, obj.length, line)];
      if (obj instanceof Map) {
        if (!obj.has(idx))
          throw new PythonError(`Ключ ${pyRepr(idx)} отсутствует в словаре`, line, "KeyError");
        return obj.get(idx)!;
      }
      if (obj instanceof Set)
        throw new PythonError("Элементы множества недоступны по индексу", line, "TypeError");
      throw new PythonError(`Нельзя обратиться по индексу к ${typeOf(obj)}`, line, "TypeError");
    };

    const applySlice = (
      obj: Value,
      start: number,
      stop: number,
      step: number,
      len: number,
      line?: number,
    ): Value => {
      const norm = (v: number) => (v < 0 ? len + v : v);
      if (step === 0) throw new PythonError("Шаг среза не может быть 0", line, "ValueError");
      const s = step;
      const out: Value[] = [];
      const from = s > 0 ? Math.max(0, norm(start)) : Math.min(len - 1, norm(start));
      const to = s > 0 ? Math.min(len, norm(stop)) : Math.max(-1, norm(stop));
      for (let i = from; s > 0 ? i < to : i > to; i += s) {
        if (Array.isArray(obj)) out.push(obj[i]);
        else if (typeof obj === "string") out.push(obj[i]);
        if (out.length > 100000) break;
      }
      if (typeof obj === "string") return out.join("");
      return out;
    };

    const binOp = (op: string, a: Value, b: Value, line?: number): Value => {
      switch (op) {
        case "+":
          if (isNum(a) && isNum(b)) return keepFloat(numv(a) + numv(b), a, b);
          if (typeof a === "string" && typeof b === "string") return a + b;
          if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
          if (a instanceof Set && b instanceof Set) return new Set([...a, ...b]);
          throw new PythonError(`Нельзя сложить ${typeOf(a)} и ${typeOf(b)}`, line, "TypeError");
        case "-":
          if (isNum(a) && isNum(b)) return keepFloat(numv(a) - numv(b), a, b);
          if (a instanceof Set && b instanceof Set) return new Set([...a].filter((x) => !b.has(x)));
          throw new PythonError(`Нельзя вычесть ${typeOf(a)} и ${typeOf(b)}`, line, "TypeError");
        case "*":
          if (isNum(a) && isNum(b)) return keepFloat(numv(a) * numv(b), a, b);
          if (typeof a === "string" && isNum(b)) return a.repeat(Math.max(0, Math.trunc(numv(b))));
          if (isNum(a) && typeof b === "string") return b.repeat(Math.max(0, Math.trunc(numv(a))));
          if (Array.isArray(a) && isNum(b)) {
            const out: Value[] = [];
            for (let i = 0; i < numv(b); i++) out.push(...a);
            return out;
          }
          throw new PythonError(
            `Операция * не поддерживается для ${typeOf(a)} и ${typeOf(b)}`,
            line,
            "TypeError",
          );
        case "/":
          if (isNum(b) && numv(b) === 0)
            throw new PythonError("Division by zero", line, "ZeroDivisionError");
          // В Python деление всегда даёт float
          return new PyFloat(numv(a) / numv(b));
        case "//":
          if (isNum(b) && numv(b) === 0)
            throw new PythonError("Integer division or modulo by zero", line, "ZeroDivisionError");
          return keepFloat(Math.floor(numv(a) / numv(b)), a, b);
        case "%":
          if (isNum(b) && numv(b) === 0)
            throw new PythonError("Integer division or modulo by zero", line, "ZeroDivisionError");
          if (typeof a === "string") return formatPercent(a, Array.isArray(b) ? b : [b]);
          return keepFloat(((numv(a) % numv(b)) + numv(b)) % numv(b), a, b);
        case "**":
          return keepFloat(Math.pow(numv(a), numv(b)), a, b);
        default:
          throw new PythonError(`Неизвестная операция ${op}`, line, "SyntaxError");
      }
    };

    const formatPercent = (fmt: string, values: Value[]): string => {
      let i = 0;
      return fmt.replace(/%([sdif])/g, (_m, kind: string) => {
        const v = values[i++];
        if (v === undefined) return "%";
        if (kind === "d" && isNum(v)) return String(Math.trunc(numv(v)));
        if (kind === "f" && isNum(v)) return numv(v).toFixed(6);
        if (typeof v === "number" && !Number.isInteger(v)) return v.toFixed(6);
        return pyStr(v);
      });
    };

    // Запуск программы
    try {
      execBlock(program, moduleEnv);
    } catch (sig) {
      if (
        sig instanceof ReturnSignal ||
        sig instanceof BreakSignal ||
        sig instanceof ContinueSignal
      ) {
        // return/continue вне блока — не ошибка, просто игнорируем
      } else throw sig;
    }

    return { output };
  } catch (err) {
    if (err instanceof PythonError) {
      return {
        output,
        error: {
          type: err.name,
          message: err.message,
          line: err.line,
        },
      };
    }
    return {
      output,
      error: {
        type: "RuntimeError",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  } finally {
    outputSink = null;
  }
}

/* Методы встроенных типов */

function stringAttribute(s: string, name: string, line?: number): Value {
  /** Отрезает символы слева/справа — аналог str.strip(chars). */
  const stripWith = (chars: string, fromStart: boolean, fromEnd: boolean): string => {
    const set = new Set([...chars]);
    let start = 0;
    let end = s.length;
    if (fromStart) while (start < end && set.has(s[start])) start++;
    if (fromEnd) while (end > start && set.has(s[end - 1])) end--;
    return s.slice(start, end);
  };
  const map: Record<string, BuiltinFunction> = {
    upper: builtin("upper", () => s.toUpperCase()),
    lower: builtin("lower", () => s.toLowerCase()),
    strip: builtin("strip", (a) => (a.length ? stripWith(pyStr(a[0]), true, true) : s.trim())),
    lstrip: builtin("lstrip", (a) =>
      a.length ? stripWith(pyStr(a[0]), true, false) : s.replace(/^\s+/, ""),
    ),
    rstrip: builtin("rstrip", (a) =>
      a.length ? stripWith(pyStr(a[0]), false, true) : s.replace(/\s+$/, ""),
    ),
    split: builtin("split", (a) => {
      const sep = a.length ? pyStr(a[0]) : undefined;
      return (sep === undefined ? s.split(/\s+/).filter(Boolean) : s.split(sep)) as Value[];
    }),
    splitlines: builtin("splitlines", () => s.split(/\r\n|\r|\n/) as Value[]),
    rsplit: builtin("rsplit", (a) => {
      const sep = a.length ? pyStr(a[0]) : undefined;
      return (sep === undefined ? s.split(/\s+/).filter(Boolean) : s.split(sep)) as Value[];
    }),
    join: builtin("join", (a) => {
      const seq = a[0];
      if (!Array.isArray(seq))
        throw new PythonError("join() ожидает список строк", line, "TypeError");
      return seq.map((x) => pyStr(x)).join(s);
    }),
    replace: builtin("replace", (a) => s.split(pyStr(a[0])).join(pyStr(a[1]))),
    find: builtin("find", (a) => s.indexOf(pyStr(a[0]))),
    index: builtin("index", (a) => {
      const i = s.indexOf(pyStr(a[0]));
      if (i === -1) throw new PythonError(`substring not found`, line, "ValueError");
      return i;
    }),
    count: builtin("count", (a) => s.split(pyStr(a[0])).length - 1),
    startswith: builtin("startswith", (a) => s.startsWith(pyStr(a[0]))),
    endswith: builtin("endswith", (a) => s.endsWith(pyStr(a[0]))),
    isdigit: builtin("isdigit", () => /^\d+$/.test(s)),
    isalpha: builtin("isalpha", () => /^[A-Za-z\u0400-\u04FF]+$/.test(s)),
    isalnum: builtin("isalnum", () => /^[\w\u0400-\u04FF]+$/i.test(s)),
    isspace: builtin("isspace", () => /^\s+$/.test(s)),
    title: builtin("title", () => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase())),
    capitalize: builtin("capitalize", () => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()),
    center: builtin("center", (a) => {
      const width = Number(a[0]);
      const fill = a.length > 1 ? pyStr(a[1]) : " ";
      const pad = Math.max(0, width - s.length);
      const left = Math.floor(pad / 2);
      return fill.repeat(left) + s + fill.repeat(pad - left);
    }),
    format: builtin("format", (a) => {
      let i = 0;
      return s.replace(/\{\}/g, () => (i < a.length ? pyStr(a[i++]) : "{}"));
    }),
    encode: builtin("encode", () => new PyTuple(...s.split("").map((c) => c.charCodeAt(0)))),
    partition: builtin("partition", (a) => {
      const sep = pyStr(a[0]);
      const i = s.indexOf(sep);
      if (i === -1) return new PyTuple(s, "", "");
      return new PyTuple(s.slice(0, i), sep, s.slice(i + sep.length));
    }),
  };
  const fn = map[name];
  if (!fn) throw new PythonError(`'str' object has no attribute '${name}'`, line, "AttributeError");
  return fn;
}

function listAttribute(list: Value[], name: string, line?: number): Value {
  const map: Record<string, BuiltinFunction> = {
    append: builtin("append", (a) => {
      list.push(a[0]);
      return null;
    }),
    extend: builtin("extend", (a) => {
      const seq = a[0];
      if (!Array.isArray(seq)) throw new PythonError("extend() ожидает список", line, "TypeError");
      list.push(...seq);
      return null;
    }),
    insert: builtin("insert", (a) => {
      const i = Math.max(0, Number(a[0]) < 0 ? list.length + Number(a[0]) : Number(a[0]));
      list.splice(i, 0, a[1]);
      return null;
    }),
    remove: builtin("remove", (a) => {
      const i = list.findIndex((x) => pyEq(x, a[0]));
      if (i === -1) throw new PythonError(`${pyRepr(a[0])} not in list`, line, "ValueError");
      list.splice(i, 1);
      return null;
    }),
    pop: builtin("pop", (a) => {
      const idx = a.length ? Number(a[0]) : list.length - 1;
      const i = idx < 0 ? list.length + idx : idx;
      if (i < 0 || i >= list.length)
        throw new PythonError("pop index out of range", line, "IndexError");
      return list.splice(i, 1)[0];
    }),
    index: builtin("index", (a) => {
      const i = list.findIndex((x) => pyEq(x, a[0]));
      if (i === -1) throw new PythonError(`${pyRepr(a[0])} is not in list`, line, "ValueError");
      return i;
    }),
    count: builtin("count", (a) => list.filter((x) => pyEq(x, a[0])).length),
    sort: builtin("sort", (_a, kwargs) => {
      const reverse = kwargs.get("reverse") ?? null;
      const key = kwargs.get("key") ?? null;
      if (key !== null && functionCall) {
        const callKey = (v: Value): Value => functionCall!(key, [v], new Map());
        list.sort((x, y) => compare(callKey(x), callKey(y)));
      } else {
        list.sort(compare);
      }
      if (pyTruth(reverse)) list.reverse();
      return null;
    }),
    reverse: builtin("reverse", () => {
      list.reverse();
      return null;
    }),
    clear: builtin("clear", () => {
      list.length = 0;
      return null;
    }),
    copy: builtin("copy", () => [...list]),
  };
  const fn = map[name];
  if (!fn)
    throw new PythonError(`'list' object has no attribute '${name}'`, line, "AttributeError");
  return fn;
}

function dictAttribute(map: Map<Value, Value>, name: string, line?: number): Value {
  const fns: Record<string, BuiltinFunction> = {
    get: builtin("get", (a) => (map.has(a[0]) ? map.get(a[0])! : a.length > 1 ? a[1] : null)),
    keys: builtin("keys", () => [...map.keys()]),
    values: builtin("values", () => [...map.values()]),
    items: builtin("items", () => [...map.entries()].map(([k, v]) => new PyTuple(k, v))),
    setdefault: builtin("setdefault", (a) => {
      if (!map.has(a[0])) map.set(a[0], a.length > 1 ? a[1] : null);
      return map.get(a[0])!;
    }),
    update: builtin("update", (a) => {
      const other = a[0];
      if (other instanceof Map) for (const [k, v] of other) map.set(k, v);
      return null;
    }),
    pop: builtin("pop", (a) => {
      if (!map.has(a[0])) {
        if (a.length > 1) return a[1];
        throw new PythonError(`Ключ ${pyRepr(a[0])} отсутствует`, line, "KeyError");
      }
      const v = map.get(a[0])!;
      map.delete(a[0]);
      return v;
    }),
    popitem: builtin("popitem", () => {
      const last = [...map.entries()].pop();
      if (!last) throw new PythonError("popitem(): словарь пуст", line, "KeyError");
      map.delete(last[0]);
      return new PyTuple(last[0], last[1]);
    }),
    clear: builtin("clear", () => {
      map.clear();
      return null;
    }),
    copy: builtin("copy", () => new Map(map)),
  };
  const fn = fns[name];
  if (!fn)
    throw new PythonError(`'dict' object has no attribute '${name}'`, line, "AttributeError");
  return fn;
}

function setMethodsAttribute(set: Set<Value>, name: string, line?: number): Value {
  const fns: Record<string, BuiltinFunction> = {
    add: builtin("add", (a) => {
      set.add(a[0]);
      return null;
    }),
    update: builtin("update", (a) => {
      const seq = a[0];
      if (Array.isArray(seq)) seq.forEach((x) => set.add(x));
      else if (seq instanceof Set) seq.forEach((x) => set.add(x));
      return null;
    }),
    remove: builtin("remove", (a) => {
      if (!set.has(a[0])) throw new PythonError(`${pyRepr(a[0])} not found`, line, "KeyError");
      set.delete(a[0]);
      return null;
    }),
    discard: builtin("discard", (a) => {
      set.delete(a[0]);
      return null;
    }),
    pop: builtin("pop", () => {
      const first = set.values().next();
      if (first.done) throw new PythonError("pop(): множество пустое", line, "KeyError");
      set.delete(first.value);
      return first.value;
    }),
    clear: builtin("clear", () => {
      set.clear();
      return null;
    }),
    union: builtin("union", (a) => new Set([...set, ...(a[0] as Set<Value>)])),
    intersection: builtin(
      "intersection",
      (a) => new Set([...set].filter((x) => (a[0] as Set<Value>).has(x))),
    ),
    difference: builtin(
      "difference",
      (a) => new Set([...set].filter((x) => !(a[0] as Set<Value>).has(x))),
    ),
    issubset: builtin("issubset", (a) => [...set].every((x) => (a[0] as Set<Value>).has(x))),
    issuperset: builtin("issuperset", (a) => [...(a[0] as Set<Value>)].every((x) => set.has(x))),
    copy: builtin("copy", () => new Set(set)),
  };
  const fn = fns[name];
  if (!fn) throw new PythonError(`'set' object has no attribute '${name}'`, line, "AttributeError");
  return fn;
}

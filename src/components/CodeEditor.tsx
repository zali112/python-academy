import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { highlightPython } from "@/lib/pythonHighlight";
import { cn } from "@/lib/utils";

const KEYWORDS = [
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
];

const BUILTINS = [
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
  "super",
  "property",
  "staticmethod",
  "classmethod",
  "Exception",
  "ValueError",
  "TypeError",
  "KeyError",
  "IndexError",
  "FileNotFoundError",
  "ZeroDivisionError",
  "AttributeError",
];

const METHODS = [
  "append",
  "extend",
  "insert",
  "remove",
  "pop",
  "index",
  "count",
  "sort",
  "reverse",
  "clear",
  "copy",
  "get",
  "keys",
  "values",
  "items",
  "setdefault",
  "update",
  "popitem",
  "add",
  "discard",
  "union",
  "intersection",
  "difference",
  "issubset",
  "upper",
  "lower",
  "strip",
  "split",
  "join",
  "replace",
  "find",
  "startswith",
  "endswith",
  "format",
  "isdigit",
  "isalpha",
  "title",
  "capitalize",
  "center",
  "partition",
  "encode",
  "decode",
  "startswith",
];

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  /** Высота поля в строках */
  rows?: number;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Редактор кода на основе textarea + слоя подсветки.
 *
 * Такой подход не тянет Monaco/CodeMirror (десятки мегабайт), мгновенно
 * грузится и полностью доступен с клавиатуры. Подсветка — собственный
 * токенизатор Python, автодополнение — встроенный список конструкций языка.
 * При необходимости редактор можно заменить, сохранив этот же интерфейс.
 */
export function CodeEditor({
  value,
  onChange,
  onRun,
  rows = 14,
  readOnly = false,
  showLineNumbers = true,
  ariaLabel = "Редактор кода Python",
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const lines = useMemo(() => highlightPython(value), [value]);
  const lineCount = lines.length;

  const closeSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestionIndex(0);
  }, []);

  /** Текущее слово перед курсором. */
  const computePrefix = useCallback((text: string, caret: number) => {
    const before = text.slice(0, caret);
    const afterDot = /\.\s*([A-Za-z_][A-Za-z0-9_]*)$/.exec(before);
    if (afterDot) return { prefix: afterDot[1], afterDot: true, start: caret - afterDot[1].length };
    const plain = /([A-Za-z_][A-Za-z0-9_]*)$/.exec(before);
    if (plain) return { prefix: plain[1], afterDot: false, start: caret - plain[1].length };
    return { prefix: "", afterDot: false, start: caret };
  }, []);

  const updateSuggestions = useCallback(
    (text: string, caret: number) => {
      const { prefix, afterDot } = computePrefix(text, caret);
      if (prefix.length < 2 && !afterDot) {
        closeSuggestions();
        return;
      }
      const source = afterDot ? METHODS : [...KEYWORDS, ...BUILTINS, ...METHODS];
      const lower = prefix.toLowerCase();
      const matches = source
        .filter(
          (item, index, arr) => arr.indexOf(item) === index && item.toLowerCase().startsWith(lower),
        )
        .slice(0, 8);
      setSuggestions(matches);
      setSuggestionIndex(0);
    },
    [computePrefix, closeSuggestions],
  );

  const applySuggestion = useCallback(
    (word: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const caret = el.selectionStart ?? value.length;
      const { prefix, start } = computePrefix(value, caret);
      const next = value.slice(0, start) + word + value.slice(caret);
      onChange(next);
      closeSuggestions();
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + word.length;
        el.setSelectionRange(pos, pos);
        void prefix;
      });
    },
    [value, onChange, computePrefix, closeSuggestions],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;

    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        applySuggestion(suggestions[suggestionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeSuggestions();
        return;
      }
    }

    // Ctrl/Cmd + Enter — запуск
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && onRun) {
      e.preventDefault();
      onRun();
      return;
    }

    // Tab — 4 пробела (с поддержкой выделения)
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + "    " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => el.setSelectionRange(start + 4, start + 4));
      return;
    }

    // Автоотступ после двоеточия
    if (e.key === "Enter") {
      e.preventDefault();
      const start = el.selectionStart;
      const before = value.slice(0, start);
      const currentLine = before.slice(before.lastIndexOf("\n") + 1);
      const indentMatch = /^[\t ]*/.exec(currentLine)?.[0] ?? "";
      const extra = /:\s*$/.test(currentLine) ? "    " : "";
      const insert = `\n${indentMatch}${extra}`;
      const next = value.slice(0, start) + insert + value.slice(el.selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        const pos = start + insert.length;
        el.setSelectionRange(pos, pos);
      });
    }
  };

  const handleScroll = () => {
    const el = textareaRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    if (preRef.current) {
      preRef.current.scrollTop = el.scrollTop;
      preRef.current.scrollLeft = el.scrollLeft;
    }
  };

  // При внешней смене кода (кнопка «Решение») прокручиваем наверх
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (preRef.current) {
      preRef.current.scrollTop = el.scrollTop;
      preRef.current.scrollLeft = el.scrollLeft;
    }
  }, [value]);

  const caretLine = value.slice(0, textareaRef.current?.selectionStart ?? 0).split("\n").length;
  const lineHeight = 21;
  const suggestionTop = Math.max(4, caretLine * lineHeight - scrollTop);

  return (
    <div
      className={cn("overflow-hidden rounded-xl border border-[#262c36] bg-[#0f141b]", className)}
    >
      <div className="relative">
        {/* Номера строк — неподвижный «жёлоб», синхронизируется по вертикали */}
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 w-10 bg-[#0f141b] py-3 text-right font-mono text-[13px] leading-[21px] text-[#3d4654]"
            style={{ transform: `translateY(${-scrollTop}px)` }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="pr-3">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Подсвеченный слой */}
        <div
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden py-3 font-mono text-[13px] leading-[21px]"
        >
          <div className={cn("min-w-max", showLineNumbers ? "pl-12" : "pl-3")}>
            {lines.map((tokens, idx) => (
              <div key={idx} className="whitespace-pre text-[#d7dde5]">
                {tokens.length === 0
                  ? " "
                  : tokens.map((t, i) => (
                      <span key={i} className={t.type === "plain" ? undefined : `tok-${t.type}`}>
                        {t.text}
                      </span>
                    ))}
              </div>
            ))}
          </div>
        </div>

        {/* Поле ввода */}
        <textarea
          ref={textareaRef}
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={ariaLabel}
          rows={rows}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            onChange(e.target.value);
            updateSuggestions(e.target.value, e.target.selectionStart ?? 0);
          }}
          onClick={(e) =>
            updateSuggestions(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)
          }
          onBlur={() => setTimeout(closeSuggestions, 120)}
          className={cn(
            "relative z-10 block w-full resize-y bg-transparent py-3 font-mono text-[13px] leading-[21px] text-transparent caret-[#4ade80] outline-none",
            showLineNumbers ? "pl-12" : "pl-3",
          )}
          style={{ minHeight: rows * 21 + 24, tabSize: 4 }}
          placeholder="# напиши код здесь"
        />

        {/* Автодополнение */}
        {suggestions.length > 0 && !readOnly && (
          <div
            role="listbox"
            aria-label="Подсказки автодополнения"
            className="absolute left-10 z-30 w-56 overflow-hidden rounded-lg border border-[#2a323f] bg-[#161b23] py-1 shadow-xl"
            style={{ top: suggestionTop }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={i === suggestionIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(s);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-xs",
                  i === suggestionIndex ? "bg-[#22303f] text-white" : "text-[#aeb7c4]",
                )}
              >
                <span>{s}</span>
                {i === suggestionIndex && <span className="text-[10px] text-[#5f6b7c]">Tab</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

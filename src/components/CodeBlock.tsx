import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { highlightPython } from "@/lib/pythonHighlight";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  caption?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  className?: string;
  maxHeight?: number;
  /** Тема блока: тёмная по умолчанию, light — для печатных примеров */
  tone?: "dark" | "muted";
}

/** Блок кода с подсветкой Python, нумерацией строк и кнопкой копирования. */
export function CodeBlock({
  code,
  caption,
  showLineNumbers = true,
  copyable = true,
  className,
  maxHeight,
  tone = "dark",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = highlightPython(code.replace(/\n$/, ""));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure
      className={cn(
        "group overflow-hidden rounded-xl border",
        tone === "dark" ? "border-white/10 bg-[#12161c]" : "border-border bg-muted",
        className,
      )}
    >
      {(caption || copyable) && (
        <figcaption
          className={cn(
            "flex items-center justify-between border-b px-4 py-2 text-xs",
            tone === "dark"
              ? "border-white/5 text-white/50"
              : "border-border text-muted-foreground",
          )}
        >
          <span className="font-medium">{caption ?? "Python"}</span>
          {copyable && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Скопировано" : "Скопировать код"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors",
                tone === "dark" ? "hover:bg-white/10" : "hover:bg-black/5",
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
          )}
        </figcaption>
      )}

      <pre
        className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed"
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <code className="font-mono">
          {lines.map((tokens, idx) => (
            <div key={idx} className="flex min-w-max">
              {showLineNumbers && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mr-4 w-6 shrink-0 select-none text-right",
                    tone === "dark" ? "text-white/25" : "text-muted-foreground/60",
                  )}
                >
                  {idx + 1}
                </span>
              )}
              <span className="whitespace-pre">
                {tokens.length === 0
                  ? " "
                  : tokens.map((t, i) => (
                      <span key={i} className={t.type === "plain" ? undefined : `tok-${t.type}`}>
                        {t.text}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}

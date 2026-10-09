import { useRef, useState } from "react";
import { Download, FileJson, Monitor, Moon, Sun, Terminal, Type, Upload, Hash } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toaster";
import { useSettingsStore, type RunnerMode, type Theme } from "@/store/settingsStore";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChoiceRow<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode; hint?: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex min-w-28 flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
            value === opt.value
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-ring/40 hover:bg-muted/50",
          )}
        >
          <span className="flex items-center gap-2 font-medium">
            {opt.icon}
            {opt.label}
          </span>
          {opt.hint && <span className="text-xs text-muted-foreground">{opt.hint}</span>}
        </button>
      ))}
    </div>
  );
}

/** Настройки: внешний вид, исполнитель кода и управление локальным прогрессом. */
export function SettingsPage() {
  const settings = useSettingsStore();
  const progress = useProgressStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const exportToFile = () => {
    const json = progress.exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `python-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Файл прогресса сохранён", "success");
  };

  const importFromText = () => {
    const ok = progress.importProgress(importText);
    if (ok) {
      setImportText("");
      setImportError("");
      toast("Прогресс импортирован", "success");
    } else {
      setImportError("Не удалось прочитать файл: ожидается JSON, выгруженный этой платформой.");
    }
  };

  const importFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = progress.importProgress(String(reader.result ?? ""));
      if (ok) toast(`Прогресс из «${file.name}» импортирован`, "success");
      else setImportError("Файл не похож на выгрузку прогресса Python Academy.");
    };
    reader.onerror = () => setImportError("Файл не удалось прочитать.");
    reader.readAsText(file);
  };

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Настройки"
        description="Внешний вид, способ исполнения Python-кода и управление прогрессом. Всё хранится только в этом браузере."
        metaDescription="Настройки Python Academy: тема оформления, интерпретатор кода, экспорт и импорт прогресса."
        breadcrumbs={[{ label: "Настройки" }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={<Sun className="h-4 w-4" aria-hidden="true" />}
          title="Тема оформления"
          description="Светлая, тёмная или как в системе."
        >
          <ChoiceRow<Theme>
            label="Тема"
            value={settings.theme}
            onChange={settings.setTheme}
            options={[
              {
                value: "light",
                label: "Светлая",
                icon: <Sun className="h-4 w-4" aria-hidden="true" />,
              },
              {
                value: "dark",
                label: "Тёмная",
                icon: <Moon className="h-4 w-4" aria-hidden="true" />,
              },
              {
                value: "system",
                label: "Системная",
                icon: <Monitor className="h-4 w-4" aria-hidden="true" />,
                hint: "как в ОС",
              },
            ]}
          />
        </SectionCard>

        <SectionCard
          icon={<Terminal className="h-4 w-4" aria-hidden="true" />}
          title="Исполнение кода"
          description="Демо-режим работает всегда и офлайн; Pyodide загружается с CDN при первом запуске."
        >
          <ChoiceRow<RunnerMode>
            label="Исполнитель"
            value={settings.runnerMode}
            onChange={settings.setRunnerMode}
            options={[
              {
                value: "demo",
                label: "Демо-режим",
                icon: <Terminal className="h-4 w-4" aria-hidden="true" />,
                hint: "встроенный интерпретатор",
              },
              {
                value: "pyodide",
                label: "Pyodide",
                icon: <FileJson className="h-4 w-4" aria-hidden="true" />,
                hint: "настоящий Python, ~10 МБ",
              },
            ]}
          />
          <Alert tone="info" className="mt-3">
            Оба варианта выполняют код <strong>в браузере</strong>: на сервер ничего не уходит, а
            сетевые примеры в уроках обращаются только к localhost.
          </Alert>
        </SectionCard>

        <SectionCard
          icon={<Type className="h-4 w-4" aria-hidden="true" />}
          title="Редактор кода"
          description="Размер шрифта и нумерация строк во всех редакторах."
        >
          <ChoiceRow
            label="Размер шрифта"
            value={settings.fontSize}
            onChange={settings.setFontSize}
            options={[
              { value: "small", label: "Мелкий" },
              { value: "medium", label: "Средний" },
              { value: "large", label: "Крупный" },
            ]}
          />
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.showLineNumbers}
              onChange={settings.toggleLineNumbers}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <Hash className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            Показывать номера строк
          </label>
        </SectionCard>

        <SectionCard
          icon={<Download className="h-4 w-4" aria-hidden="true" />}
          title="Прогресс: экспорт и импорт"
          description="Уроки, задачи, тесты, избранное и заметки в одном JSON-файле."
        >
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportToFile}>
              <Download className="h-4 w-4" aria-hidden="true" /> Выгрузить JSON
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" /> Загрузить файл
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Выбрать файл прогресса"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFromFile(file);
              e.target.value = "";
            }}
          />

          <label className="mt-4 block text-sm">
            <span className="text-muted-foreground">…или вставь содержимое JSON:</span>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={4}
              spellCheck={false}
              placeholder='{"app":"python-academy", …}'
              className="mt-1.5 w-full rounded-lg border border-input bg-background p-3 font-mono text-xs outline-none focus:border-ring"
            />
          </label>
          <div className="mt-2 flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={importFromText}
              disabled={importText.trim() === ""}
            >
              Импортировать
            </Button>
            {importError && (
              <p className="text-xs text-destructive" role="alert">
                {importError}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <ConfirmDialog
              title="Сбросить весь прогресс?"
              description="Будут удалены пройденные уроки, решённые задачи, результаты тестов, избранное и заметки. Отменить это нельзя — сначала выгрузи JSON."
              confirmLabel="Да, сбросить"
              onConfirm={() => {
                progress.resetProgress();
                toast("Прогресс сброшен", "warning");
              }}
            >
              Сбросить прогресс
            </ConfirmDialog>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

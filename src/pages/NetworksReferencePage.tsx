import { useEffect, useMemo, useState } from "react";
import { Filter, Network, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { CodeBlock } from "@/components/CodeBlock";
import { networkConcepts } from "@/data/referenceNetworks";
import { LEVEL_LABEL, type NetworkConcept } from "@/types/content";
import { cn } from "@/lib/utils";

/** Карточка концепции сети: простыми словами → техника → схема → Python → практика. */
function ConceptCard({ concept }: { concept: NetworkConcept }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      id={concept.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">{concept.title}</h3>
        <Badge tone="info">{concept.group}</Badge>
        <Badge tone="outline">{LEVEL_LABEL[concept.level]}</Badge>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{concept.simple}</p>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Технически
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90">{concept.technical}</p>
          </div>

          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Схема по шагам
            </h4>
            <ol className="space-y-1.5">
              {concept.scheme.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs leading-relaxed text-foreground/90">
                    {line}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <CodeBlock code={concept.pythonExample} caption="Python-пример" />

          <div className="rounded-lg border border-success/30 bg-success/10 p-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-success">
              Практика
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90">{concept.practice}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button
          size="sm"
          variant={open ? "secondary" : "outline"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Свернуть" : "Разобрать"}
        </Button>
      </div>
    </article>
  );
}

/** Справочник сетей: как данные доходят от клиента до сервера — простыми словами и со схемами. */
export function NetworksReferencePage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");

  const groups = useMemo(() => {
    const set = new Map<string, number>();
    for (const c of networkConcepts) set.set(c.group, (set.get(c.group) ?? 0) + 1);
    return [...set.entries()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return networkConcepts.filter((c) => {
      if (group !== "all" && c.group !== group) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.simple.toLowerCase().includes(q) ||
        c.technical.toLowerCase().includes(q)
      );
    });
  }, [query, group]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Справочник сетей"
        description="DNS, TCP, HTTP, TLS и маршрут пакета — сначала человеческим языком, потом техника, потом пошаговая схема и Python-код."
        metaDescription="Справочник компьютерных сетей: DNS, TCP-хендшейк, жизненный цикл HTTP, порты, IP, TLS и OSI."
        breadcrumbs={[{ label: "Справочники" }, { label: "Сети" }]}
        badge={<Badge tone="accent">{networkConcepts.length} концепций</Badge>}
      />

      <Alert tone="warning" title="Только учебные сценарии" className="mb-6">
        Примеры обращаются исключительно к <code>127.0.0.1</code> и <code>localhost</code>.
        Сканирование, подключение и тестирование чужих систем — вне рамок платформы.
      </Alert>

      <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Поиск по справочнику сетей</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти: хендшейк, порт, рукопожатие TLS…"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Темы">
          <span className="mr-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="h-3 w-3" aria-hidden="true" /> Тема:
          </span>
          <button
            type="button"
            aria-pressed={group === "all"}
            onClick={() => setGroup("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              group === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Все ({networkConcepts.length})
          </button>
          {groups.map(([g, count]) => (
            <button
              key={g}
              type="button"
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                group === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {g} ({count})
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" role="status">
        Показано концепций: {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Network className="h-8 w-8" aria-hidden="true" />}
          title="Ничего не найдено"
          description="Сбрось фильтр темы или попробуй более короткий запрос — например «DNS» или «порты»."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setGroup("all");
              }}
            >
              Сбросить фильтры
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      )}
    </div>
  );
}

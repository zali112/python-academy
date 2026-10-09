import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/LinkButton";
import { Roadmap } from "@/components/Roadmap";
import { roadmap } from "@/data/roadmap";
import { courses } from "@/data/courses";
import { useProgressStore } from "@/store/progressStore";
import { MapPinned } from "lucide-react";

/** Дорожная карта: последовательность курсов от нуля до продвинутого Python. */
export function RoadmapPage() {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const published = courses.filter((c) => c.published).length;

  return (
    <div className="container-app py-8 sm:py-10">
      <PageHeader
        title="Дорожная карта"
        description="Маршрут обучения от первого print() до асинхронных сетевых сервисов. Узлы подсвечиваются по твоему прогрессу: пройденный курс закрашивается, следующий становится активным."
        metaDescription="Дорожная карта Python Academy: путь от основ до продвинутого Python, ООП, файлов и компьютерных сетей."
        breadcrumbs={[{ label: "Дорожная карта" }]}
        badge={<Badge tone="info">{roadmap.length} этапов</Badge>}
        actions={<LinkButton to="/courses">Открыть каталог</LinkButton>}
      />

      <Alert tone="info" className="mb-6" title="Как читать карту">
        Кружок со скриншотом — пройденный этап, обведённый — текущий, серый — впереди. Из{" "}
        {courses.length} курсов {published} уже имеют опубликованные уроки, остальные показывают
        полную программу и пополняются постепенно.
      </Alert>

      <Roadmap nodes={roadmap} completedLessons={completedLessons} />

      <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-3">
          <MapPinned className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Сомневаешься, с чего начать? Первый этап «Основы» не требует предварительных знаний.
          </p>
        </div>
        <LinkButton to="/learn/python-basics/basics-1" variant="secondary" size="sm">
          К первому уроку
        </LinkButton>
      </div>
    </div>
  );
}

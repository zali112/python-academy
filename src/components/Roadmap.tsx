import { Link } from "react-router-dom";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import type { RoadmapNode } from "@/types/content";
import { LEVEL_LABEL } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { getCourse } from "@/data/courses";
import { lessonsByCourse } from "@/data/lessons";
import { cn } from "@/lib/utils";

export interface RoadmapProps {
  nodes: RoadmapNode[];
  completedLessons: string[];
  /** показывать ссылки на курсы */
  showCourses?: boolean;
}

/**
 * Дорожная карта обучения: последовательность этапов с учётом прогресса.
 * Этап считается пройденным, если завершены все опубликованные уроки его курсов.
 */
export function Roadmap({ nodes, completedLessons, showCourses = true }: RoadmapProps) {
  const done = new Set(completedLessons);

  const status = (node: RoadmapNode): "done" | "active" | "locked" => {
    const courseIds = node.courseIds.filter((id) => getCourse(id)?.published);
    if (courseIds.length === 0) return "locked";
    const all = courseIds.flatMap((id) => lessonsByCourse(id));
    if (all.length === 0) return "locked";
    const passed = all.filter((l) => done.has(l.id)).length;
    if (passed === all.length) return "done";
    if (passed > 0) return "active";
    return done.size > 0 ? "active" : "locked";
  };

  return (
    <ol className="relative space-y-4 sm:space-y-5">
      <span className="absolute left-[18px] top-3 bottom-3 w-px bg-border" aria-hidden="true" />
      {nodes.map((node, i) => {
        const state = status(node);
        return (
          <li key={node.id} className="relative flex gap-4">
            <span
              className={cn(
                "relative z-10 mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 bg-card transition-colors",
                state === "done" && "border-success bg-success text-success-foreground",
                state === "active" && "border-primary text-primary",
                state === "locked" && "border-border text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {state === "done" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </span>

            <div
              className={cn(
                "min-w-0 flex-1 rounded-xl border bg-card p-4 transition-colors sm:p-5",
                state === "active" ? "border-primary/40" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{node.title}</h3>
                <Badge
                  tone={state === "done" ? "success" : state === "active" ? "info" : "outline"}
                >
                  {state === "done"
                    ? "Пройдено"
                    : state === "active"
                      ? "Сейчас"
                      : LEVEL_LABEL[node.level]}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {node.description}
              </p>

              {showCourses && node.courseIds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {node.courseIds.map((id) => {
                    const course = getCourse(id);
                    if (!course) return null;
                    return (
                      <Link
                        key={id}
                        to={`/courses/${id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium transition-colors hover:border-ring/40 hover:bg-muted"
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                        {course.title}
                        {!course.published && <Circle className="h-2.5 w-2.5" aria-hidden="true" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

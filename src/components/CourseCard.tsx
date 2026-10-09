import { Link } from "react-router-dom";
import {
  Blocks,
  BookOpen,
  Bug,
  Boxes,
  Clock,
  FileCode2,
  FolderOpen,
  GitBranch,
  GitCommitHorizontal,
  Layers,
  Network,
  Package,
  Play,
  Rocket,
  Sparkles,
  TextCursorInput,
  Target,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Course } from "@/types/content";
import { LEVEL_LABEL } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { cn, formatMinutes, percent } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  "git-branch": GitBranch,
  layers: Layers,
  blocks: Blocks,
  "text-cursor-input": TextCursorInput,
  "folder-open": FolderOpen,
  bug: Bug,
  boxes: Boxes,
  package: Package,
  rocket: Rocket,
  workflow: Workflow,
  "git-commit-horizontal": GitCommitHorizontal,
  network: Network,
  target: Target,
  play: Play,
  book: BookOpen,
};

export function courseIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}

export interface CourseCardProps {
  course: Course;
  completedLessons?: number;
  totalLessons?: number;
  index?: number;
}

export function CourseCard({
  course,
  completedLessons = 0,
  totalLessons,
  index = 0,
}: CourseCardProps) {
  const Icon = courseIcon(course.icon);
  const total = totalLessons ?? course.modules.reduce((acc, m) => acc + m.lessonIds.length, 0);
  const progress = percent(completedLessons, total);

  return (
    <Link
      to={`/courses/${course.id}`}
      className="interactive-card group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-start gap-3 p-5">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: course.accent }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold leading-tight">{course.title}</h3>
            {!course.published && (
              <Badge tone="warning" className="shrink-0">
                Программа
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.subtitle}</p>
        </div>
      </div>

      <div className="mt-auto space-y-3 px-5 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{LEVEL_LABEL[course.level]}</Badge>
          <Badge tone="outline" icon={<Clock className="h-3 w-3" aria-hidden="true" />}>
            {course.durationHours} ч
          </Badge>
          <Badge tone="outline">
            {course.published ? `${total} ур.` : `${course.modules.length} модуля`}
          </Badge>
        </div>

        {course.published && total > 0 && (
          <Progress value={progress} label="Прогресс" showValue={progress > 0} />
        )}

        {!course.published && (
          <p className="text-xs text-muted-foreground">
            Уроки публикуются постепенно — программа уже доступна.
          </p>
        )}
      </div>
    </Link>
  );
}

export function LessonCard({
  lessonId,
  courseId,
  title,
  goal,
  level,
  durationMin,
  completed,
  current,
  index = 0,
}: {
  lessonId: string;
  courseId: string;
  title: string;
  goal: string;
  level: Course["level"];
  durationMin: number;
  completed: boolean;
  current?: boolean;
  index?: number;
}) {
  return (
    <Link
      to={`/learn/${courseId}/${lessonId}`}
      className={cn(
        "interactive-card group flex items-start gap-4 rounded-xl border bg-card p-4 sm:p-5",
        current ? "border-primary/50 ring-1 ring-primary/30" : "border-border",
        completed && "border-success/35",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold transition-colors",
          completed
            ? "border-success bg-success text-success-foreground"
            : current
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {completed ? "✓" : index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium leading-snug group-hover:text-primary">{title}</span>
          {current && <Badge tone="info">Текущий</Badge>}
        </span>
        <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{goal}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone="outline">{LEVEL_LABEL[level]}</Badge>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" /> {durationMin} мин
          </span>
        </span>
      </span>
      <FileCode2
        className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

export { formatMinutes };

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProgressStore, todayKey } from "@/store/progressStore";
import { lessonsByCourse } from "@/data/lessons";
import { getCourse } from "@/data/courses";

/** Активность за последние 14 дней (данные из localStorage). */
export function ActivityChart() {
  const activity = useProgressStore((s) => s.activity);
  const map = new Map(activity.map((a) => [a.date, a.actions]));

  const data = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = todayKey(d);
    return {
      date: `${d.getDate()}.${d.getMonth() + 1}`,
      actions: map.get(key) ?? 0,
    };
  });

  return (
    <div className="h-56 w-full" role="img" aria-label="График активности за последние 14 дней">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontSize: 12,
              color: "hsl(var(--popover-foreground))",
            }}
            formatter={(value: number | string) => [`${value} действий`, "Активность"]}
          />
          <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Разбивка завершённых уроков по курсам. */
export function CourseProgressChart({ completedLessons }: { completedLessons: string[] }) {
  const done = new Set(completedLessons);
  const data = lessonsGrouped()
    .map(([courseId, ids]) => ({
      name: getCourse(courseId)?.title ?? courseId,
      пройдено: ids.filter((id) => done.has(id)).length,
      всего: ids.length,
    }))
    .filter((d) => d.всего > 0);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Пока нет данных — пройди первый урок, и здесь появится диаграмма.
      </p>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="Прогресс по курсам">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontSize: 12,
              color: "hsl(var(--popover-foreground))",
            }}
          />
          <Bar
            dataKey="пройдено"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            maxBarSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function lessonsGrouped(): [string, string[]][] {
  const ids = ["python-basics", "python-functions", "python-oop", "python-files", "network-python"];
  return ids.map((id) => [id, lessonsByCourse(id).map((l) => l.id)]);
}

/** Круговая диаграмма: распределение решённых задач по сложности. */
export function TaskStatsChart({ solved, total }: { solved: number; total: number }) {
  const data = [
    { name: "Решено", value: solved },
    { name: "Осталось", value: Math.max(0, total - solved) },
  ];
  return (
    <div className="h-52 w-full" role="img" aria-label="Доля решённых задач">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 10,
              fontSize: 12,
              color: "hsl(var(--popover-foreground))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

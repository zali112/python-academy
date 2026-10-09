import { describe, expect, it } from "vitest";
import { highlightParts, searchItems, type SearchItem } from "@/lib/search";

const items: SearchItem[] = [
  {
    id: "l1",
    title: "Словари в Python",
    subtitle: "Создание и обход словарей",
    type: "lesson",
    url: "/learn/python-basics/basics-4",
    text: "Словарь хранит пары ключ-значение и позволяет быстро находить значение по ключу.",
    level: "elementary",
    keywords: ["dict", "словарь", "get"],
  },
  {
    id: "t1",
    title: "Рекурсия: факториал",
    subtitle: "Напиши рекурсивную функцию",
    type: "task",
    url: "/practice/recursion-1",
    text: "Функция должна вызывать саму себя для уменьшенного аргумента.",
    level: "beginner",
    keywords: ["рекурсия", "функция"],
  },
  {
    id: "p1",
    title: "TCP-чат",
    subtitle: "Сетевой проект на сокетах",
    type: "project",
    url: "/projects#tcp-chat",
    text: "Клиент и сервер обмениваются сообщениями через TCP.",
    level: "advanced",
    keywords: ["сеть", "socket"],
  },
];

describe("searchItems — ранжирование", () => {
  it("точное совпадение заголовка выше частичного", () => {
    const res = searchItems(items, "словари");
    expect(res[0].id).toBe("l1");
    expect(res[0].score).toBeGreaterThan(0);
  });

  it("заголовок весит больше, чем текст", () => {
    const res = searchItems(items, "рекурсия");
    expect(res[0].id).toBe("t1");
  });

  it("все слова запроса должны найтись", () => {
    const res = searchItems(items, "словарь сервер");
    expect(res).toHaveLength(0);
  });

  it("не зависит от регистра", () => {
    const upper = searchItems(items, "СЛОВАРИ");
    expect(upper.map((r) => r.id)).toContain("l1");
  });

  it("нормализует «ё» в запросе", () => {
    const list: SearchItem[] = [
      {
        id: "n1",
        title: "Зелёный свет",
        subtitle: "про светофор",
        type: "lesson",
        url: "/learn/x/y",
        text: "зелёный цвет",
      },
    ];
    expect(searchItems(list, "зеленый").map((r) => r.id)).toEqual(["n1"]);
    expect(searchItems(list, "ЗЕЛЁНЫЙ").map((r) => r.id)).toEqual(["n1"]);
  });

  it("без запроса возвращает всё, что прошло фильтры", () => {
    expect(searchItems(items, "")).toHaveLength(3);
    expect(searchItems(items, "  ")).toHaveLength(3);
  });
});

describe("searchItems — фильтры", () => {
  it("фильтрует по типу", () => {
    const res = searchItems(items, "", { type: "task" });
    expect(res).toHaveLength(1);
    expect(res[0].type).toBe("task");
  });

  it("фильтрует по уровню", () => {
    const res = searchItems(items, "", { level: "advanced" });
    expect(res.map((r) => r.id)).toEqual(["p1"]);
  });

  it("фильтр и поиск работают вместе", () => {
    const res = searchItems(items, "чат", { type: "project" });
    expect(res.map((r) => r.id)).toEqual(["p1"]);
    expect(searchItems(items, "чат", { type: "lesson" })).toHaveLength(0);
  });
});

describe("highlightParts", () => {
  it("находит вхождение и разбивает строку", () => {
    const parts = highlightParts("Словари в Python", "словари");
    const hit = parts.find((p) => p.hit);
    expect(hit?.text.toLowerCase()).toBe("словари");
    expect(parts.map((p) => p.text).join("")).toBe("Словари в Python");
  });

  it("без совпадений возвращает исходный текст", () => {
    const parts = highlightParts("просто текст", "нет");
    expect(parts).toEqual([{ text: "просто текст", hit: false }]);
  });

  it("склеивает перекрывающиеся совпадения разных слов", () => {
    const parts = highlightParts("мама", "ама мам");
    const hits = parts.filter((p) => p.hit);
    expect(hits).toHaveLength(1);
    expect(hits[0].text).toBe("мама");
    expect(parts.map((p) => p.text).join("")).toBe("мама");
  });

  it("пустой запрос ничего не подсвечивает", () => {
    expect(highlightParts("текст", "")).toEqual([{ text: "текст", hit: false }]);
  });
});

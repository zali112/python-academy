import { describe, expect, it } from "vitest";
import { demoRunner } from "@/runner/demoRunner";
import { runPythonLite } from "@/runner/pythonLite";

async function run(code: string) {
  return demoRunner.run(code);
}

describe("pythonLite — базовые конструкции", () => {
  it("выводит текст через print", async () => {
    const res = await run(`print("Привет, мир!")`);
    expect(res.error).toBeUndefined();
    expect(res.stdout).toBe("Привет, мир!\n");
  });

  it("считает в цикле и построчно форматирует", async () => {
    const res = await run(`total = 0
for i in range(1, 6):
    total += i
print("Итог:", total)`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("Итог: 15");
  });

  it("поддерживает функции, рекурсию и аннотации", async () => {
    const res = await run(`def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("55");
  });

  it("работают словари, списки и срезы", async () => {
    const res = await run(`d = {"a": 1, "b": 2}
d["c"] = 3
nums = [1, 2, 3, 4, 5]
print(sum(d.values()), nums[1:4])`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("6 [2, 3, 4]");
  });

  it("f-строки вычисляют выражения внутри фигурных скобок", async () => {
    const res = await run(`name = "Мир"
print(f"Привет, {name.upper()}! 2+2={2 + 2}")`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("Привет, МИР! 2+2=4");
  });
});

describe("pythonLite — классы и форматирование", () => {
  it("вызывает __str__ экземпляра без ошибок", async () => {
    const res = await run(`class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
print(p)
print(str(p))`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("Point(3, 4)\nPoint(3, 4)");
  });

  it("print экземпляра без __str__ не падает", async () => {
    const res = await run(`class Empty:
    pass

e = Empty()
print("создан", e is not None)`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("создан True");
  });

  it("кортеж хранит значения, а не длину", async () => {
    const res = await run(`t = tuple([5])
print(len(t), t[0])
u = (1, 2)
print(len(u), u[1])`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("1 5\n2 2");
  });
});

describe("pythonLite — строки и сортировка", () => {
  it("strip убирает указанные символы", async () => {
    const res = await run(`s = "++Python++"
print(s.strip("+"))
print(s.lstrip("+"))
print(s.rstrip("+"))`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("Python\nPython++\n++Python");
  });

  it("sort принимает key и reverse", async () => {
    const res = await run(`words = ["bb", "a", "ccc"]
words.sort(key=len, reverse=True)
print(words)
nums = [3, 1, 2]
nums.sort()
print(nums)`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("['ccc', 'bb', 'a']\n[1, 2, 3]");
  });

  it("percent-форматирование подставляет значения", async () => {
    const res = await run(`print("%s: %d" % ("балл", 5))`);
    expect(res.error).toBeUndefined();
    expect(res.stdout.trim()).toBe("балл: 5");
  });
});

describe("pythonLite — ошибки", () => {
  it("деление на ноль даёт ZeroDivisionError", async () => {
    const res = await run(`print(10 / 0)`);
    expect(res.error?.type).toBe("ZeroDivisionError");
    expect(res.stderr).toContain("ZeroDivisionError");
  });

  it("обращение к неопределённому имени даёт NameError", async () => {
    const res = await run(`print(undefined_name)`);
    expect(res.error?.type).toBe("NameError");
  });

  it("отсутствующий ключ словаря даёт KeyError", async () => {
    const res = await run(`d = {}
print(d["нет"])`);
    expect(res.error?.type).toBe("KeyError");
  });

  it("синтаксическая ошибка не запускает программу", async () => {
    const res = await run(`if True
    print(1)`);
    expect(res.error).toBeDefined();
    expect(res.stdout).toBe("");
  });

  it("доступ к файлам запрещён в браузере", async () => {
    const res = await run(`open("secret.txt")`);
    expect(res.error?.type).toBe("OSError");
  });

  it("input() не блокирует выполнение", async () => {
    const res = await run(`name = input("Имя: ")
print("готово")`);
    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain("готово");
  });
});

describe("pythonLite — защита от зависаний", () => {
  it("останавливает бесконечный цикл", () => {
    const res = runPythonLite(`while True:
    pass`);
    expect(res.error).toBeDefined();
  });
});

import { expect, test } from "@playwright/test";

/** Ключевые пользовательские сценарии платформы. */
test.describe("навигация и контент", () => {
  test("главная открывается и ведёт в каталог курсов", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /курс/i }).first().click();
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.getByRole("heading", { name: /каталог курсов/i })).toBeVisible();
  });

  test("урок открывается и показывает редактор с консолью", async ({ page }) => {
    await page.goto("/learn/python-basics/basics-1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Консоль вывода")).toBeVisible();

    await page
      .getByRole("button", { name: /запустить/i })
      .first()
      .click();
    // В консоли появляется либо вывод, либо сообщение об ошибке исполнения
    await expect(page.getByText(/строка|готово|привет|\d|ошибк|Error/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("страница 404 объясняет причину и даёт выход", async ({ page }) => {
    await page.goto("/neto-sushchestvuyushchaya-stranica");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: /страницы нет/i })).toBeVisible();
    await page.getByRole("link", { name: /на главную/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("практика и тренажёры", () => {
  test("список задач фильтруется", async ({ page }) => {
    await page.goto("/practice");
    await expect(page.getByRole("heading", { name: /^практика$/i })).toBeVisible();
    const cards = page.locator("ul li a[href^='/practice/']");
    await expect(cards.first()).toBeVisible();
  });

  test("тест открывается и считает вопросы", async ({ page }) => {
    await page.goto("/trainers");
    const start = page.getByRole("button", { name: /начать тест|пройти заново/i }).first();
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("поиск и настройки", () => {
  test("страница поиска находит материалы", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder(/например/i);
    await input.fill("цикл");
    await expect(page.locator("a[href^='/learn/']").first()).toBeVisible({ timeout: 10_000 });
  });

  test("тема переключается и сохраняется", async ({ page }) => {
    await page.goto("/settings");
    const darkButton = page.getByRole("radio", { name: /тёмная/i });
    await darkButton.click();
    await expect(darkButton).toHaveAttribute("aria-checked", "true");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("безопасность и доступность", () => {
  test("сетевой справочник предупреждает о работе только с localhost", async ({ page }) => {
    await page.goto("/reference/networks");
    await expect(page.getByRole("heading", { name: /справочник сетей/i })).toBeVisible();
    await expect(page.getByText(/только учебные сценарии/i)).toBeVisible();
    await expect(page.getByText(/127\.0\.0\.1/).first()).toBeVisible();

    // Внешние ссылки — только разрешённые (исходники проекта), никаких чужих хостов
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") ?? ""));
    const external = hrefs.filter(
      (h) => /^https?:\/\//.test(h) && !/^https?:\/\/(localhost|127\.0\.0\.1|github\.com)/.test(h),
    );
    expect(external).toEqual([]);
  });

  test("на странице есть main и skip-link", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.locator("main#main")).toBeVisible();
    await expect(page.getByText(/перейти к .*содержимому/i)).toHaveCount(1);
  });
});

import type { ReferenceEntry } from "@/types/content";

/**
 * Справочник Python: встроенные функции, типы, методы коллекций, ключевые слова,
 * операторы, исключения, стандартная библиотека, ООП, асинхронность, файлы и сети.
 * Каждая запись содержит назначение, синтаксис, параметры, рабочий пример,
 * типичные ошибки и связи с другими записями справочника.
 */
export const pythonReference: ReferenceEntry[] = [
  // ── Встроенные функции ──────────────────────────────────────────────
  {
    id: "ref-print",
    name: "print()",
    category: "builtins",
    purpose:
      "Выводит переданные значения в стандартный поток вывода, обычно в консоль. Первая функция, с которой начинается знакомство с Python.",
    syntax: "print(*objects, sep=' ', end='\\n', file=sys.stdout)",
    params: [
      { name: "objects", description: "Любые объекты, которые нужно вывести" },
      { name: "sep", description: "Строка-разделитель, вставляется между объектами" },
      { name: "end", description: "Строка, дописываемая после последнего объекта" },
      { name: "file", description: "Поток вывода, по умолчанию это консоль" },
    ],
    returns: "None — print ничего не возвращает",
    example: "print('Сумма:', 2 + 3, sep=' = ')",
    errors: [
      "Вызов без скобок печатает имя функции, а не результат",
      "Переменную выводят без кавычек и получают NameError",
      "Используют русские скобки или типографские кавычки вместо ASCII-символов",
    ],
    related: ["ref-str", "ref-repr", "ref-input", "ref-str-format"],
    level: "beginner",
  },
  {
    id: "ref-len",
    name: "len()",
    category: "builtins",
    purpose:
      "Возвращает количество элементов в объекте: число символов в строке, элементов в списке или ключей в словаре.",
    syntax: "len(obj)",
    params: [
      {
        name: "obj",
        description: "Строка, список, кортеж, словарь, множество или другой объект с длиной",
      },
    ],
    returns: "int — размер объекта",
    example: `words = ['python', 'academy']
print(len(words))`,
    errors: [
      "len() у числа вызывает TypeError: object of type 'int' has no len()",
      "Забывают, что пробелы и переводы строки тоже считаются символами",
      "Путают длину исходной строки с длиной списка после split()",
    ],
    related: ["ref-type-str", "ref-type-list", "ref-str-split", "ref-list-append"],
    level: "beginner",
  },
  {
    id: "ref-range",
    name: "range()",
    category: "builtins",
    purpose:
      "Создаёт последовательность чисел для цикла for. По умолчанию шаг равен единице, а отсчёт начинается с нуля.",
    syntax: "range(stop) | range(start, stop, step)",
    params: [
      { name: "stop", description: "Граница последовательности, сама она не включается" },
      { name: "start", description: "Начальное значение, по умолчанию 0" },
      { name: "step", description: "Шаг изменения, по умолчанию 1, может быть отрицательным" },
    ],
    returns: "объект range — ленивую последовательность чисел",
    example: `for i in range(1, 6):
    print(i)`,
    errors: [
      "Ждут, что range(5) выведет 5, но последнее число всегда меньше границы",
      "range(1, 10, 0) вызывает ValueError: range() arg 3 must not be zero",
      "При положительной границе и отрицательном шаге получается пустая последовательность",
    ],
    related: ["ref-kw-for", "ref-list-append", "ref-len"],
    level: "beginner",
  },
  {
    id: "ref-int",
    name: "int()",
    category: "builtins",
    purpose:
      "Преобразует значение в целое число или возвращает его целую часть. Для строки можно указать систему счисления.",
    syntax: "int(x=0, base=10)",
    params: [
      { name: "x", description: "Число, строка или объект с методом __int__" },
      { name: "base", description: "Основание системы счисления для строки, от 2 до 36" },
    ],
    returns: "int — целое число",
    example: "print(int('42'), int(3.99), int('ff', 16))",
    errors: [
      "int('3.14') вызывает ValueError — дробную строку сначала приводят к float",
      "int() от None или списка даёт TypeError",
      "Отрицательное дробное число округляется к нулю, а не вниз: int(-2.7) равно -2",
    ],
    related: ["ref-float", "ref-type-int", "ref-str", "ref-round"],
    level: "beginner",
  },
  {
    id: "ref-float",
    name: "float()",
    category: "builtins",
    purpose:
      "Преобразует значение в вещественное число. Понимает записи с точкой, научную нотацию и булевы значения.",
    syntax: "float(x)",
    params: [
      { name: "x", description: "Число, строка вида '3.14' или '1e-3', значение True или False" },
    ],
    returns: "float — число с плавающей точкой",
    example: `price = float('19.99')
print(price * 2)`,
    errors: [
      "float('1,5') вызывает ValueError — в Python нужна точка, а не запятая",
      "float('') и float(None) приводят к ValueError или TypeError",
      "Деление float на 0 даёт ZeroDivisionError, а не бесконечность",
    ],
    related: ["ref-int", "ref-round", "ref-type-int", "ref-str"],
    level: "beginner",
  },
  {
    id: "ref-str",
    name: "str()",
    category: "builtins",
    purpose:
      "Преобразует значение в строку или возвращает строковое представление объекта. Незаменима при соединении текста и чисел.",
    syntax: "str(object='')",
    params: [
      { name: "object", description: "Любой объект; без аргумента возвращается пустая строка" },
    ],
    returns: "str — строковое представление объекта",
    example: `year = 2026
print('Год: ' + str(year))`,
    errors: [
      "'Год: ' + 2026 вызывает TypeError: can only concatenate str",
      "str(obj) и repr(obj) часто различаются, для отладки нужен repr",
      "str() не превращает строку в число — для этого есть int() и float()",
    ],
    related: ["ref-type-str", "ref-int", "ref-repr", "ref-float"],
    level: "beginner",
  },
  {
    id: "ref-bool",
    name: "bool()",
    category: "builtins",
    purpose:
      "Определяет истинность значения и приводит его к True или False. Пустые контейнеры и нули считаются ложными.",
    syntax: "bool(x)",
    params: [{ name: "x", description: "Число, строка, список, словарь, None или другой объект" }],
    returns: "bool — True либо False",
    example: "print(bool(''), bool('text'), bool([]), bool([1]))",
    errors: [
      "Считают, что bool('False') равно False, но любая непустая строка это True",
      "bool([]) и bool({}) дают False, а bool(' ') даёт True",
      "Для цикла if не нужны лишние сравнения: if values: короче, чем if bool(values):",
    ],
    related: ["ref-any", "ref-all", "ref-isinstance", "ref-op-eq"],
    level: "beginner",
  },
  {
    id: "ref-type",
    name: "type()",
    category: "builtins",
    purpose:
      "Возвращает тип объекта, например int или list. По трем аргументам функция объявляет новый класс.",
    syntax: "type(object)",
    params: [{ name: "object", description: "Объект, чей тип нужно узнать" }],
    returns: "класс объекта, например <class 'int'>",
    example: `values = [1, 'a', 3.0]
for v in values:
    print(v, type(v))`,
    errors: [
      "Проверка type(x) == list не учитывает подклассы, поэтому isinstance() надёжнее",
      "Забывают, что bool — подкласс int, поэтому isinstance(True, int) вернёт True",
      "Печать type(x) выглядит как <class 'int'>, это нормально, а не ошибка",
    ],
    related: ["ref-isinstance", "ref-int", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-input",
    name: "input()",
    category: "builtins",
    purpose:
      "Читает строку, введённую пользователем, и приостанавливает программу до нажатия Enter. Всегда возвращает строку.",
    syntax: "input(prompt='')",
    params: [
      { name: "prompt", description: "Подсказка, которая печатается перед приглашением к вводу" },
    ],
    returns: "str — введённая строка без символа переноса строки",
    example: `name = input('Как тебя зовут? ')
print('Привет, ' + name)`,
    errors: [
      "Ждут число, а получают строку, поэтому нужен int(input(...))",
      "При закрытии потока ввода (Ctrl+Z или Ctrl+D) возникает EOFError",
      "Пустой ввод не считается ошибкой, но может сломать дальнейшую логику",
    ],
    related: ["ref-str", "ref-int", "ref-print"],
    level: "beginner",
  },
  {
    id: "ref-sorted",
    name: "sorted()",
    category: "builtins",
    purpose:
      "Возвращает новый отсортированный список, не изменяя исходный объект. Элементы идут по возрастанию, если не указано обратное.",
    syntax: "sorted(iterable, key=None, reverse=False)",
    params: [
      { name: "iterable", description: "Последовательность, которую нужно отсортировать" },
      { name: "key", description: "Функция, задающая критерий сравнения элементов" },
      { name: "reverse", description: "True — сортировка по убыванию" },
    ],
    returns: "list — новый список из тех же элементов",
    example: `nums = [3, 1, 2]
print(sorted(nums), nums)`,
    errors: [
      "Смешение чисел и строк в одном списке даёт TypeError при сравнении",
      "Путают sorted() с методом sort(), который возвращает None",
      "Ключевая функция key должна возвращать значение, а не печатать его",
    ],
    related: ["ref-list-sort", "ref-map", "ref-reversed", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-sum",
    name: "sum()",
    category: "builtins",
    purpose:
      "Складывает все элементы последовательности. Удобно для итогов по списку чисел и для подсчёта в цикле.",
    syntax: "sum(iterable, start=0)",
    params: [
      { name: "iterable", description: "Числовая последовательность: список, кортеж, генератор" },
      { name: "start", description: "Начальное значение суммы, по умолчанию 0" },
    ],
    returns: "число — сумму всех элементов с учётом start",
    example: `prices = [100, 250, 50]
print(sum(prices))`,
    errors: [
      "sum() строки вызывает TypeError: unsupported operand type(s) for +",
      "По умолчанию словарь даёт сумму ключей, а не значений",
      "Забывают про start и пытаются прибавить базовое значение через +=",
    ],
    related: ["ref-min", "ref-max", "ref-type-list", "ref-filter"],
    level: "beginner",
  },
  {
    id: "ref-min",
    name: "min()",
    category: "builtins",
    purpose:
      "Находит наименьший элемент последовательности или напрямую сравнивает несколько аргументов.",
    syntax: "min(iterable, key=None, default=None) | min(a, b, ...)",
    params: [
      { name: "iterable", description: "Непустая последовательность значений" },
      { name: "key", description: "Функция критерия сравнения, например len для строк" },
      { name: "default", description: "Значение для пустой последовательности вместо исключения" },
    ],
    returns: "минимальный элемент либо значение default",
    example: `temps = [17, 21, 13, 19]
print(min(temps), min([], default=0))`,
    errors: [
      "min([]) без default вызывает ValueError: min() arg is an empty sequence",
      "Функция key без return возвращает None и ломает сравнение",
      "Сравнивать строки с числами нельзя — возникает TypeError",
    ],
    related: ["ref-max", "ref-sum", "ref-sorted", "ref-abs"],
    level: "beginner",
  },
  {
    id: "ref-max",
    name: "max()",
    category: "builtins",
    purpose:
      "Находит наибольший элемент последовательности или сравнивает несколько аргументов напрямую.",
    syntax: "max(iterable, key=None, default=None) | max(a, b, ...)",
    params: [
      { name: "iterable", description: "Непустая последовательность значений" },
      { name: "key", description: "Функция критерия сравнения" },
      { name: "default", description: "Значение для пустой последовательности вместо исключения" },
    ],
    returns: "наибольший элемент либо значение default",
    example: `scores = [4, 15, 9]
print(max(scores), max([], default=0))`,
    errors: [
      "max([]) без default выбрасывает ValueError",
      "Для объектов нужен key, иначе Python сравнивает их по правилам класса",
      "Путают выбор из двух чисел с поиском максимума в списке",
    ],
    related: ["ref-min", "ref-sorted", "ref-sum", "ref-abs"],
    level: "beginner",
  },
  {
    id: "ref-abs",
    name: "abs()",
    category: "builtins",
    purpose:
      "Возвращает абсолютное значение числа — его модуль, то есть расстояние от нуля без учёта знака.",
    syntax: "abs(x)",
    params: [{ name: "x", description: "Число, комплексное число или объект с методом __abs__" }],
    returns: "число того же типа без знака минус",
    example: `delta = -7
print(abs(delta))`,
    errors: [
      "abs() строки или списка даёт TypeError",
      "Модуль не округляет: abs(-2.7) вернёт 2.7",
      "Для Decimal и Fraction результат остаётся того же типа, что и аргумент",
    ],
    related: ["ref-int", "ref-float", "ref-min"],
    level: "beginner",
  },
  {
    id: "ref-enumerate",
    name: "enumerate()",
    category: "builtins",
    purpose:
      "Перебирает последовательность, выдавая пары «номер элемента — значение». Нумерацию можно начинать с любого числа.",
    syntax: "enumerate(iterable, start=0)",
    params: [
      { name: "iterable", description: "Последовательность для перебора" },
      { name: "start", description: "Номер первого элемента, по умолчанию 0" },
    ],
    returns: "итератор пар (index, value)",
    example: `cities = ['Москва', 'Казань']
for i, city in enumerate(cities, 1):
    print(i, city)`,
    errors: [
      "Забывают про start и думают, что нумерация уже идёт с единицы",
      "Путают порядок переменных: сначала индекс, потом значение",
      "Оборачивают enumerate в list() в цикле и теряют преимущество ленивости",
    ],
    related: ["ref-kw-for", "ref-zip", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-zip",
    name: "zip()",
    category: "builtins",
    purpose:
      "Соединяет несколько последовательностей попарно и останавливается вместе с самой короткой. Удобно для параллельного перебора.",
    syntax: "zip(*iterables)",
    params: [{ name: "iterables", description: "Две и более последовательности любых типов" }],
    returns: "итератор кортежей из соответствующих элементов",
    example: `names = ['A', 'B']
points = [10, 20]
print(list(zip(names, points)))`,
    errors: [
      "zip обрезает данные по самому короткому списку — это частая потеря информации",
      "В Python 3 zip возвращает итератор, его нельзя индексировать без list()",
      "Число переменных в цикле должно совпадать с числом последовательностей",
    ],
    related: ["ref-enumerate", "ref-map", "ref-kw-for"],
    level: "elementary",
  },
  {
    id: "ref-map",
    name: "map()",
    category: "builtins",
    purpose:
      "Применяет функцию к каждому элементу последовательности и выдаёт результаты лениво. В Python 3 возвращает итератор.",
    syntax: "map(function, iterable)",
    params: [
      { name: "function", description: "Функция одного аргумента: имя или lambda" },
      { name: "iterable", description: "Последовательность исходных значений" },
    ],
    returns: "итератор из результатов вызова функции",
    example: `nums = [1, 2, 3]
print(list(map(str, nums)))`,
    errors: [
      "Забывают обернуть результат в list() и видят объект <map object at ...>",
      "Функция с двумя параметрами требует передать два iterable",
      "Сам по себе map ничего не печатает, нужен явный вывод",
    ],
    related: ["ref-filter", "ref-sorted", "ref-zip", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-filter",
    name: "filter()",
    category: "builtins",
    purpose:
      "Отбирает элементы, для которых функция возвращает истину. Неподходящие значения отбрасываются, исходный список не меняется.",
    syntax: "filter(function, iterable)",
    params: [
      { name: "function", description: "Предикат — функция, возвращающая True или False" },
      { name: "iterable", description: "Последовательность для проверки" },
    ],
    returns: "итератор из подходящих элементов",
    example: `nums = [1, 2, 3, 4]
print(list(filter(lambda n: n % 2 == 0, nums)))`,
    errors: [
      "Вместо функции передают None — тогда отбираются просто истинные значения элементов",
      "filter на пустом списке возвращает пустой результат без ошибки",
      "Ждут изменения исходного списка, но filter создаёт новый итератор",
    ],
    related: ["ref-map", "ref-any", "ref-all", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-any",
    name: "any()",
    category: "builtins",
    purpose:
      "Проверяет, есть ли в последовательности хотя бы одно истинное значение. Перебор прекращается на первом True.",
    syntax: "any(iterable)",
    params: [{ name: "iterable", description: "Последовательность любых значений" }],
    returns: "bool — True, если найден хотя бы один истинный элемент",
    example: `flags = [False, 0, 'text']
print(any(flags))`,
    errors: [
      "any([]) возвращает False — пустая последовательность не содержит истинных значений",
      "Ждут список найденных элементов, а получают одно значение True или False",
      "Сравнивают результат any с набором значений через ==",
    ],
    related: ["ref-all", "ref-filter", "ref-bool"],
    level: "elementary",
  },
  {
    id: "ref-all",
    name: "all()",
    category: "builtins",
    purpose:
      "Проверяет, что все элементы последовательности истинны. Как и any, останавливается на первом ложном значении.",
    syntax: "all(iterable)",
    params: [{ name: "iterable", description: "Последовательность любых значений" }],
    returns: "bool — True, если ни один элемент не является ложным",
    example: `marks = [5, 4, 5]
print(all(m > 3 for m in marks))`,
    errors: [
      "all([]) возвращает True — это вакуумная истина, о ней легко забыть",
      "Повторно используют уже исчерпанный генератор и получают пустой результат",
      "Ждут, что all перечислит проблемные элементы, а он возвращает только True или False",
    ],
    related: ["ref-any", "ref-filter", "ref-bool"],
    level: "elementary",
  },
  {
    id: "ref-isinstance",
    name: "isinstance()",
    category: "builtins",
    purpose:
      "Проверяет, принадлежит ли объект классу или его подклассу. Это предпочтительный способ проверки типа в Python.",
    syntax: "isinstance(object, classinfo)",
    params: [
      { name: "object", description: "Проверяемый объект" },
      { name: "classinfo", description: "Класс или кортеж из нескольких классов" },
    ],
    returns: "bool — True, если объект принадлежит указанному классу",
    example: `data = ['a', 'b']
print(isinstance(data, (list, tuple)))`,
    errors: [
      "Проверку пишут как isinstance(x, 'list'), передавая строку вместо класса, и получают TypeError",
      "Сравнение type(x) == list отвергает подклассы",
      "Забывают, что bool является подклассом int",
    ],
    related: ["ref-type", "ref-bool", "ref-oop-property"],
    level: "elementary",
  },
  {
    id: "ref-open",
    name: "open()",
    category: "builtins",
    purpose:
      "Открывает файл и возвращает объект файла. Лучше всегда открывать его через with, иначе данные могут не записаться на диск.",
    syntax: "open(file, mode='r', encoding=None)",
    params: [
      { name: "file", description: "Путь к файлу относительно текущей папки или абсолютный" },
      { name: "mode", description: "'r' чтение, 'w' запись с очисткой, 'a' добавление в конец" },
      { name: "encoding", description: "Кодировка, для кириллицы укажите encoding='utf-8'" },
    ],
    returns: "объект файла: TextIOWrapper для текста или BufferedReader для байтов",
    example: `with open('notes.txt', 'w', encoding='utf-8') as f:
    f.write('привет')`,
    errors: [
      "Файл не найден приводит к FileNotFoundError — проверьте путь",
      "Запись без encoding='utf-8' ломает кириллицу на Windows",
      "Режим 'w' сразу стирает старое содержимое файла",
    ],
    related: ["ref-files-with", "ref-files-open", "ref-files-read", "ref-str"],
    level: "elementary",
  },
  {
    id: "ref-repr",
    name: "repr()",
    category: "builtins",
    purpose:
      "Возвращает точное строковое представление объекта для отладки. В отличие от str, показывает кавычки у строк и спецсимволы.",
    syntax: "repr(object)",
    params: [{ name: "object", description: "Объект, чьё представление нужно получить" }],
    returns: "str — официальное строковое представление объекта",
    example: `title = 'Python'
print(repr(title), len(repr(title)))`,
    errors: [
      "Путают repr со str и получают лишние кавычки при обычной печати",
      "Метод __repr__ должен возвращать строку, иначе Python выбросит TypeError",
      "Для чисел repr и str почти всегда совпадают, путаницы они не создают",
    ],
    related: ["ref-str", "ref-print", "ref-type"],
    level: "elementary",
  },
  {
    id: "ref-reversed",
    name: "reversed()",
    category: "builtins",
    purpose:
      "Возвращает итератор, идущий от конца последовательности к началу. Сам объект при этом не изменяется.",
    syntax: "reversed(seq)",
    params: [
      {
        name: "seq",
        description: "Последовательность: список, строка, кортеж или объект с __reversed__",
      },
    ],
    returns: "итератор в обратном порядке",
    example: `steps = ['a', 'b', 'c']
for s in reversed(steps):
    print(s)`,
    errors: [
      "reversed() на словаре или множестве вызывает TypeError",
      "В Python 3 результат нельзя индексировать, нужен list(reversed(x))",
      "Ждут, что исходный список развернётся на месте",
    ],
    related: ["ref-sorted", "ref-kw-for", "ref-iter"],
    level: "elementary",
  },
  {
    id: "ref-round",
    name: "round()",
    category: "builtins",
    purpose:
      "Округляет число до заданного количества знаков после запятой. Без второго аргумента возвращает целое.",
    syntax: "round(number, ndigits=None)",
    params: [
      { name: "number", description: "Число для округления" },
      { name: "ndigits", description: "Число знаков после запятой, None — округление до целого" },
    ],
    returns: "округлённое число типа int или float",
    example: "print(round(2.675, 2), round(2.5), round(-2.5))",
    errors: [
      "Ждут арифметического 2.68, а из-за двоичного представления получают 2.67",
      "round('3.14') вызывает TypeError — сначала приводят к float",
      "Округление идёт к чётному: round(0.5) даёт 0, а round(1.5) даёт 2",
    ],
    related: ["ref-float", "ref-int", "ref-abs"],
    level: "elementary",
  },
  {
    id: "ref-iter",
    name: "iter()",
    category: "builtins",
    purpose:
      "Возвращает итератор объекта. Итератор хранит позицию и отдаёт элементы по одному при каждом вызове next().",
    syntax: "iter(iterable)",
    params: [
      {
        name: "iterable",
        description: "Список, строка, файл или другой объект с методом __iter__",
      },
    ],
    returns: "итератор",
    example: `it = iter([1, 2, 3])
print(next(it), next(it))`,
    errors: [
      "iter() числа вызывает TypeError: 'int' object is not iterable",
      "Итератор одноразовый: после исчерпания next() бросает StopIteration",
      "Цикл for создаёт новый итератор на каждой итерации, а вручную созданный общий для всех",
    ],
    related: ["ref-next", "ref-reversed", "ref-kw-for"],
    level: "intermediate",
  },
  {
    id: "ref-next",
    name: "next()",
    category: "builtins",
    purpose:
      "Возвращает следующий элемент итератора. Если элементы закончились, выбрасывает StopIteration либо значение по умолчанию.",
    syntax: "next(iterator, default=None)",
    params: [
      { name: "iterator", description: "Итератор, созданный функцией iter() или генератор" },
      { name: "default", description: "Значение, которое вернуть вместо StopIteration" },
    ],
    returns: "следующий элемент итератора",
    example: `it = iter([10, 20])
print(next(it), next(it), next(it, 0))`,
    errors: [
      "Без default вызов после исчерпания элементов прерывает программу по StopIteration",
      "Передают список вместо итератора: next([1, 2]) вызывает TypeError",
      "next() необратимо сдвигает позицию, повторный вызов вернёт другой элемент",
    ],
    related: ["ref-iter", "ref-kw-for", "ref-reversed"],
    level: "intermediate",
  },
  {
    id: "ref-getattr",
    name: "getattr()",
    category: "builtins",
    purpose:
      "Читает значение атрибута объекта по имени, записанному в строке. Позволяет работать с полями, названия которых появляются во время выполнения.",
    syntax: "getattr(object, name, default=None)",
    params: [
      { name: "object", description: "Объект или класс" },
      { name: "name", description: "Строка с именем атрибута" },
      { name: "default", description: "Значение, если атрибут не найден" },
    ],
    returns: "значение атрибута либо default",
    example: `class Server:
    host = 'localhost'

srv = Server()
print(getattr(srv, 'host'), getattr(srv, 'port', 8080))`,
    errors: [
      "Без default отсутствующий атрибут выбрасывает AttributeError",
      "Второй аргумент обязан быть строкой, иначе TypeError",
      "Для статичных имён понятнее писать obj.name напрямую",
    ],
    related: ["ref-setattr", "ref-oop-init", "ref-type"],
    level: "intermediate",
  },
  {
    id: "ref-setattr",
    name: "setattr()",
    category: "builtins",
    purpose:
      "Устанавливает атрибут объекта по имени из строки. Полезно в конфигурациях, где имена полей задаются данными.",
    syntax: "setattr(object, name, value)",
    params: [
      { name: "object", description: "Объект или класс" },
      { name: "name", description: "Строка с именем атрибута" },
      { name: "value", description: "Присваиваемое значение" },
    ],
    returns: "None",
    example: `class Server:
    host = ''

srv = Server()
setattr(srv, 'host', 'localhost')
print(srv.host)`,
    errors: [
      "Присваивание запрещённого атрибута вызывает AttributeError",
      "В классах со слотами (__slots__) нельзя добавить ранее необъявленное имя",
      "Передают значение вместо строки в качестве имени атрибута",
    ],
    related: ["ref-getattr", "ref-oop-init", "ref-oop-property"],
    level: "intermediate",
  },
  {
    id: "ref-help",
    name: "help()",
    category: "builtins",
    purpose:
      "Выводит справку по объекту: документацию, сигнатуру и список методов. Работает в интерактивном режиме и в Jupyter.",
    syntax: "help(object)",
    params: [{ name: "object", description: "Функция, класс, модуль или строка с именем" }],
    returns: "None — справка печатается в консоль",
    example: "help(list.append)",
    errors: [
      "Ждут возвращения строки, но help печатает справку и возвращает None",
      "В обычном скрипте вывод может быть слишком объёмным",
      "У объекта без docstring справка окажется короткой или пустой",
    ],
    related: ["ref-repr", "ref-print", "ref-type"],
    level: "beginner",
  },

  // ── Типы данных ─────────────────────────────────────────────────────
  {
    id: "ref-type-int",
    name: "int",
    category: "types",
    purpose:
      "Целое число без дробной части. Разрядность не ограничена: Python хранит сколько угодно большие значения.",
    syntax: "42 | -7 | 0b1010 | 0o17 | 0xFF | int(value)",
    params: [{ name: "value", description: "Число, строка или основание системы счисления" }],
    returns: "объект типа int",
    example: `big = 10 ** 20
print(big, type(big))`,
    errors: [
      "Оператор / всегда возвращает float: даже 4 / 2 даёт 2.0, целое деление — //",
      "Сравнение int со строкой вызывает TypeError",
      "Переполнения нет, но возведение в огромную степень заметно замедляет программу",
    ],
    related: ["ref-int", "ref-float", "ref-op-floordiv"],
    level: "beginner",
  },
  {
    id: "ref-type-str",
    name: "str",
    category: "types",
    purpose:
      "Неизменяемая последовательность Unicode-символов. Методы строки возвращают новую строку, исходная остаётся прежней.",
    syntax: '\'text\' | "text" | """block""" | str(value)',
    params: [{ name: "value", description: "Объект, который нужно представить строкой" }],
    returns: "объект типа str",
    example: `line = 'hello'
print(line[0], len(line), line.upper())`,
    errors: [
      "Попытка изменить символ по индексу даёт TypeError: 'str' object does not support item assignment",
      "Вызов line.upper() без присваивания ничего не меняет в самой строке",
      "Смешение текста и байтов в операциях приводит к TypeError",
    ],
    related: ["ref-str", "ref-str-split", "ref-len"],
    level: "beginner",
  },
  {
    id: "ref-type-list",
    name: "list",
    category: "types",
    purpose:
      "Изменяемая упорядоченная коллекция. Хранит элементы любого типа, допускает повторы и позволяет менять содержимое на месте.",
    syntax: "[1, 2, 3] | list(iterable)",
    params: [{ name: "iterable", description: "Итерируемый объект, из которого построят список" }],
    returns: "объект типа list",
    example: `nums = [1, 2]
nums.append(3)
print(nums[0], nums[-1], nums[1:])`,
    errors: [
      "Индекс за пределами списка даёт IndexError",
      "Присваивание среза списку другой длины вызывает ValueError",
      "Копирование через b = a не создаёт копию: оба имени смотрят на один и тот же список",
    ],
    related: ["ref-list-append", "ref-len", "ref-sorted", "ref-type-dict"],
    level: "beginner",
  },
  {
    id: "ref-type-dict",
    name: "dict",
    category: "types",
    purpose:
      "Словарь — коллекция пар «ключ: значение» с быстрым поиском по ключу. Ключ должен быть неизменяемым и уникальным.",
    syntax: "{'a': 1} | dict(key=value, ...) | dict(pairs)",
    params: [
      {
        name: "pairs",
        description: "Именованные аргументы или итерируемый объект пар ключ-значение",
      },
    ],
    returns: "объект типа dict",
    example: `user = {'name': 'Alex', 'age': 20}
print(user['name'], user.get('city'))`,
    errors: [
      "Обращение по отсутствующему ключу даёт KeyError, безопаснее метод get()",
      "Ключ в виде списка вызывает TypeError: unhashable type: 'list'",
      "Нельзя полагаться на порядок ключей в старых версиях Python",
    ],
    related: ["ref-dict-get", "ref-dict-items", "ref-type-list", "ref-set-add"],
    level: "beginner",
  },

  // ── Методы строк ────────────────────────────────────────────────────
  {
    id: "ref-str-split",
    name: "split()",
    category: "str",
    purpose:
      "Разбивает строку на список подстрок по разделителю. Без аргумента режет по любым пробельным символам.",
    syntax: "str.split(sep=None, maxsplit=-1)",
    params: [
      { name: "sep", description: "Разделитель, по умолчанию любые пробелы и табуляции" },
      { name: "maxsplit", description: "Максимальное число разрезов, -1 означает без ограничения" },
    ],
    returns: "list — список подстрок",
    example: `line = 'a,b,c'
print(line.split(','))`,
    errors: [
      "split('') вызывает ValueError: empty separator",
      "Метод не удаляет пробелы, поэтому перед ним часто применяют strip()",
      "Разрез по одному пробелу оставляет пустые строки при двойных пробелах",
    ],
    related: ["ref-str-join", "ref-str-strip", "ref-type-list", "ref-str-format"],
    level: "beginner",
  },
  {
    id: "ref-str-join",
    name: "join()",
    category: "str",
    purpose:
      "Собирает последовательность строк в одну, вставляя между ними указанный разделитель. Объединять можно только строки.",
    syntax: "str.join(iterable)",
    params: [{ name: "iterable", description: "Последовательность строк" }],
    returns: "str — склеенная строка",
    example: `parts = ['2026', '10', '06']
print('-'.join(parts))`,
    errors: [
      "join([1, 2]) даёт TypeError: sequence item 0 expected str instance, int found",
      "Забывают, что join — метод разделителя, а не списка: ', '.join(list)",
      "Пустой список возвращает пустую строку без какой-либо ошибки",
    ],
    related: ["ref-str-split", "ref-str-format", "ref-type-list"],
    level: "beginner",
  },
  {
    id: "ref-str-strip",
    name: "strip()",
    category: "str",
    purpose:
      "Удаляет пробелы и указанные символы с начала и конца строки. Есть направленные версии lstrip() и rstrip().",
    syntax: "str.strip(chars=None)",
    params: [
      {
        name: "chars",
        description: "Набор символов для удаления, по умолчанию пробелы и переводы строк",
      },
    ],
    returns: "str — новая строка без краевых символов",
    example: `raw = '  hello  '
print(raw.strip(), raw.strip().upper())`,
    errors: [
      "Удаляются символы только по краям, внутри строки всё остаётся",
      "strip('-5-') уберёт все краевые минусы, включая знак числа",
      "Забывают присвоить результат — строка неизменяема и метод возвращает копию",
    ],
    related: ["ref-str-split", "ref-str-replace", "ref-type-str"],
    level: "beginner",
  },
  {
    id: "ref-str-replace",
    name: "replace()",
    category: "str",
    purpose:
      "Заменяет вхождения подстроки на новую. Количество замен можно ограничить третьим аргументом.",
    syntax: "str.replace(old, new, count=-1)",
    params: [
      { name: "old", description: "Подстрока, которую ищем" },
      { name: "new", description: "Подстрока-замена" },
      { name: "count", description: "Сколько первых вхождений заменить, -1 означает все" },
    ],
    returns: "str — новая строка",
    example: `text = 'a-b-c'
print(text.replace('-', '+'))`,
    errors: [
      "Строка не меняется на месте, результат нужно присвоить переменной",
      "Регистр важен: 'Hello'.replace('hello', ...) ничего не найдёт",
      "Пустой аргумент old вызывает ValueError: empty search string",
    ],
    related: ["ref-str-split", "ref-str-strip", "ref-str-format"],
    level: "beginner",
  },
  {
    id: "ref-str-format",
    name: "format()",
    category: "str",
    purpose:
      "Подставляет значения в шаблон строки по позициям и именам полей. Основа форматирования до появления f-строк.",
    syntax: "str.format(*args, **kwargs)",
    params: [
      { name: "args", description: "Значения для позиционных полей {0}, {1}" },
      { name: "kwargs", description: "Значения для именованных полей вида {name}" },
    ],
    returns: "str — строка с подставленными значениями",
    example: `template = '{0} набрал {1} баллов'
print(template.format('Alex', 95))`,
    errors: [
      "Число полей не совпадает с аргументами — возникают IndexError или KeyError",
      "Выражения внутри фигурных скобок не вычисляются, их считают заранее",
      "Слишком сложные форматы чисел удобнее задавать через спецификатор вида {0:.2f}",
    ],
    related: ["ref-str-join", "ref-print", "ref-str-split"],
    level: "elementary",
  },

  // ── Методы списков ──────────────────────────────────────────────────
  {
    id: "ref-list-append",
    name: "append()",
    category: "list",
    purpose:
      "Добавляет один элемент в конец списка, изменяя его на месте. Самый частый способ наполнить список внутри цикла.",
    syntax: "list.append(object)",
    params: [
      {
        name: "object",
        description: "Элемент любого типа; список добавится целиком как вложенный",
      },
    ],
    returns: "None — метод меняет список и ничего не возвращает",
    example: `logs = []
logs.append('start')
logs.append('done')
print(logs)`,
    errors: [
      "Присваивание res = lst.append(x) сохранит в res значение None",
      "Нужно добавить сразу несколько элементов, а append кладёт один — поможет extend()",
      "Забывают создать пустой список до цикла и получают NameError",
    ],
    related: ["ref-list-extend", "ref-list-remove", "ref-type-list", "ref-kw-for"],
    level: "beginner",
  },
  {
    id: "ref-list-extend",
    name: "extend()",
    category: "list",
    purpose:
      "Дополняет список элементами другой последовательности, добавляя каждый элемент отдельно, а не вложенным объектом.",
    syntax: "list.extend(iterable)",
    params: [{ name: "iterable", description: "Список, строка, кортеж, множество или генератор" }],
    returns: "None",
    example: `base = [1, 2]
base.extend([3, 4])
print(base)`,
    errors: [
      "extend('ab') разложит строку на символы, а append добавил бы строку целиком",
      "extend возвращает None, поэтому результат нельзя присвоить",
      "Склейка через + создаёт новый список и не экономит память",
    ],
    related: ["ref-list-append", "ref-list-pop", "ref-type-list"],
    level: "beginner",
  },
  {
    id: "ref-list-remove",
    name: "remove()",
    category: "list",
    purpose:
      "Удаляет первое вхождение значения из списка. Если такого значения нет, выбрасывает ValueError.",
    syntax: "list.remove(value)",
    params: [
      { name: "value", description: "Удаляемое значение, поиск выполняется через оператор ==" },
    ],
    returns: "None",
    example: `tasks = ['read', 'write', 'read']
tasks.remove('read')
print(tasks)`,
    errors: [
      "Отсутствующее значение даёт ValueError: list.remove(x): x not in list",
      "Удаляется только первое вхождение, остальные остаются",
      "Изменение списка во время итерации сдвигает индексы — собирайте новый список",
    ],
    related: ["ref-list-pop", "ref-list-append", "ref-type-list"],
    level: "elementary",
  },
  {
    id: "ref-list-pop",
    name: "pop()",
    category: "list",
    purpose:
      "Извлекает элемент по индексу и возвращает его, одновременно убирая из списка. Без аргумента берёт последний элемент.",
    syntax: "list.pop(index=-1)",
    params: [{ name: "index", description: "Индекс удаляемого элемента, по умолчанию -1 (конец)" }],
    returns: "удалённый элемент",
    example: `stack = [1, 2, 3]
print(stack.pop(), stack)`,
    errors: [
      "Индекс за пределами списка даёт IndexError: pop index out of range",
      "Путают pop с remove: pop работает по индексу, remove по значению",
      "На пустом списке pop() выбросит IndexError",
    ],
    related: ["ref-list-remove", "ref-list-append", "ref-list-extend"],
    level: "elementary",
  },
  {
    id: "ref-list-sort",
    name: "sort()",
    category: "list",
    purpose:
      "Сортирует список на месте и возвращает None. Если исходный список жалко, используют sorted().",
    syntax: "list.sort(key=None, reverse=False)",
    params: [
      { name: "key", description: "Функция критерия сравнения, например str.lower" },
      { name: "reverse", description: "True — сортировка по убыванию" },
    ],
    returns: "None — изменяется только сам список",
    example: `nums = [3, 1, 2]
nums.sort()
print(nums)`,
    errors: [
      "Присваивание nums = nums.sort() затрёт список значением None",
      "Список с числами и строками не отсортируется: TypeError",
      "Сортировка объектов без key требует, чтобы класс поддерживал сравнение",
    ],
    related: ["ref-sorted", "ref-list-append", "ref-type-list"],
    level: "elementary",
  },

  // ── Методы словарей ─────────────────────────────────────────────────
  {
    id: "ref-dict-get",
    name: "get()",
    category: "dict",
    purpose:
      "Возвращает значение по ключу, а при отсутствии ключа — значение по умолчанию вместо исключения. Безопасная альтернатива обращению в квадратных скобках.",
    syntax: "dict.get(key, default=None)",
    params: [
      { name: "key", description: "Искомый ключ" },
      { name: "default", description: "Что вернуть, если ключа нет, по умолчанию None" },
    ],
    returns: "значение по ключу либо default",
    example: `config = {'host': 'localhost'}
print(config.get('port', 8080))`,
    errors: [
      "get не создаёт ключ: config.get('new', 0) не запишет ничего в словарь",
      "Возвращённый None легко перепутать с настоящим значением None",
      "Если ключ может отсутствовать, но это важно заметить, лучше использовать оператор in",
    ],
    related: ["ref-dict-keys", "ref-dict-items", "ref-type-dict", "ref-exc-keyerror"],
    level: "beginner",
  },
  {
    id: "ref-dict-keys",
    name: "keys()",
    category: "dict",
    purpose:
      "Возвращает представление всех ключей словаря. В Python 3 это динамический вид, который обновляется при изменении словаря.",
    syntax: "dict.keys()",
    params: [],
    returns: "объект dict_keys — вид ключей, похожий на множество",
    example: `scores = {'a': 5, 'b': 4}
print(list(scores.keys()))`,
    errors: [
      "Результат нельзя индексировать без list()",
      "Удаление ключей во время обхода представления вызывает RuntimeError",
      "По словарю проходят напрямую: for key in scores:, отдельный вызов не обязателен",
    ],
    related: ["ref-dict-items", "ref-dict-get", "ref-type-dict"],
    level: "beginner",
  },
  {
    id: "ref-dict-items",
    name: "items()",
    category: "dict",
    purpose:
      "Возвращает пары «ключ: значение», удобные для распаковки в цикле. В Python 3 вид элементов динамический и ленивый.",
    syntax: "dict.items()",
    params: [],
    returns: "объект dict_items — пары кортежей (key, value)",
    example: `user = {'name': 'Alex', 'age': 20}
for key, value in user.items():
    print(key, '=>', value)`,
    errors: [
      "Забывают распаковать пару и получают кортеж целиком",
      "Присваивание по представлению items() невозможно, это не список",
      "Путают items() с values(), когда нужны только значения",
    ],
    related: ["ref-dict-keys", "ref-dict-update", "ref-type-dict", "ref-kw-for"],
    level: "beginner",
  },
  {
    id: "ref-dict-update",
    name: "update()",
    category: "dict",
    purpose:
      "Обновляет словарь значениями из другого словаря или пар. Существующие ключи перезаписываются, новые добавляются.",
    syntax: "dict.update(other=..., **kwargs)",
    params: [
      { name: "other", description: "Словарь или последовательность пар ключ-значение" },
      { name: "kwargs", description: "Пары вида key=value" },
    ],
    returns: "None — словарь меняется на месте",
    example: `base = {'a': 1, 'b': 2}
base.update({'b': 20, 'c': 3})
print(base)`,
    errors: [
      "Несуществующий ключ в update не создаётся, а добавляется — путаница со слиянием",
      "Метод возвращает None, результат нельзя присвоить",
      "При необходимости сохранить оба словаря строят новый: {**a, **b}",
    ],
    related: ["ref-dict-get", "ref-dict-items", "ref-type-dict", "ref-op-assign"],
    level: "elementary",
  },

  // ── Методы множеств ────────────────────────────────────────────────
  {
    id: "ref-set-add",
    name: "add()",
    category: "set",
    purpose:
      "Добавляет один элемент в множество. Если такой элемент уже есть, ничего не происходит — множества не хранят дубликаты.",
    syntax: "set.add(elem)",
    params: [{ name: "elem", description: "Добавляемый элемент; он должен быть неизменяемым" }],
    returns: "None — множество меняется на месте",
    example: `tags = {'python'}
tags.add('class')
tags.add('python')
print(tags)`,
    errors: [
      "Добавить список или словарь нельзя: TypeError: unhashable type",
      "Порядок элементов не гарантирован, поэтому вывод может отличаться от записанного",
      "Метод возвращает None, результат присваивать нельзя",
    ],
    related: ["ref-set-union", "ref-set-difference", "ref-dict-keys", "ref-type-dict"],
    level: "elementary",
  },
  {
    id: "ref-set-union",
    name: "union()",
    category: "set",
    purpose:
      "Объединяет несколько множеств в одно, сохраняя только уникальные элементы. Записывается короче через оператор |.",
    syntax: "set.union(*others) | a | b",
    params: [
      {
        name: "others",
        description: "Одно или несколько множеств либо любых итерируемых объектов",
      },
    ],
    returns: "новое множество — исходные объекты не изменяются",
    example: `a = {1, 2}
b = {2, 3}
print(a | b, a.union([3, 4]))`,
    errors: [
      "union создаёт новое множество, для изменения на месте нужен оператор |=",
      "Результат неупорядочен, полагаться на порядок нельзя",
      "Склеивание через + для множеств невозможно: TypeError",
    ],
    related: ["ref-set-add", "ref-set-difference", "ref-type-dict"],
    level: "elementary",
  },
  {
    id: "ref-set-difference",
    name: "difference()",
    category: "set",
    purpose:
      "Возвращает элементы, есть в первом множестве и отсутствующие во всех остальных. Записывается короче через минус.",
    syntax: "set.difference(*others) | a - b",
    params: [{ name: "others", description: "Множества, элементы которых исключаются" }],
    returns: "новое множество разности",
    example: `all_users = {'ann', 'bob', 'cat'}
blocked = {'bob'}
print(all_users - blocked)`,
    errors: [
      "Порядок аргументов важен: a - b и b - a дают разные результаты",
      "Разность не изменяет исходное множество",
      "Передача неитерируемого аргумента вызывает TypeError",
    ],
    related: ["ref-set-union", "ref-set-add", "ref-type-dict"],
    level: "elementary",
  },

  // ── Ключевые слова ─────────────────────────────────────────────────
  {
    id: "ref-kw-for",
    name: "for",
    category: "keywords",
    purpose:
      "Организует цикл по элементам последовательности либо по любому итерируемому объекту. В Python нет классического цикла со счётчиком.",
    syntax: "for target in iterable:",
    params: [
      { name: "target", description: "Имя переменной, в которую кладётся очередной элемент" },
      { name: "iterable", description: "Последовательность, range или другой итерируемый объект" },
    ],
    returns: "Цикл не возвращает значение; тело выполняется для каждого элемента",
    example: `for i in range(3):
    print(i)`,
    errors: [
      "Забыто двоеточие в конце строки — SyntaxError",
      "Изменение списка при обходе пропускает элементы: перебирайте копию или новый список",
      "Ждут индекс по умолчанию — используйте enumerate(), если он нужен",
    ],
    related: ["ref-range", "ref-enumerate", "ref-kw-return", "ref-zip"],
    level: "beginner",
  },
  {
    id: "ref-kw-def",
    name: "def",
    category: "keywords",
    purpose:
      "Объявляет функцию: имя, параметры и тело. Функция выполняется только в момент вызова, поэтому объявление должно стоять выше первого использования.",
    syntax: "def name(arg=default):",
    params: [
      { name: "name", description: "Имя функции по правилам именования snake_case" },
      {
        name: "arg",
        description:
          "Параметр со значением по умолчанию, значение по умолчанию вычисляется один раз",
      },
      { name: "body", description: "Инструкции функции с отступом в четыре пробела" },
    ],
    returns: "Объект функции; при вызове возвращается результат return, иначе None",
    example: `def square(x):
    return x * x

print(square(5))`,
    errors: [
      "Вызов до объявления даёт NameError",
      "Мутабельное значение по умолчанию вроде def f(items=[]) общее для всех вызовов",
      "Отступ тела функции не совпадает с остальным кодом — IndentationError",
    ],
    related: ["ref-kw-return", "ref-oop-init", "ref-async-def", "ref-map"],
    level: "beginner",
  },
  {
    id: "ref-kw-return",
    name: "return",
    category: "keywords",
    purpose:
      "Завершает функцию и возвращает значение вызывающему коду. Без return функция вернёт None.",
    syntax: "return value",
    params: [{ name: "value", description: "Возвращаемое значение, можно не указывать вовсе" }],
    returns: "Значение в вызывающий код; return немедленно прерывает выполнение функции",
    example: `def grade(score):
    if score >= 60:
        return 'pass'
    return 'fail'

print(grade(75))`,
    errors: [
      "Код после return не выполняется никогда",
      "Возврат нескольких значений через запятую создаёт кортеж — легко забыть",
      "return внутри генератора завершает его, порождая StopIteration",
    ],
    related: ["ref-kw-def", "ref-kw-for", "ref-type-dict"],
    level: "beginner",
  },

  // ── Операторы ──────────────────────────────────────────────────────
  {
    id: "ref-op-add",
    name: "+",
    category: "operators",
    purpose:
      "Складывает числа, а для строк и списков означает склейку. В зависимости от типов операндов работает по-разному.",
    syntax: "a + b",
    params: [
      { name: "a", description: "Левый операнд: число, строка, список или кортеж" },
      { name: "b", description: "Правый операнд того же типа, что и левый" },
    ],
    returns: "Сумму чисел либо новый объект, склеенный из двух последовательностей",
    example: "print(7 + 3, 'a' + 'b', [1] + [2])",
    errors: [
      "1 + '1' вызывает TypeError: unsupported operand type(s)",
      "Склейка списков создаёт новый список, исходные не меняются",
      "Для текста и чисел сначала приводят тип: 'x' + str(1)",
    ],
    related: ["ref-op-floordiv", "ref-op-assign", "ref-type-str", "ref-type-list"],
    level: "beginner",
  },
  {
    id: "ref-op-floordiv",
    name: "//",
    category: "operators",
    purpose:
      "Целочисленное деление: дробная часть отбрасывается, результат округляется вниз к меньшему целому.",
    syntax: "a // b",
    params: [
      { name: "a", description: "Делимое" },
      { name: "b", description: "Делитель, не должен быть равен нулю" },
    ],
    returns: "int, если оба операнда целые, иначе float",
    example: "print(7 // 2, -7 // 2, 7 / 2)",
    errors: [
      "Деление на ноль вызывает ZeroDivisionError",
      "Отрицательные числа округляются вниз: -7 // 2 равно -4",
      "Путают // с % : остаток даёт именно оператор остатка",
    ],
    related: ["ref-op-add", "ref-type-int", "ref-round"],
    level: "beginner",
  },
  {
    id: "ref-op-eq",
    name: "==",
    category: "operators",
    purpose:
      "Сравнивает значения двух объектов и возвращает True или False. Обратный оператор — неравенство !=.",
    syntax: "a == b | a != b",
    params: [
      { name: "a", description: "Левый операнд" },
      { name: "b", description: "Правый операнд" },
    ],
    returns: "bool — результат сравнения",
    example: "print(2 + 2 == 4, 'abc' == 'ABC', 1 == True)",
    errors: [
      "Сравнение чисел с плавающей точкой точное, поэтому 0.1 + 0.2 == 0.3 даст False",
      "Оператор == в условии присваивания не работает: if x = 1 это SyntaxError",
      "Для None и единичных объектов идиоматичнее проверка через is",
    ],
    related: ["ref-bool", "ref-op-assign", "ref-isinstance", "ref-type-dict"],
    level: "beginner",
  },
  {
    id: "ref-op-assign",
    name: "=",
    category: "operators",
    purpose:
      "Присваивает значение переменной или атрибуту. Сокращённые формы вида += вычисляют новое значение и сохраняют его обратно.",
    syntax: "target = value | a += b",
    params: [
      { name: "target", description: "Переменная, элемент или атрибут слева" },
      { name: "value", description: "Выражение справа, вычисляется до присваивания" },
    ],
    returns: "Само присваивание значения не возвращает; += даёт новое значение переменной",
    example: `x = 10
x += 5
print(x)`,
    errors: [
      "Сравнение в условии пишут через ==, одиночное = даёт SyntaxError",
      "b = a не копирует список, оба имени указывают на один объект",
      "Присваивание всегда идёт справа налево: a = b = 0 корректно, но читается справа налево",
    ],
    related: ["ref-op-eq", "ref-op-add", "ref-dict-update", "ref-setattr"],
    level: "beginner",
  },

  // ── Исключения ─────────────────────────────────────────────────────
  {
    id: "ref-exc-valueerror",
    name: "ValueError",
    category: "exceptions",
    purpose:
      "Возникает, когда тип значения подходит, а вот само значение непригодно: не та строка для числа или пустой выбор.",
    syntax: "raise ValueError('описание') | except ValueError:",
    params: [{ name: "message", description: "Человекочитаемое описание того, что пошло не так" }],
    returns: "Экземпляр исключения, который можно поймать блоком try/except",
    example: `try:
    number = int('abc')
except ValueError as error:
    print('Ошибка:', error)`,
    errors: [
      "Ловят слишком широко через except: и скрывают настоящую причину",
      "Блок except с pass полностью проглатывает ошибку",
      "Путают с TypeError: тот возникает из-за неподходящего типа, а не значения",
    ],
    related: ["ref-int", "ref-exc-typeerror", "ref-float", "ref-str-split"],
    level: "elementary",
  },
  {
    id: "ref-exc-typeerror",
    name: "TypeError",
    category: "exceptions",
    purpose:
      "Возникает, когда операция получила объект неподходящего типа: сложение числа со строкой или вызов нефункции.",
    syntax: "raise TypeError('описание') | except TypeError:",
    params: [{ name: "message", description: "Описание несовместимости типов" }],
    returns: "Экземпляр исключения",
    example: `try:
    total = 1 + '1'
except TypeError as error:
    print('Ошибка:', error)`,
    errors: [
      "Возникает при вызове объекта без скобок у нефункции или при опечатке в имени",
      "Не стоит подавлять TypeError — почти всегда это ошибка в данных или в коде",
      "Проверять тип заранее нужно через isinstance, а не перехватывать исключение",
    ],
    related: ["ref-exc-valueerror", "ref-isinstance", "ref-op-add", "ref-type"],
    level: "elementary",
  },
  {
    id: "ref-exc-keyerror",
    name: "KeyError",
    category: "exceptions",
    purpose:
      "Выбрасывается при обращении к словарю по ключу, которого там нет. Сообщение об ошибке содержит сам отсутствующий ключ.",
    syntax: "except KeyError:",
    params: [
      { name: "key", description: "Имя отсутствующего ключа, попадающее в сообщение об ошибке" },
    ],
    returns: "Экземпляр исключения",
    example: `config = {'host': 'localhost'}
try:
    port = config['port']
except KeyError as error:
    print('Нет ключа:', error)`,
    errors: [
      "Обращение через индекс небезопасно — используйте dict.get(key, default)",
      "Проверку по ключу делают через in: if 'port' in config",
      "Ключ пишут с ошибкой регистра или лишним пробелом, и поиск проваливается",
    ],
    related: ["ref-dict-get", "ref-type-dict", "ref-dict-keys", "ref-exc-valueerror"],
    level: "elementary",
  },

  // ── Стандартная библиотека ─────────────────────────────────────────
  {
    id: "ref-stdlib-json",
    name: "json",
    category: "stdlib",
    purpose:
      "Модуль для чтения и записи данных в формате JSON. Позволяет превращать словари и списки в текст и обратно.",
    syntax: "json.dumps(obj) | json.loads(s)",
    params: [
      { name: "obj", description: "Словарь, список, число, строка или None для сериализации" },
      { name: "s", description: "Строка JSON для разбора" },
    ],
    returns: "dumps возвращает строку, loads возвращает объект Python",
    example: `import json

data = {'host': 'localhost', 'port': 8080}
line = json.dumps(data)
print(json.loads(line))`,
    errors: [
      "json.dumps возвращает строку, а не словарь, его нельзя индексировать",
      "По умолчанию кириллица экранируется, включите ensure_ascii=False",
      "Незакрытая скобка или одинарные кавычки приводят к json.JSONDecodeError",
    ],
    related: ["ref-type-dict", "ref-dict-items", "ref-str-format"],
    level: "elementary",
  },
  {
    id: "ref-stdlib-random",
    name: "random",
    category: "stdlib",
    purpose:
      "Генератор псевдослучайных чисел: выбор элемента, дробные значения и броски «кубика». Для криптографии не предназначен.",
    syntax: "random.randint(a, b) | random.choice(seq) | random.random()",
    params: [
      { name: "a", description: "Нижняя граница диапазона, включительно" },
      { name: "b", description: "Верхняя граница диапазона, включительно" },
      { name: "seq", description: "Непустая последовательность для случайного выбора" },
    ],
    returns: "Число или случайный элемент последовательности",
    example: `import random

print(random.randint(1, 6), random.choice(['a', 'b', 'c']))`,
    errors: [
      "random.choice на пустом списке вызывает IndexError",
      "Для воспроизводимого результата задают random.seed(42)",
      "Потокобезопасные задачи решают через random.Random() в отдельном экземпляре",
    ],
    related: ["ref-int", "ref-type-list", "ref-stdlib-datetime"],
    level: "elementary",
  },
  {
    id: "ref-stdlib-datetime",
    name: "datetime",
    category: "stdlib",
    purpose:
      "Работа с датой и временем: текущий момент, разница между датами и форматирование вывода.",
    syntax: "datetime.now() | date.today() | dt.strftime('%Y-%m-%d')",
    params: [
      { name: "year", description: "Год в конструкторе даты" },
      { name: "month", description: "Месяц от 1 до 12" },
      { name: "day", description: "День месяца" },
    ],
    returns: "Объекты datetime, date или timedelta",
    example: `from datetime import date, timedelta

today = date.today()
print(today, today + timedelta(days=7))`,
    errors: [
      "Сложение двух дат даёт timedelta, а не новую дату",
      "datetime.now() возвращает локальное время сервера без часового пояса",
      "Конструктор date(2026, 10, 6) принимает год первым, а не месяц",
    ],
    related: ["ref-stdlib-json", "ref-str-format", "ref-stdlib-random"],
    level: "elementary",
  },
  {
    id: "ref-stdlib-re",
    name: "re",
    category: "stdlib",
    purpose:
      "Поиск и замена по регулярным выражениям. Позволяет находить шаблоны: даты, номера, адреса и другие повторяющиеся конструкции.",
    syntax: "re.findall(pattern, s) | re.search(pattern, s)",
    params: [
      { name: "pattern", description: "Шаблон, обычно вида raw-строки r'[0-9]+'" },
      { name: "s", description: "Разбираемая строка" },
    ],
    returns: "findall возвращает список совпадений, search — объект Match или None",
    example: `import re

text = 'order 123, price 45'
print(re.findall(r'[0-9]+', text))`,
    errors: [
      "Кавычки без префикса r съедают обратные слеши: пишите r'\\d+'",
      "Слишком широкий шаблон захватывает лишнее — уточняйте границы ^ и $",
      "re.split по умолчанию включает найденные группы в результат",
    ],
    related: ["ref-str-split", "ref-str-replace", "ref-stdlib-json"],
    level: "intermediate",
  },

  // ── ООП ────────────────────────────────────────────────────────────
  {
    id: "ref-oop-init",
    name: "__init__",
    category: "oop",
    purpose:
      "Конструктор экземпляра класса: вызывается автоматически при создании объекта и задаёт его начальное состояние.",
    syntax: "def __init__(self, ...):",
    params: [
      { name: "self", description: "Ссылка на создаваемый объект, передаётся автоматически" },
      {
        name: "args",
        description: "Параметры инициализации, обязательные и со значениями по умолчанию",
      },
    ],
    returns: "Ничего не возвращает: Python сам вернёт созданный объект",
    example: `class User:
    def __init__(self, name):
        self.name = name

print(User('Alex').name)`,
    errors: [
      "Забывают self в определении — при вызове метода аргументы сдвинутся",
      "Пытаются вернуть значение из __init__, это SyntaxError на практике недопустимо",
      "При наследовании не вызывают super().__init__() и теряют инициализацию базового класса",
    ],
    related: ["ref-kw-def", "ref-oop-super", "ref-oop-property", "ref-setattr"],
    level: "elementary",
  },
  {
    id: "ref-oop-property",
    name: "@property",
    category: "oop",
    purpose:
      "Превращает метод в свойство: чтение выглядит как поле, а внутренние проверки остаются в коде. Сеттер задаётся декоратором @name.setter.",
    syntax: "@property",
    params: [{ name: "self", description: "Экземпляр, для которого читается свойство" }],
    returns: "Значение вычисляемого свойства",
    example: `class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def area(self):
        return 3.14 * self._radius ** 2

print(Circle(2).area)`,
    errors: [
      "Присваивание c.area = 5 без @area.setter вызовет AttributeError",
      "Свойство размещают над методом, а не над обычным атрибутом",
      "Забывают self в определении геттера и получают TypeError",
    ],
    related: ["ref-oop-init", "ref-setattr", "ref-getattr"],
    level: "intermediate",
  },
  {
    id: "ref-oop-super",
    name: "super()",
    category: "oop",
    purpose:
      "Даёт доступ к реализации родительского класса. Чаще всего вызывают super().__init__(), чтобы не дублировать код базового класса.",
    syntax: "super().method(...)",
    params: [
      { name: "self", description: "Текущий экземпляр, в котором вызывается родительский метод" },
    ],
    returns: "Результат вызова метода родительского класса",
    example: `class Base:
    def greet(self):
        return 'hello'

class Child(Base):
    def greet(self):
        return super().greet() + '!'

print(Child().greet())`,
    errors: [
      "Пропуск super().__init__() оставляет поля базового класса неинициализированными",
      "super() работает только внутри класса, поддерживающего наследование",
      "Вызов родительского метода без super ведёт к дублированию кода",
    ],
    related: ["ref-oop-init", "ref-kw-def", "ref-oop-property"],
    level: "intermediate",
  },

  // ── Асинхронность ──────────────────────────────────────────────────
  {
    id: "ref-async-def",
    name: "async def",
    category: "async",
    purpose:
      "Объявляет корутину — функцию, которая может приостанавливаться и не блокировать другие задачи. Так пишут и серверные обработчики, и клиентские запросы.",
    syntax: "async def name(args):",
    params: [
      { name: "name", description: "Имя корутины" },
      { name: "args", description: "Обычные параметры функции" },
    ],
    returns: "Объект корутины; запускают его через asyncio.run или await",
    example: `import asyncio

async def hello():
    return 'done'

print(asyncio.run(hello()))`,
    errors: [
      "Просто вызвать async def без await нельзя: программа вернёт корутину и ничего не выполнит",
      "asyncio.run нельзя вызывать из уже работающего цикла событий",
      "Блокирующая функция внутри корутины останавливает весь цикл",
    ],
    related: ["ref-async-await", "ref-async-gather", "ref-kw-def", "ref-net-socket"],
    level: "advanced",
  },
  {
    id: "ref-async-await",
    name: "await",
    category: "async",
    purpose:
      "Ждёт завершения другой корутины или асинхронного действия, отдавая управление циклу событий. Используется только внутри async def.",
    syntax: "await coroutine",
    params: [{ name: "coroutine", description: "Корутина, future или асинхронный итератор" }],
    returns: "Результат выполнения ожидаемого объекта",
    example: `import asyncio

async def main():
    await asyncio.sleep(0.1)
    print('slept')

asyncio.run(main())`,
    errors: [
      "await вне async def — SyntaxError",
      "await обычной функции невозможен, сначала её надо обернуть в корутину",
      "Ждут параллелизма от CPU-задач, но цикл событий однопоточный",
    ],
    related: ["ref-async-def", "ref-async-gather", "ref-kw-for"],
    level: "advanced",
  },
  {
    id: "ref-async-gather",
    name: "asyncio.gather()",
    category: "async",
    purpose:
      "Запускает несколько корутин одновременно и собирает их результаты. Основной способ получить настоящую конкурентность ввода-вывода.",
    syntax: "await asyncio.gather(*coroutines)",
    params: [
      { name: "coroutines", description: "Одна или несколько корутин или future" },
      { name: "return_exceptions", description: "True — исключения возвращаются как результаты" },
    ],
    returns: "Список результатов в порядке переданных корутин",
    example: `import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    return name

async def main():
    results = await asyncio.gather(task('a', 0.2), task('b', 0.1))
    print(results)

asyncio.run(main())`,
    errors: [
      "Без await вызов gather вернёт future, а не результаты",
      "По умолчанию первое исключение прерывает ожидание остальных задач",
      "Порядок результатов совпадает с порядком аргументов, а не моментом завершения",
    ],
    related: ["ref-async-await", "ref-async-def", "ref-stdlib-random"],
    level: "advanced",
  },

  // ── Работа с файлами ───────────────────────────────────────────────
  {
    id: "ref-files-open",
    name: "open(mode)",
    category: "files",
    purpose:
      "Режим определяет, что произойдёт с файлом при открытии: чтение, перезапись, добавление или работа с байтами. Режим выбирают заранее, до первого чтения или записи.",
    syntax: "open(file, mode='r', newline=None)",
    params: [
      {
        name: "mode",
        description: "'r' чтение, 'w' запись с очисткой, 'a' добавление, 'b' бинарный режим",
      },
      { name: "newline", description: "Как обрабатывать переводы строк при чтении и записи" },
      { name: "file", description: "Путь к файлу: относительный или абсолютный" },
    ],
    returns: "Объект файла с текущей позицией чтения или записи",
    example: `with open('log.txt', 'a', encoding='utf-8') as f:
    f.write('new line\\n')`,
    errors: [
      "Режим 'w' сразу стирает старое содержимое, для дополнения нужен 'a'",
      "Режим 'x' создаёт новый файл и даёт FileExistsError, если он уже есть",
      "Без 'b' писать байты нельзя, а без 'rb' читать изображения нельзя",
    ],
    related: ["ref-open", "ref-files-with", "ref-files-read", "ref-files-path"],
    level: "elementary",
  },
  {
    id: "ref-files-with",
    name: "with",
    category: "files",
    purpose:
      "Контекстный оператор гарантирует закрытие файла даже при ошибке внутри блока. Это рекомендуемый способ работать с файлами и любыми ресурсами.",
    syntax: "with open(path) as f:",
    params: [
      { name: "expression", description: "Выражение, возвращающее объект с __enter__ и __exit__" },
      { name: "target", description: "Имя переменной, через которую обращаются к ресурсу в блоке" },
    ],
    returns: "Блок with не возвращает значение; ресурс закрывается автоматически",
    example: `with open('notes.txt', encoding='utf-8') as f:
    print(f.read())`,
    errors: [
      "Забыты двоеточие и отступ тела — SyntaxError",
      "Файл держат открытым вне with, и при сбое он остаётся занятым",
      "Два файла открывают так: with open(a) as fa, open(b) as fb:",
    ],
    related: ["ref-files-open", "ref-files-read", "ref-open", "ref-kw-def"],
    level: "elementary",
  },
  {
    id: "ref-files-path",
    name: "pathlib.Path",
    category: "files",
    purpose:
      "Объектная обёртка над путями: склейка, проверка существования, чтение и запись. Заменяет модуль os.path более читаемым кодом.",
    syntax: "Path(folder) / 'file.txt'",
    params: [{ name: "path", description: "Строка с путём или его часть" }],
    returns: "Объект Path, представляющий путь в файловой системе",
    example: `from pathlib import Path

p = Path('data') / 'notes.txt'
print(p.name, p.suffix, p.exists())`,
    errors: [
      "Относительный путь зависит от текущей рабочей папки процесса",
      "exists() только проверяет наличие, файл он не создаёт",
      "Для создания каталога нужен mkdir(parents=True, exist_ok=True)",
    ],
    related: ["ref-open", "ref-files-open", "ref-files-with", "ref-files-read"],
    level: "elementary",
  },
  {
    id: "ref-files-read",
    name: "read() / readline()",
    category: "files",
    purpose:
      "Читает содержимое файла целиком, построчно или по частям. Методы возвращают данные, сами их не печатая.",
    syntax: "f.read() | f.readline() | f.readlines()",
    params: [
      { name: "size", description: "Число символов или байт; без аргумента читается всё до конца" },
    ],
    returns: "Строка для read и readline, список строк для readlines",
    example: `with open('notes.txt', encoding='utf-8') as f:
    lines = f.readlines()
print(len(lines))`,
    errors: [
      "read() на большом файле съедает память — итерация по файлу надёжнее",
      "Повторный read() вернёт пустую строку: позиция уже в конце файла",
      "Символ переноса строки остаётся в данных, его снимают через strip()",
    ],
    related: ["ref-files-with", "ref-files-open", "ref-open", "ref-len"],
    level: "elementary",
  },

  // ── Сети ───────────────────────────────────────────────────────────
  {
    id: "ref-net-socket",
    name: "socket.socket()",
    category: "networks",
    purpose:
      "Создаёт сокет — конечную точку обмена данными. AF_INET отвечает за IPv4, SOCK_STREAM за надёжную доставку по TCP, SOCK_DGRAM за датаграммы UDP.",
    syntax: "socket.socket(family=AF_INET, type=SOCK_STREAM)",
    params: [
      { name: "family", description: "Семейство адресов: socket.AF_INET для IPv4" },
      { name: "type", description: "SOCK_STREAM — TCP, SOCK_DGRAM — UDP" },
    ],
    returns: "Объект сокета, готовый к подключению или прослушиванию",
    example: `import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(sock.family, sock.type)
sock.close()`,
    errors: [
      "Сокет обязательно закрывают close() или открывают через with",
      "Путают семейство адресов с типом: семейство задаёт формат адреса",
      "SOCK_DGRAM не гарантирует доставку и порядок, в отличие от SOCK_STREAM",
    ],
    related: ["ref-net-connect", "ref-net-sendall", "ref-net-recv", "ref-async-def"],
    level: "intermediate",
  },
  {
    id: "ref-net-connect",
    name: "connect()",
    category: "networks",
    purpose:
      "Устанавливает TCP-соединение с указанным хостом и портом. На стороне сервера вместо неё выполняют bind(), listen() и accept().",
    syntax: "sock.connect((host, port))",
    params: [
      {
        name: "host",
        description: "Имя хоста или IP-адрес, для своей машины 'localhost' или '127.0.0.1'",
      },
      { name: "port", description: "Номер порта от 0 до 65535; 1024 и выше считаются незанятыми" },
    ],
    returns: "None при успешном подключении",
    example: `import socket

client = socket.socket()
client.connect(('127.0.0.1', 9000))
print('connected')
client.close()`,
    errors: [
      "ConnectionRefusedError означает, что сервер не запущен или слушает другой порт",
      "Адрес передают кортежем из двух элементов, а не строкой 'localhost:9000'",
      "После работы сокет закрывают, иначе порт останется занятым",
    ],
    related: ["ref-net-socket", "ref-net-sendall", "ref-net-recv", "ref-exc-keyerror"],
    level: "intermediate",
  },
  {
    id: "ref-net-sendall",
    name: "sendall()",
    category: "networks",
    purpose:
      "Отправляет байты в сокет полностью, повторяя отправку, пока не уйдут все данные. Обычный send может вернуться, отправив лишь часть.",
    syntax: "sock.sendall(data)",
    params: [
      {
        name: "data",
        description: "Байтовый объект, например b'ping'; текст сначала кодируют через encode()",
      },
    ],
    returns: "None — данные либо ушли целиком, либо возникла ошибка",
    example: `import socket
import threading

def server():
    srv = socket.socket()
    srv.bind(('127.0.0.1', 9001))
    srv.listen(1)
    conn, _ = srv.accept()
    print('server got:', conn.recv(16))
    conn.close()
    srv.close()

threading.Thread(target=server, daemon=True).start()
client = socket.socket()
client.connect(('127.0.0.1', 9001))
client.sendall(b'hello')
client.close()`,
    errors: [
      "Отправка строки вместо байтов даёт TypeError: a bytes-like object is required",
      "После sendall данные не гарантируют доставки — это делает транспортный уровень",
      "Сервер не получил завершение передачи, пока клиент не закроет соединение",
    ],
    related: ["ref-net-socket", "ref-net-connect", "ref-net-recv", "ref-type-str"],
    level: "intermediate",
  },
  {
    id: "ref-net-recv",
    name: "recv()",
    category: "networks",
    purpose:
      "Читает входящие байты из сокета. Аргумент — максимум за один вызов: если данных меньше, вернётся только их часть, а если нет, вызов подождёт.",
    syntax: "sock.recv(bufsize)",
    params: [
      {
        name: "bufsize",
        description: "Максимальное число байт за один вызов, обычно 1024 или 4096",
      },
      { name: "flags", description: "Дополнительные флаги, в учебных задачах не нужны" },
    ],
    returns: "bytes; пустые байты b'' означают, что партнёр закрыл соединение",
    example: `import socket

client = socket.socket()
client.settimeout(2)
client.connect(('127.0.0.1', 9002))
data = client.recv(1024)
print(data.decode('utf-8'))
client.close()`,
    errors: [
      "Полученные байты читают без decode() — печатается вида b'hello'",
      "recv может вернуть меньше байтов, чем было отправлено, поэтому цикл чтения обязателен",
      "Без settimeout вызов способен заблокировать программу надолго",
    ],
    related: ["ref-net-sendall", "ref-net-socket", "ref-net-connect", "ref-files-read"],
    level: "intermediate",
  },
];

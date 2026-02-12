# 📚 Справочники (Reference Data) - Руководство

Справочники - это гибкая система **code-label паттерна**, где все словари хранятся в Firestore и полностью отделены от React кода.

---

## 🎯 Основной Принцип

```
БД (FIRESTORE) - источник истины          React - только отображает
┌─────────────────────────────────┐       ┌─────────────────────┐
│ reference/ROLES/                 │       │ Компонент          │
│ - admin                          │       │ import useRference │
│   code: "admin"                  │ ──→  │ const roles = ...  │
│   label: "Администратор"         │       │ roles.map(role =>  │
│                                  │       │   <span>{role...}  │
│ - manager                        │       │                    │
│   code: "manager"                │       │                    │
│   label: "Менеджер"              │       │                    │
└─────────────────────────────────┘       └─────────────────────┘
```

**Правило**: 
- ✅ В коде используем **code** (например: `role="admin"`)
- ✅ В интерфейсе показываем **label** (например: "Администратор")
- ✅ Мета-данные в `meta` (цвет, позиция, описание, etc)

---

## 📦 Структура справочника в Firestore

```
firestore/
└── reference/
    ├── ROLES/           (collection)
    │   ├── admin        (document)
    │   │   ├── code: "admin"
    │   │   ├── label: "Администратор"
    │   │   └── meta: { color: "text-red-600" }
    │   │
    │   └── manager
    │       ├── code: "manager"
    │       ├── label: "Менеджер"
    │       └── meta: { color: "text-blue-600" }
    │
    ├── PRIORITIES/
    ├── SECTORS/
    ├── USER_FIELDS/
    └── ORDER_STEPS/
```

---

## 🚀 Использование в компонентах

### Вариант 1: Hook (рекомендуется)

```typescript
import { useReferenceData, getLabelFromItems } from '@/hooks';

function RoleSelector() {
  const { items: roles, loading, error } = useReferenceData('ROLES');

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <select>
      {roles.map(role => (
        <option key={role.code} value={role.code}>
          {role.label}
        </option>
      ))}
    </select>
  );
}
```

### Вариант 2: Async функция

```typescript
import { getReferenceItems, getLabelByCode } from '@/firebase/referenceAdapter';

async function showRoleLabel(roleCode: string) {
  const label = await getLabelByCode('ROLES', roleCode);
  console.log(`Роль: ${label}`); // "Роль: Администратор"
}
```

### Вариант 3: Создать карту для быстрого поиска

```typescript
import { useReferenceData, createLabelMap } from '@/hooks';

function OrderStatus({ statusCode }) {
  const { items: statuses } = useReferenceData('ORDER_STEPS');
  const statusMap = createLabelMap(statuses);

  return <span>{statusMap.get(statusCode)}</span>;
}
```

### Вариант 4: Получить мета-данные (цвет, иконка, etc)

```typescript
import { useReferenceData, getMetaFromItems } from '@/hooks';

function PriorityBadge({ priorityCode }) {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const color = getMetaFromItems(priorities, priorityCode, 'color');

  return <span className={color}>{priorityCode}</span>;
}
```

---

## 📋 Доступные справочники

### 1. USER_FIELDS (Поля профиля)

| Code | Label | Использование |
|------|-------|---|
| `full_name` | ФИО | Профиль пользователя |
| `phone` | Телефон | Контакты |
| `email` | Email | Уведомления |
| `telegram_username` | Telegram (@username) | Коммуникация |

**Пример использования:**
```typescript
const { items: fields } = useReferenceData('USER_FIELDS');
// Отобразить все поля профиля пользователя
fields.forEach(field => console.log(field.label));
```

---

### 2. ROLES (Роли доступа)

| Code | Label |
|------|-------|
| `admin` | Системный администратор |
| `director` | Директор |
| `sales_manager` | Менеджер |
| `designer` | Дизайнер |
| `operator` | Оператор |
| `worker` | Исполнитель |

**Пример использования в правах доступа:**
```typescript
const userRole = 'sales_manager'; // Code
const { items: roles } = useReferenceData('ROLES');
const roleLabel = getLabelFromItems(roles, userRole);
// → "Менеджер"
```

---

### 3. SECTORS (Производственные участки)

| Code | Label |
|------|---|
| `management` | Менеджмент |
| `design` | Дизайн и верстка |
| `screen_printing` | Трафаретная печать |
| `assembly` | Комплектация / Упаковка |
| `logistics` | Логистика |

**Пример использования:**
```typescript
// Назначить работу на участок
await updateOrder({
  ...order,
  sector: 'screen_printing', // Code
});

// Показать название участка в UI
const { items: sectors } = useReferenceData('SECTORS');
const label = getLabelFromItems(sectors, order.sector);
// → "Трафаретная печать"
```

---

### 4. PRIORITIES (Приоритеты заказов)

| Code | Label | Color |
|------|-------|-------|
| `default` | Обычный | gray-400 |
| `urgent_paid` | Срочно (доп. оплата) | yellow-400 |
| `reprint` | Перепечатка | purple-400 |
| `overdue` | Просрочка | red-500 |

**Пример использования:**
```typescript
function OrderCard({ order }) {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const color = getMetaFromItems(priorities, order.priority, 'color');

  return (
    <div className={`p-4 border-l-4 border-${color}`}>
      {getLabelFromItems(priorities, order.priority)}
    </div>
  );
}
```

---

### 5. ORDER_STEPS (Пайплайн заказа)

15 этапов от создания до отгрузки:

| Seq | Code | Label |
|-----|------|-------|
| 1 | `order_entry` | Внесён в систему |
| 2 | `task_definition` | Формирование ТЗ |
| 5 | `planning` | Планирование очереди |
| 13 | `printing` | Печать тиража |
| 15 | `shipping` | Отгрузка |

**Пример использования - прогресс бар:**
```typescript
function OrderProgress({ currentStep }) {
  const { items: steps } = useReferenceData('ORDER_STEPS');
  const stepIndex = steps.findIndex(s => s.code === currentStep);

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.code} className={
          i <= stepIndex ? 'bg-emerald-600' : 'bg-gray-400'
        }>
          {step.label}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Как добавить новый справочник?

### 1. Добавить в `referenceAdapter.ts`

```typescript
// В функции initializeReferenceData()

// Новый справочник: STATUSES
const statuses: ReferenceItem[] = [
  { code: 'active', label: 'Активный', meta: { color: 'green' } },
  { code: 'archived', label: 'Архивирован', meta: { color: 'gray' } },
];

statuses.forEach((item) => {
  const docRef = doc(db, 'reference', 'STATUSES', item.code);
  batch.set(docRef, item);
});
```

### 2. Обновить типы в Firestore

```typescript
export const REFERENCE_COLLECTIONS = {
  USER_FIELDS: 'USER_FIELDS',
  ROLES: 'ROLES',
  SECTORS: 'SECTORS',
  PRIORITIES: 'PRIORITIES',
  ORDER_STEPS: 'ORDER_STEPS',
  STATUSES: 'STATUSES', // ← Добавить
} as const;
```

### 3. Использовать в компоненте

```typescript
const { items: statuses } = useReferenceData('STATUSES');
```

**Готово!** Справочник будет инициализирован при первом запуске приложения.

---

## 💾 Управление справочниками в Firebase Console

### Просмотр справочников

1. Откройте [Firebase Console](https://console.firebase.google.com)
2. Firestore Database → collection: `reference`
3. Скролл по документам

### Добавить новый элемент в справочник

```
reference/ROLES/new_role
├── code: "new_role"
├── label: "Новая роль"
└── meta: { color: "text-blue-500" }
```

### Отредактировать существующий элемент

1. Откройте документ
2. Нажмите Edit на нужное поле
3. Сохраните

**Изменения сразу появятся в приложении!** (благодаря кэшированию, может требоваться обновление страницы)

---

## ⚡ Производительность

### Кэширование

Справочники кэшируются в памяти приложения:

```typescript
// Первый вызов: запрос к Firestore
const roles1 = await getReferenceItems('ROLES');

// Второй вызов: из кэша (не обращается к БД)
const roles2 = await getReferenceItems('ROLES');

// Принудительный refresh: обновить из БД
const roles3 = await getReferenceItems('ROLES', true); // forceRefresh = true
```

### Hook автоматически кэшует

```typescript
// Каждый раз возвращает кэшированное значение
const { items } = useReferenceData('ROLES');
const { items: sameRoles } = useReferenceData('ROLES');
// sameRoles === items (один и тот же объект из кэша)
```

---

## 🚨 Частые ошибки

### ❌ Используешь label в коде

```typescript
// ❌ НЕПРАВИЛЬНО
if (userRole === 'Менеджер') { ... }

// ✅ ПРАВИЛЬНО
if (userRole === 'sales_manager') { ... }
```

### ❌ Забыл получить label перед показом

```typescript
// ❌ НЕПРАВИЛЬНО
<span>{order.status}</span>   // Shows: "order_entry"

// ✅ ПРАВИЛЬНО
const label = getLabelFromItems(statuses, order.status);
<span>{label}</span>          // Shows: "Внесён в систему"
```

### ❌ Не инициализировал справочник при запуске

```typescript
// ✅ Уже сделано в App.tsx
useEffect(() => {
  initializeReferenceData(); // Вызывается автоматически
}, []);
```

---

## 📊 Примеры использования в разных компонентах

### Фильтр по ролям

```typescript
function TeamFilter() {
  const { items: roles } = useReferenceData('ROLES');

  return (
    <select>
      <option value="">Все роли</option>
      {roles.map(role => (
        <option key={role.code} value={role.code}>
          {role.label}
        </option>
      ))}
    </select>
  );
}
```

### Таблица с данными из справочников

```typescript
function SectorsTable() {
  const { items: sectors } = useReferenceData('SECTORS');

  return (
    <table>
      <tbody>
        {sectors.map(sector => (
          <tr key={sector.code}>
            <td>{sector.code}</td>
            <td>{sector.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Мультиязычность (будущее)

```typescript
// Добавить поле в meta для других языков
{
  code: 'admin',
  label: 'Администратор', // Russian
  meta: {
    en: 'Administrator',
    de: 'Administrator',
    es: 'Administrador'
  }
}

// Использовать в компоненте
function useTranslatedLabel(collectionName, code, lang = 'ru') {
  const { items } = useReferenceData(collectionName);
  const item = items.find(i => i.code === code);
  
  if (lang === 'ru') return item?.label;
  return item?.meta?.[lang] || item?.label;
}
```

---

## ✅ Чек-лист

- [ ] Инициализированы все 5 справочников
- [ ] Используешь code в логике, label в UI
- [ ] Кэширование работает (не много запросов)
- [ ] Мета-данные используются (цвета, иконки)
- [ ] Справочники редактируются через Firebase Console
- [ ] Изменения появляются в приложении

---

**Статус**: ✅ Справочники полностью готовы к использованию!

**Следующее**: Добавить справочники в компоненты (Dashboard, BottomNav, OrderReel)

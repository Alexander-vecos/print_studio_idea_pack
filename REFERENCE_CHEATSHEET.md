# 🚀 Reference Data - Шпаргалка для разработчиков

Копируй-вставляй и готово!

---

## 📦 Импорты

```typescript
// Основное for React компоненты
import { useReferenceData, getLabelFromItems, getMetaFromItems, createLabelMap } from '@/hooks';

// Direct adapter (если нужен async)
import { getReferenceItems, getReferenceItem, getLabelByCode, initializeReferenceData } from '@/firebase';
```

---

## 🎯 Базовые паттерны

### Паттерн 1️⃣: Получить все элементы справочника

```typescript
const { items, loading, error } = useReferenceData('ROLES');

if (loading) return <span>Loading...</span>;
if (error) return <span>Error: {error.message}</span>;

return <div>{items.length} roles loaded</div>;
```

### Паттерн 2️⃣: Быстрый поиск label по code

```typescript
const { items: roles } = useReferenceData('ROLES');
const label = getLabelFromItems(roles, 'admin'); // "Администратор"
```

### Паттерн 3️⃣: Получить мета-данные

```typescript
const { items: priorities } = useReferenceData('PRIORITIES');
const color = getMetaFromItems(priorities, 'urgent_paid', 'color'); // "yellow-400"
const seq = getMetaFromItems(items, 'order_entry', 'seq'); // 1
```

### Паттерн 4️⃣: Создать Map для O(1) поиска

```typescript
const { items: roles } = useReferenceData('ROLES');
const roleMap = createLabelMap(roles); // Map<string, string>

// Везде потом просто
roleMap.get('admin') // "Администратор" (быстро!)
```

### Паттерн 5️⃣: Фильтр по справочнику

```typescript
const { items: sectors } = useReferenceData('SECTORS');

// Только warehouse sectors
const warehouses = items.filter(s => s.code.includes('warehouse'));

// Отобразить
warehouses.map(w => <option value={w.code}>{w.label}</option>)
```

---

## 🎨 UI Компоненты

### Select (Выпадающее меню)

```typescript
<select>
  <option value="">-- Select --</option>
  {items.map(item => (
    <option key={item.code} value={item.code}>
      {item.label}
    </option>
  ))}
</select>
```

### Radio Buttons

```typescript
{items.map(item => (
  <label key={item.code}>
    <input type="radio" name="priority" value={item.code} />
    {item.label}
  </label>
))}
```

### Checkboxes (Множественный выбор)

```typescript
{items.map(item => (
  <label key={item.code}>
    <input type="checkbox" value={item.code} />
    {item.label}
  </label>
))}
```

### Tabs

```typescript
{items.map(item => (
  <button
    key={item.code}
    onClick={() => setActive(item.code)}
    className={active === item.code ? 'active' : ''}
  >
    {item.label}
  </button>
))}
```

### Badge с цветом

```typescript
function PriorityBadge({ code }: { code: string }) {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const color = getMetaFromItems(priorities, code, 'color');
  const label = getLabelFromItems(priorities, code);

  return (
    <span className={`px-2 py-1 rounded ${color} text-white text-sm`}>
      {label}
    </span>
  );
}

// Использование
<PriorityBadge code="urgent_paid" />
```

### Таблица

```typescript
function RolesTable() {
  const { items: roles } = useReferenceData('ROLES');

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Code</th>
          <th className="border p-2 text-left">Label</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(role => (
          <tr key={role.code} className="hover:bg-gray-50">
            <td className="border p-2 font-mono text-sm">{role.code}</td>
            <td className="border p-2">{role.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Dropdown меню

```typescript
function SectorDropdown({ value, onChange }) {
  const { items: sectors } = useReferenceData('SECTORS');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        {items.find(s => s.code === value)?.label || 'Select...'}
      </button>
      {open && (
        <ul className="absolute mt-1 bg-white border">
          {sectors.map(sector => (
            <li key={sector.code}>
              <button
                onClick={() => {
                  onChange(sector.code);
                  setOpen(false);
                }}
              >
                {sector.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 📋 Справочники и их коды

### USER_FIELDS (7)
- `full_name`
- `phone`
- `email`
- `telegram_username`
- `telegram_id`
- `payout_card`
- `id`

### ROLES (14)
- `admin`, `director`, `owner`, `sales_manager`
- `designer`, `technologist`, `supervisor`, `logistician`
- `operator`, `worker`, `freelancer`, `trainee`
- `guest`, `client`

### SECTORS (15)
- `management`, `design`, `supervision`
- `warehouse_main`, `warehouse_wip`, `warehouse_consumables`
- `gallery_films`, `gallery_samples`, `gallery_paints`
- `screen_prep`, `screen_reclaiming`, `screen_exposure`
- `screen_printing`, `assembly`, `logistics`

### PRIORITIES (6)
- `default` (gray-400)
- `contract` (blue-400)
- `urgent_paid` (yellow-400)
- `reprint` (purple-400)
- `director_control` (fuchsia-500)
- `overdue` (red-500)

### ORDER_STEPS (15)
1. `order_entry` - Внесён в систему
2. `task_definition` - Формирование ТЗ
3. `specs_ready` - ТЗ готово
4. `production_launch` - Запуск производства
5. `planning` - Планирование очереди
6. `material_arrival` - Прибытие материалов
7. `film_check` - Проверка плёнок
8. `sample_check` - Проверка сэмпла
9. `paint_check` - Проверка красок
10. `screen_reclaiming` - Рекламирование комбинезонов
11. `screen_exposure` - Экспозиция сетки
12. `sample_approval` - Утверждение сэмпла
13. `printing` - Печать тиража
14. `assembly` - Комплектация/Упаковка
15. `shipping` - Отгрузка

---

## 🔄 Async операции (если нужен async)

```typescript
// Получить все справочники
const roles = await getReferenceItems('ROLES');

// Получить один элемент
const admin = await getReferenceItem('ROLES', 'admin');

// Получить только label
const label = await getLabelByCode('ROLES', 'admin'); // "Администратор"

// Принудительно обновить из БД (bypass кэш)
const freshRoles = await getReferenceItems('ROLES', true); // forceRefresh = true
```

---

## 💾 Использовать в forms

### Change handler

```typescript
function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
  const roleCode = e.target.value; // "admin" - code!
  setUser({ ...user, role: roleCode });
  // В БД сохраните code, НЕ label
}

// При отправке на сервер
await updateUser({
  ...user,
  role: 'sales_manager', // ← code
  // Не 'Менеджер' - это label!
});
```

### Отобразить сохранённое значение

```typescript
function UserForm({ user }) {
  const { items: roles } = useReferenceData('ROLES');
  
  return (
    <input
      value={user.role} // ← это code ("admin")
      onChange={handleRoleChange}
    />
  );
  
  // Но показываем label
  <span>{getLabelFromItems(roles, user.role)}</span> // "Администратор"
}
```

---

## 🎓 Полные примеры компонентов

### Компонент 1: Selector с Label

```typescript
import { useReferenceData, getLabelFromItems } from '@/hooks';

interface Props {
  value: string;
  onChange: (code: string) => void;
  collectionName: 'ROLES' | 'SECTORS' | 'PRIORITIES';
}

export function ReferenceSelect({ value, onChange, collectionName }: Props) {
  const { items, loading, error } = useReferenceData(collectionName as 'ROLES');

  if (loading) return <span className="text-gray-500">Loading...</span>;
  if (error) return <span className="text-red-500">Error</span>;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Select --</option>
      {items.map(item => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

// Использование
<ReferenceSelect 
  value={role}
  onChange={setRole}
  collectionName="ROLES"
/>
```

### Компонент 2: Display с Label

```typescript
import { useReferenceData, getLabelFromItems } from '@/hooks';

interface Props {
  code: string;
  collectionName: 'ROLES' | 'SECTORS' | 'PRIORITIES' | 'ORDER_STEPS';
}

export function ReferenceLabel({ code, collectionName }: Props) {
  const { items } = useReferenceData(collectionName as 'ROLES');
  const label = getLabelFromItems(items, code);

  return <span>{label || code}</span>;
}

// Использование
<ReferenceLabel code="admin" collectionName="ROLES" />
// → "Администратор"
```

### Компонент 3: Priority Badge с цветом

```typescript
import { useReferenceData, getMetaFromItems, getLabelFromItems } from '@/hooks';

interface Props {
  code: string;
  className?: string;
}

export function PriorityBadge({ code, className = '' }: Props) {
  const { items: priorities } = useReferenceData('PRIORITIES');
  const color = getMetaFromItems(priorities, code, 'color');
  const label = getLabelFromItems(priorities, code);

  return (
    <span className={`px-3 py-1 rounded font-semibold text-white ${color} ${className}`}>
      {label}
    </span>
  );
}

// Использование
<PriorityBadge code="urgent_paid" />
// → жёлтый badge "Срочно (доп. оплата)"
```

---

## 🔐 Типизация

```typescript
import { ReferenceItem } from '@/firebase/referenceAdapter';

// Type-safe использование
type ReferenceCollection = 'ROLES' | 'SECTORS' | 'PRIORITIES' | 'USER_FIELDS' | 'ORDER_STEPS';

interface User {
  role: string; // Используй 'admin', 'manager', etc - это code!
  sector: string;
}

// Когда получаешь из hook
const { items: roles }: { items: ReferenceItem[] } = useReferenceData('ROLES');
```

---

## 🚀 Tips & Tricks

### Tip 1: Memoize role map

```typescript
const { items: roles } = useReferenceData('ROLES');
const roleMap = useMemo(() => createLabelMap(roles), [roles]);

// Теперь roleMap не пересчитывается каждый render
```

### Tip 2: Combine несколько справочников

```typescript
const { items: roles } = useReferenceData('ROLES');
const { items: sectors } = useReferenceData('SECTORS');
const { items: priorities } = useReferenceData('PRIORITIES');

const allData = { roles, sectors, priorities };
```

### Tip 3: Find с fallback

```typescript
const { items: roles } = useReferenceData('ROLES');
const role = items.find(r => r.code === code) || items[0];
// Если code не найдён, используй первый
```

### Tip 4: Sort by meta.seq

```typescript
const { items: steps } = useReferenceData('ORDER_STEPS');
const sorted = [...items].sort((a, b) => 
  (a.meta?.seq || 0) - (b.meta?.seq || 0)
);
```

### Tip 5: Filter в UI

```typescript
const { items: sectors } = useReferenceData('SECTORS');
const warehouses = items.filter(s => s.code.startsWith('warehouse_'));

// Отобразить группированные
const management = items.filter(s => s.code === 'management');
const design = items.filter(s => s.code === 'design');
// etc
```

---

## ❌ Что НЕ делать

```typescript
// ❌ Не используй label в коде!
if (user.role === 'Администратор') { ... } // НЕПРАВИЛЬНО!

// ✅ Используй code
if (user.role === 'admin') { ... } // OK!

// ❌ Не сохраняй label в БД
await updateUser({ role: 'Менеджер' }); // НЕПРАВИЛЬНО!

// ✅ Сохраняй code
await updateUser({ role: 'sales_manager' }); // OK!

// ❌ Не hardcode справочники в коде
const ROLES = ['admin', 'manager', 'user']; // НЕПРАВИЛЬНО!

// ✅ Получи из hook
const { items: roles } = useReferenceData('ROLES'); // OK!
```

---

## 📱 На мобильных устройствах

```typescript
import { useReferenceData } from '@/hooks';

export function MobileRoleSelector() {
  const { items: roles, loading } = useReferenceData('ROLES');

  return (
    <div className="space-y-2">
      {roles.map(role => (
        <button
          key={role.code}
          onClick={() => selectRole(role.code)}
          className="w-full p-3 border rounded hover:bg-gray-100"
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 🎓 Общие паттерны

| Задача | Код |
|--------|-----|
| Получить все | `const { items } = useReferenceData('ROLES')` |
| Получить label | `getLabelFromItems(items, code)` |
| Получить мета | `getMetaFromItems(items, code, 'color')` |
| Быстрый поиск | `createLabelMap(items).get(code)` |
| Find | `items.find(i => i.code === code)` |
| Filter | `items.filter(i => i.code.includes('admin'))` |
| Map | `items.map(i => <option value={i.code}>{i.label}</option>)` |

---

**Всё готово! Копируй примеры и используй! 🚀**

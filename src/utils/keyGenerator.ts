/**
 * Генерирует уникальный ключ доступа формата: KEY-XXXX-XXXX-XXXX
 * Где X - случайная буква или цифра (исключая похожие: 0, O, l, 1, I)
 */
export function generateAccessKey(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Без 0, O, 1, I, L
  let key = 'KEY';

  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      key += '-';
    }
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
}

/**
 * Проверяет формат ключа
 */
export function isValidKeyFormat(key: string): boolean {
  return /^KEY-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key);
}

/**
 * Генерирует гостевой ключ (всегда одинаковый)
 */
export function getGuestKey(): string {
  return 'KEY-GUEST-0000-0000';
}

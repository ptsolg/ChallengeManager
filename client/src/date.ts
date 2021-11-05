
export function formatDate(s: string | null): string {
    if (s === null)
        return '-';
    const date = new Date(s);
    return date.toLocaleString('ru-RU');
}
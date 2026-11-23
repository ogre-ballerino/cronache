import { toRoman } from './format';

export function handoutMeta(data: { capitolo: number; fonte?: string }): string {
  return [`Capitolo ${toRoman(data.capitolo)}`, data.fonte].filter(Boolean).join(' · ');
}

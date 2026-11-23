import config from 'virtual:cronache/config';
import { toRoman } from './format';

export function handoutMeta(data: { capitolo: number; fonte?: string }): string {
  return [`${config.labels.session} ${toRoman(data.capitolo)}`, data.fonte].filter(Boolean).join(' · ');
}

import fs from 'node:fs';
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { sheetTemplate } from 'virtual:cronache/paths';
import { sheetSystem, sheetsByCharacter, type SheetEntry } from '../../lib/schede';

export async function getStaticPaths() {
  const paths = [];
  for (const [id, sheets] of await sheetsByCharacter()) {
    for (const sheet of sheets) paths.push({ params: { id, snapshot: sheet.slug }, props: { sheet } });
  }
  return paths;
}

export const GET: APIRoute = async ({ params, props }) => {
  const { sheet } = props as { sheet: SheetEntry };
  const character = await getEntry('personaggi', params.id!);
  const pdf = await sheetSystem()!.fill(fs.readFileSync(sheetTemplate), sheet.data, { nome: character?.data.titolo ?? params.id! });
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
};

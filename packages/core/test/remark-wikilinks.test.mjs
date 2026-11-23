import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import remarkWikilinks from '../lib/remark-wikilinks.mjs';
import { contentFixture, entry } from './fixture.mjs';

const dir = contentFixture({
  'png/ismark.md': entry({ titolo: 'Ismark Kolyanovich', ruolo: 'Fratello di Ireena', stato: 'morto' }),
  'luoghi/vallaki.md': entry({ titolo: 'Vallaki', tipo: 'Città' }),
  'personaggi/tariq.md': entry({ titolo: 'Tariq' }),
});
const transform = remarkWikilinks({ contentDir: dir });

const text = (value) => ({ type: 'text', value });
const paragraph = (value) => ({ type: 'paragraph', children: [text(value)] });
const heading = (value) => ({ type: 'heading', depth: 2, children: [text(value)] });

function run(children, file = path.join(dir, 'png', 'altro.md')) {
  const tree = { type: 'root', children };
  transform(tree, { path: file });
  return tree;
}

describe('remarkWikilinks', () => {
  it('turns a resolved link into a link node with the alias as label', () => {
    const [p] = run([paragraph('Con [[Ismark Kolyanovich|Ismark]] a [[vallaki]].')]).children;
    assert.deepEqual(
      p.children.map((n) => [n.type, n.url ?? n.value, n.children?.[0].value]),
      [
        ['text', 'Con ', undefined],
        ['link', '/png/ismark/', 'Ismark'],
        ['text', ' a ', undefined],
        ['link', '/luoghi/vallaki/', 'Vallaki'],
        ['text', '.', undefined],
      ]
    );
  });

  it('renders an unresolved link as escaped broken text and warns', (t) => {
    const warn = t.mock.method(console, 'warn', () => {});
    const [p] = run([paragraph('[[<Nessuno>]]')]).children;
    assert.equal(p.children[0].type, 'html');
    assert.match(p.children[0].value, /class="wikilink-broken"/);
    assert.match(p.children[0].value, /&lt;Nessuno&gt;/);
    assert.equal(warn.mock.callCount(), 1);
  });

  it('adds margin notes to sessions only, once per entity, without characters', () => {
    const session = path.join(dir, 'sessions', 'sessione-01.md');
    const tree = run(
      [
        heading('Arrivo'),
        paragraph('[[Tariq]] incontra [[Ismark Kolyanovich]] a [[Vallaki]].'),
        heading('Partenza'),
        paragraph('Ancora [[Vallaki]].'),
      ],
      session
    );
    const notes = tree.children.filter((n) => n.type === 'html');
    assert.equal(notes.length, 1);
    assert.equal(tree.children.indexOf(notes[0]), 1);
    assert.match(notes[0].value, /Fratello di Ireena/);
    assert.match(notes[0].value, /marginalia-dagger/);
    assert.match(notes[0].value, /Città/);
    assert.doesNotMatch(notes[0].value, /Tariq/);

    const other = run([heading('Arrivo'), paragraph('[[Vallaki]]')]);
    assert.equal(other.children.filter((n) => n.type === 'html').length, 0);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  WIKILINK_RE,
  curlyQuotes,
  findUnresolvedLinks,
  frontmatterField,
  getSlugMap,
  markdownBody,
  normalize,
} from '../lib/wikilinks.mjs';
import { contentFixture, entry } from './fixture.mjs';

describe('normalize', () => {
  it('ignores case, accents, apostrophes and extra spaces', () => {
    assert.equal(normalize('  Città   dell’Ombra '), normalize("citta dell'ombra"));
    assert.equal(normalize('Hans Träumer'), 'hans traumer');
  });
});

describe('curlyQuotes', () => {
  it('curls straight double quotes', () => {
    assert.equal(curlyQuotes('il "Barone"'), 'il “Barone”');
  });
});

describe('WIKILINK_RE', () => {
  it('captures target and alias', () => {
    const [[, target, alias], [, plain, none]] = [...'[[Ireena Kolyana|Ireena]] e [[Vallaki]]'.matchAll(WIKILINK_RE)];
    assert.deepEqual([target, alias, plain, none], ['Ireena Kolyana', 'Ireena', 'Vallaki', undefined]);
  });
});

describe('frontmatterField', () => {
  it('reads plain and quoted values', () => {
    const raw = entry({ titolo: '"L\'Equilibrio"', ruolo: 'Borgomastro' });
    assert.equal(frontmatterField(raw, 'titolo'), "L'Equilibrio");
    assert.equal(frontmatterField(raw, 'ruolo'), 'Borgomastro');
    assert.equal(frontmatterField(raw, 'stato'), undefined);
  });
});

describe('markdownBody', () => {
  it('drops the frontmatter', () => {
    assert.equal(markdownBody(entry({ titolo: 'X' }, 'Corpo [[Y]]')).trim(), 'Corpo [[Y]]');
  });
});

describe('getSlugMap', () => {
  const dir = contentFixture({
    'png/ismark.md': entry({ titolo: 'Ismark Kolyanovich', ruolo: 'Fratello di Ireena', stato: 'vivo' }),
    'png/_bozza.md': entry({ titolo: 'Bozza' }),
    'luoghi/vallaki.md': entry({ titolo: 'Vallaki', tipo: 'Città' }),
    'riassunto/overview.md': entry({ titolo: 'Riassunto' }),
  });
  const map = getSlugMap(dir);

  it('resolves by id and by title, with trailing-slash URLs', () => {
    assert.equal(map.get('ismark').url, '/png/ismark/');
    assert.equal(map.get('ismark kolyanovich').url, '/png/ismark/');
    assert.equal(map.get('vallaki').tipo, 'Città');
    assert.equal(map.get('riassunto').url, '/riassunto/');
  });

  it('skips drafts', () => {
    assert.equal(map.has('bozza'), false);
  });

  it('warns when two entries share a name', (t) => {
    const warn = t.mock.method(console, 'warn', () => {});
    getSlugMap(
      contentFixture({
        'png/vallaki.md': entry({ titolo: 'Vallaki' }),
        'luoghi/vallaki.md': entry({ titolo: 'Vallaki' }),
      })
    );
    assert.match(warn.mock.calls[0].arguments[0], /"vallaki" names both \/png\/vallaki\/ and \/luoghi\/vallaki\//);
  });
});

describe('findUnresolvedLinks', () => {
  it('lists targets that match no entry, ignoring frontmatter', () => {
    const dir = contentFixture({
      'luoghi/vallaki.md': entry({ titolo: 'Vallaki', estratto: '"[[Fuori dal corpo]]"' }),
      'sessions/sessione-01.md': entry({ titolo: 'Inizio' }, 'A [[Vallaki]], poi a [[Krezk]].'),
    });
    const unresolved = findUnresolvedLinks(dir);
    assert.deepEqual(unresolved.map((u) => u.target), ['Krezk']);
    assert.match(unresolved[0].file, /sessione-01\.md$/);
  });
});

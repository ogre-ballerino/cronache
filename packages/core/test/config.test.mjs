import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveConfig } from '../config.mjs';
import { entryUrl } from '../lib/collections.mjs';

const base = { name: 'Campagna', description: 'd', ogImageAlt: 'a' };

describe('resolveConfig', () => {
  it('builds the default nav from the enabled collections', () => {
    const hrefs = (config) => config.nav.map((l) => l.href);
    assert.deepEqual(hrefs(resolveConfig(base)), ['/riassunto/', '/diario/', '/personaggi/', '/png/', '/luoghi/', '/cerca/']);
    assert.ok(hrefs(resolveConfig({ ...base, features: { handout: true } })).includes('/handout/'));
    assert.ok(!hrefs(resolveConfig({ ...base, features: { riassunto: false } })).includes('/riassunto/'));
  });

  it('uses section labels in the nav and falls back title → heading', () => {
    const config = resolveConfig({ ...base, sections: { luoghi: { label: 'Posti' }, png: { heading: 'Comprimari' } } });
    assert.equal(config.nav[4].label, 'Posti');
    assert.equal(config.sections.luoghi.heading, 'Posti');
    assert.equal(config.sections.png.title, 'PNG');
    assert.equal(config.sections.png.heading, 'Comprimari');
  });

  it('keeps a site nav as given and merges labels', () => {
    const nav = [{ href: '/mappa/', label: 'Mappa' }];
    const config = resolveConfig({ ...base, nav, labels: { session: 'Capitolo' } });
    assert.equal(config.nav, nav);
    assert.equal(config.labels.session, 'Capitolo');
    assert.equal(config.labels.season, 'Stagione');
    assert.deepEqual(config.seasons, {});
  });
});

describe('entryUrl', () => {
  it('maps collections to routes with a trailing slash', () => {
    assert.equal(entryUrl('sessions', 'sessione-01'), '/diario/sessione-01/');
    assert.equal(entryUrl('riassunto', 'overview'), '/riassunto/');
    assert.throws(() => entryUrl('mappe', 'x'), /Unknown collection/);
  });
});

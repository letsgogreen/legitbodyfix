import test from 'node:test';
import assert from 'node:assert/strict';
import { recipeToggleImages } from '../src/lib/recipe-toggle-images.ts';

const image = (id, alt) => ({ id, type: 'image', alt, url: 'https://example.com/image.png', caption: 'Credit', source: 'Original source', fit: 'contain', aspect: 'auto' });
const toggle = (id, title) => ({ id, type: 'toggle', title, text: 'Description' });

test('matching images before or after their toggle are grouped without losing metadata', () => {
  const blocks = [image('p', 'Piriformis'), toggle('pt', 'Piriformis'), toggle('tt', 'TFL'), image('t', 'TFL')];
  const before = JSON.stringify(blocks);
  const grouped = recipeToggleImages(blocks);
  assert.deepEqual([...grouped.imageIds], ['p', 't']);
  assert.equal(grouped.byToggle.get('pt')[0], blocks[0]);
  assert.equal(grouped.byToggle.get('tt')[0].caption, 'Credit');
  assert.equal(JSON.stringify(blocks), before);
});

test('unmatched, ambiguous and different-section images remain standalone', () => {
  const blocks = [image('screen', 'Screening'), image('ambiguous', 'TFL'), toggle('one', 'TFL'), toggle('two', 'TFL'), image('outside', 'QL'), { id: 'h', type: 'heading', level: 2, text: 'Next section' }, toggle('ql', 'QL')];
  assert.equal(recipeToggleImages(blocks).imageIds.size, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipeBlocks } from '../src/lib/recipe-blocks.ts';
import { parseRecipeBlocks } from '../src/lib/recipe-blocks.schema.ts';
import { muscleSearchText } from '../src/lib/recipe-muscle-dictionary.ts';
import { readFileSync } from 'node:fs';

test('explicit dictionary links survive validation and normalization', () => {
  const block = {id:'t',type:'toggle',title:'Gluteus medius (same side)',text:'Recipe-specific instructions',muscleIds:['gluteus-medius']};
  assert.deepEqual(parseRecipeBlocks([block]), [block]);
  assert.deepEqual(normalizeRecipeBlocks(parseRecipeBlocks([block]))[0].muscleIds, ['gluteus-medius']);
  assert.equal(normalizeRecipeBlocks([block])[0].text, block.text);
});
test('legacy toggles remain valid and malformed IDs cannot become dictionary queries', () => {
  const block={id:'t',type:'toggle',title:'Original',text:'Unchanged'};
  assert.equal(parseRecipeBlocks([block]).length,1);
  assert.deepEqual(normalizeRecipeBlocks([{...block,muscleIds:['a','a',null,4,'']}])[0].muscleIds,['a']);
  assert.equal(parseRecipeBlocks([{...block,muscleIds:[4]}]).length,0);
});
test('abbreviations help search without auto-linking muscles', () => {
  assert.match(muscleSearchText({name:'Tensor fasciae latae',anatomical_group:'Hip'}), /tfl/);
  assert.match(muscleSearchText({name:'Quadratus lumborum',anatomical_group:null}), /ql/);
});
test('public dictionary queries explicitly require published entries', () => {
  const source=readFileSync(new URL('../src/lib/recipes.functions.ts',import.meta.url),'utf8');
  assert.match(source,/select\(RECIPE_MUSCLE_COLUMNS\)\.eq\("published", true\)\.in\("id", dictionaryIds\)/);
});

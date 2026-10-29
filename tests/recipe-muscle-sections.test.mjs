import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeSectionMuscles} from '../src/lib/recipe-muscle-sections.ts';
import {muscleSide, muscleSectionRole} from '../src/lib/recipe-muscle-dictionary.ts';
import {parseRecipeBlocks} from '../src/lib/recipe-blocks.schema.ts';
import {blocksToPlainText} from '../src/lib/recipe-blocks.ts';

test('tight and weak sections derive distinct unique dictionary relations', () => {
  const blocks=[{id:'h',type:'heading',level:2,text:'Tight muscles'},{id:'t',type:'toggle',title:'TFL',text:'',muscleIds:['tfl','tfl']},{id:'w',type:'heading',level:2,text:'Weakened muscles'},{id:'g',type:'toggle',title:'TFL',text:'',muscleIds:['tfl']},{id:'i',type:'heading',level:2,text:'Instructions'},{id:'u',type:'toggle',title:'Unrelated',text:'',muscleIds:['unrelated']}];
  assert.deepEqual(recipeSectionMuscles(blocks).links,[{muscle_id:'tfl',role:'tight'},{muscle_id:'tfl',role:'weak'}]);
  assert.deepEqual(recipeSectionMuscles(blocks.filter(b=>b.id!=='g')).links,[{muscle_id:'tfl',role:'tight'}]);
});
test('side and notes stay separate from the canonical muscle name', () => {
  const block={id:'g',type:'toggle',title:'Gluteus medius',text:'Application',muscleIds:['g'],muscleRole:'weak',side:'Same side',note:'Additional context'};
  assert.deepEqual(parseRecipeBlocks([block]),[block]);
  assert.match(blocksToPlainText([block]),/Same side/);
  assert.match(blocksToPlainText([block]),/Additional context/);
  assert.equal(muscleSide({title:'Elevated side TFL'}),'Elevated side');
  assert.equal(muscleSide({title:'Elevated side TFL',side:''}),'');
  assert.equal(muscleSectionRole(' tight muscles '),'tight');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { muscleInRegion, orderedMuscleGroups, muscleSectionGroup, neckDirectoryGroups } from '../public/assets/js/muscle-directory-data.js';
const muscles = JSON.parse(readFileSync(new URL('../public/assets/data/knowledge-base.json', import.meta.url))).muscles.filter(item => item.published !== false);
test('hip groups match the existing dictionary, including counts', () => {
  const regional = muscles.filter(item => muscleInRegion(item, 'pelvis-hip'));
  assert.deepEqual(orderedMuscleGroups(regional).map(name => [name, regional.filter(item => muscleSectionGroup(item) === name).length]), [
    ['Pelvic floor',13], ['Hip and pelvis',8], ['Deep hip rotators',6], ['Anterior thigh',2], ['Medial thigh',6], ['Posterior thigh',3],
  ]);
});
test('all six regions expose real published groups and representative images', () => {
  for (const region of ['head-neck','shoulder-arm','spine-rib-cage','pelvis-hip','knee','foot-ankle']) {
    const regional = muscles.filter(item => muscleInRegion(item, region));
    const names = region === 'head-neck' ? [...new Set(regional.flatMap(neckDirectoryGroups))] : orderedMuscleGroups(regional);
    assert.ok(names.length > 0, region);
    for (const name of names) assert.ok(regional.some(item => (region === 'head-neck' ? neckDirectoryGroups(item).includes(name) : muscleSectionGroup(item) === name) && item.imageUrl), name);
  }
});

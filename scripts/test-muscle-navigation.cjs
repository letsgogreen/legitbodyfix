const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/assets/js/knowledge.js', 'utf8');
function extract(name) {
  const start = source.indexOf('  function ' + name + '(');
  const end = source.indexOf('\n  function ', start + 1);
  return source.slice(start, end);
}
function node() {
  return { children: [], setAttribute() {}, append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; }, addEventListener(event, handler) { this[event] = handler; } };
}
const context = {
  data: { muscles: [
    { group: 'Calf', region: 'foot', roles: ['Plantarflexion'] },
    { group: 'Foot', region: 'foot', roles: ['Toe control'] },
    { group: 'Shoulder', region: 'shoulder', roles: ['Abduction'] },
  ] },
  activeMuscleRegion: 'foot', activeMuscleGroup: 'all', activeMuscleFunction: 'all',
  muscleGroupFilters: node(), muscleGroupFilterShell: node(),
  muscleFunction: { options: ['all', 'Plantarflexion', 'Toe control', 'Abduction'].map(value => ({ value, textContent: value, dataset: {} })), selectedIndex: 0 },
  muscleInRegion: (item, region) => item.region === region,
  muscleSectionGroup: item => item.group,
  muscleFunctionalRoles: item => item.roles,
  orderedMuscleGroups: items => [...new Set(items.map(item => item.group))],
  element: node, document: { createTextNode: text => text }, render() {},
};
vm.createContext(context);
vm.runInContext(extract('updateFunctionOptions') + extract('updateMuscleGroupFilters'), context);
context.updateMuscleGroupFilters();
assert.equal(context.muscleGroupFilterShell.hidden, false, 'groups must be visible before choosing an action');
assert.equal(context.muscleGroupFilters.children.length, 3);
context.muscleGroupFilters.children[1].click();
assert.equal(context.activeMuscleGroup, 'Calf');
assert.equal(context.muscleFunction.options[2].disabled, true, 'actions must be scoped to selected group');
const change = source.match(/muscleFunction.addEventListener\("change", function \(\) \{([\s\S]*?)\n  \}\);/)[1];
context.muscleFunction.value = 'Plantarflexion';
vm.runInContext(change, context);
assert.equal(context.activeMuscleRegion, 'foot');
assert.equal(context.activeMuscleGroup, 'Calf');
assert.equal(context.activeMuscleFunction, 'Plantarflexion');
console.log('PASS: region-first groups, scoped actions, and selection preservation');

// Audit the complete existing dictionary, not only sample fixtures.
const payload = JSON.parse(fs.readFileSync('public/assets/data/knowledge-base.json', 'utf8'));
context.data = payload;
for (const name of ['movementTagOrder', 'muscleGroupOrder']) {
  vm.runInContext(source.match(new RegExp('  var ' + name + ' = \\[([\\s\\S]*?)\\];'))[0], context);
}
for (const name of ['muscleRegion', 'muscleInRegion', 'muscleFunctionalRoles', 'muscleSectionGroup', 'neckDirectoryGroups', 'orderedMuscleGroups']) {
  vm.runInContext(extract(name), context);
}
const regions = ['head-neck', 'shoulder-scapula', 'elbow-forearm', 'wrist-hand', 'thoracic-spine', 'lumbar-spine', 'pelvis-hip', 'knee', 'foot-ankle'];
// Visual group overview uses the same membership and click behavior as the tabs.
context.grid = node();
context.grid.scrollIntoView = () => {};
context.document.createElement = node;
context.muscleGroupFilters.querySelector = () => null;
vm.runInContext(source.slice(source.indexOf('  var collectiveNeckGroupImages ='), source.indexOf('  var muscleFamilyOrder =')), context);
context.muscleRegions = {};
vm.runInContext(extract('renderMuscleGroupCards'), context);
for (const region of regions) {
  context.activeMuscleRegion = region;
  context.activeMuscleGroup = 'all';
  context.updateMuscleGroupFilters();
  const expected = context.muscleGroupFilters.children.length - 1;
  assert.equal(context.renderMuscleGroupCards(), expected, region + ' cards must match group tabs');
  for (const card of context.grid.children) {
    const media = card.children[0];
    assert.ok(media.children[0].src, region + ' group card must have an image');
    media.children[0].error();
    assert.equal(media.children.length, 1, 'broken images have a readable fallback');
    card.click();
    assert.notEqual(context.activeMuscleGroup, 'all', 'group card selects its members');
  }
}
console.log('PASS: image cards, image fallback, and group selection across all regions');
const published = payload.muscles.filter(item => item && item.published !== false);
const deepHipMembers = published.filter(item => item.group === 'Deep hip');
assert.equal(deepHipMembers.length, 6);
for (const item of deepHipMembers) assert.equal(context.muscleSectionGroup(item), 'Deep hip rotators');
const pelvicSubgroups = ['Pelvic diaphragm', 'Superficial perineum', 'Deep perineum', 'Pelvic sphincters'];
const pelvicMembers = published.filter(item => pelvicSubgroups.includes(item.group));
assert.equal(pelvicMembers.length, 13, 'all four pelvic subgroups must retain their 13 records');
for (const item of pelvicMembers) {
  assert.equal(context.muscleSectionGroup(item), 'Pelvic floor');
  assert.ok(pelvicSubgroups.includes(item.group), 'original detail subgroup must be preserved');
}
context.activeMuscleRegion = 'pelvis-hip';
context.activeMuscleGroup = 'all';
context.updateMuscleGroupFilters();
const pelvicGroups = context.orderedMuscleGroups(published.filter(item => context.muscleInRegion(item, 'pelvis-hip')));
assert.equal(pelvicGroups.filter(name => name === 'Pelvic floor').length, 1);
assert.equal(pelvicGroups.filter(name => pelvicSubgroups.includes(name)).length, 0);
console.log('PASS: one Pelvic floor group, 13 muscles, original detail subgroups preserved');
const reached = new Set();
for (const region of regions) {
  context.activeMuscleRegion = region;
  context.activeMuscleGroup = 'all';
  context.activeMuscleFunction = 'all';
  context.updateMuscleGroupFilters();
  const regional = published.filter(item => context.muscleInRegion(item, region));
  const covered = new Set();
  const groups = context.muscleGroupFilters.children.slice(1);
  assert.ok(groups.length, region + ' must have groups');
  for (const button of groups) {
    button.click();
    const members = regional.filter(item => region === 'head-neck'
      ? context.neckDirectoryGroups(item).includes(context.activeMuscleGroup)
      : context.muscleSectionGroup(item) === context.activeMuscleGroup);
    assert.ok(members.length, 'no empty group: ' + context.activeMuscleGroup);
    members.forEach(item => { covered.add(item.id); reached.add(item.id); });
  }
  assert.equal(covered.size, regional.length, region + ' must expose every muscle');
  console.log(region + ': ' + groups.length + ' groups / ' + covered.size + ' muscles reachable');
}
assert.equal(reached.size, published.length, 'every published muscle must be reachable');
console.log('PASS: all ' + published.length + ' published muscles reachable across 9 regions');

context.URL = URL;
context.window = { location: { href: 'https://example.test/knowledge.html?type=muscles&id=soleus' } };
context.labels = { muscles: 'Muscles', conditions: 'Conditions', recipes: 'Recipes' };
context.activeType = 'muscles';
let destination;
context.history = { pushState: (_state, _title, url) => { destination = url; } };
vm.runInContext(extract('updateUrl'), context);
context.updateUrl();
assert.equal(destination, '/knowledge.html?type=muscles', 'returning to list must retain muscle collection');
context.activeType = 'all';
context.updateUrl();
assert.equal(destination, '/knowledge.html', 'overview must clear collection');
console.log('PASS: detail-to-list URLs preserve collection on refresh');

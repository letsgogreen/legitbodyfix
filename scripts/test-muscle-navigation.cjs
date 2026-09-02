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

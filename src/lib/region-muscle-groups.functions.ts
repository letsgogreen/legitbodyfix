import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export const listRegionMuscleGroups = createServerFn({ method: 'GET' })
  .validator((input) => z.object({ region: z.enum(['head-neck', 'shoulder-arm', 'spine-rib-cage', 'hip-pelvis', 'knee', 'ankle-foot']) }).parse(input))
  .handler(async ({ data }) => {
    const [{ default: knowledge }, directory] = await Promise.all([
      import('../../public/assets/data/knowledge-base.json'),
      import('../../public/assets/js/muscle-directory-data.js'),
    ]);
    const region = data.region === 'hip-pelvis' ? 'pelvis-hip' : data.region === 'ankle-foot' ? 'foot-ankle' : data.region;
    const muscles = knowledge.muscles.filter(item => item.published !== false && directory.muscleInRegion(item, region));
    const names: string[] = region === 'head-neck'
      ? [...new Set(muscles.flatMap(directory.neckDirectoryGroups))]
      : directory.orderedMuscleGroups(muscles);
    return names.map(name => {
      const members = muscles.filter(item => region === 'head-neck' ? directory.neckDirectoryGroups(item).includes(name) : directory.muscleSectionGroup(item) === name);
      const representative = members.find(item => item.imageUrl);
      const collective = directory.collectiveNeckGroupImages[name as keyof typeof directory.collectiveNeckGroupImages];
      const reference = collective || representative;
      return {
        name, count: members.length,
        imageUrl: reference?.imageUrl?.startsWith('https://') ? reference.imageUrl : '',
        imageAlt: reference?.imageAlt || `${name} anatomy reference`,
        description: collective?.label || (representative ? `Representative muscle: ${representative.title}` : 'Anatomy reference'),
        href: `/knowledge.html?type=muscles&region=${encodeURIComponent(region)}&group=${encodeURIComponent(name)}`,
      };
    });
  });

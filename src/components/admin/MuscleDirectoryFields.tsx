import { AUTO_DIRECTORY_CONFIG, DIRECTORY_FUNCTIONS, DIRECTORY_REGIONS, DIRECTORY_REGION_LABELS, type DirectoryConfig } from "@/lib/muscle-directory-config";

export function MuscleDirectoryFields({ value, onChange }: { value: DirectoryConfig | undefined; onChange: (value: DirectoryConfig) => void }) {
  const config = value ?? AUTO_DIRECTORY_CONFIG;
  function toggle(field: "regions" | "functions", tag: string) {
    const current: readonly string[] = config[field] ?? [];
    onChange({ ...config, [field]: current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag] } as DirectoryConfig);
  }
  return <section className="space-y-5 rounded-sm border border-border p-5 sm:col-span-2" aria-label="Public dictionary classification">
    <div><h2 className="text-lg font-bold">Public dictionary classification</h2><p className="mt-1 text-sm text-muted-foreground">Automatic uses the existing anatomy rules. Manual selections replace those rules. Published changes appear in the public dictionary after saving and refreshing.</p></div>
    <fieldset className="space-y-3"><legend className="text-sm font-bold">Body regions</legend>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.regions !== null} onChange={e => onChange({ ...config, regions: e.target.checked ? [] : null })} />Choose regions manually</label>
      {config.regions !== null ? <div className="grid gap-2 sm:grid-cols-2">{DIRECTORY_REGIONS.map((region, i) => <label key={region} className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={config.regions!.includes(region)} onChange={() => toggle("regions", region)} />{DIRECTORY_REGION_LABELS[i]}</label>)}</div> : null}
    </fieldset>
    <fieldset className="space-y-3"><legend className="text-sm font-bold">Muscle groups</legend>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.groups !== null} onChange={e => onChange({ ...config, groups: e.target.checked ? [] : null })} />Choose groups manually</label>
      {config.groups !== null ? <label className="grid gap-2 text-sm">Group names — one per line, shown in every selected region<textarea rows={4} value={config.groups.join("\n")} onChange={e => onChange({ ...config, groups: e.target.value.split("\n") })} placeholder={"Upper back\nHead and neck"} className="rounded-sm border border-border bg-background p-3" /></label> : null}
    </fieldset>
    <fieldset className="space-y-3"><legend className="text-sm font-bold">Movement filters</legend>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.functions !== null} onChange={e => onChange({ ...config, functions: e.target.checked ? [] : null })} />Choose movements manually</label>
      {config.functions !== null ? <div className="grid max-h-80 gap-2 overflow-y-auto rounded-sm border border-border p-3 sm:grid-cols-2">{DIRECTORY_FUNCTIONS.map(tag => <label key={tag} className="flex min-h-9 items-center gap-2 text-sm"><input type="checkbox" checked={config.functions!.includes(tag)} onChange={() => toggle("functions", tag)} />{tag}</label>)}</div> : null}
    </fieldset>
  </section>;
}

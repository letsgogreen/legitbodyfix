const steps = [
  {
    number: "01",
    title: "Choose your focus",
    description: "Start with the body region or movement that feels most relevant.",
  },
  {
    number: "02",
    title: "Choose your approach",
    description: "Explore free learning resources or look for a guided program.",
  },
  {
    number: "03",
    title: "Take your next step",
    description: "Read a relevant guide or review a program, then return to your library anytime.",
  },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
      {steps.map((step) => (
        <li key={step.number} className="min-w-0 bg-card p-6 sm:p-8">
          <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
            {step.number}
          </span>
          <h3 className="mt-8 text-xl font-extrabold">{step.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

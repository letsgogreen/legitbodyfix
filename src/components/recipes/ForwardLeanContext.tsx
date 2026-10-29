import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ImageIcon } from "lucide-react";

type RelatedRecipe = {
  slug: string;
  title: string;
  image_url: string | null;
  image_alt: string | null;
  connectionReason: string;
};

function RelatedPatternCard({ recipe }: { recipe: RelatedRecipe }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = recipe.image_url;
  const resolvedImage = imageUrl && (/^(?:https?:)?\/\//i.test(imageUrl) || imageUrl.startsWith("/")
    ? imageUrl : `/${imageUrl.replace(/^\.\//, "")}`);

  return (
    <li className="min-w-0 border border-border bg-card">
      <Link to="/recipes/$slug" params={{ slug: recipe.slug }} className="group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
          {resolvedImage && !imageFailed ? (
            <img src={resolvedImage} alt={recipe.image_alt ?? recipe.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.025]" onError={() => setImageFailed(true)} />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon aria-hidden="true" className="h-7 w-7" /></div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-xl font-extrabold leading-tight">{recipe.title}</h3>
          <p className="mb-5 mt-3 text-base leading-7 text-foreground/85">{recipe.connectionReason}</p>
          <span className="mt-auto flex min-h-11 items-center justify-between border-t border-border pt-4 text-sm font-bold">Explore this pattern <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
        </div>
      </Link>
    </li>
  );
}

export function ForwardLeanContext({ relatedRecipes }: { relatedRecipes: RelatedRecipe[] }) {
  return (
    <section aria-labelledby="forward-lean-context" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[70ch] text-[18px] leading-[1.85] text-foreground/90 sm:text-[19px]">
        <p className="text-sm font-semibold uppercase tracking-[0.12em]">Understanding the pattern</p>
        <h2 id="forward-lean-context" className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">Why does the trunk lean forward during a squat?</h2>
        <p className="mt-6">Forward trunk lean describes a movement, not a diagnosis. During a squat, ankle, knee, hip and pelvic motion work together. More forward lean can shift the relative demand toward the hip extensors; it does not, by itself, identify a tight or weak muscle.</p>

        <div className="mt-10 space-y-10">
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">The ankle can change how the rest of the body moves</h3>
            <p className="mt-4">When the shin cannot travel forward comfortably, a person may use more hip and trunk movement or stop at a shallower depth. A study of 44 participants found greater forward lean in those with limited ankle dorsiflexion. This association does not identify a particular calf muscle as the cause.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">Hip position can influence the depth available</h3>
            <p className="mt-4">If the hip stays adducted or does not comfortably access the abduction and rotation needed for the chosen stance, available squat depth may change. The person may stop earlier or redistribute motion through the pelvis and trunk.</p>
            <p className="mt-5">This is a possible connection to explore, not an established rule that an adduction pattern causes forward lean. Leaning farther forward can also increase hip flexion rather than bypass a hip restriction.</p>
            <p className="mt-5">Inward knee movement is a related observation, not a diagnosis of an adductor problem. Research in symptomatic hip impingement shows task-dependent hip and pelvic strategies, but that condition is not equivalent to a hip adduction pattern.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">Forward lean, pelvic tilt and sideways shifts are different observations</h3>
            <p className="mt-4">Notice separately whether the torso inclines, the pelvis rotates backward, the lower back rounds, or the body shifts to one side. These describe different movements. Their coexistence can help frame a closer assessment, but does not establish which movement caused another.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">A more upright squat is not always the goal</h3>
            <p className="mt-4">The exercise and load position matter: back squats can involve more trunk lean than front squats. Stance changes also affect hip and knee mechanics, but a wider stance does not reliably make every torso more upright. Interpret the angle in the context of the task rather than against one universal ideal.</p>
          </section>
        </div>

        <section aria-labelledby="forward-lean-references" className="mt-12 border-t border-border pt-7">
          <h3 id="forward-lean-references" className="text-xl font-bold text-foreground">Research behind this explanation</h3>
          <ul className="mt-4 space-y-3 text-base leading-7 text-foreground/85">
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/41196246/" className="underline underline-offset-4">Ankle dorsiflexion and squat kinematics (44 participants)</a></li>
            <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10518215/" className="underline underline-offset-4">Trunk and shin position: hip-to-knee moment ratio</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/28709152/" className="underline underline-offset-4">Task-dependent squat mechanics in symptomatic hip impingement</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/25630691/" className="underline underline-offset-4">Front and back squat trunk inclination</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/11404665/" className="underline underline-offset-4">Stance width and three-dimensional squat mechanics</a></li>
          </ul>
          <p className="mt-5">These studies examine different populations and squat tasks. The pattern connections below are editorial exploration links, not validated causal pathways or a diagnosis.</p>
        </section>
        </article>

        {relatedRecipes.length > 0 ? (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="text-2xl font-extrabold">Related movement patterns</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-foreground/85">Explore observations that may occur alongside forward lean. A related card does not mean you have that pattern or that it caused your trunk position.</p>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {relatedRecipes.map((recipe) => <RelatedPatternCard key={recipe.slug} recipe={recipe} />)}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

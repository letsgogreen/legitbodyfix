import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ImageIcon } from "lucide-react";

export type RelatedRecipe = {
  slug: string;
  title: string;
  image_url: string | null;
  image_alt: string | null;
  connectionReason: string;
};

export function RelatedPatternCard({ recipe }: { recipe: RelatedRecipe }) {
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
        <h2 id="forward-lean-context" className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">Why does your chest drop as you squat?</h2>
        <p className="mt-6">As you lower into a squat, you may notice your chest turning toward the floor while your hips move backward. The movement is most visible at the trunk, but the explanation may involve what is happening farther down: how far the shins travel forward, how the hips fold, and whether the pelvis tilts or shifts.</p>
        <p className="mt-5">Rather than treating the chest position as an isolated fault, look at how these movements fit together. Similar-looking squats can be produced by different strategies.</p>

        <div className="mt-10 space-y-10">
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">When the ankles limit forward movement</h3>
            <p className="mt-4">During the lowering phase, the shins usually move forward over the feet. This movement uses ankle dorsiflexion: the angle between the shin and the top of the foot closes. If that movement is limited, the rest of the squat may look different.</p>
            <p className="mt-5">One possible response is to use more hip and trunk movement. Another is to stop at a shallower depth or let the heels lift. In a study of 44 people, the group with limited ankle dorsiflexion showed greater forward trunk lean, along with more hip and lumbar flexion. <a href="https://pubmed.ncbi.nlm.nih.gov/41196246/" className="font-semibold underline underline-offset-4" aria-label="Read the ankle dorsiflexion study">[1]</a></p>
            <p className="mt-5">This is why the heel-rise recipe is connected below: it provides another way to explore ankle motion and foot contact, rather than another name for forward lean.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">When the hips cannot comfortably accommodate the squat</h3>
            <p className="mt-4">The hips do more than bend. Hip flexion is the folding movement between the thigh and pelvis; abduction moves the thigh outward; rotation turns it within the joint. The combination used during a squat depends on the stance and the movement being performed.</p>
            <p className="mt-5">If the thighs stay drawn inward, or the chosen stance asks for hip movement that is not comfortably available, descending farther may become difficult. A useful possibility to investigate is whether the person stops earlier or redistributes movement through the pelvis and trunk.</p>
            <p className="mt-5">That makes an adduction pattern relevant to the discussion, but it does not mean that leaning forward solves a hip restriction. Depending on how the pelvis moves, a farther-forward torso may actually require more hip flexion.</p>
            <p className="mt-5">Research in people with symptomatic hip impingement illustrates how task conditions matter: a constrained squat produced differences in hip adduction and pelvic rise, even though squat depth did not differ between groups. This is evidence of different strategies, not proof that an adduction pattern causes forward lean. <a href="https://pubmed.ncbi.nlm.nih.gov/28709152/" className="font-semibold underline underline-offset-4" aria-label="Read the hip and pelvic squat mechanics study">[2]</a></p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">When forward lean comes with a sideways shift</h3>
            <p className="mt-4">A side view can make the squat look like a simple forward bend. From the front, the same movement may also include a shift toward one leg. These are two separate observations: one describes trunk inclination, the other describes a side-to-side strategy.</p>
            <p className="mt-5">The useful connection is a question: does the chest drop while the pelvis also moves to one side? If so, the asymmetric hip-shift recipe offers a related pattern to explore. The combination alone does not show which hip is restricted or which muscle needs attention.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">Leaning forward is not the same as rounding your back</h3>
            <p className="mt-4">A torso can incline as the hips fold without the lower back visibly rounding. In another squat, the pelvis may rotate backward and the lumbar spine may flex as depth increases. Both can bring the chest closer to the floor, but they are not the same movement.</p>
            <p className="mt-5">Separating trunk inclination from pelvic and spinal motion makes the description more useful than simply saying “keep your chest up.” The posterior pelvic-tilt recipe below helps distinguish these observations.</p>
          </section>
          <section>
            <h3 className="text-2xl font-bold leading-snug text-foreground">Putting the pieces together</h3>
            <p className="mt-4">Start with the whole movement: the shins moving forward, the hips folding, and the pelvis staying centered or shifting. Then consider what the exercise asks for. Back squats, for example, can involve more forward lean than front squats. A more upright torso is not automatically the goal for every squat. <a href="https://pubmed.ncbi.nlm.nih.gov/25630691/" className="font-semibold underline underline-offset-4" aria-label="Read the front and back squat comparison">[3]</a></p>
            <p className="mt-5">Trunk angle also changes how the work is shared. Research links greater forward trunk inclination, relative to shin inclination, with a greater hip-to-knee extensor moment ratio. In plain language, the strategy can place relatively more demand at the hips than at the knees. <a href="https://pubmed.ncbi.nlm.nih.gov/37001335/" className="font-semibold underline underline-offset-4" aria-label="Read the hip-to-knee moment study">[4]</a></p>
            <p className="mt-5">The muscle cards above and the related recipes below are starting points for understanding these connections. They are not a checklist of confirmed causes: posture alone cannot establish that a muscle is short, weak, or responsible for the movement.</p>
          </section>
        </div>

        <section aria-labelledby="forward-lean-references" className="mt-12 border-t border-border pt-7">
          <h3 id="forward-lean-references" className="text-xl font-bold text-foreground">Research behind this explanation</h3>
          <ul className="mt-4 space-y-3 text-base leading-7 text-foreground/85">
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/41196246/" className="underline underline-offset-4">[1] Ankle dorsiflexion and squat kinematics (44 participants)</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/28709152/" className="underline underline-offset-4">[2] Task-dependent squat mechanics in symptomatic hip impingement</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/25630691/" className="underline underline-offset-4">[3] Front and back squat trunk inclination</a></li>
            <li><a href="https://pubmed.ncbi.nlm.nih.gov/37001335/" className="underline underline-offset-4">[4] Trunk and shin position: hip-to-knee moment ratio</a></li>
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

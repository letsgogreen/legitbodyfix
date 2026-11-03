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
  return <ApprovedForwardLeanContext relatedRecipes={relatedRecipes} />;
}

function ApprovedForwardLeanContext({ relatedRecipes }: { relatedRecipes: RelatedRecipe[] }) {
  const sections = [
    { heading: "How ankle motion changes the squat", paragraphs: ["As you descend, the shins travel forward over the feet. This requires ankle dorsiflexion.", "When that motion is restricted, you may move the hips farther backward, lean forward, lift the heels or stop at a shallower depth. Research has found greater trunk lean and more movement through the hips, pelvis and lower back in people with limited ankle dorsiflexion.", "The gastrocnemius and soleus become relevant when calf restriction contributes to that limitation. Addressing available ankle motion can create more options for the descent—but those options still need to be practiced in the squat."], sources: ["https://pubmed.ncbi.nlm.nih.gov/41196246/"] },
    { heading: "How the hips share the work", paragraphs: ["The hips fold as you lower and extend as you stand back up. Moving the torso farther forward changes the demand: relative to a more upright strategy, it can shift more work toward the hip extensors.", "This helps explain why hip mobility and gluteal function belong in the same discussion. In one study, participants with restricted hip flexor length showed lower gluteus maximus activation during a bilateral squat.", "Improving flexibility and developing hip-extension control are separate tasks. The sequence addresses both, then connects them through a coordinated movement."], sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC10518215/", "https://pubmed.ncbi.nlm.nih.gov/26673683/"] },
    { heading: "Give the trunk movement—and control", paragraphs: ["Leaning through the hips is different from rounding the lower back. The torso can incline while the spine remains relatively steady, or the pelvis and spine can also move as the squat deepens.", "The flexibility stage includes the abdominal complex alongside the calves and hip flexors. The activation stage then emphasizes the tibialis anterior, core stabilizers and gluteus maximus.", "These stages have different purposes: flexibility work addresses relevant restrictions, while activation develops control. The aim is not to keep the abdomen relaxed during the squat, but to support the trunk while the legs move."], sources: [] },
  ];
  const rows = [
    ["Inhibit", "Self-myofascial release", "Gastrocnemius / soleus, rectus femoris, TFL"],
    ["Lengthen", "Static stretching", "Abdominal complex, gastrocnemius / soleus, hip flexor complex"],
    ["Activate", "Isolated strengthening", "Tibialis anterior, core stabilizers, gluteus maximus"],
    ["Integrate", "Integrated movement", "Ball wall squat with overhead press"],
  ];
  return <section className="border-b border-border" aria-labelledby="forward-lean-context">
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
      <article className="mx-auto max-w-[70ch] text-[18px] leading-[1.85] text-foreground/90 sm:text-[19px]">
        <p className="text-sm font-semibold uppercase tracking-[0.12em]">Understanding the pattern</p>
        <h2 id="forward-lean-context" className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Why does your chest drop as you squat?</h2>
        <p className="mt-6">You lower into a squat. Your hips move back, your chest drops, and keeping your balance becomes harder as you go deeper.</p>
        <p className="mt-5">The visible change is at the trunk, but the movement is shared by the ankles, knees and hips. When the knees have less room to travel forward, the hips and torso may adjust to keep you balanced over your feet.</p>
        <p className="mt-5">Understanding that adjustment gives you a clearer starting point than simply trying to lift your chest.</p>
        {sections.map(section => <section key={section.heading} className="mt-10"><h3 className="text-2xl font-bold leading-snug">{section.heading}</h3>{section.paragraphs.map(paragraph => <p key={paragraph} className="mt-5">{paragraph}</p>)}{section.sources.map((url, index) => <a key={url} className="mr-4 text-base font-semibold underline underline-offset-4" href={url}>Study{section.sources.length > 1 ? ` ${index + 1}` : ""}</a>)}</section>)}
        <section className="mt-10"><h3 className="text-2xl font-bold">A practical sequence</h3><p className="mt-5">This sequence moves from targeted preparation to active control, then brings the work together in a supported squat.</p>
          <div className="mt-6 overflow-x-auto border border-border"><table className="w-full min-w-[620px] text-left text-base leading-7"><thead className="bg-muted/50"><tr>{["Phase", "Approach", "Muscles / Exercise"].map(label => <th key={label} scope="col" className="border-b border-border px-5 py-4">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]} className="border-b border-border last:border-0"><th scope="row" className="px-5 py-4 align-top">{row[0]}</th>{row.slice(1).map(cell => <td key={cell} className="px-5 py-4 align-top">{cell}</td>)}</tr>)}</tbody></table></div>
        </section>
        <section className="mt-10"><h3 className="text-2xl font-bold">Why use a ball wall squat with overhead press?</h3><p className="mt-5">The ball and wall provide external support, changing the balance demands of the squat. This creates a different setting in which to coordinate the knees, hips and trunk.</p><p className="mt-5">Adding the overhead press connects an upper-body movement to the squat. The task becomes controlling the torso while the legs and arms work together.</p><p className="mt-5">The support is part of the exercise’s purpose—not simply a way to make the movement more unstable. Research confirms that ball and wall support, together with foot position, changes how the exercise loads the knees.</p><a href="https://doi.org/10.1249/MSS.0000000000003185" className="text-base font-semibold underline underline-offset-4">Study</a></section>
        <section className="mt-10"><h3 className="text-2xl font-bold">Bring it back to your squat</h3><p className="mt-5">Return to the point where your chest begins to drop. Look for smoother knee travel, steady foot contact and better coordination as you lower and rise.</p><p className="mt-5">The goal is not one upright position for everyone. It is to develop the available movement and control needed for the squat you are performing.</p></section>
      </article>
      {relatedRecipes.length > 0 && <section className="mt-16 border-t border-border pt-10"><h2 className="text-2xl font-extrabold">Related movement patterns</h2><ul className="mt-6 grid gap-5 md:grid-cols-2">{relatedRecipes.map(recipe => <RelatedPatternCard key={recipe.slug} recipe={recipe} />)}</ul></section>}
    </div>
  </section>;
}

function PreviousForwardLeanContext({ relatedRecipes }: { relatedRecipes: RelatedRecipe[] }) {
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

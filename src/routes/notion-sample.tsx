import { type FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const unlockKey = "lbf_recipe_library_lead";

export const Route = createFileRoute("/notion-sample")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: search["next"] === "/recipes" ? "/recipes" : "/recipes",
  }),
  head: () => ({
    meta: [
      { title: "Corrective Exercise Library — Free Sample | LegitBodyFix" },
      { name: "description", content: "Open the complete Corrective Movement Strategies library with your email." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotionSample,
});

function NotionSample() {
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || state === "sending") return;
    setState("sending");
    try {
      const response = await fetch("/api/recipe-library-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website, source_path: "/notion-sample" }),
      });
      if (!response.ok) throw new Error("Lead request failed");
      window.localStorage.setItem(unlockKey, "1");
      window.location.assign(next);
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3eb] px-5 py-8 text-[#161812] sm:px-8 lg:px-[5%]">
      <header className="mx-auto flex max-w-[1400px] items-center justify-between border-b border-[#d5d6ca] pb-7">
        <Link to="/" className="text-base font-black tracking-[-0.04em]">LEGITBODYFIX</Link>
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#60635a]">FREE LIBRARY ACCESS</span>
      </header>
      <section className="mx-auto max-w-[1140px] py-14 lg:py-20">
        <p className="flex items-center justify-center gap-2 text-center font-mono text-[10px] tracking-[0.15em] text-[#60635a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#607b1d]" /> FOR TRAINERS &amp; MOVEMENT PROFESSIONALS
        </p>
        <h1 className="mt-6 text-center text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
          Your access to the<br /><span className="bg-[linear-gradient(transparent_56%,#d5fb60_56%,#d5fb60_93%,transparent_93%)]">Corrective Exercise Library.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-7 text-[#60635a] sm:text-lg">
          Explore movement notes, muscle references and corrective movement strategies in one connected library.
        </p>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="flex justify-between font-mono text-[9px] tracking-[0.15em] text-[#60635a]"><span>INSIDE THE LIBRARY</span><span>STRUCTURE PREVIEW / 01</span></div>
            <div className="mt-3 rotate-[-1deg] border border-[#b8bbaa] bg-[#fffef9] shadow-[12px_12px_0_#e0e5d3]">
              <div className="flex h-10 items-center justify-between border-b border-[#d5d6ca] bg-[#eeefe7] px-3 text-[10px] text-[#60635a]"><span>● ● ●</span><span>Corrective Exercise Recipes</span><span>•••</span></div>
              <div className="grid min-h-[390px] grid-cols-[105px_1fr] sm:grid-cols-[125px_1fr]">
                <aside className="flex flex-col gap-2 border-r border-[#e0e1d7] bg-[#f1f2e9] p-3 text-[9px] text-[#60635a] sm:p-4 sm:text-[10px]"><strong className="pb-4 text-[8px] tracking-[0.12em]">YOUR LIBRARY</strong><span className="bg-[#e0e6ce] px-2 py-2 text-[#161812]">▦ &nbsp; Recipes</span><span className="px-2 py-1">◉ &nbsp; Body regions</span><span className="px-2 py-1">◇ &nbsp; Muscle atlas</span><span className="mt-auto px-2 py-2 leading-5">A clearer path<br />through your notes.</span></aside>
                <div className="p-5 sm:p-7"><p className="font-mono text-[8px] tracking-[0.12em] text-[#60635a]">LIBRARY / RECIPE</p><span className="mt-5 grid h-8 w-8 place-items-center bg-[#d5fb60] text-xl">↗</span><h2 className="mt-4 text-2xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-3xl">From observation<br />to session notes.</h2><p className="mt-3 text-xs text-[#60635a]">The useful details, connected in one place.</p><div className="mt-6 space-y-3 text-[10px]"><p className="grid grid-cols-[95px_1fr]"><span className="text-[#60635a]">Body region</span><b className="w-fit bg-[#e1eac7] px-2 py-1 font-medium">Hip / Pelvis</b></p><p className="grid grid-cols-[95px_1fr]"><span className="text-[#60635a]">Movement</span><b className="w-fit bg-[#eceee5] px-2 py-1 font-medium">Squat</b></p><p className="grid grid-cols-[95px_1fr]"><span className="text-[#60635a]">References</span><b className="underline underline-offset-4">Open references ↗</b></p></div><div className="mt-6 border-t border-[#d5d6ca] pt-4"><h3 className="text-sm font-bold">Session brief</h3><p className="mt-3 border-l-2 border-[#d1d6c5] pl-3 text-[10px] leading-5">What are you exploring in this movement?</p><p className="mt-3 border-l-2 border-[#d1d6c5] pl-3 text-[10px] leading-5">Keep the exercise and practice details together.</p></div></div>
              </div>
            </div>
          </div>

          <section className="border border-[#b8bbaa] bg-[#fffef9] p-7 sm:p-10">
            <p className="font-mono text-[10px] tracking-[0.14em] text-[#60635a]">A LOOK INSIDE THE LIBRARY</p>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em]">Open the full library.</h2>
            <p className="mt-4 text-sm leading-6 text-[#60635a]">Enter your email to access the complete corrective movement strategies library.</p>
            <form className="mt-7" onSubmit={submit}>
              <label htmlFor="notion-sample-email" className="block text-xs font-bold">Where should we send your access?</label>
              <input id="notion-sample-email" type="email" required autoComplete="email" autoCapitalize="none" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="mt-2 h-13 w-full border border-[#a1a595] bg-[#fffef9] px-4 text-sm outline-none focus:border-[#161812]" />
              <label className="mt-4 flex gap-3 text-xs leading-5 text-[#60635a]"><input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#607b1d]" /><span>I agree that LegitBodyFix may store my email to provide this access, as described in the <Link to="/privacy" className="font-bold underline">Privacy Policy</Link>.</span></label>
              <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="notion-sample-website">Website</label><input id="notion-sample-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></div>
              <button type="submit" disabled={!accepted || state === "sending"} className="mt-6 min-h-13 w-full border border-[#161812] bg-[#d5fb60] px-5 text-sm font-bold hover:bg-[#c4ed42] disabled:cursor-not-allowed disabled:opacity-60">{state === "sending" ? "Opening library…" : "Open the full library ↗"}</button>
              <p aria-live="polite" className="mt-3 text-sm text-red-700">{state === "error" ? "We couldn’t save that email. Please try again." : ""}</p>
            </form>
          </section>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1400px] justify-between border-t border-[#d5d6ca] py-6 text-xs text-[#60635a]"><span className="font-black text-[#161812]">LEGITBODYFIX</span><span>Corrective Exercise Library</span></footer>
    </main>
  );
}

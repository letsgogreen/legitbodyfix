import { recipePatternArticles, patternSources } from "@/data/recipe-articles";
import { forwardLeanSlug } from "@/data/recipe-pattern-connections";
import { ForwardLeanContext, RelatedPatternCard, type RelatedRecipe } from "./ForwardLeanContext";

export function RecipePatternContext({
  slug,
  relatedRecipes,
}: {
  slug: string;
  relatedRecipes: RelatedRecipe[];
}) {
  if (slug === forwardLeanSlug) return <ForwardLeanContext relatedRecipes={relatedRecipes} />;
  if (!Object.hasOwn(recipePatternArticles, slug)) return null;
  const article = recipePatternArticles[slug];
  if (!article) return null;
  const headingId = `pattern-context-${slug}`;
  const evidenceIds = [...new Set(article.sections.flatMap((section) => section.evidence ?? []))];

  return (
    <section aria-labelledby={headingId} className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-16">
        <article className="mx-auto max-w-[70ch] text-[18px] leading-[1.85] text-foreground/90 sm:text-[19px]">
          <p className="text-sm font-semibold uppercase tracking-[0.12em]">
            Understanding the pattern
          </p>
          <h2
            id={headingId}
            className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl"
          >
            {article.title}
          </h2>
          {article.intro.map((paragraph) => (
            <p key={paragraph} className="mt-6">
              {paragraph}
            </p>
          ))}
          <div className="mt-10 space-y-10">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="text-2xl font-bold leading-snug text-foreground">
                  {section.heading}
                </h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-5">
                    {paragraph}
                  </p>
                ))}
                {section.table ? (
                  <div className="mt-6 overflow-x-auto rounded-sm border border-border" role="region" aria-label={section.table.caption} tabIndex={0}>
                    <table className="w-full min-w-[620px] border-collapse text-left text-base leading-7">
                      <caption className="border-b border-border px-5 py-4 text-left font-medium text-foreground/80">
                        {section.table.caption}
                      </caption>
                      <thead className="bg-muted/50">
                        <tr>
                          {section.table.columns.map((column) => (
                            <th key={column} scope="col" className="border-b border-border px-5 py-4 font-bold">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row[0]} className="border-b border-border last:border-b-0">
                            <th scope="row" className="px-5 py-4 align-top font-semibold">{row[0]}</th>
                            {row.slice(1).map((cell, index) => (
                              <td key={index} className="px-5 py-4 align-top">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {section.evidence?.length ? (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-base leading-7">
                    {section.evidence.map((id) => {
                      const source = patternSources[id];
                      return source ? (
                        <a
                          key={id}
                          href={source.url}
                          className="font-semibold underline underline-offset-4"
                          aria-label={`Study ${evidenceIds.indexOf(id) + 1}: ${source.title}`}
                        >
                          Study [{evidenceIds.indexOf(id) + 1}]
                        </a>
                      ) : null;
                    })}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
          {article.interpretation && <section className="mt-10">
            <h3 className="text-2xl font-bold leading-snug text-foreground">
              Reading the connections
            </h3>
            <p className="mt-4">{article.interpretation}</p>
          </section>}
          <section
            aria-labelledby={`${headingId}-sources`}
            className="mt-12 border-t border-border pt-7"
          >
            <h3 id={`${headingId}-sources`} className="text-xl font-bold text-foreground">
              Research behind this explanation
            </h3>
            <ol className="mt-5 space-y-5 text-base leading-7">
              {evidenceIds.map((id, index) => {
                const source = patternSources[id];
                return source ? (
                  <li key={id}>
                    <a href={source.url} className="font-semibold underline underline-offset-4">
                      [{index + 1}] {source.title}
                    </a>
                    <p className="mt-1 text-foreground/80">{source.scope}</p>
                  </li>
                ) : null;
              })}
            </ol>
          </section>
        </article>
        {relatedRecipes.length ? (
          <section
            aria-labelledby={`${headingId}-related`}
            className="mt-16 border-t border-border pt-10"
          >
            <h2 id={`${headingId}-related`} className="text-2xl font-extrabold">
              Related movement patterns
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-foreground/85">
              Each connection below explains a particular observation or comparison. These are not
              confirmed causes of your movement.
            </p>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {relatedRecipes.map((recipe) => (
                <RelatedPatternCard key={recipe.slug} recipe={recipe} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </section>
  );
}

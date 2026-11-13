import axe from "axe-core";
export async function auditPage() {
  await document.fonts.ready;
  const result = await axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
  });
  console.info(
    "ACCESSIBILITY_AUDIT",
    JSON.stringify({
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      passes: result.passes.length,
      incomplete: result.incomplete.map((v) => v.id),
    }),
  );
}

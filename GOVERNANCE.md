# Governance

## Authority

Ivy Waters International publishes official editions of Ivy Waters
International Standards. The public repository makes the catalog open under
CC BY 4.0; openness does not remove the distinction between an official Ivy
Waters edition and an independent adaptation.

## Versioning

- **MAJOR:** framework convictions, alignment model, translation boundary,
  stage architecture, or domain architecture changes.
- **MINOR:** catalog additions or capability-level revisions.
- **PATCH:** editorial clarification, typo, example, formatting, or generated
  artifact correction with no capability-meaning change.

Every official release records what changed and why. A release must never
silently reinterpret historical evidence.

## Permanent identifiers

Identifiers such as `EY-M-01`, `K.C-02`, and `G3.M-01` are permanent. They are
never reused, renumbered, or reassigned to a different capability. If a
capability materially changes, the official catalog assigns a new identifier
and retains the old identifier for historical resolution.

## Official change process

1. A dated proposal describes the exact change and rationale.
2. The product owner reviews capability or framework changes.
3. The canonical catalog source is updated.
4. human-readable, machine-readable, and PDF artifacts are regenerated.
5. automated checks verify counts, IDs, public boundaries, and artifact drift.
6. the changelog and release metadata are updated in the same release.

## Public boundary

Official public artifacts contain only Ivy Waters' parent-facing framework.
External-framework translation mappings remain a separate, internal
registrar-only interoperability surface. They are not part of this open
repository and are not an authority over the Ivy Waters framework.

## License and adaptations

Official repository content is published under CC BY 4.0. Anyone may share or
adapt it under that license. Independent adaptations must provide attribution,
link the license, indicate changes, retain prior modification notices, avoid
additional restrictions, and avoid implying endorsement.

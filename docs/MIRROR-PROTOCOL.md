# Deterministic mirror protocol

The public repository begins as a screened mirror of the private canonical
catalog. It must never receive direct access to the private ecosystem, learner
records, internal translation metadata, deployment credentials, or a broad
repository token.

## Release flow

1. Approve the release identity and catalog change in the private ecosystem.
2. Generate the public-safe JSON from the canonical catalog.
3. Run the private external-name, markup, catalog-count, stable-ID, and artifact
   drift gates.
4. Build a fresh public package from an explicit allowlist, never by copying a
   whole source directory and deleting files afterward.
5. Create `PUBLICATION-MANIFEST.json` and `SHA256SUMS` from the staged bytes.
6. Run the public package validator in an isolated directory.
7. Run secret, privacy, third-party-IP, and external-framework leak scans over
   the exact outgoing tree.
8. Human-review the manifest and outgoing diff.
9. Open a pull request in the public repository from a narrowly scoped release
   identity or GitHub App.
10. Require the public repository's validation workflow before merging the
    exact reviewed SHA.

## Future canonical-source transition

Accepted ADR-0042 permits the public-safe catalog to become canonical later.
That is a separate architectural change. If adopted, pin the public catalog by
immutable commit or release digest inside the private ecosystem and keep
registrar translation data as a private overlay keyed by permanent standard
identifier. Never add private metadata to the public source tree.

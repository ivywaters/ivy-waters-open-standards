import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const releasesRoot = join(projectRoot, "releases");
const expectedLicenseUrl = "https://creativecommons.org/licenses/by/4.0/";
const expectedSpdx = "CC-BY-4.0";
const externalNamePattern = /cambridge|baccalaureate|\bIB\b|\bPYP\b|\bMYP\b/i;
const closedLicensePattern =
  /all rights reserved|catalog itself remains proprietary|stays proprietary|no[- ]derivatives|redistribute this file unmodified|competing standards product/i;
const publicationManifestPath = join(projectRoot, "PUBLICATION-MANIFEST.json");

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function collectKeys(value, target = new Set()) {
  if (Array.isArray(value)) {
    for (const entry of value) collectKeys(entry, target);
    return target;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      target.add(key);
      collectKeys(entry, target);
    }
  }
  return target;
}

async function releaseFiles() {
  const versions = await readdir(releasesRoot, { withFileTypes: true });
  const files = [];
  for (const version of versions) {
    if (!version.isDirectory()) continue;
    const directory = join(releasesRoot, version.name);
    const entries = await readdir(directory, { withFileTypes: true });
    files.push(
      ...entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => join(directory, entry.name)),
    );
  }
  return files.toSorted();
}

async function validateRelease(file, release, raw) {
  const expectedFilename = `ivy-waters-international-standards.v${release.version}.json`;
  invariant(basename(file) === expectedFilename, `release_filename_mismatch:${file}`);
  invariant(release.name === "The Ivy Waters International Standards", "release_name_mismatch");
  invariant(release.publisher === "Ivy Waters International", "release_publisher_mismatch");
  invariant(/^\d+\.\d+\.\d+$/.test(release.version), "release_version_invalid");
  invariant(/^\d{4}-\d{2}-\d{2}$/.test(release.versionDate), "release_date_invalid");
  invariant(!closedLicensePattern.test(raw), "release_closed_license_language");
  invariant(!externalNamePattern.test(raw), "standards_external_name_leak");

  invariant(release.license?.spdx === expectedSpdx, "release_license_spdx_mismatch");
  invariant(release.license?.url === expectedLicenseUrl, "release_license_url_mismatch");
  invariant(
    release.notice === "© 2026 Ivy Waters International. Licensed under CC BY 4.0.",
    "release_notice_mismatch",
  );
  invariant(typeof release.license?.attribution === "string", "release_attribution_missing");
  invariant(typeof release.license?.source === "string", "release_source_missing");
  invariant(
    typeof release.license?.modificationNotice === "string",
    "release_modification_notice_missing",
  );

  const grades = release.grades ?? [];
  const guides = grades.flatMap((grade) => grade.guides ?? []);
  const standards = guides.flatMap((guide) => guide.standards ?? []);
  invariant(grades.length === release.counts?.grades, "release_grade_count_mismatch");
  invariant(guides.length === release.counts?.guides, "release_guide_count_mismatch");
  invariant(standards.length === release.counts?.standards, "release_standard_count_mismatch");
  invariant(grades.length === 10, "release_expected_grade_count_mismatch");
  invariant(guides.length === 52, "release_expected_guide_count_mismatch");
  invariant(standards.length === 138, "release_expected_standard_count_mismatch");
  invariant(Math.min(...grades.map((grade) => grade.ageFrom)) === 3, "release_minimum_age_mismatch");
  invariant(Math.max(...grades.map((grade) => grade.ageTo)) === 14, "release_maximum_age_mismatch");

  const ids = standards.map((standard) => standard.id);
  invariant(ids.every((id) => typeof id === "string" && id.length > 0), "release_standard_id_missing");
  invariant(new Set(ids).size === ids.length, "release_duplicate_standard_id");
  invariant(
    standards.every((standard) => typeof standard.code === "string" && standard.code.length > 0),
    "release_standard_code_missing",
  );

  const publicKeys = collectKeys(release);
  for (const privateKey of ["benchmarkEquivalent", "translation", "translations", "externalMappings"]) {
    invariant(!publicKeys.has(privateKey), `release_private_key_leak:${privateKey}`);
  }

  const checksumPath = join(dirname(file), "SHA256SUMS");
  const checksumLine = (await readFile(checksumPath, "utf8")).trim();
  const [expectedChecksum, expectedChecksumFile] = checksumLine.split(/\s+/u);
  const actualChecksum = createHash("sha256").update(raw).digest("hex");
  invariant(expectedChecksumFile === basename(file), "release_checksum_filename_mismatch");
  invariant(expectedChecksum === actualChecksum, "release_checksum_mismatch");
}

const files = await releaseFiles();
invariant(files.length > 0, "release_json_missing");

const publicationManifest = JSON.parse(await readFile(publicationManifestPath, "utf8"));
invariant(publicationManifest.schemaVersion === 1, "publication_manifest_schema_mismatch");
invariant(publicationManifest.visibility === "public", "publication_manifest_visibility_mismatch");
invariant(publicationManifest.license?.spdx === expectedSpdx, "publication_manifest_license_mismatch");
invariant(files.length === 1, "publication_manifest_release_count_mismatch");

for (const file of files) {
  const raw = await readFile(file, "utf8");
  const release = JSON.parse(raw);
  await validateRelease(file, release, raw);
  const relativeReleasePath = file.slice(`${projectRoot}/`.length);
  const actualChecksum = createHash("sha256").update(raw).digest("hex");
  invariant(
    publicationManifest.release?.file === relativeReleasePath,
    "publication_manifest_release_path_mismatch",
  );
  invariant(
    publicationManifest.release?.sha256 === actualChecksum,
    "publication_manifest_checksum_mismatch",
  );
  invariant(
    publicationManifest.release?.version === release.version,
    "publication_manifest_version_mismatch",
  );
  console.log(
    `validated ${basename(file)}: ${release.counts.grades} stages · ${release.counts.guides} guides · ${release.counts.standards} standards · ${release.license.spdx}`,
  );
}

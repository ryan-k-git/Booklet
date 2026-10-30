const fs = require("fs");
const path = require("path");
const { Compilation, sources } = require("webpack");

const PAGES_DIR = path.resolve(__dirname, "pages");
const IMAGE_EXTENSION = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

const listPages = () => {
  let entries;

  try {
    entries = fs.readdirSync(PAGES_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSION.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((name) => `pages/${name}`);
};

/*
 * Emits pages/manifest.json for every build by scanning /pages.
 * The booklet reads this manifest at runtime, so adding or removing an image
 * is all that is needed for the page order to update.
 */
class PagesManifestPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("PagesManifestPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "PagesManifestPlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const manifest = `${JSON.stringify(listPages(), null, 2)}\n`;

          compilation.emitAsset("pages/manifest.json", new sources.RawSource(manifest));
        }
      );
    });

    compiler.hooks.afterCompile.tap("PagesManifestPlugin", (compilation) => {
      compilation.contextDependencies.add(PAGES_DIR);
    });
  }
}

module.exports = PagesManifestPlugin;

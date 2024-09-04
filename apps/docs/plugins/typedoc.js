const fs = require('node:fs');
const path = require('node:path');
const slug = require('slug');

const REDIRECTS = {
  '../globals.md': '/docs/api/',
  '../README.md': '/docs/api/',
};

function replaceLinks(navigation, substr, groupValue) {
  if (REDIRECTS[groupValue]) {
    return substr.replace(groupValue, REDIRECTS[groupValue]);
  }

  for (const item of navigation) {
    for (const child of item.children) {
      const fileName = path.basename(child.path);
      if (groupValue.includes(fileName)) {
        return substr.replace(
          groupValue,
          `/docs/api/${slug(item.title)}/${child.title}.md`
        );
      }
    }
  }
}

function removeFolder(path) {
  fs.rmSync(path, { recursive: true, force: true });
}

function validateFolder(path, remove = true) {
  if (remove) removeFolder(path);

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

module.exports = {
  /**
   * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
   */
  load(app) {
    app.renderer.markdownHooks.on('content.begin', (args) => {});
    app.renderer.postRenderAsyncJobs.push(async (renderer) => {
      const basePath = path.resolve(
        process.cwd(),
        'apps',
        'docs',
        'docs',
        'api'
      );
      const navigation = renderer.navigation;

      validateFolder(basePath, false);

      for (const category of navigation) {
        const catBasePath = path.resolve(basePath, slug(category.title));
        const def = {
          label: category.title,
          position: slug(category.title) === 'other' ? navigation.length : 2,
          link: {
            type: 'generated-index',
          },
        };

        validateFolder(catBasePath);

        for (const child of category.children) {
          const sourceFilePath = path.resolve(
            renderer.outputDirectory,
            child.path
          );
          let contents = fs.readFileSync(sourceFilePath).toString();

          contents = contents.replace(
            /\[[a-zA-Z0-9\.\/\-`@*]*\]\(([a-zA-Z0-9\.\/\-]*)\)/gi,
            (substr, groupValue) => {
              return replaceLinks(navigation, substr, groupValue);
            }
          );

          fs.writeFileSync(
            path.resolve(catBasePath, child.title + '.md'),
            contents
          );
        }

        fs.writeFileSync(
          path.resolve(catBasePath, '_category_.json'),
          JSON.stringify(def)
        );
      }

      removeFolder(renderer.outputDirectory);
    });
  },
};

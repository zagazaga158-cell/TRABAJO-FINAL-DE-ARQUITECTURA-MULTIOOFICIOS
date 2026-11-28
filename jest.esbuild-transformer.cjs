const esbuild = require('esbuild');

module.exports = {
  process(sourceText, sourcePath) {
    const loader = sourcePath.endsWith('.tsx')
      ? 'tsx'
      : sourcePath.endsWith('.ts')
        ? 'ts'
        : sourcePath.endsWith('.jsx')
          ? 'jsx'
          : 'js';

    const result = esbuild.transformSync(sourceText, {
      loader,
      format: 'cjs',
      target: 'node22',
      sourcemap: 'inline',
      sourcefile: sourcePath
    });

    return { code: result.code };
  }
};

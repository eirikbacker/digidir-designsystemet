import * as tokenStudio from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import { outputReferencesFilter } from 'style-dictionary/utils';
import type { Config, TransformedToken } from 'style-dictionary/types';
import * as R from 'ramda';
import type { ThemeObject } from '@tokens-studio/types';

import { permutateThemes as permutateThemes_ } from './permutateThemes';
import { nameKebab, typographyShorthand, sizeRem } from './transformers.js';
import { jsTokens } from './formats/js-tokens.js';
import { cssVariables } from './formats/css-variables.js';
import { cssClassesTypography } from './formats/css-classes';
import { makeEntryFile } from './actions.js';
import { getType } from './utils';

void tokenStudio.registerTransforms(StyleDictionary);

const prefix = 'ds';
const basePxFontSize = 16;
const separator = '_';

const fileHeader = () => [`These files are generated from design tokens defind using Token Studio`];

StyleDictionary.registerTransform(sizeRem);
StyleDictionary.registerTransform(nameKebab);
StyleDictionary.registerTransform(typographyShorthand);

StyleDictionary.registerFormat(jsTokens);
StyleDictionary.registerFormat(cssVariables);
StyleDictionary.registerFormat(cssClassesTypography);

StyleDictionary.registerAction(makeEntryFile);

const dsTransformers = [
  nameKebab.name,
  `ts/resolveMath`,
  'ts/size/px',
  sizeRem.name,
  'ts/typography/fontWeight',
  typographyShorthand.name,
  'ts/color/modifiers',
  'ts/color/css/hexrgba',
  'ts/size/lineheight',
  'ts/shadow/css/shorthand',
];

const processThemeName = R.pipe(R.replace(`${separator}semantic`, ''), R.toLower, R.split(separator));

const outputColorReferences = (token: TransformedToken) => {
  if (
    R.test(/accent|neutral|brand1|brand2|brand3|success|danger|warning/, token.name) &&
    R.includes('semantic/color', token.filePath)
  ) {
    return true;
  }

  return false;
};

export type IsCalculatedToken = (token: TransformedToken, options?: Config) => boolean;

export const permutateThemes = ($themes: ThemeObject[]) =>
  permutateThemes_($themes, {
    separator,
  });

type GetConfig = (options: {
  mode?: string;
  theme?: string;
  semantic?: string;
  fontSize?: string;
  typography?: string;
  outPath?: string;
}) => Config;

export const colorModeVariables: GetConfig = ({ mode = 'light', outPath, theme }) => {
  const selector = `${mode === 'light' ? ':root, ' : ''}[data-ds-color-mode="${mode}"]`;

  return {
    log: { verbosity: 'silent' },
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        // custom
        outPath,
        mode,
        theme,
        selector,
        //
        prefix,
        buildPath: `${outPath}/${theme}/`,
        transforms: dsTransformers,
        actions: [makeEntryFile.name],
        files: [
          {
            destination: `color-mode/${mode}.css`,
            format: cssVariables.name,
            filter: (token) => {
              const type = getType(token);

              return !token.isSource && type === 'color';
            },
          },
        ],
        options: {
          fileHeader,
          outputReferences: (token, options) => outputColorReferences(token) && outputReferencesFilter(token, options),
        },
      },
    },
  };
};

export const semanticVariables: GetConfig = ({ outPath, theme }) => {
  const selector = `:root`;

  /**
   * This is a workaround for our formatters to support transative transformers while retaining outputReference.
   *
   * This function will wrap formatted token in `calc()`
   *
   * @example  --ds-spacing-1: var(--ds-spacing-base)*1; ->  --ds-spacing-0: calc(var(--ds-spacing-base)*1);
   */
  const isCalculatedToken: IsCalculatedToken = (token: TransformedToken) => {
    const type = getType(token);

    return ['spacing', 'sizing', 'borderRadius'].includes(type);
  };

  return {
    log: { verbosity: 'silent' },
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        // custom
        outPath,
        theme,
        basePxFontSize,
        isCalculatedToken,
        selector,
        //
        prefix,
        buildPath: `${outPath}/${theme}/`,
        transforms: dsTransformers,
        actions: [makeEntryFile.name],
        files: [
          {
            destination: `semantic.css`,
            format: cssVariables.name,
            filter: (token) => {
              const type = getType(token);
              return (
                (!token.isSource || isCalculatedToken(token)) &&
                !['color', 'fontWeights', 'fontFamilies'].includes(type)
              );
            },
          },
        ],
        options: {
          fileHeader,
          outputReferences: (token, options) => isCalculatedToken(token) && outputReferencesFilter(token, options),
        },
      },
    },
  };
};

export const typescriptTokens: GetConfig = ({ mode = 'unknown', outPath, theme }) => {
  return {
    log: { verbosity: 'silent' },
    preprocessors: ['tokens-studio'],
    platforms: {
      ts: {
        prefix,
        basePxFontSize,
        transforms: dsTransformers,
        buildPath: `${outPath}/${theme}/`,
        files: [
          {
            destination: `${mode}.ts`,
            format: jsTokens.name,
            outputReferences: outputColorReferences,
            filter: (token: TransformedToken) => {
              if (R.test(/primitives\/modes|\/themes/, token.filePath)) {
                return false;
              }

              if (
                R.test(/accent|neutral|brand1|brand2|brand3|success|danger|warning/, token.name) ||
                R.includes('semantic', token.filePath)
              ) {
                return true;
              }

              return false;
            },
          },
        ],
        options: {
          fileHeader,
        },
      },
    },
  };
};

export const typographyCSS: GetConfig = ({ outPath, theme, typography }) => {
  // const selector = `${typography === 'default' ? ':root, ' : ''}[data-ds-typography="${typography}"]`;

  return {
    log: { verbosity: 'silent' },
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        prefix,
        typography,
        // selector,
        buildPath: `${outPath}/${theme}/`,
        basePxFontSize,
        transforms: [nameKebab.name, 'ts/size/lineheight', 'ts/size/px', 'ts/typography/fontWeight'],
        files: [
          {
            destination: `typography.css`,
            format: cssClassesTypography.name,
            filter: (token) => {
              return (
                ['typography', 'fontWeights', 'fontFamilies'].includes(getType(token)) &&
                !(token.path[0] || '').startsWith('theme')
              );
            },
          },
        ],
        options: {
          fileHeader,
        },
      },
    },
  };
};

type getConfigs = (
  getConfig: GetConfig,
  outPath: string,
  tokensDir: string,
  themes: Record<string, string[]>,
) => { name: string; config: Config }[];

export const getConfigs: getConfigs = (getConfig, outPath, tokensDir, themes) =>
  Object.entries(themes)
    .map(([name, tokensets]) => {
      const setsWithPaths = tokensets.map((x) => `${tokensDir}/${x}.json`);

      const [mode, theme, semantic, fontSize, typography] = processThemeName(name);

      const paritionPrimitives = /(?!.*global\.json).*primitives.*/;
      const [source, include] = R.partition(R.test(paritionPrimitives), setsWithPaths);

      const config_ = getConfig({
        outPath,
        theme,
        mode,
        semantic,
        fontSize,
        typography,
      });

      const config = {
        ...config_,
        source,
        include,
      };

      return { name: `${theme}-${mode}`, config };
    })
    .sort();

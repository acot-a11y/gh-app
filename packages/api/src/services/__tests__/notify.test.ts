import { createSummary } from '@acot/factory';
import type { PrCommentMeta } from '@acot/gh-app-types';
import type { Summary } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { format } from '../notify';

const createPrCommentMeta = (
  props: PartialDeep<PrCommentMeta> = {},
): PrCommentMeta => ({
  commit: 'abc12345',
  origin: 'http://localhost:3000',
  ...props,
  core: {
    version: '0.0.0',
    ...(props?.core ?? {}),
  },
  runner: {
    name: 'test',
    version: '0.0.0',
    ...(props?.core ?? {}),
  },
});

describe('NotifyService', () => {
  describe('internal#format', () => {
    test.each<[string, PrCommentMeta, Summary]>([
      ['empty', createPrCommentMeta(), createSummary()],
      [
        'mixed',
        createPrCommentMeta(),
        createSummary({
          rules: {
            '@acot/test/rule1': {
              duration: 1,
              passCount: 2,
              warningCount: 3,
              errorCount: 4,
            },
            '@acot/test/rule2': {
              duration: 2,
              passCount: 1,
            },
          },
          results: [
            {
              url: 'http://localhost:3000/',
              passCount: 2,
              warningCount: 3,
              errorCount: 2,
              rules: {
                '@acot/test/rule1': {
                  passCount: 1,
                  warningCount: 3,
                },
                '@acot/test/rule2': {
                  passCount: 1,
                },
              },
              results: [
                {
                  status: 'pass',
                  rule: '@acot/test/rule1',
                },
                {
                  status: 'warn',
                  rule: '@acot/test/rule1',
                  message: 'group1',
                },
                {
                  status: 'warn',
                  rule: '@acot/test/rule1',
                  message: 'group1',
                },
                {
                  status: 'warn',
                  rule: '@acot/test/rule1',
                  message: 'group1',
                  selector: '#rule1-warn3',
                  help: 'https://acot.example/help',
                },
                {
                  status: 'pass',
                  rule: '@acot/test/rule2',
                },
              ],
            },
            {
              url: 'http://localhost:3000/path/to',
              errorCount: 4,
              rules: {
                '@acot/test/rule1': {
                  errorCount: 4,
                },
              },
              results: [
                {
                  status: 'error',
                  rule: '@acot/test/rule1',
                  message: 'group1',
                  selector: '#rule1-error1',
                },
                {
                  status: 'error',
                  rule: '@acot/test/rule1',
                  message: 'group1',
                  selector: '#rule1-error2',
                },
                {
                  status: 'error',
                  rule: '@acot/test/rule1',
                  message: 'group2',
                  help: 'https://acot.example/help',
                },
                {
                  status: 'error',
                  rule: '@acot/test/rule1',
                  message: 'group2',
                  help: 'https://acot.example/help',
                },
              ],
            },
            {
              url: 'http://localhost:3000/empty',
              rules: {},
              results: [],
            },
          ],
        }),
      ],
    ])('%s', (_, meta, summary) => {
      expect(format(meta, summary)).toMatchSnapshot();
    });
  });
});

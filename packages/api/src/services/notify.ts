import type { PrCommentMeta } from '@acot/gh-app-types';
import type { Summary } from '@acot/types';
import { Align, getMarkdownTable } from 'markdown-table-ts';
import ms from 'pretty-ms';
import { GH_APP_LOGIN } from '../constants';
import type { GhIssueComment } from '../drivers/github';
import type { DriverRegistry } from '../drivers/registry';
import type { Logger } from '../logging';
import type { ServiceOutput } from './utils';
import { output } from './utils';

export type NotifyCommentInput = {
  token: string;
  owner: string;
  repo: string;
  number: number;
  meta: PrCommentMeta;
  summary: Summary;
};

export type NotifyCommentOutput = ServiceOutput<
  GhIssueComment,
  {
    error: string;
  }
>;

export type NotifyService = {
  comment: (input: NotifyCommentInput) => Promise<NotifyCommentOutput>;
};

const formatMessage = (message: string) => {
  return message.trim().replace(/(?:\r\n|\r|\n)/g, '<br />');
};

export const format = (meta: PrCommentMeta, summary: Summary) => {
  const symbols = {
    success: ':white_check_mark:',
    error: ':x:',
    warning: ':warning:',
  };

  const count = (n: number) => (n > 0 ? `${n}` : '-');

  // Environment
  let body = `\n## Run details

${getMarkdownTable({
  table: {
    head: ['', ''],
    body: [
      ['**Core**', `\`v${meta.core.version}\``],
      ['**Runner**', `\`${meta.runner.name} v${meta.runner.version}\``],
      ['**Origin**', meta.origin],
      ['**URLs**', `${summary.results.length}`],
      ['**Duration**', `${ms(summary.duration)}`],
      ['**Commit**', meta.commit],
    ],
  },
  alignment: [Align.Left, Align.Left, Align.Left],
  alignColumns: false,
})}
`;

  // Summary
  if (summary.results.length > 0) {
    body += `\n## Audit summary

${getMarkdownTable({
  table: {
    head: ['', 'Rule', 'Duration', 'Pass', 'Error', 'Warning'],
    body: [
      ...Object.entries(summary.rules).map(([rule, result]) => {
        let status = symbols.success;
        if (result.errorCount > 0) {
          status = symbols.error;
        } else if (result.warningCount > 0) {
          status = symbols.warning;
        }

        return [
          status,
          `\`${rule}\``,
          ms(result.duration),
          count(result.passCount),
          count(result.errorCount),
          count(result.warningCount),
        ];
      }),
      [
        '',
        '',
        '',
        count(summary.passCount),
        count(summary.errorCount),
        count(summary.warningCount),
      ],
    ],
  },
  alignment: [
    Align.Center,
    Align.Left,
    Align.Right,
    Align.Right,
    Align.Right,
    Align.Right,
  ],
  alignColumns: false,
})}
`;
  }

  // Details
  body += '\n## Audit details\n\n';
  if (summary.results.length === 0) {
    body += `:tada: All checks pass :tada:`;
  } else {
    const lines = [] as string[];

    summary.results.forEach((result) => {
      if (result.results.length === 0) {
        return;
      }

      if (result.errorCount === 0 && result.warningCount === 0) {
        return;
      }

      const short = [
        `${symbols.success} ${result.passCount}`,
        `${symbols.error} ${result.errorCount}`,
        `${symbols.warning} ${result.warningCount}`,
      ].join(' ');

      const path = result.url.replace(meta.origin, '');

      lines.push(`<details>
<summary><a href="${result.url}">${path}</a> - ${short}</summary>

${getMarkdownTable({
  table: {
    head: ['', 'Rule', 'Details'],
    body: [
      ...result.results.reduce<
        Map<
          string,
          {
            status: string;
            rule: string;
            message: string;
            help: string;
            selectors: string[];
          }
        >
      >((acc, cur) => {
        if (cur.status === 'pass') {
          return acc;
        }

        const status = cur.status === 'error' ? symbols.error : symbols.warning;
        const rule = cur.rule;
        const message = formatMessage(cur.message);
        const help = cur.help ? formatMessage(cur.help) : '';
        const key = status + rule + message + help;

        if (acc.has(key)) {
          if (cur.selector) {
            acc.get(key)!.selectors.push(cur.selector);
          }
        } else {
          const selectors = cur.selector ? [cur.selector] : [];
          acc.set(key, {
            status,
            rule,
            message,
            help,
            selectors,
          });
        }

        return acc;
      }, new Map()),
    ].map(([, entry]) => {
      const body = [entry.message];

      if (entry.selectors.length > 0 || entry.help) {
        body.push(`<br />`);
      }

      entry.selectors.forEach((selector) => {
        body.push(`<br />at \`${selector}\``);
      });

      if (entry.help) {
        body.push(`<br />see ${entry.help}`);
      }

      return [entry.status, `\`${entry.rule}\``, body.join('')];
    }),
  },
  alignment: [Align.Center, Align.Left, Align.Left],
  alignColumns: false,
})}
</details>`);
    });

    body += lines.join('\n\n');
  }

  // Footer
  body += `<p align="right">Generated by :heart: <a href="https://github.com/acot-a11y/acot">acot</a>.</p>`;

  return body;
};

export const createNotifyService = (
  logger: Logger,
  driver: DriverRegistry,
): NotifyService => {
  const github = driver.resolve('github');

  return {
    comment: async ({ token, owner, repo, number, meta, summary }) => {
      const body = format(meta, summary);

      logger.debug({ body: body.slice(0, 200) }, 'formatted body');

      try {
        const comments = await github.getIssueCommentList({
          token,
          owner,
          repo,
          issue_number: number,
          per_page: 100,
          page: 1,
        });

        const found = comments.findIndex(
          ({ user }) => user.type === 'Bot' && user.login === GH_APP_LOGIN,
        );

        logger.debug({ found }, 'comments search index');
        if (found >= 0) {
          logger.debug({ comment: comments[found].id }, 'found comment id');
        }

        const comment =
          found < 0
            ? await github.createIssueComment({
                token,
                owner,
                repo,
                issue_number: number,
                body,
              })
            : await github.updateIssueComment({
                token,
                owner,
                repo,
                comment_id: comments[found].id,
                body,
              });

        logger.debug(
          { comment },
          `${found < 0 ? 'created' : 'updated'} comment`,
        );

        return output(true, comment);
      } catch (e) {
        logger.debug('comment failure');
        logger.error(e);
        return output(false, {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
  };
};

createNotifyService.inject = ['logger', 'driver'] as const;

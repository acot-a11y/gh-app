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

const format = (meta: PrCommentMeta, summary: Summary) => {
  const symbols = {
    success: ':white_check_mark:',
    error: ':x:',
    warning: ':warning:',
  };

  const passCount = (n: number) => (n > 0 ? `${n}` : '-');
  const errorCount = (n: number) => (n > 0 ? `${n}` : '-');
  const warningCount = (n: number) => (n > 0 ? `${n}` : '-');

  // Environment
  let body = `\n## Run details

${getMarkdownTable({
  table: {
    head: ['', ''],
    body: [
      ['**Core**', `\`v${meta.core.version}\``],
      ['**Runner**', `\`${meta.runner.name} v${meta.runner.version}\``],
      ['**Origin**', meta.origin],
      ['**Duration**', `${ms(summary.duration)}`],
      ['**Commit**', meta.commit],
    ],
  },
  alignment: [Align.Left, Align.Left, Align.Left],
})}
`;

  // Summary
  body += `## Audit summary

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
          passCount(result.passCount),
          errorCount(result.errorCount),
          warningCount(result.warningCount),
        ];
      }),
      [
        '',
        '',
        ms(summary.duration),
        passCount(summary.passCount),
        errorCount(summary.errorCount),
        warningCount(summary.warningCount),
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
})}
`;

  // Details
  body += '\n## Audit details\n';
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

      lines.push(`<details>
<summary><a href="${result.url}">${result.url}</a> - ${short}</summary>

${getMarkdownTable({
  table: {
    head: ['', 'Rule', 'Details'],
    body: result.results.reduce<string[][]>((acc, cur) => {
      if (cur.status === 'pass') {
        return acc;
      }

      const body = [formatMessage(`${cur.message}`)];

      if (cur.selector || cur.help) {
        body.push(`<br />`);
      }
      if (cur.selector) {
        body.push(`<br />at \`${cur.selector}\``);
      }
      if (cur.help) {
        body.push(`<br />see ${formatMessage(cur.help)}`);
      }

      acc.push([
        cur.status === 'error' ? symbols.error : symbols.warning,
        `\`${cur.rule}\``,
        body.join(''),
      ]);

      return acc;
    }, []),
  },
  alignment: [Align.Center, Align.Left, Align.Left],
})}
</details>`);
    });

    body += lines.join('\n');
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
        logger.error(e, 'comment failure');
        return output(false, {
          error: e instanceof Error ? e.message : '',
        });
      }
    },
  };
};

createNotifyService.inject = ['logger', 'driver'] as const;

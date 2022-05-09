import stringify from 'safe-json-stringify';
import bunyan from 'bunyan';
import bformat from 'bunyan-format';
import { RequestError } from 'got';
import { GCP_PROJECT_ID } from './constants';

export type TraceContext = {
  id: string;
  span: string;
};

export type LogRecord = {
  level: number;
  name: string;
  hostname: string;
  pid: number;
  time: string;
  msg: string;
  v: number;
  err?: {
    message: string;
    name: string;
    stack?: string;
  };
  trace?: TraceContext;
  [key: string]: unknown;
};

type LogRawStream = {
  write: (record: LogRecord) => void;
};

type CloudLoggingSeverity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

type CloudLoggingHttpRequest = {
  requestMethod?: string;
  requestUrl?: string;
  requestSize?: string;
  status?: number;
  responseSize?: string;
  userAgent: string;
  remoteIp?: string;
  serverIp?: string;
  referer?: string;
  latency?: string;
  cacheLookup?: boolean;
  cacheHit?: boolean;
  cacheValidatedWithOriginServer?: boolean;
  cacheFillBytes?: string;
  protocol?: string;
};

type CloudLoggingSourceLocation = {
  file?: string;
  line?: string;
  function?: string;
};

type CloudLoggingServiceContext = {
  service: string;
  version?: string;
  resourceType?: string;
};

type CloudLoggingEntry = {
  timestamp: string;
  severity: CloudLoggingSeverity;
  message: string;
  httpRequest?: CloudLoggingHttpRequest;
  serviceContext?: CloudLoggingServiceContext;
  'logging.googleapis.com/labels'?: Record<string, string>;
  'logging.googleapis.com/sourceLocation'?: CloudLoggingSourceLocation;
  'logging.googleapis.com/spanId'?: string;
  'logging.googleapis.com/trace'?: string;
  'logging.googleapis.com/trace_sampled'?: boolean;
  [key: string]: any;
};

const cloudLoggingSeverityMap: { [key: number]: CloudLoggingSeverity } = {
  [bunyan.FATAL]: 'CRITICAL',
  [bunyan.ERROR]: 'ERROR',
  [bunyan.WARN]: 'WARNING',
  [bunyan.INFO]: 'INFO',
  [bunyan.DEBUG]: 'DEBUG',
  [bunyan.TRACE]: 'DEBUG',
};

const createCloudLoggingReporter = (): LogRawStream => ({
  write: ({
    name,
    category,
    msg,
    level,
    err,
    time: timestamp,
    trace,
    v, // discard
    hostname, // discard
    pid, // discard
    ...rest
  }) => {
    const entry: CloudLoggingEntry = {
      ...rest,
      severity: cloudLoggingSeverityMap[level],
      message: msg,
      timestamp,
    };

    if (trace != null) {
      entry[
        'logging.googleapis.com/trace'
      ] = `projects/${GCP_PROJECT_ID}/traces/${trace.id}`;
      entry['logging.googleapis.com/spanId'] = trace.span;
    }

    if (err != null) {
      if (err instanceof RequestError) {
        entry.code = err.code;
        if (err.response != null) {
          entry.body = err.response.body;
          entry.requestUrl = err.response.url;
          entry.timings = err.response.timings;
          entry.retries = err.response.retryCount;
        }
      }

      const e = bunyan.stdSerializers.err(err);
      if (e?.stack != null) {
        entry.message = e.stack?.trim();
        entry.serviceContext = {
          service: name,
        };
      }
    }

    // eslint-disable-next-line no-console
    console.log(stringify(entry));
  },
});

export type LogObj = LogRecord | Error | string | unknown;

export type Logger = {
  trace: (obj?: LogObj, ...args: any[]) => void;
  debug: (obj?: LogObj, ...args: any[]) => void;
  info: (obj?: LogObj, ...args: any[]) => void;
  warn: (obj?: LogObj, ...args: any[]) => void;
  error: (obj?: LogObj, ...args: any[]) => void;
  fatal: (obj?: LogObj, ...args: any[]) => void;
};

export const createLogger = (trace?: TraceContext | null): Logger => {
  const level = bunyan.DEBUG;

  let logger = bunyan.createLogger({
    name: 'gh-app-api',
    streams: [],
    level,
  });

  switch (process.env.NODE_ENV) {
    case 'production':
      logger = logger.child({ trace });
      logger.addStream({
        type: 'raw',
        stream: createCloudLoggingReporter() as any,
        level,
      });
      break;

    case 'test':
      // nothing output
      break;

    default:
      logger.addStream({
        stream: bformat({
          outputMode: 'short',
        }),
        level,
      });
      break;
  }

  return logger;
};

createLogger.inject = ['trace'] as const;

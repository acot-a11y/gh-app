/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';
import * as tjs from 'typescript-json-schema';

const BASE_DIR = path.resolve(__dirname, '..', 'src');
const SCHEMA_DIR = path.resolve(BASE_DIR, 'schema');

const generate = async (file: string) => {
  const { dir, name } = path.parse(file);
  const output = path.join(dir, `${name}.json`);

  const program = tjs.getProgramFromFiles(
    [file],
    {
      resolveJsonModule: true,
      esModuleInterop: true,
    },
    BASE_DIR,
  );

  const generator = tjs.buildGenerator(program, {
    required: true,
  });

  if (generator == null) {
    console.error('invalid arguments:', file);
    process.exit(1);
  }

  const requests = generator
    .getMainFileSymbols(program)
    .filter((t) => /[a-z]+Request$/i.test(t));

  const json = requests.reduce<Record<string, any>>((acc, cur) => {
    acc[cur] = generator.getSchemaForSymbol(cur);
    return acc;
  }, {});

  fs.writeFileSync(output, JSON.stringify(json, null, '  '));
};

const files = fs
  .readdirSync(SCHEMA_DIR, { withFileTypes: true })
  .reduce<string[]>((acc, cur) => {
    if (cur.isFile() && cur.name !== 'index.ts' && cur.name.endsWith('.ts')) {
      acc.push(path.resolve(SCHEMA_DIR, cur.name));
    }
    return acc;
  }, []);

Promise.all([files.map((file) => generate(file))])
  .then()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

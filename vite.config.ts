import { defineConfig } from 'vite';
import * as glob from 'glob';
import * as path from 'path';

type FilesInputOption = { [fileName: string]: string };

const ROUTE_FILE_SUFFIX: string = '.route';
const ROUTES_BASE_PATH: string = './src/infrastructure/routes';
const ROUTES_PATH_PATTERN: string = `${ROUTES_BASE_PATH}/**/*${ROUTE_FILE_SUFFIX}.ts`;

const getActionName = (filePath: string) => path.parse(filePath).name.replace(new RegExp(`${ROUTE_FILE_SUFFIX}$`), '');

const getRessourceName = (filePath: string) => path.parse(filePath).dir.replace(new RegExp(`^${ROUTES_BASE_PATH}/`), '');

const getFileName = (filePath: string): string => `${getRessourceName(filePath)}.${getActionName(filePath)}`;

const getRoutesEntries = (): FilesInputOption =>
  glob.sync(ROUTES_PATH_PATTERN).reduce(
    (files: FilesInputOption, filePath: string): FilesInputOption => ({
      ...files,
      [getFileName(filePath)]: filePath
    }),
    {}
  );

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: getRoutesEntries(),
      formats: ['es']
    },
    rollupOptions: {
      input: getRoutesEntries(),
      output: {
        entryFileNames: '[name].mjs'
      }
    }
  }
});

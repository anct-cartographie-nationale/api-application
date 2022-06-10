import * as glob from 'glob';
import * as path from 'path';
import * as webpack from 'webpack';

const ROUTE_FILE_SUFFIX = '.route';
const ROUTES_BASE_PATH = './src/infrastructure/routes';
const ROUTES_PATH_PATTERN = `${ROUTES_BASE_PATH}/**/*${ROUTE_FILE_SUFFIX}.ts`;

const getActionName = (filePath: string) => path.parse(filePath).name.replace(new RegExp(`${ROUTE_FILE_SUFFIX}$`), '');

const getRessourceName = (filePath: string) => path.parse(filePath).dir.replace(new RegExp(`^${ROUTES_BASE_PATH}/`), '');

const getRoutesEntries = () =>
  glob.sync(ROUTES_PATH_PATTERN).reduce(
    (files: { [fileName: string]: string }, filePath: string) => ({
      [`${getRessourceName(filePath)}.${getActionName(filePath)}`]: filePath,
      ...files
    }),
    {}
  );

const config: webpack.Configuration = {
  mode: 'production',
  target: 'node',
  entry: getRoutesEntries(),
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        use: 'ts-loader',
        include: path.resolve(__dirname, 'src')
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    clean: true
  }
};

export default config;

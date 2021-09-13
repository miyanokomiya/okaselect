import { Config } from 'bili'

const config: Config = {
  plugins: {
    typescript2: {
      tsconfigOverride: {
        include: ['src'],
      },
    },
  },
  input: 'src/okaselect.ts',
  output: {
    format: ['cjs-min', 'esm-min', 'umd-min'],
    moduleName: 'okaselect',
  },
  banner: true,
}

export default config

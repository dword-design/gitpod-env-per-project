import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginEnv from '@dword-design/tester-plugin-env'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import { createRequire } from 'module'
import outputFiles from 'output-files'

import self from './index.js'

const _require = createRequire(import.meta.url)

const cli = _require.resolve('./cli.js')

const getOutputEnvCode = variables => endent`
  import { pick } from '@dword-design/functions'

  const env = process.env |> pick(${JSON.stringify(variables)})

  for (const entry of Object.entries(env)) {
    console.log(\`\${entry[0]}: \${JSON.stringify(entry[1])}\`)
  }
`

export default tester(
  {
    json: async () => {
      await outputFiles({
        'env.js': getOutputEnvCode(['FOO', 'PACK_FOO']),
        'package.json': JSON.stringify({ name: 'pack', type: 'module' }),
      })
      expect(
        (await execaCommand(`eval "$(${cli})" && node env.js`, {
          env: {
            PACK_FOO: '{ "test": "test", "test2": "test2" }',
          },
          shell: true,
        }))
          |> await
          |> property('stdout'),
      ).toEqual('FOO: "{ \\"test\\": \\"test\\", \\"test2\\": \\"test2\\" }"')
    },
    'json multiline': async () => {
      await outputFiles({
        'env.js': getOutputEnvCode(['FOO', 'PACK_FOO']),
        'package.json': JSON.stringify({ name: 'pack', type: 'module' }),
      })
      expect(
        (await execaCommand(`eval "$(${cli})" && node env.js`, {
          env: {
            PACK_FOO: endent`
              {
                "test": "test",
                "test2": "test2"
              }
            `,
          },
          shell: true,
        }))
          |> await
          |> property('stdout'),
      ).toEqual(
        'FOO: "{\\n  \\"test\\": \\"test\\",\\n  \\"test2\\": \\"test2\\"\\n}"',
      )
    },
    'multiple variables': async () => {
      await outputFiles({
        'env.js': getOutputEnvCode(['FOO', 'PACK_FOO', 'BAR', 'PACK_BAR']),
        'package.json': JSON.stringify({ name: 'pack', type: 'module' }),
      })
      expect(
        (await execaCommand(`eval "$(${cli})" && node env.js`, {
          env: {
            PACK_BAR: 'test2',
            PACK_FOO: 'test',
          },
          shell: true,
        }))
          |> await
          |> property('stdout'),
      ).toEqual(endent`
        FOO: "test"
        BAR: "test2"
      `)
    },
    'no package': () =>
      expect(self()).rejects.toThrow(
        'Name or package.json could not be found.',
      ),
    scoped: async () => {
      await outputFiles({
        'env.js': getOutputEnvCode(['FOO', 'PACK_FOO']),
        'package.json': JSON.stringify({ name: '@scope/pack', type: 'module' }),
      })
      expect(
        (await execaCommand(`eval "$(${cli})" && node env.js`, {
          env: {
            PACK_FOO: 'test',
          },
          shell: true,
        }))
          |> await
          |> property('stdout'),
      ).toEqual(endent`
        FOO: "test"
      `)
    },
    spaces: async () => {
      await outputFiles({
        'env.js': getOutputEnvCode(['FOO', 'PACK_FOO']),
        'package.json': JSON.stringify({ name: 'pack', type: 'module' }),
      })
      expect(
        (await execaCommand(`eval "$(${cli})" && node env.js`, {
          env: {
            PACK_FOO: 'test  test2',
          },
          shell: true,
        }))
          |> await
          |> property('stdout'),
      ).toEqual('FOO: "test  test2"')
    },
  },
  [testerPluginEnv(), testerPluginTmpDir()],
)

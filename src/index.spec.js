import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginEnv from '@dword-design/tester-plugin-env'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'

import self from './index.js'

const _require = createRequire(import.meta.url)

export default tester(
  [
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: 'pack', type: 'module' })
      )
      expect(
        (await execaCommand(
          `eval $("${_require.resolve(
            './cli.js'
          )}") && echo "$FOO" && echo "$BAR" && echo "$PACK_FOO" && echo "$PACK_BAR"`,
          {
            env: {
              PACK_BAR: 'test2',
              PACK_FOO: 'test',
            },
            shell: true,
          }
        ))
          |> await
          |> property('stdout')
      ).toEqual(endent`
        test
        test2


      `)
    },
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: '@scope/pack' })
      )
      expect(
        (await execaCommand(
          `eval $("${_require.resolve(
            './cli.js'
          )}") && echo "$FOO" && echo "$PACK_FOO"`,
          {
            env: {
              PACK_FOO: 'test',
            },
            shell: true,
          }
        ))
          |> await
          |> property('stdout')
      ).toEqual(endent`
      
        test
      `)
    },
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: 'pack', type: 'module' })
      )
      expect(
        (await execaCommand(
          `eval $("${_require.resolve('./cli.js')}") && echo "$FOO"`,
          {
            env: {
              PACK_FOO: 'test  test2',
            },
            shell: true,
          }
        ))
          |> await
          |> property('stdout')
      ).toEqual('test  test2')
    },
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: 'pack', type: 'module' })
      )
      expect(
        (await execaCommand(
          `eval $("${_require.resolve('./cli.js')}") && echo "$FOO"`,
          {
            env: {
              PACK_FOO: '{ "test": "test", "test2": "test2" }',
            },
            shell: true,
          }
        ))
          |> await
          |> property('stdout')
      ).toEqual('{ "test": "test", "test2": "test2" }')
    },
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: 'pack', type: 'module' })
      )
      expect(
        (await execaCommand(
          `eval $("${_require.resolve('./cli.js')}") && echo "$FOO"`,
          {
            env: {
              PACK_FOO: endent`
                {
                  "test": "test",
                  "test2": "test2"
                }
              `,
            },
            shell: true,
          }
        ))
          |> await
          |> property('stdout')
      ).toEqual(endent`
        {
          "test": "test",
          "test2": "test2"
        }
      `)
    },
    async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: 'pack', type: 'module' })
      )
      expect(
        execaCommand(
          `eval $("${_require.resolve('./cli.js')}") && echo "$FOO"`,
          {
            env: {
              PACK_FOO: 'bar" --bla"',
            },
            shell: true,
          }
        )
          |> await
          |> property('stdout')
      ).toEqual('bar" --bla"')
    },
    () =>
      expect(self()).rejects.toThrow(
        'Name or package.json could not be found.'
      ),
  ],
  [testerPluginEnv(), testerPluginTmpDir()]
)

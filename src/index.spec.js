import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginEnv from '@dword-design/tester-plugin-env'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import self from '.'

export default tester(
  [
    async () => {
      await outputFile('package.json', JSON.stringify({ name: 'pack' }))
      process.env.PACK_FOO = 'test'
      process.env.PACK_BAR = 'test2'
      expect(await self()).toEqual(endent`
        export PACK_BAR=
        export PACK_FOO=
        export BAR="test2"
        export FOO="test"
      `)
    },
    async () => {
      await outputFile('package.json', JSON.stringify({ name: '@scope/pack' }))
      process.env.PACK_FOO = 'test'
      expect(await self()).toEqual(endent`
          export PACK_FOO=
          export FOO="test"
        `)
    },
    () =>
      expect(self()).rejects.toThrow(
        'Name or package.json could not be found.'
      ),
  ],
  [testerPluginEnv(), testerPluginTmpDir()]
)

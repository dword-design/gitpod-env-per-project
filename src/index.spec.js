import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import { outputFile } from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from '.'

export default tester(
  [
    async () => {
      await outputFile('package.json', JSON.stringify({ name: 'pack' }))
      process.env.PACK_FOO = 'test'
      process.env.PACK_BAR = 'test2'
      expect(await self()).toEqual(endent`
        export PACK_FOO=
        export PACK_BAR=
        export FOO="test"
        export BAR="test2"
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
  [
    {
      afterEach() {
        process.env = this.previousEnv
      },
      beforeEach() {
        this.previousEnv = { ...process.env }
      },
    },
    {
      transform: test => () => withLocalTmpDir(test),
    },
  ]
)

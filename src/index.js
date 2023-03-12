import {
  join,
  mapKeys,
  mapValues,
  pickBy,
  values,
} from '@dword-design/functions'
import { constantCase } from 'constant-case'
import loadPkg from 'load-pkg'
import parsePackagejsonName from 'parse-packagejson-name'
import sortKeys from 'sort-keys'

export default async () => {
  const packageConfig = await loadPkg()
  if (!packageConfig?.name) {
    throw new Error('Name or package.json could not be found.')
  }

  const packageName = parsePackagejsonName(packageConfig.name).fullName

  const prefix = `${packageName |> constantCase}_`

  const projectVariables =
    process.env |> pickBy((value, name) => name.startsWith(prefix)) |> sortKeys

  return (
    [
      ...(projectVariables
        |> mapKeys((value, name) => name.substr(prefix.length))
        |> mapValues((value, name) => `export ${name}="$${prefix}${name}"`)
        |> values),
      ...(projectVariables
        |> mapValues((value, name) => `unset ${name}`)
        |> values),
    ] |> join('\n')
  )
}

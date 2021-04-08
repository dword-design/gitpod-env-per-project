#!/usr/bin/env node

import api from '.'

const run = async () => {
  try {
    console.log(await api())
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
run()

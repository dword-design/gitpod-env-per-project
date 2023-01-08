#!/usr/bin/env node

import api from './index.js'

const run = async () => {
  try {
    console.log(await api())
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
run()

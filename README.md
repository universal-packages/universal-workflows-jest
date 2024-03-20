# Workflows Jest

[![npm version](https://badge.fury.io/js/@universal-packages%2Fworkflows-jest.svg)](https://www.npmjs.com/package/@universal-packages/workflows-jest)
[![Testing](https://github.com/universal-packages/universal-workflows-jest/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-workflows-jest/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-workflows-jest/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-workflows-jest)

Jest matchers for [Workflows](https://github.com/universal-packages/universal-workflows) testing.

## Install

```shell
npm install @universal-packages/workflows-jest

npm install @universal-packages/workflows
```

## Setup

Add the following to your `jest.config.js` or where you configure Jest:

```js
module.exports = {
  setupFilesAfterEnv: ['@universal-packages/workflows-jest']
}
```

## Matchers

### toHaveFinishWithStatus

```js
it('should be successful', async () => {
  const workflow = await workflowsJest.run('my-workflow')

  expect(workflow).toHaveFinishWithStatus('success')
})
```

### toHaveBeenBuildAndRun

```js
import { runApp } from './src'

workflowsJest.mockRuns()

it('should have been build and run', async () => {
  await runApp({ development: true })

  expect('development-workflow').toHaveBeenBuildAndRun()
})
```

### toHaveBeenBuildAndRunWithVariables

```js
import { runApp } from './src'

workflowsJest.mockRuns()

it('should have been build and run with variables', async () => {
  await runApp({ development: true, fast: true })

  expect('development-workflow').toHaveBeenBuildAndRunWithVariables({ fast: true })
})
```

### getCommandHistory

```js
it('should be ran commands', async () => {
  await workflowsJest.run('my-workflow')

  const commandHistory = workflowsJest.getCommandHistory()

  expect(commandHistory).toEqual([
    { command: 'git pull', workingDirectory: './my-repo' },
    { command: 'npm install', workingDirectory: './my-repo' }
  ])
})
```

## Typescript

In order for typescript to see the global types you need to reference the types somewhere in your project, normally `./src/globals.d.ts`.

```ts
/// <reference types="@universal-packages/workflows-jest" />
```

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).

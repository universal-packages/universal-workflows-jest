import { Workflow } from '@universal-packages/workflows'
import stripAnsi from 'strip-ansi'

import '../src'

workflowsJest.mockRuns()

describe('toHaveBeenBuildAndRunWithVariables', (): void => {
  it('mocks a workflow run and can tell if it was', async (): Promise<void> => {
    let workflow = Workflow.buildFrom('result-dependant', { variables: { hello: 'world' } })

    await workflow.run()

    expect('result-dependant').toHaveBeenBuildAndRunWithVariables({ hello: 'world' })
    expect('success').not.toHaveBeenBuildAndRunWithVariables({ hello: 'world' })
  })

  it('fails and tells a workflow was not build and run', async (): Promise<void> => {
    let workflow = Workflow.buildFrom('success', { variables: { hello: 'world' } })

    await workflow.run()

    let error: Error

    try {
      expect('result-dependant').toHaveBeenBuildAndRunWithVariables({ hello: 'world' })
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "result-dependant" to have been build and run with variables {"hello": "world"}, but it was not build and run at all')

    try {
      expect('success').not.toHaveBeenBuildAndRunWithVariables({ hello: 'world' })
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "success" not to have been build and run with variables {"hello": "world"}, but it was')

    try {
      expect('success').toHaveBeenBuildAndRunWithVariables({ hello: 'nop' })
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "success" to have been build and run with variables {"hello": "nop"}, but it was not')
  })
})

import { Workflow } from '@universal-packages/workflows'
import stripAnsi from 'strip-ansi'

import '../src'

workflowsJest.mockRuns()

describe('toHaveBeenBuildAndRun', (): void => {
  it('mocks a workflow run and can tell if it was', async (): Promise<void> => {
    let workflow = Workflow.buildFrom('result-dependant', { variables: { hello: 'world' } })

    await workflow.run()

    expect('result-dependant').toHaveBeenBuildAndRun()
    expect('success').not.toHaveBeenBuildAndRun()
  })

  it('fails and tells a workflow was not build and run', async (): Promise<void> => {
    let workflow = Workflow.buildFrom('success', { variables: {} })

    await workflow.run()

    let error: Error

    try {
      expect('result-dependant').toHaveBeenBuildAndRun()
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "result-dependant" to have been build and run, but it was not')

    try {
      expect('success').not.toHaveBeenBuildAndRun()
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "success" not to have been build and run, but it was')
  })
})

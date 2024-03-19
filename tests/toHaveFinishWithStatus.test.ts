import { Status } from '@universal-packages/workflows'
import stripAnsi from 'strip-ansi'

import '../src'

describe('toHaveFinishWithStatus', (): void => {
  it('asserts a workflow being finished with status success', async (): Promise<void> => {
    const workflow = await workflowsJest.run('success', {
      workflowsLocation: './tests/__fixtures__'
    })

    expect(workflow).toHaveFinishWithStatus(Status.Success)
  })

  it('asserts a workflow being finished with status failure', async (): Promise<void> => {
    const workflow = await workflowsJest.run('failure', {
      workflowsLocation: './tests/__fixtures__'
    })

    expect(workflow).toHaveFinishWithStatus(Status.Failure)
  })

  it('fails and shows if a workflow did not finish wit status', async (): Promise<void> => {
    const workflow = await workflowsJest.run('success', {
      workflowsLocation: './tests/__fixtures__'
    })

    let error: Error

    try {
      expect(workflow).toHaveFinishWithStatus(Status.Failure)
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "Successful workflow" to have finished with status "failure", but it finished with status "success"')

    try {
      expect(workflow).not.toHaveFinishWithStatus(Status.Success)
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "Successful workflow" not to have finished with status "success"')
  })
})

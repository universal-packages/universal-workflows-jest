import { Status } from '@universal-packages/workflows'

import '../src'

describe('workflowsJest', (): void => {
  describe('target-mock-results', (): void => {
    it('runs a workflow configured and with provided target results', async (): Promise<void> => {
      let workflow = await workflowsJest.run('result-dependant', {
        workflowsLocation: './tests/__fixtures__',
        targetMockResults: [{ command: 'get-result', result: 'echo yes' }]
      })

      expect(workflow).toHaveFinishWithStatus(Status.Success)

      workflow = await workflowsJest.run('result-dependant', {
        workflowsLocation: './tests/__fixtures__',
        targetMockResults: [{ command: 'get-result', result: 'failure' }]
      })

      expect(workflow).toHaveFinishWithStatus(Status.Failure)
    })
  })
})

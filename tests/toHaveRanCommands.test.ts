import { Status } from '@universal-packages/workflows'
import stripAnsi from 'strip-ansi'

import '../src'

describe('toHaveFinishWithStatus', (): void => {
  it('asserts a workflow being finished running a list of commands', async (): Promise<void> => {
    const workflow = await workflowsJest.run('result-dependant', {
      workflowsLocation: './tests/__fixtures__',
      targetMockResults: [{ command: 'get-result', result: 'echo yes' }]
    })

    expect(workflow).toHaveRanCommands([{ command: 'get-result' }, { command: 'echo yes' }])

    let error: Error

    try {
      expect(workflow).toHaveRanCommands([{ command: 'get-result' }, { command: 'echo no' }])
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual(
      `expected \"Successful workflow\" to have ran provided commands, but it did not

Commands have discrepancies:

- Expected
+ Received

  Array [
    Object {
      \"command\": \"get-result\",
      \"env\": Object {},
      \"workingDirectory\": undefined,
    },
    Object {
-     \"command\": \"echo yes\",
+     \"command\": \"echo no\",
      \"env\": Object {},
      \"workingDirectory\": undefined,
    },
  ]`
    )

    try {
      expect(workflow).not.toHaveRanCommands([{ command: 'get-result' }, { command: 'echo yes' }])
    } catch (e) {
      error = e
    }

    expect(stripAnsi(error.message)).toEqual('expected "Successful workflow" not to have ran provided commands, but it did exactly that')
  })
})

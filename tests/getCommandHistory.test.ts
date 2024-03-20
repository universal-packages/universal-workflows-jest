import '../src'

describe('getCommandHistory', (): void => {
  it('lets test the history of commands ran until that moment', async (): Promise<void> => {
    const workflow = await workflowsJest.run('result-dependant', {
      workflowsLocation: './tests/__fixtures__',
      targetMockResults: [{ command: 'get-result', result: 'echo yes' }]
    })

    const commandHistory = workflowsJest.getCommandHistory()

    expect(commandHistory).toEqual([{ command: 'get-result' }, { command: 'echo yes' }])
  })
})

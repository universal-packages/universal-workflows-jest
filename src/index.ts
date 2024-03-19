import { expect } from '@jest/globals'
import { TestEngine } from '@universal-packages/sub-process'
import { BuildFromOptions, Status, Workflow } from '@universal-packages/workflows'

import './globals'

const WORKFLOWS_JEST = {
  mocked: false,
  ranMockedWorkflows: []
}

global.workflowsJest = {
  run: async (name: string, options?): Promise<Workflow> => {
    if (options?.targetMockResults) {
      const { targetMockResults } = options

      for (let i = 0; i < targetMockResults.length; i++) {
        const currentTargetMockResult = targetMockResults[i]
        const commandParts = currentTargetMockResult.command.split(' ')
        const actualCommand = commandParts[0]
        const actualArgs = commandParts.slice(1)

        TestEngine.mockProcessEvents({
          command: actualCommand,
          args: actualArgs,
          env: currentTargetMockResult.env,
          workingDirectory: currentTargetMockResult.workingDirectory,
          events: [{ type: 'stdout', data: currentTargetMockResult.result }]
        })
      }
    }

    const workflow = Workflow.buildFrom(name, options)

    workflow.on('**', jest.fn())

    await workflow.run()

    return workflow
  },
  mockRuns: () => {
    WORKFLOWS_JEST.mocked = true
    Workflow.buildFrom = (name: string, options: BuildFromOptions): any => {
      return {
        run: () => {
          WORKFLOWS_JEST.ranMockedWorkflows.push({ name, options })
        }
      }
    }
  }
}

beforeEach(() => {
  TestEngine.reset()
  WORKFLOWS_JEST.ranMockedWorkflows = []
})

function toHaveFinishWithStatus(workflow: Workflow, status: Status): jest.CustomMatcherResult {
  const pass = workflow.status === status

  if (pass) {
    return {
      message: () => `expected "${workflow.name || 'Workflow'}" not to have finished with status ${this.utils.printExpected(status)}`,
      pass
    }
  } else {
    return {
      message: () => {
        const received = workflow.status
        return `expected "${workflow.name || 'Workflow'}" to have finished with status ${this.utils.printExpected(status)}, but it finished with status ${this.utils.printReceived(
          received
        )}`
      },
      pass
    }
  }
}

function toHaveBeenBuildAndRun(workflow: string): jest.CustomMatcherResult {
  const pass = WORKFLOWS_JEST.ranMockedWorkflows.some((ranWorkflow) => ranWorkflow.name === workflow)

  if (pass) {
    return {
      message: () => `expected "${workflow}" not to have been build and run, but it was`,
      pass
    }
  } else {
    return {
      message: () => `expected "${workflow}" to have been build and run, but it was not`,
      pass
    }
  }
}

function toHaveBeenBuildAndRunWithVariables(workflow: string, variables: Record<string, any>): jest.CustomMatcherResult {
  const runInstances = WORKFLOWS_JEST.ranMockedWorkflows.filter((ranWorkflow) => ranWorkflow.name === workflow)
  const pass = runInstances.some((ranWorkflow) => this.equals(ranWorkflow.options?.variables, variables))

  if (pass) {
    return {
      message: () => `expected "${workflow}" not to have been build and run with variables ${this.utils.printExpected(variables)}, but it was`,
      pass
    }
  } else {
    if (runInstances.length === 0) {
      return {
        message: () => `expected "${workflow}" to have been build and run with variables ${this.utils.printExpected(variables)}, but it was not build and run at all`,
        pass
      }
    } else {
      return {
        message: () => `expected "${workflow}" to have been build and run with variables ${this.utils.printExpected(variables)}, but it was not`,
        pass
      }
    }
  }
}

expect.extend({
  toHaveFinishWithStatus,
  toHaveBeenBuildAndRun,
  toHaveBeenBuildAndRunWithVariables
})

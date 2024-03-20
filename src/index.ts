import { expect } from '@jest/globals'
import { TestEngine } from '@universal-packages/sub-process'
import { BuildFromOptions, Status, Workflow } from '@universal-packages/workflows'
import EventEmitter from 'events'

import './globals'
import { ProcessCommandEntry } from './globals'

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
    class MockedWorkflow extends EventEmitter {
      private options: any
      private name: string

      public get graph() {
        return {
          name: this.name,
          routines: []
        }
      }

      public constructor(name: string, options: any) {
        super()
        this.name = name
        this.options = options
      }

      public run() {
        WORKFLOWS_JEST.ranMockedWorkflows.push({ name: this.name, options: this.options })
      }
    }

    Workflow.buildFrom = (name: string, options: BuildFromOptions): any => {
      return new MockedWorkflow(name, options)
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

function toHaveRanCommands(workflow: Workflow, processCommandEntries: ProcessCommandEntry[]): jest.CustomMatcherResult {
  const pass = TestEngine.commandHistory.every((processEntry, index) => {
    const processCommandEntry = processCommandEntries[index]

    if (processCommandEntry) {
      const commandParts = processCommandEntry.command.split(' ')
      const actualCommand = commandParts[0]
      const actualArgs = commandParts.slice(1)

      return (
        this.equals(actualCommand, processEntry.command) &&
        this.equals(actualArgs, processEntry.args) &&
        this.equals(processCommandEntry.env || {}, processEntry.env) &&
        this.equals(processCommandEntry.workingDirectory, processEntry.workingDirectory)
      )
    }

    return false
  })

  if (pass) {
    return {
      message: () => `expected "${workflow.name || 'Workflow'}" not to have ran provided commands, but it did exactly that`,
      pass
    }
  } else {
    const generatedFromHistory = TestEngine.commandHistory.map((processEntry) => {
      return {
        command: processEntry.command + (processEntry.args.length > 0 ? ' ' + processEntry.args.join(' ') : ''),
        env: processEntry.env,
        workingDirectory: processEntry.workingDirectory
      }
    })
    const generatedFromEntries = processCommandEntries.map((processCommandEntry) => {
      return {
        command: processCommandEntry.command,
        env: processCommandEntry.env || {},
        workingDirectory: processCommandEntry.workingDirectory
      }
    })

    const commandsToPrint = this.utils.diff(generatedFromHistory, generatedFromEntries)

    return {
      message: () => `expected "${workflow.name || 'Workflow'}" to have ran provided commands, but it did not\n\nCommands have discrepancies:\n\n${commandsToPrint}`,
      pass
    }
  }
}

expect.extend({
  toHaveBeenBuildAndRun,
  toHaveBeenBuildAndRunWithVariables,
  toHaveFinishWithStatus,
  toHaveRanCommands
})

import { BuildFromOptions, Status, Workflow } from '@universal-packages/workflows'

interface ProcessMockDescriptor {
  command: string
  env?: Record<string, string>
  workingDirectory?: string
  result: string
}

interface WorkflowJestRunOptions extends BuildFromOptions {
  targetMockResults?: ProcessMockDescriptor[]
}

declare global {
  namespace workflowsJest {
    function getCommandHistory(): ProcessCommandEntry[]
    function run(name: string, options?: WorkflowJestRunOptions): Promise<Workflow>
    function mockRuns(): void
  }

  namespace jest {
    interface Matchers<R> {
      toHaveBeenBuildAndRun(): R
      toHaveBeenBuildAndRunWithVariables(variables: Record<string, any>): R
      toHaveFinishWithStatus(status: Status): R
    }
  }
}

export interface ProcessCommandEntry {
  command: string
  env?: Record<string, string>
  workingDirectory?: string
}

export {}

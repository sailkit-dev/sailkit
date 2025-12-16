/**
 * In-process runner using esbuild transform + vm module
 * Much faster than spawning child processes (~240x speedup)
 */

import vm from 'node:vm'
import { transform } from 'esbuild'
import type { CodeBlock } from './parser.js'

export interface RunResult {
  block: CodeBlock
  success: boolean
  output: string
  error?: string
}

export async function runBlock(block: CodeBlock): Promise<RunResult> {
  const isTypeScript = block.language === 'typescript' || block.language === 'ts'

  try {
    // Transpile TypeScript to JavaScript if needed
    let code = block.code
    if (isTypeScript) {
      const result = await transform(code, {
        loader: 'ts',
        format: 'cjs', // vm.runInContext works better with CJS
        target: 'node18'
      })
      code = result.code
    }

    // Capture console output
    let stdout = ''
    const mockConsole = {
      log: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      error: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      warn: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      info: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' }
    }

    // Create sandbox with common globals
    const sandbox = {
      console: mockConsole,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      process: { env: process.env },
      Error,
      TypeError,
      ReferenceError,
      SyntaxError
    }

    vm.createContext(sandbox)

    // Execute with timeout
    const script = new vm.Script(code, { filename: 'code-block.js' })
    script.runInContext(sandbox, { timeout: 5000 })

    return {
      block,
      success: true,
      output: stdout
    }
  } catch (err) {
    return {
      block,
      success: false,
      output: '',
      error: err instanceof Error ? err.message : String(err)
    }
  }
}

export async function runBlocks(blocks: CodeBlock[]): Promise<RunResult[]> {
  const results: RunResult[] = []
  for (const block of blocks) {
    results.push(await runBlock(block))
  }
  return results
}

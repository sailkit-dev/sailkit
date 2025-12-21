/**
 * In-process runner using esbuild build + vm module
 * Bundles imports so code blocks can use real packages
 */

import vm from 'node:vm'
import assert from 'node:assert'
import path from 'node:path'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import type { CodeBlock } from './parser.js'

// Detect DOM usage via regex
const DOM_PATTERN = /\b(document|window|localStorage|sessionStorage|navigator|location|HTMLElement|Element|Node)\b/

export interface RunResult {
  block: CodeBlock
  success: boolean
  output: string
  error?: string
}

// Find workspace root by looking for package.json with workspaces
function findWorkspaceRoot(): string {
  let dir = process.cwd()
  while (dir !== '/') {
    try {
      const pkg = require(path.join(dir, 'package.json'))
      if (pkg.workspaces) {
        return dir
      }
    } catch {
      // Continue searching
    }
    dir = path.dirname(dir)
  }
  return process.cwd()
}

export async function runBlock(block: CodeBlock): Promise<RunResult> {
  const isTypeScript = block.language === 'typescript' || block.language === 'ts'

  try {
    // Bundle with esbuild to resolve imports
    const result = await build({
      stdin: {
        contents: block.code,
        loader: isTypeScript ? 'ts' : 'js',
        resolveDir: findWorkspaceRoot(),
      },
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      target: 'node18',
      // Resolve from workspace node_modules
      nodePaths: [path.join(findWorkspaceRoot(), 'node_modules')],
      logLevel: 'silent',
    })

    const code = result.outputFiles?.[0]?.text ?? ''

    // Capture console output
    let stdout = ''
    const mockConsole = {
      log: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      error: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      warn: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' },
      info: (...args: unknown[]) => { stdout += args.map(String).join(' ') + '\n' }
    }

    // Create sandbox with common globals + assert
    const sandbox: Record<string, unknown> = {
      console: mockConsole,
      assert,  // Node's assert module
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      process: { env: process.env },
      Error,
      TypeError,
      ReferenceError,
      SyntaxError,
      // CJS module support
      module: { exports: {} },
      exports: {},
      require: (id: string) => {
        // Only allow requiring built-in modules
        if (id.startsWith('node:') || ['assert', 'path', 'fs', 'util'].includes(id)) {
          return require(id)
        }
        throw new Error(`Cannot require '${id}' - imports should be bundled by esbuild`)
      },
    }

    // Inject JSDOM globals if code uses DOM APIs
    if (DOM_PATTERN.test(block.code)) {
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost/',
        runScripts: 'outside-only',
      })
      Object.assign(sandbox, {
        window: dom.window,
        document: dom.window.document,
        localStorage: dom.window.localStorage,
        sessionStorage: dom.window.sessionStorage,
        navigator: dom.window.navigator,
        location: dom.window.location,
        HTMLElement: dom.window.HTMLElement,
        Element: dom.window.Element,
        Node: dom.window.Node,
      })
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

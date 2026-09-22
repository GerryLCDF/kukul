#!/usr/bin/env node
// deps: node:fs, node:path. Sin dependencias npm = instalación instantánea vía npx.
import { mkdirSync, writeFileSync, cpSync, existsSync } from 'node:fs'
import { join, basename, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const TPL = join(here, '..', 'template') // enfrente del bin: tools/create-kukul/template
const PKG = '@gerardolcdf/kukul'
const AUTHORS = { name: 'Nuevo proyecto kukul', email: '' }

function fail(msg) {
  console.error('  \x1b[31m✖\x1b[0m', msg)
  process.exit(1)
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  console.log('  ✓', path.replace(process.cwd() + '/', ''))
}

function done(pkg) {
  console.log(`
  \x1b[32m¡Listo!\x1b[0m "${pkg}" creado con la librería ${PKG} preinstalada.

  cd ${pkg}
  npm run dev     # arranca Vite + demo
  npm install @gerardolcdf/kukul@latest   # cuando haya versiones nuevas
  `)
}

function main() {
  const target = (process.argv[2] || 'kukul-demo').replace(/\/+$/, '')
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(target))
    fail(`"${target}" no es un nombre válido (usa minúsculas, números y guiones).`)

  const dest = join(process.cwd(), target)
  if (existsSync(dest)) fail(`La carpeta "${target}" ya existe. Elige otro nombre.`)

  mkdirSync(dest, { recursive: true })

  // 1) copiar template estático (src/, index.html, configs)
  cpSync(TPL, dest, { recursive: true })

  // 2) package.json con el nombre pedido
  const pkg = {
    name: target,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: {
      [`${PKG}`]: '^1.0.0',
      'framer-motion': '^11.11.17',
      'lucide-react': '^1.31.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/react-dom': '^18.3.2',
      '@vitejs/plugin-react': '^4.3.4',
      typescript: '^5.6.3',
      vite: '^5.4.11',
    },
  }
  write(join(dest, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

  // 3) tsconfig base
  write(
    join(dest, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  )

  // 4) vite.config.ts BÁSICO (sin lib: solo la web demo)
  write(
    join(dest, 'vite.config.ts'),
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',           // rutas relativas → funciona en GitHub Pages sin config
  plugins: [react()],
})
`,
  )

  // 5) .gitignore del proyecto generado
  write(
    join(dest, '.gitignore'),
    `# deps
node_modules
dist
dist-lib

# logs
*.log
npm-debug.log*
`,
  )

  console.log('\n  Instalando dependencias…\n')
  const npm = spawnSync('npm', ['install'], { cwd: dest, stdio: 'inherit', shell: process.platform === 'win32' })
  if (npm.status !== 0) fail('npm install falló. Revisa arriba.')
  done(target)
}

main()

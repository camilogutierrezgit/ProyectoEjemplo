# 🚀 Guía de Pipelines de Integración Continua (CI)

## Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Anatomía de un Workflow de GitHub Actions](#anatomía-de-un-workflow-de-github-actions)
- [Pipeline Angular — Explicación Detallada](#pipeline-angular--explicación-detallada)
- [Pipeline .NET — Explicación Detallada](#pipeline-net--explicación-detallada)
- [Cómo Proteger la Rama `main` (Branch Protection Rules)](#cómo-proteger-la-rama-main-branch-protection-rules)
- [¿Qué pasa cuando falla el pipeline?](#qué-pasa-cuando-falla-el-pipeline)
- [Buenas Prácticas Implementadas](#buenas-prácticas-implementadas)
- [Glosario de Términos](#glosario-de-términos)
- [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## Estructura del Proyecto

Este repositorio es un **monorepo** — un solo repositorio que contiene múltiples proyectos:

```
ProyectoEjemplo/
├── .github/
│   └── workflows/                    ← 📁 Aquí viven los pipelines
│       ├── angular-ci.yml            ← Pipeline del proyecto Angular
│       └── dotnet-ci.yml             ← Pipeline del proyecto .NET
│
├── angular-best-practices/           ← 📁 Proyecto Angular 18
│   ├── src/                          ← Código fuente
│   ├── package.json                  ← Dependencias y scripts de Node.js
│   ├── vite.config.mts               ← Configuración de Vite + Vitest
│   └── tsconfig.json                 ← Configuración de TypeScript
│
├── DotnetBestPractices/              ← 📁 Proyecto .NET 8
│   ├── DotnetBestPractices.Api/      ← Web API (proyecto principal)
│   │   └── *.csproj                  ← Archivo de proyecto .NET
│   └── DotnetBestPractices.Tests/    ← Pruebas unitarias con xUnit
│       └── *.csproj                  ← Archivo de proyecto de tests
│
└── GUIA_PIPELINES.md                 ← 📄 Este archivo
```

> **¿Por qué un pipeline separado por proyecto?**
> En un monorepo, es importante que cada proyecto tenga su propio pipeline con **filtros de ruta** (`paths`). Así, si solo modificas código Angular, no se ejecuta el pipeline de .NET y viceversa. Esto ahorra tiempo y recursos.

---

## Anatomía de un Workflow de GitHub Actions

Un archivo de workflow tiene esta estructura general:

```yaml
name: "Nombre del Pipeline"          # ① Nombre visible en GitHub

on:                                   # ② Cuándo se ejecuta
  pull_request:
    branches: [main]

permissions:                          # ③ Qué permisos tiene
  contents: read

concurrency:                          # ④ Control de ejecuciones paralelas
  group: mi-pipeline-${{ github.ref }}
  cancel-in-progress: true

jobs:                                 # ⑤ Los trabajos a ejecutar
  mi-job:
    runs-on: ubuntu-latest            # ⑥ En qué máquina virtual
    steps:                            # ⑦ Los pasos secuenciales
      - name: "Paso 1"
        uses: actions/checkout@v4     # ← Usar una Action pre-hecha
      - name: "Paso 2"
        run: echo "Hola mundo"        # ← Ejecutar un comando
```

### Explicación de cada sección:

| # | Sección | ¿Qué hace? |
|---|---------|-------------|
| ① | `name` | Nombre que aparece en la UI de GitHub Actions |
| ② | `on` | Define los **eventos** que disparan el pipeline (PR, push, etc.) |
| ③ | `permissions` | Limita qué puede hacer el pipeline (seguridad) |
| ④ | `concurrency` | Evita ejecuciones duplicadas del mismo PR |
| ⑤ | `jobs` | Agrupa los trabajos. Cada job corre en su propia VM |
| ⑥ | `runs-on` | Especifica el sistema operativo del runner |
| ⑦ | `steps` | Pasos secuenciales dentro de un job |

---

## Pipeline Angular — Explicación Detallada

📄 **Archivo:** `.github/workflows/angular-ci.yml`

### Flujo del Pipeline

```
📥 Checkout  →  ⚙️ Setup Node.js  →  📦 npm ci  →  🔍 Lint  →  🏗️ Build  →  🧪 Tests  →  📊 Cobertura
```

### Desglose de cada paso:

#### 1. 📥 Checkout del código
```yaml
uses: actions/checkout@v4
```
Descarga el código del repositorio al runner. **Es siempre el primer paso** de cualquier pipeline.

#### 2. ⚙️ Configurar Node.js (con Matrix Strategy)
```yaml
strategy:
  matrix:
    node-version: [20, 22]

uses: actions/setup-node@v4
with:
  node-version: ${{ matrix.node-version }}
  cache: "npm"
```
- **Matrix Strategy**: Ejecuta el pipeline con Node.js 20 Y 22 en paralelo. Esto detecta problemas de compatibilidad temprano.
- **Cache**: Guarda `node_modules` en caché entre ejecuciones para acelerar el pipeline.

#### 3. 📦 Instalar dependencias
```yaml
run: npm ci
```
`npm ci` vs `npm install`:
| `npm ci` | `npm install` |
|----------|---------------|
| Usa `package-lock.json` exacto | Puede actualizar el lock |
| Borra `node_modules` antes | No los borra |
| Más rápido y determinista | Más lento |
| **Ideal para CI** ✅ | Ideal para desarrollo local |

#### 4. 🔍 Lint (calidad de código)
Verifica que el código sigue las reglas de estilo. En este proyecto es opcional (`continue-on-error: true`) hasta que se configure ESLint.

#### 5. 🏗️ Build de producción
```yaml
run: npm run build -- --configuration production
```
Compila el proyecto con todas las optimizaciones de producción (AOT, tree-shaking, minificación). Si hay errores de TypeScript o de templates Angular, el build falla aquí.

#### 6. 🧪 Tests con Vitest
```yaml
run: npx vitest run --reporter=default --coverage
```
Ejecuta todas las pruebas unitarias (`*.spec.ts`) usando **Vitest** y genera un reporte de cobertura de código.

#### 7. 📊 Upload de cobertura
Guarda el reporte como artefacto descargable en GitHub por 14 días.

---

## Pipeline .NET — Explicación Detallada

📄 **Archivo:** `.github/workflows/dotnet-ci.yml`

### Flujo del Pipeline

```
📥 Checkout  →  ⚙️ Setup .NET  →  📦 Restore  →  🏗️ Build  →  🧪 Tests  →  📊 Resultados  →  🔐 Seguridad
```

### Desglose de cada paso:

#### 1. 📥 Checkout del código
Igual que en Angular — descarga el código al runner.

#### 2. ⚙️ Configurar .NET SDK
```yaml
uses: actions/setup-dotnet@v4
with:
  dotnet-version: "8.0.x"
```
Instala el SDK de .NET 8.0. Aunque el runner ya trae .NET, especificar la versión garantiza **reproducibilidad**.

#### 3. 📦 Restaurar dependencias (NuGet)
```yaml
run: dotnet restore
```
El equivalente de `npm install` en el mundo .NET. Descarga todos los paquetes NuGet necesarios.

#### 4. 🏗️ Build en modo Release
```yaml
run: dotnet build --no-restore --configuration Release --warnaserror
```
Flags importantes:
| Flag | ¿Qué hace? |
|------|-------------|
| `--no-restore` | No repite el restore (ya lo hicimos) |
| `--configuration Release` | Compila optimizado para producción |
| `--warnaserror` | **Trata warnings como errores** — fuerza código limpio |

#### 5. 🧪 Tests con xUnit + Cobertura
```yaml
run: dotnet test --no-build --configuration Release --collect:"XPlat Code Coverage"
```
- Ejecuta las pruebas con **xUnit**
- Genera reportes en formato **TRX** (Visual Studio)
- Usa **coverlet** para cobertura de código en formato Cobertura XML

#### 6. 📊 Upload de resultados
Sube tanto los resultados de tests (`.trx`) como la cobertura como artefactos. El `if: always()` asegura que se suben **incluso si los tests fallaron** — para poder inspeccionar qué salió mal.

#### 7. 🔐 Verificación de seguridad
```yaml
run: dotnet list package --vulnerable --include-transitive
```
Revisa si algún paquete NuGet tiene **vulnerabilidades de seguridad conocidas (CVEs)**. Es un paso informativo pero muy valioso.

---

## Cómo Proteger la Rama `main` (Branch Protection Rules)

> ⚠️ **Este paso es MANUAL y se hace en GitHub.com** — no se puede automatizar con archivos YAML.

Para que los pipelines realmente bloqueen PRs que fallan, debes configurar **Branch Protection Rules** en tu repositorio:

### Paso a paso:

1. Ve a tu repositorio en GitHub: `github.com/camilogutierrezgit/ProyectoEjemplo`

2. Haz clic en **Settings** (⚙️) → **Branches** (en el menú lateral)

3. Haz clic en **"Add branch protection rule"** (o edita la regla existente para `main`)

4. En **"Branch name pattern"**, escribe: `main`

5. Marca las siguientes opciones:

   - ✅ **Require a pull request before merging**
     - Esto prohíbe pushes directos a `main`

   - ✅ **Require status checks to pass before merging**
     - Haz clic en **"Search for status checks"** y selecciona:
       - `🔨 Build & Test Angular` (aparecerá después del primer PR)
       - `🔨 Build & Test .NET`
     - ✅ Marca **"Require branches to be up to date before merging"**

   - ✅ **Require conversation resolution before merging** *(opcional pero recomendado)*

   - ✅ **Do not allow bypassing the above settings** *(recomendado)*
     - Ni siquiera los administradores pueden saltarse las reglas

6. Haz clic en **"Create"** o **"Save changes"**

### Resultado visual en un PR:

```
Pull Request #42: "Agregar feature de login"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status Checks:
  ✅ 🔨 Build & Test Angular (Node 20)     — Passed
  ✅ 🔨 Build & Test Angular (Node 22)     — Passed
  ✅ 🔨 Build & Test .NET                  — Passed

  [  Merge Pull Request  ]     ← ✅ Botón habilitado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


Pull Request #43: "Refactorizar servicio (con bug)"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status Checks:
  ❌ 🔨 Build & Test .NET                  — Failed
      └── Tests: 2 failed, 15 passed

  [ Merge Pull Request ]     ← 🔒 Botón BLOQUEADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> **📌 Nota importante**: Los status checks solo aparecen en el buscador DESPUÉS de que el pipeline se haya ejecutado al menos una vez. Por eso, primero haz push de los archivos YAML, abre un PR de prueba, espera a que corran los pipelines, y luego configura las branch protection rules.

---

## ¿Qué pasa cuando falla el pipeline?

1. **GitHub marca el check como fallido** ❌ en el PR
2. **El botón de Merge se bloquea** (si configuraste Branch Protection)
3. **GitHub envía una notificación** al autor del PR
4. El desarrollador debe:
   - Revisar los logs del pipeline en la pestaña **"Actions"**
   - Corregir el error en su rama
   - Hacer push de la corrección
   - El pipeline se re-ejecuta automáticamente

---

## Buenas Prácticas Implementadas

Estos pipelines ya incluyen varias buenas prácticas de la industria:

| Práctica | ¿Dónde? | ¿Por qué? |
|----------|---------|-----------|
| **Filtros de ruta** (`paths`) | Ambos | Solo ejecutar cuando cambian archivos relevantes |
| **Cancelación de ejecuciones duplicadas** (`concurrency`) | Ambos | Ahorra minutos de CI (y dinero 💰) |
| **Mínimo privilegio** (`permissions: contents: read`) | Ambos | Seguridad — el pipeline no puede modificar el repo |
| **Caché de dependencias** | Angular | Acelera pipelines futuros (de ~2min a ~30s) |
| **`npm ci` en vez de `npm install`** | Angular | Instalación determinista y reproducible |
| **Matrix strategy** (Node 20 + 22) | Angular | Detectar incompatibilidades temprano |
| **`--warnaserror`** | .NET | Fuerza código limpio sin advertencias |
| **Cobertura de código** | Ambos | Visibilidad de qué tan bien se testea el código |
| **Upload de artefactos** (`if: always()`) | Ambos | Poder inspeccionar fallos después |
| **Escaneo de vulnerabilidades** | .NET | Detectar dependencias inseguras |

---

## Glosario de Términos

| Término | Significado |
|---------|-------------|
| **CI** | Integración Continua — automatizar la validación de código |
| **CD** | Despliegue Continuo — automatizar la entrega a producción |
| **Pipeline** | Secuencia automatizada de pasos (build → test → deploy) |
| **Workflow** | Nombre que GitHub Actions le da a un pipeline |
| **Runner** | Máquina virtual donde se ejecuta el pipeline |
| **Job** | Unidad de trabajo dentro de un workflow |
| **Step** | Paso individual dentro de un job |
| **Action** | Componente reutilizable (ej: `actions/checkout@v4`) |
| **Artifact** | Archivo generado por el pipeline que se puede descargar |
| **PR / Pull Request** | Solicitud para fusionar cambios a otra rama |
| **Branch Protection** | Reglas que protegen una rama de cambios sin validar |
| **Status Check** | Verificación que debe pasar antes de hacer merge |
| **Matrix Strategy** | Ejecutar el mismo job con diferentes configuraciones |
| **Cache** | Almacenamiento temporal para acelerar ejecuciones futuras |
| **Monorepo** | Un solo repositorio con múltiples proyectos |
| **NuGet** | Gestor de paquetes de .NET (equivalente a npm en Node) |
| **xUnit** | Framework de testing para .NET |
| **Vitest** | Framework de testing para proyectos Vite/JavaScript |
| **Coverlet** | Herramienta de cobertura de código para .NET |

---

## Solución de Problemas Comunes

### ❌ "El pipeline no se ejecuta cuando abro un PR"
- **Causa**: Los archivos de workflow no están en la rama `main` todavía.
- **Solución**: Primero haz merge de los archivos `.github/workflows/*.yml` a `main`.

### ❌ "No encuentro los status checks en Branch Protection"
- **Causa**: Los checks solo aparecen después de que el pipeline se ejecuta por primera vez.
- **Solución**: Abre un PR de prueba, espera a que corran los pipelines, luego configura las reglas.

### ❌ "El pipeline falla en `npm ci` con errores de dependencias"
- **Causa**: El `package-lock.json` está desactualizado o fue modificado manualmente.
- **Solución**: Ejecuta `npm install` localmente, commit el `package-lock.json` actualizado.

### ❌ "El pipeline falla en `dotnet restore` por paquetes no encontrados"
- **Causa**: Un paquete NuGet privado o una fuente de paquetes no configurada.
- **Solución**: Verifica que todos los paquetes sean públicos o configura NuGet sources en el pipeline.

### ❌ "`--warnaserror` causa fallos inesperados"
- **Causa**: El código tiene advertencias que antes se ignoraban.
- **Solución**: Corrige las advertencias o, temporalmente, quita `--warnaserror` del pipeline.

---

## Recursos Adicionales

- 📖 [Documentación oficial de GitHub Actions](https://docs.github.com/es/actions)
- 📖 [Sintaxis de Workflows](https://docs.github.com/es/actions/using-workflows/workflow-syntax-for-github-actions)
- 📖 [Branch Protection Rules](https://docs.github.com/es/repositories/configuring-branches-and-merges-in-your-repository/managing-a-branch-protection-rule/managing-a-branch-protection-rule)
- 📖 [Documentación de Vitest](https://vitest.dev/)
- 📖 [Documentación de xUnit](https://xunit.net/)
- 📖 [dotnet test CLI](https://learn.microsoft.com/es-es/dotnet/core/tools/dotnet-test)

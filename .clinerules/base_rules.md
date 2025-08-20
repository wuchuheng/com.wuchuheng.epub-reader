# GitHub Copilot Project Rules (Multi‑language)

Purpose: Provide clear, enforceable guidance so AI‑generated code matches our commenting and readability standards.
Scope: Applies to all source files in this repository. Language adapters below specify how to express the same standards.

---

## TL;DR (defaults Copilot must follow)

- Add doc comments for classes/types, properties/fields, and functions/methods.
- Use numbered inline comments only inside function/method bodies to mark steps.
- Always follow 1/2/3 phases: 1 = Input, 2 = Core, 3 = Output; omit for trivial bodies.
- Never place numbered comments at file/module scope, on decorators/annotations, or above properties.
- Keep lines ≤ 120 chars; wrap args, template strings, and objects for readability.
- Match nearby file style; prefer explicit types and safe narrowing when applicable.

---

## Defaults checklist (for Copilot)

- JSDoc/Javadoc/docstring present on: classes/types, fields, and functions/methods (concise and relevant).
- Numeric comments only inside function bodies for non‑trivial logic (1/2/3; use 1.1, 2.2.1 when it helps).
- ≤ 120 chars per line; break long args/objects/strings across lines with trailing commas where supported.
- No implicit any where typing exists; add minimal explicit types or guards.
- Comments are short, actionable, and near the code they describe.

---

## Three‑phase numeric comment convention (all languages)

Use numeric comments only inside function/method bodies.

- 1.\* Input Handling: validate/parse parameters, type checks, defaults, guards.
- 2.\* Core Processing: transformations, calculations, I/O, side effects.
- 3.\* Output Handling: return values, emit/resolve/respond, cleanup.

Minimal example:

```ts
const formatHour = (hour: number): string => {
  // 3. Output handling
  return `${hour}:00`;
};
```

Non‑trivial example (language‑agnostic structure):

```pseudo
function handle(data) {
  // 1. Input handling
  // 1.1 Validate shape; 1.2 Apply defaults

  // 2. Core processing
  // 2.1 Transform; 2.2 Persist

  // 3. Output handling
  // 3.1 Return result
}
```

---

## Documentation placement rules (generic)

- File/module: No numeric comments. Optional brief header comment if needed.
- Class/Type/Struct/Interface/Enum: Doc comment above declaration; describe purpose and constraints.
- Property/Field: Doc comment above; describe purpose, type/units, constraints.
- Function/Method: Doc comment above; describe purpose, params, return value, notable side effects.

Never use numeric comments outside a function/method body.

---

## Language adapters (how to write doc comments)

- TypeScript/JavaScript/TSX/JSX: JSDoc with `/** ... */`; use `@param`, `@returns` when helpful.
- Python: Triple‑quoted docstrings under defs/classes; Google/NumPy style is fine; inline `# 1.` comments in bodies.
- Go: Line doc starting with the name, e.g., `// Foo does ...`; inline `// 1.` inside functions only.
- Java/Kotlin: Javadoc/KDoc `/** ... */` with `@param`, `@return`; inline `// 1.` inside methods only.
- C#/C++: C# XML doc `/// <summary>...`; C++ Doxygen `///` or `/** ... */`; numeric `// 1.` only inside bodies.
- Rust: `///` item docs; `//` inside functions for numeric comments.
- Shell (bash/sh/pwsh): `#` header above functions; numeric `# 1.` within functions only.

If a language has a project formatter configured, adhere to it.

---

## React/TSX specifics (when applicable)

- Components: Doc above component describing purpose and props; doc each prop in its type/interface.
- Hooks: Doc inputs/outputs and side effects. In useEffect/useMemo, add numeric comments only for multi‑step logic.

Example:

```tsx
/** Renders a labeled time display. */
type TimeProps = {
  /** Hour in 0–23. */
  hour: number;
};

export function TimeLabel({ hour }: TimeProps) {
  // 3. Output handling
  return <span>{`${hour}:00`}</span>;
}
```

---

## Async, IPC/HTTP, and error handling (all stacks)

- Always structure handlers as 1 (validate/parse), 2 (do work: DB/HTTP/IPC/FS), 3 (return/respond/cleanup).
- Node/Electron example:

```ts
ipcMain.handle('log:add', async (_e, payload) => {
  // 1. Input handling
  if (!payload || typeof payload.message !== 'string') throw new Error('Invalid payload');
  // 2. Core processing
  const id = await logService.create(payload);
  // 3. Output handling
  return { id };
});
```

- Python (Flask) example:

```py
@app.post('/log/add')
def add_log():
    # 1. Input handling
    body = request.get_json(silent=True) or {}
    msg = body.get('message')
    if not isinstance(msg, str): abort(400, 'Invalid payload')
    # 2. Core processing
    _id = service_create(body)
    # 3. Output handling
    return { 'id': _id }, 201
```

---

## Do / Don’t

Do

- Add doc comments to declarations; use numeric comments only inside bodies.
- Keep lines ≤ 120 chars; wrap long args/objects/strings.
- Prefer clarity and consistency; align to nearby style.

Don’t

- Don’t add numbered comments at module scope, on decorators/annotations, or above properties.
- Don’t overuse sub‑numbering; nest only when it improves clarity.

Incorrect (avoid):

```ts
// 1. Primary identification
@PrimaryGeneratedColumn('uuid')
id: string;
```

---

## Readability constraints (≤ 120 chars per line)

If a line would exceed 120 chars, refactor:

- Break argument lists across lines with trailing commas (where supported).
- Split template literals / long strings or extract variables.
- Spread object/record/map literals across multiple lines with aligned keys.
- Extract intermediate variables to clarify complex expressions.

---

## Consistency, conflict, and precedence

- Match existing repository style first; otherwise follow these rules.
- Apply rules across all code (Electron main, renderer, scripts, services).
- Prefer omitting numeric comments for trivial getters/setters.

---

## Tooling

- JS/TS/TSX: Prettier enforces print width 120 (see `.prettierrc.json`).
- Python: Use black/isort if configured.
- Go: gofmt/goimports.
- Rust: rustfmt.
- Java/Kotlin: formatter/ktlint if configured.
- C#/C++: dotnet/clang‑format if configured.

Keep code formatted consistently with project tools.

# Cline's Memory Bank

I am Cline, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

flowchart TD
PB[projectbrief.md] --> PC[productContext.md]
PB --> SP[systemPatterns.md]
PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]

### Core Files (Required)

1. `projectbrief.md`

   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. `productContext.md`

   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. `activeContext.md`

   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. `systemPatterns.md`

   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. `techContext.md`

   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. `progress.md`
   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context

Create additional files/folders within memory-bank/ when they help organize:

- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Core Workflows

### Plan Mode

flowchart TD
Start[Start] --> ReadFiles[Read Memory Bank]
ReadFiles --> CheckFiles{Files Complete?}

    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]

    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]

### Act Mode

flowchart TD
Start[Start] --> Context[Check Memory Bank]
Context --> Update[Update Documentation]
Update --> Execute[Execute Task]
Execute --> Document[Document Changes]

## Documentation Updates

Memory Bank updates occur when:

1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

flowchart TD
Start[Update Process]

    subgraph Process
        P1[Review ALL Files]
        P2[Document Current State]
        P3[Clarify Next Steps]
        P4[Document Insights & Patterns]

        P1 --> P2 --> P3 --> P4
    end

    Start --> Process

Note: When triggered by **update memory bank**, I MUST review every memory bank file, even if some don't require updates. Focus particularly on activeContext.md and progress.md as they track current state.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.

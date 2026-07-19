# MysterySlavic Agent Contract

## Required reading

Before planning or changing the project, read:

- `docs/GAME.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATE.md`
- `docs/TESTING.md`
- any relevant file under `docs/specs/`, `docs/plans/`, or `docs/decisions/`

Use the installed Superpowers workflow for every non-trivial task.

## Product constraints

- Engine: Unity 6 LTS, pinned by `ProjectSettings/ProjectVersion.txt`.
- Language: C#.
- Platform target: PC first.
- Visual format: 2D pseudo-isometric top-down presentation with an orthographic camera.
- Game format: playable by 1–4 players, designed primarily for 2–4.
- Networking: host/client cooperative multiplayer.
- Shared gameplay state is host-authoritative.
- Role-specific perception is rendered locally on each client.
- MVP contains one compact expedition and one minimal community hub.
- No dedicated servers, Railway backend, matchmaking, voice chat, microtransactions, or live-service systems unless explicitly approved.

## Architecture rules

- Production code belongs under `Assets/_Game/Runtime/`.
- Organize code by gameplay feature, not by generic `Scripts` folders.
- Use the namespace `MysterySlavic.<Feature>`.
- Keep deterministic puzzle and progression logic in plain C# where practical.
- Keep MonoBehaviours focused on Unity lifecycle, presentation, input, and scene integration.
- ScriptableObjects contain static design data, not mutable save data or authoritative runtime state.
- Avoid global mutable state, service-locator patterns, and uncontrolled singleton growth.
- Do not add a dependency-injection framework during MVP.
- Do not create additional assemblies without a demonstrated need.
- Prefer the smallest implementation that satisfies the approved specification.

## Unity asset safety

- Never delete, regenerate, or separate a Unity asset from its `.meta` file.
- Do not hand-edit serialized `.unity`, `.prefab`, or `.asset` YAML unless explicitly approved.
- Prefer manual Editor instructions or deterministic Editor tooling for scene and prefab setup.
- Do not rename or move existing Unity assets without checking reference and GUID impact.
- Do not add, remove, or upgrade Unity packages without explicit approval.
- Never change the pinned Unity Editor version without explicit approval.
- Preserve Force Text serialization and Visible Meta Files.

## Multiplayer rules

- Separate the real player connection from the controlled character entity.
- The host validates and owns shared puzzle, item, timer, and expedition state.
- Clients request actions; they do not unilaterally declare shared results.
- Do not synchronize role-specific visual/audio perception that can be derived locally.
- Initial multiplayer verification uses Multiplayer Play Mode with one host and up to three virtual clients.
- Host migration is outside MVP unless explicitly approved.

## Testing

- Use RED-GREEN-REFACTOR for deterministic logic and bug fixes.
- Use EditMode tests for pure C# logic, puzzle rules, role allocation, save serialization, and state transitions.
- Use PlayMode tests for MonoBehaviour integration, interaction, scene flow, and stable network behavior.
- For visual, animation, sorting, audio, or Editor-only work, define a manual acceptance checklist before implementation.
- Never create meaningless tests solely to satisfy a test count.
- Run all available relevant tests before declaring completion.
- Never claim a Unity visual or multiplayer behavior was verified unless it was actually run and observed.

## Git workflow

- Never implement directly on `main`.
- Use an isolated branch or worktree for every non-trivial change.
- Keep commits scoped and descriptive.
- Do not stage unrelated files.
- Do not commit `Library`, `Temp`, `Logs`, local builds, credentials, recovery codes, or machine-specific settings.

## Documentation policy

After a completed task:

- update `docs/PROJECT_STATE.md`;
- update `docs/ARCHITECTURE.md` only when architecture actually changed;
- update `docs/GAME.md` only after an approved design change;
- add or update a spec when externally visible behavior changed;
- add an ADR for a significant technical decision;
- update `docs/TESTING.md` when test or build procedures changed.

Do not use `AGENTS.md` as a changelog and do not expand it with task-specific history.

## Completion report

Every completed task must end with:

1. concise implementation summary;
2. exact files changed;
3. tests, builds, and commands run with exact results;
4. behavior that remains unverified;
5. exact manual Unity Editor actions required from the user;
6. step-by-step manual verification checklist;
7. documentation files updated;
8. remaining risks or follow-up work.

Do not claim completion while compilation errors, failing tests, or undocumented manual setup remain.

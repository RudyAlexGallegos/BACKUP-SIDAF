Angular component guidelines — preventing standalone/NgModule collisions

Why this exists
- During migration we hit NG6008 because a component was treated as standalone but also declared in an NgModule. That breaks compilation.

Rules
1. Components generated for this project should be classical (declared in an NgModule).
   - When generating, use the CLI with schematics set to `standalone: false` or pass explicit flags.
2. Never declare a component in `declarations` if its decorator contains `standalone: true`.
   - If a component is standalone, import it instead of declaring it.
3. Keep a single canonical set of files per component: `xxx.component.ts`, `xxx.component.html`, `xxx.component.scss`.
4. Avoid barrel files that re-export component classes from ambiguous paths unless necessary.
5. If you need to convert to standalone, update module code to `imports: [MyStandaloneComponent]` instead of `declarations`.

Quick local checks
- Search for accidental standalone declarations:
  - `node tools/check-standalone.js` (adds a quick scan)

What to do when you see NG6008
1. Inspect the component decorator for `standalone: true`.
2. If it's standalone, remove it from `declarations` and import it into the NgModule or convert the module to use the standalone component via `imports`.
3. Remove duplicate/old files and re-run `ng serve` from the project root.

Contact
- If unsure, open an issue in the repo and tag the frontend owner.

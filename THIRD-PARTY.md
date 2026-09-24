# Third-party licenses

This project is Apache-2.0. Its dependencies remain under their own licenses,
all of them approved by the [Open Source Initiative](https://opensource.org/licenses).

## Summary

699 packages in the installed tree:

| License | Packages |
|---|---|
| MIT | 604 |
| ISC | 37 |
| Apache-2.0 | 26 |
| BSD-2-Clause | 12 |
| BSD-3-Clause | 8 |
| BlueOak-1.0.0 | 3 |
| MPL-2.0 | 3 |
| LGPL-3.0-or-later | 1 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| Python-2.0 | 1 |
| CC-BY-4.0 | 1 |
| CC0-1.0 | 1 |
| 0BSD | 1 |

### Copyleft components

Two transitive packages carry copyleft terms, both pulled in by Next.js image
optimisation (`sharp` and its native libvips binaries):

| Package | License |
|---|---|
| `@img/sharp-libvips-*` | LGPL-3.0-or-later |
| `@img/sharp-wasm32` | Apache-2.0 AND LGPL-3.0-or-later AND MIT |

They are used unmodified as separate binaries, which LGPL permits without
affecting the license of this project. The only image this app renders is a QR
code drawn on the client with `unoptimized`, so nothing here depends on them.
Three further packages are MPL-2.0, which is file-level copyleft and likewise
does not extend to this project.

## Regenerating

Licenses were read from every `package.json` in `node_modules`. For the full
text of any dependency, see its own `LICENSE` file inside that directory.

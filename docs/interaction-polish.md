# Interface polish

Guidance: [emil-design-eng](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md),
[animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md),
and [mobile-native](https://github.com/emilkowalski/skills/blob/main/skills/mobile-native/SKILL.md).

| Before | After | Purpose |
| --- | --- | --- |
| Small card descriptions and evaluation notes | Larger type and clearer result hierarchy | Readability |
| Hover styles on all input types | Hover styling gated to fine pointers with hover support | Avoid sticky touch hover |
| Area selection recreates the page | Update results and pressed states in place | Preserve controls and focus |
| Controls have no press feedback | Pointer-only 120ms scale transition | Immediate feedback |
| Keyboard actions share pointer styling | Keyboard input disables pointer transforms | Immediate keyboard response |
| Reduced motion | Stable position with opacity press feedback | Preserve feedback without movement |
| 15px form inputs | 16px on coarse pointers | Avoid focus zoom on mobile |

The data science and agent collections, source links and evaluation caveats remain
available. Browser visual review and physical-device testing were unavailable;
tap feel, safe areas and mobile input behavior still need hardware verification.

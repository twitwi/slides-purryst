# AGENTS.md

## Dev workflow

```bash
git clone <repo>
cd slides-purryst
pnpm install
pnpm build          # builds dist/
pnpm dev            # vite dev server serving example/demo-slidespurr.html
```

Edit `example/demo-slidespurr.html` to try slides interactively.

## Use as a dependency

In an existing project:

```bash
pnpm add slides-purryst
```

Or point to a local build / git repo:

```bash
pnpm add ./path/to/slides-purryst
# or
pnpm add github:user/slides-purryst
```

### HTML setup

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/node_modules/slides-purryst/style.css" />
</head>
<body>
  <div id="app"></div>
  <template id="sp-content">
    <sp-slide>
      <h1>Hello, SlidesPurryst!</h1>
    </sp-slide>
    <sp-slide transition="fade">
      <h2>Slide two</h2>
    </sp-slide>
  </template>
  <script type="module">
    import { createSlidesPurryst } from 'slides-purryst'
    import 'slides-purryst/style.css'
    createSlidesPurryst().mount()
  </script>
</body>
</html>
```

If using a bundler (Vite, etc.):

```ts
import { createSlidesPurryst } from 'slides-purryst'
import 'slides-purryst/style.css'
createSlidesPurryst({ el: '#app' })
```

### Available imports

- `createSlidesPurryst(options)` — boots the full presentation
- Components: `SpPresentation`, `SpSlide`, `SpAlternatives`, `SpAnim`, `SpDrag`, `SpInclude`, `SpSvg`, `SpStyle`
- Composables: `useScale`, `useElementScale`, `useSteps`, `useNavigation`, `useSlides`, `usePresenter`
- Plugins: `transformSvg`, `transformSvgString` (from `transformers/svg`)

See `src/types.ts` for `SPSlidesOptions`.

# SlidesPurryst

Where Typst meets Vue in purr-fect harmony.


## Without typst (= SlidesPurr)

### Minimal use

Here we need slides-purryst and vue
- use a downloaded slides-purryst
- use a vue from CDN (but you can download it and update the importmap)

```bash
mkdir my-slides && cd my-slides
#cp the purryst .es.js and .css
```

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="./slides-purryst.css">
  <title>My Slides</title>
</head>
<body>
<script type="importmap">
{
    "imports": {
        "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
        "sp": "./slides-purryst.es.js"
    }
}
</script>
<template id="sp-content">
    
  <sp-slide>
    <h1>Hello, SlidesPurryst!</h1>
  </sp-slide>
  <sp-slide transition="fade">
    <h2>Slide two</h2>
  </sp-slide>
  
</template>
<script type="module">
import { createSlidesPurryst } from 'sp'
createSlidesPurryst()
</script>
</body>
</html>
```



Serve with any static file server, choose among:

```bash
# live reload
pnpx --package=@web/dev-server wds -w .
# no live reload
pnpx serve
python3 -m http.server
```









---



## Use 1 — Using pnpm (from github)

```bash
mkdir my-slides && cd my-slides
pnpm init
pnpm add github:twitwi/slides-purryst
```

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Slides</title>
</head>
<body>
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
createSlidesPurryst()
</script>
</body>
</html>
```

Serve with any static file server:

```bash
pnpx vite
```

## Use 2 — Prebuilt ZIP

> ZIP download: TODO (once CI publishes releases)

Download and extract `slides-purryst.zip`, then create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Slides</title>
<link rel="stylesheet" href="slides-purryst.css">
</head>
<body>
<template id="sp-content">
  <sp-slide>
    <h1>Hello, SlidesPurryst!</h1>
  </sp-slide>
  <sp-slide transition="fade">
    <h2>Slide two</h2>
  </sp-slide>
</template>
<script type="module" src="slides-purryst.es.js"></script>
<script type="module">
import { createSlidesPurryst } from './slides-purryst.es.js'
createSlidesPurryst()
</script>
</body>
</html>
```

Serve locally:

```bash
python3 -m http.server 8080
# or
npx wds --node-resolve
```

## Use 4 — Dev mode (clone & hack)

```bash
git clone https://github.com/twitwi/slides-purryst
cd slides-purryst
pnpm install
pnpm build
pnpm dev
```

Edit `example/demo-slidespurr.html` and refresh to see changes.

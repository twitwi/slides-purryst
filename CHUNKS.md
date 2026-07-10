

## SlidesPurryst (typst level)





## SlidesPurr (intermediate representation, no need for typst)


### TOC

```html
<!-- Default — ordered list with slide numbers, start at h2 -->
<sp-toc />
<sp-toc :highlight="1" /> <!-- highlight section n+1 -->
```

```html
<sp-toc :start="1" />            <!-- show all levels, no section grouping -->
<sp-toc :start="3" />            <!-- only h3+ -->
<sp-toc :start="3" context />    <!-- only h3+, show parent h2 faded -->
<sp-toc :start="1" :end="2" />   <!-- only h1 and h2 -->
```

```html
<!-- Custom template — receives items, currentIndex, goTo -->
<sp-toc v-slot="{ items, currentIndex, goTo }">
  <div v-for="item in items" :key="item.slideIndex"
       :class="{ active: item.slideIndex === currentIndex }"
       @click="goTo(item.slideIndex)">
    {{ item.slideNum }} — {{ item.text }}
  </div>
</sp-toc>
```

```ts
// Headless: use the tree data directly in any component
import { useSlideTree, type TocItem } from 'slides-purryst'
const { tree } = useSlideTree(slidesRef)
// tree.value → TocItem[]
```


### sp-alternatives

```html
<sp-alternatives>        <!-- default: cycle=false, shows child 0,1,2 then nothing -->
<sp-alternatives cycle>          <!-- wraps: 0,1,2,0,1,2,... -->
<sp-alternatives :cycle="true">  <!-- same -->
```

```html
<sp-alternatives at="2">
  <div>Option A</div>
  <div>Option B</div>
</sp-alternatives>
```

NB: "at" defaults to 0



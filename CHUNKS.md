




### TOC

```
<!-- Default — ordered list with slide numbers -->
<sp-toc />
```

```
<!-- Custom template — receives items, currentIndex, goTo -->
<sp-toc v-slot="{ items, currentIndex, goTo }">
  <div v-for="item in items" :key="item.slideIndex"
       :class="{ active: item.slideIndex === currentIndex }"
       @click="goTo(item.slideIndex)">
    {{ item.slideNum }} — {{ item.text }}
  </div>
</sp-toc>
```

```
// Headless: use the tree data directly in any component
import { useSlideTree, type TocItem } from 'slides-purryst'
const { tree } = useSlideTree(slidesRef)
// tree.value → TocItem[]
```

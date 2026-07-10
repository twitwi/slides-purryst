




### TOC

```
<!-- Default — ordered list with slide numbers, start at h2 -->
<sp-toc />
```

```
<sp-toc :start="1" />            <!-- show all levels, no section grouping -->
<sp-toc :start="3" />            <!-- only h3+ -->
<sp-toc :start="1" :end="2" />   <!-- only h1 and h2 -->
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

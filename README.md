# Midnight UI - Infinite Slider

**Midnight UI - Infinite Slider** is a lightweight, dependency-free JavaScript slider library designed to support infinite horizontal or vertical slides. It's built to be highly customizable, responsive, and framework-agnostic.

---

## 🚀 Features

- Infinite loop logic using cloned slides
- Supports both **horizontal** and **vertical** layouts
- Autoplay with progress bar
- Touch & mouse drag support
- Optional navigation buttons
- Lightweight with no external dependencies
- Easy integration and customization

---

## 🛠️ Installation

You can import it as a module:

```js
import { InfiniteSlider } from './infinite-slider.js';
Or include it via script tag:

html
<script src="path/to/infinite-slider.js"></script>
📦 Usage
HTML structure example:

html
<div id="my-slider">
  <div class="midnight-slide-track">
    <div class="midnight-slide-card">Slide 1</div>
    <div class="midnight-slide-card">Slide 2</div>
    <div class="midnight-slide-card">Slide 3</div>
    ...
  </div>
</div>
JavaScript initialization:

js

const slider = new InfiniteSlider({
  container: '#my-slider',
  layout: 0, // 0 = horizontal, 1 = vertical
  autoplay: true,
  interval: 3000,
  showProgress: true,
  prevBtn: '#prev-btn',
  nextBtn: '#next-btn',
  progressBar: '#progress-bar'
});
📚 API
Public Methods
Method	Description
next()	Move to next slide
prev()	Move to previous slide
goTo(index)	Jump to specific index
getSlideItems()	Get all slide elements
updateSlideItems(newItems)	Replace slide items
getCurrentIndex()	Get current slide index
destroy()	Destroy slider and clean up

🔧 Options
Option	Type	Default	Description
container	string	required	CSS selector for container
layout	number	0	0 = horizontal, 1 = vertical
autoplay	boolean	false	Auto-slide toggle
interval	number	3000	Interval in ms
prevBtn, nextBtn, progressBar	string	null	Optional selectors

📂 File Structure
/midnight-UI/
├── infinite-slider.js
├── styles/
│   └── slider.css (optional default styling)
└── README.md
📝 License
MIT License

🙌 Author
Developed by @Midnight2206

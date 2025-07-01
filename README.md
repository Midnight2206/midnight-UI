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
```
Or include it via script tag:
```html
<div id="my-slider">
  <div class="midnight-slide-track">
    <div class="midnight-slide-card">Slide 1</div>
    <div class="midnight-slide-card">Slide 2</div>
    <div class="midnight-slide-card">Slide 3</div>
    <!-- more slides -->
  </div>
</div>
```
## 📚 API
| Method                 | Description                 |
| ---------------------- | --------------------------- |
| `next()`               | Move to next slide          |
| `prev()`               | Move to previous slide      |
| `goTo(index)`          | Jump to specific index      |
| `getSlideItems()`      | Get all slide elements      |
| `updateSlideItems([])` | Replace slide items         |
| `getCurrentIndex()`    | Get current slide index     |
| `destroy()`            | Destroy slider and clean up |
---
🔧 Options
| Option        | Type    | Default  | Description                         |
| ------------- | ------- | -------- | ----------------------------------- |
| `container`   | string  | required | CSS selector for container          |
| `layout`      | number  | `0`      | `0` = horizontal, `1` = vertical    |
| `autoplay`    | boolean | `false`  | Auto-slide toggle                   |
| `interval`    | number  | `3000`   | Interval time in milliseconds       |
| `prevBtn`     | string  | `null`   | Selector for previous button        |
| `nextBtn`     | string  | `null`   | Selector for next button            |
| `progressBar` | string  | `null`   | Selector for progress bar container |
---
## 📂 File Structure

/midnight-UI/
├── infinite-slider.js
├── styles/
│   └── slider.css         # (optional default styling)
└── README.md
## 📝 License
MIT License
## 🙌 Author
Developed by @Midnight2206

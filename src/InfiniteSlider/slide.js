/**
 * Các property cho class Slider:
 * 
 * @property {HTMLElement|string} container - Phần tử gốc của Slider.
 * @property {Array<HTMLElement|string>} slideItems - Danh sách các mục slide, có thể là phần tử HTML hoặc chuỗi (HTML/image URL).
 * @property {function} onProgress - Hàm callback gọi khi cập nhật tiến trình.
 * @property {HTMLElement|string} progressBarItem - Phần tử HTML hoặc chuỗi dùng cho progress bar item.
 * @property {number} progressBarDisplay - 1: hiển thị progress bar, 0: không hiển thị (mặc định: 1).
 * @property {boolean} autoPlay - Có bật tự động chuyển slide không (mặc định: false).
 * @property {number} autoPlayDelay - Delay (ms) giữa các lần chuyển slide khi autoPlay bật (mặc định: 3000).
 * @property {string} progressBarPosition - Vị trí thanh progress: 'start' (trái/trên), 'end' (phải/dưới). Mặc định: 'start'.
 * @property {number} layout - Loại layout: 0 = ngang, 1 = dọc (mặc định: 0).
 * @property {HTMLElement|string|null} prevBtn - Nút điều hướng về trước (có thể là phần tử HTML, selector string hoặc null).
 * @property {HTMLElement|string|null} nextBtn - Nút điều hướng về sau (có thể là phần tử HTML, selector string hoặc null).
 * @property {number} duration - Thời gian transition (đơn vị: giây). Mặc định: 0.3.
 * @property {number} thresholdRatio - Tỉ lệ kéo so với chiều dài container để quyết định chuyển slide (mặc định: 0).
 * @property {function} onInit - Callback được gọi sau khi slider khởi tạo.
 * @property {function} onChangeSlide - Callback khi slide thay đổi.
 */
export class InfiniteSlider {
  #track;
  #container;
  #slideItems;
  #startX;
  #startY;
  #isDragging = false;
  #slideWidth = 0;
  #slideHeight = 0;
  #layout;
  #stepDistance;
  #duration;
  #thresholdRatio;
  #prevBtn = null;
  #nextBtn = null;
  #handlers;
  #autoPlayID = null;
  #autoPlayEnabled;
  #autoPlayDelay;
  #isDestroyed = false;
  #progressBarItem;
  #progressBarDisplay;
  #progressBar;
  #progressBarPosition;
  #axis;
  #onInit;
  #onChangeSlide;
  #layoutClasses = ["midnight-layout-horizontal", "midnight-layout-vertical"];

  constructor({
    container,
    slideItems,
    onProgress,
    progressBarItem,
    progressBarDisplay = 1,
    autoPlay = false,
    autoPlayDelay = 3000,
    progressBarPosition = "start",
    layout = 0,
    prevBtn = null,
    nextBtn = null,
    duration = 0.3,
    thresholdRatio = 0,
    onInit,
    onChangeSlide,
  }) {
    this.#container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.#container) {
      throw new Error("Container element not found");
    }

    this.#slideItems = slideItems
      ? this.#handleSlideItems(slideItems)
      : Array.from(this.#container.children);
    this.#prevBtn = prevBtn;
    this.#nextBtn = nextBtn;
    this.#progressBarItem = progressBarItem;
    this.#progressBarPosition = progressBarPosition;
    this.#progressBarDisplay = progressBarDisplay;
    this.onProgress = onProgress;
    this.#handlers = {
      touchStart: this.#touchStart.bind(this),
      touchMove: this.#touchMove.bind(this),
      touchEnd: this.#touchEnd.bind(this),
      touchProgressBar: this.#touchProgressBar.bind(this),
    };
    this.#duration = duration;
    this.#thresholdRatio = thresholdRatio;
    this.#autoPlayEnabled = autoPlay;
    this.#autoPlayDelay = autoPlayDelay;
    this.index = 0;
    this.#layout = layout;
    this.#onInit = onInit;
    this.#onChangeSlide = onChangeSlide;
    this.#init();
    this.#axis = this.#layout === 0 ? "X" : "Y";
  }

  #init() {
    this.#prevBtn = this.#createControlSlideButtons(this.#prevBtn, "prev");
    this.#nextBtn = this.#createControlSlideButtons(this.#nextBtn, "next");
    this.#progressBar = this.#createProgressBar(
      this.#progressBarItem,
      this.#progressBarPosition
    );
    this.#prevBtn.classList.add("midnight-prev-btn");
    this.#nextBtn.classList.add("midnight-next-btn");
    this.#container.innerHTML = "";
    this.#track = document.createElement("div");
    this.#track.classList.add(
      "midnight-slide-track",
      this.#layoutClasses[this.#layout]
    );
    this.#container.classList.add("midnight-slide-container");

    this.#container.appendChild(this.#track);
    this.#container.appendChild(this.#prevBtn);
    this.#container.appendChild(this.#nextBtn);
    this.#container.appendChild(this.#progressBar);
    this.#activeProgressBarItem(0);
    if (!this.#progressBarDisplay) {
      this.#progressBar.classList.add("none");
    }
    this.#render();
    this.#attachEvents();
    if (this.#autoPlayEnabled) {
      this.#startAutoPlay();
    }
    this.#handleResize();
    window.addEventListener("resize", this.#handleResize);
    if (typeof this.#onInit === "function") {
      this.#onInit(this.getCurrentIndex());
    }
  }

  #startAutoPlay() {
    if (!this.#autoPlayEnabled) return;
    this.#stopAutoPlay();
    this.#autoPlayID = setInterval(() => {
      this.#startChangeSlide();
      this.#forwardSlide();
      this.#endChangeSlide();
    }, this.#autoPlayDelay);
  }

  #stopAutoPlay() {
    clearInterval(this.#autoPlayID);
    this.#autoPlayID = null;
  }

  #render() {
    this.#track.innerHTML = "";
    this.#track.style.transform = null;
    this.#track.style.transition = null;
    this.#slideItems.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("midnight-slide-card");

      const wrapper = document.createElement("div");
      wrapper.classList.add("midnight-slide-item");
      wrapper.appendChild(item.item);

      card.appendChild(wrapper);
      this.#track.appendChild(card);
    });
  }
  #createControlSlideButtons(input, direc) {
    let textDefault;
    if (this.#layout) {
      textDefault = direc === "next" ? "↓" : "↑";
    } else {
      textDefault = direc === "next" ? ">" : "<";
    }

    if (input instanceof HTMLElement) {
      input.classList.add("midnight-control-btn");
      return input;
    }

    if (typeof input === "string") {
      const trimmed = input.trim();

      // Nếu là HTML string
      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        const template = document.createElement("template");
        template.innerHTML = trimmed;
        const el = template.content.firstElementChild;
        if (!el) throw new Error("Invalid HTML string for button");
        el.classList.add("midnight-control-btn");
        return el;
      }

      // Nếu là class name
      const btn = document.createElement("button");
      btn.innerText = textDefault;
      btn.className = trimmed;
      btn.classList.add("midnight-control-btn");
      return btn;
    }

    // Nếu không truyền gì hoặc truyền không hợp lệ
    const fallback = document.createElement("button");
    fallback.innerText = textDefault;
    fallback.classList.add("midnight-control-btn");
    return fallback;
  }
  #createProgressBar(input, pos) {
    const defaultClassItem = "midnight-progress-bar-item";
    const defaultClassBar = "midnight-progress-bar";

    let itemHTML = "";
    // Nếu là HTML element
    if (input instanceof HTMLElement) {
      input.classList.add(defaultClassItem);
      itemHTML = input.outerHTML;
    } else if (typeof input === "string") {
      const trimmed = input.trim();

      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        // HTML string
        const template = document.createElement("template");
        template.innerHTML = trimmed;
        const el = template.content.firstElementChild;
        if (!el) throw new Error("Invalid HTML string for progressBar");
        el.classList.add(defaultClassItem);
        el.style.transition = `all ${this.#duration} ease`;
        itemHTML = el.outerHTML;
      } else {
        // Class name
        itemHTML = `<div class="${defaultClassItem} ${trimmed}" style="transition: all ${
          this.#duration
        } ease;"></div>`;
      }
    } else {
      // Mặc định
      itemHTML = `<div class="${defaultClassItem}" style="transition: all ${
        this.#duration
      } ease;"></div>`;
    }

    // Tạo thanh Progress
    const progressBar = document.createElement("div");
    progressBar.classList.add(defaultClassBar);
    if (pos === "start")
      progressBar.classList.add("midnight-progress-bar-start");
    if (pos === "end") progressBar.classList.add("midnight-progress-bar-end");
    if (!this.#layout) {
      progressBar.classList.add("horizontal");
    } else {
      progressBar.classList.add("vertical");
    }
    const slidesCount = this.#slideItems.length;
    const itemsHTML = Array(slidesCount).fill(itemHTML).join("");
    progressBar.innerHTML = itemsHTML;
    return progressBar;
  }

  #handleSlideItems(slideItems) {
    if (!Array.isArray(slideItems)) {
      throw new Error("slideItems must be an array");
    }

    return slideItems.map((item, index) => {
      if (typeof item === "string") {
        if (this.#isImageUrl(item)) {
          const img = document.createElement("img");
          img.src = item;
          img.alt = "";
          return { item: img, index };
        }

        const template = document.createElement("template");
        template.innerHTML = item.trim();
        const node = template.content.firstElementChild;
        if (!node) throw new Error("Invalid HTML string in slideItems");
        return { item: node, index };
      }

      if (item instanceof HTMLElement) {
        return { item, index };
      }

      throw new Error("Each slide item must be a string or HTMLElement");
    });
  }

  #isImageUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  #attachEvents() {
    this.#track.addEventListener("pointerdown", this.#handlers.touchStart, {
      passive: true,
    });
    this.#track.addEventListener("pointermove", this.#handlers.touchMove, {
      passive: true,
    });
    this.#track.addEventListener("pointerup", this.#handlers.touchEnd);
    this.#track.addEventListener("pointercancel", this.#handlers.touchEnd);
    this.#track.addEventListener("mouseleave", this.#handleMouseLeave);

    this.#prevBtn.addEventListener("pointerdown", this.#handlers.touchStart, {
      passive: true,
    });
    this.#prevBtn.addEventListener("pointerup", this.#handlers.touchEnd);

    this.#nextBtn.addEventListener("pointerdown", this.#handlers.touchStart, {
      passive: true,
    });
    this.#nextBtn.addEventListener("pointerup", this.#handlers.touchEnd);

    this.#progressBar.addEventListener(
      "click",
      this.#handlers.touchProgressBar
    );
  }

  #removeEvents() {
    this.#track.removeEventListener("pointerdown", this.#handlers.touchStart);
    this.#track.removeEventListener("pointermove", this.#handlers.touchMove);
    this.#track.removeEventListener("pointerup", this.#handlers.touchEnd);
    this.#track.removeEventListener("pointercancel", this.#handlers.touchEnd);
    this.#track.removeEventListener("mouseleave", this.#handleMouseLeave);

    this.#prevBtn.removeEventListener("pointerdown", this.#handlers.touchStart);
    this.#prevBtn.removeEventListener("pointerup", this.#handlers.touchEnd);

    this.#nextBtn.removeEventListener("pointerdown", this.#handlers.touchStart);
    this.#nextBtn.removeEventListener("pointerup", this.#handlers.touchEnd);

    this.#progressBar.removeEventListener(
      "click",
      this.#handlers.touchProgressBar
    );
  }

  #getPosX(e) {
    return e.clientX;
  }
  #getPosY(e) {
    return e.clientY;
  }
  #touchProgressBar(e) {
    console.log(e);

    const items = Array.from(this.#progressBar.children);
    const clickedIndex = items.indexOf(e.target);
    if (clickedIndex === -1 || clickedIndex === this.getCurrentIndex()) return;
    this.goTo(clickedIndex);
  }
  #startChangeSlide() {
    this.#stopAutoPlay();
    this.#track.style.transition = "none";
    this.#track.style.transform = "";
    const lastChildClone =
      this.#track.children[this.#track.children.length - 1].cloneNode(true);
    this.#track.prepend(lastChildClone);
    this.#track.style.transform = `translate${this.#axis}(${
      this.#stepDistance
    }px)`;
  }
  #touchStart(e) {
    this.#startX = e.clientX;
    this.#startY = e.clientY;
    if (this.#startX && this.#startY) {
      this.#isDragging = true;
      this.#startChangeSlide();
    }
  }
  #touchMove(e) {
    if (!this.#isDragging) return;
    const detal = this.#layout
      ? this.#getPosY(e) - this.#startY
      : this.#getPosX(e) - this.#startX;

    this.#track.style.transform = `translate${this.#axis}(${
      detal + this.#stepDistance
    }px)`;
  }
  #handleMouseLeave = (e) => {
    if (!this.#isDragging) return;
    this.#handlers.touchEnd(e);
  };
  #backSlide() {
    this.#track.style.transform = `translate${this.#axis}(${
      this.#stepDistance * 0
    }px)`;
    const last = this.#slideItems.pop();
    this.#slideItems.unshift(last);
  }
  #forwardSlide() {
    this.#track.style.transform = `translate${this.#axis}(${
      this.#stepDistance * 2
    }px)`;
    const first = this.#slideItems.shift();
    this.#slideItems.push(first);
  }
  #endChangeSlide() {
    this.#track.style.transition = `transform ${this.#duration}s ease`;
    this.#activeProgressBarItem(this.#slideItems[0].index);
    this.#removeEvents();
    const handleTransitionEnd = () => {
      this.#render();
      this.#track.removeEventListener("transitionend", handleTransitionEnd);
      this.#attachEvents();
    };
    this.#track.addEventListener("transitionend", handleTransitionEnd);
    if (this.#autoPlayEnabled) {
      this.#startAutoPlay();
    }
    if (typeof this.#onChangeSlide === "function") {
      this.#onChangeSlide(this.getCurrentIndex);
    }
  }
  #touchEnd(e) {
    if (!this.#isDragging) return;
    const endX = this.#getPosX(e);
    const endY = this.#getPosY(e);

    this.#isDragging = false;
    const detal = this.#layout ? endY - this.#startY : endX - this.#startX;
    if (endX === this.#startX && endY === this.#startY) {
      const rectContainer = this.#container.getBoundingClientRect();
      let action;
      if (this.#layout) {
        const middlePoint = rectContainer.top + rectContainer.height / 2;
        action = endY < middlePoint ? "back" : "forward";
      } else {
        const middlePoint = rectContainer.left + rectContainer.width / 2;
        action = endX < middlePoint ? "back" : "forward";
      }
      if (action === "forward") this.#forwardSlide();
      if (action === "back") this.#backSlide();
    } else {
      const isChangeSlide =
        this.#thresholdRatio * this.#stepDistance < Math.abs(detal);

      if (isChangeSlide) {
        detal < 0 ? this.#backSlide() : this.#forwardSlide();
      } else {
        this.#track.style.transform = `translate${this.#axis}(${
          this.#stepDistance
        }px)`;
      }
    }
    this.#endChangeSlide();
  }
  #activeProgressBarItem(index) {
    Array.from(this.#progressBar.children).forEach((item) => {
      item.classList.remove("active");
    });
    this.#progressBar.children[index]?.classList.add("active");
  }
  #handleResize = () => {
    this.#slideWidth =
      this.#container.querySelector(".midnight-slide-card")?.offsetWidth || 0;
    this.#slideHeight =
      this.#container.querySelector(".midnight-slide-card")?.offsetHeight || 0;
    this.#stepDistance =
      this.#layout === 0 ? this.#slideWidth : this.#slideHeight;
  };

  //Public method
  destroy() {
    if (this.#isDestroyed) return;

    this.#removeEvents();
    window.removeEventListener("resize", this.#handleResize);
    this.#isDestroyed = true;
    if (this.#container && this.#container instanceof HTMLElement) {
      this.#container.classList.remove("midnight-slide-container");
      this.#layoutClasses.forEach((cls) => this.#track?.classList.remove(cls));
      this.#container.innerHTML = "";
    }
    this.#track = null;
    this.#container = null;
    this.#slideItems = null;
    this.#prevBtn = null;
    this.#nextBtn = null;
    this.#progressBar = null;
    this.#progressBarItem = null;
    this.#handlers = null;
  }
  getContainer() {
    return this.#container;
  }
  getTrack() {
    return this.#track;
  }
  getPrevButton() {
    return this.#prevBtn;
  }
  getNextButton() {
    return this.#nextBtn;
  }
  getProgressBar() {
    return this.#progressBar;
  }
  next() {
    if (this.#isDestroyed) return;
    this.#startChangeSlide();
    this.#forwardSlide();
    this.#endChangeSlide();
  }
  prev() {
    if (this.#isDestroyed) return;
    this.#startChangeSlide();
    this.#backSlide();
    this.#endChangeSlide();
  }
  getSlideItems() {
    return this.#slideItems.map((s) => s.item);
  }
  updateSlideItems(newItems) {
    this.#slideItems = this.#handleSlideItems(newItems);
    this.#render();
    this.#activeProgressBarItem(0);
  }
  getCurrentIndex() {
    return this.#slideItems[0]?.index ?? 0;
  }
  goTo(index) {
    const currentIndex = this.#slideItems[0].index;
    let steps = index - currentIndex;
    if (steps === 0) return;

    while (steps > 0) {
      this.#forwardSlide();
      steps--;
    }
    while (steps < 0) {
      this.#backSlide();
      steps++;
    }
    this.#render();
    this.#activeProgressBarItem(index);
  }
}

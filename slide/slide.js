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
  #progressBarItem;
  #progressBar;
  #progressBarClass;
  #progressBarPosition;
  #axis;
  #layoutClasses = ["midnight-layout-horizontal", "midnight-layout-vertical"];

  constructor({
    container,
    slideItems,
    onProgress,
    progressBarItem,
    progressBarClass,
    progressBarPosition = "start",
    layout = 0,
    prevBtn = null,
    nextBtn = null,
    duration = 0.3,
    thresholdRatio = 0,
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
    this.#progressBarClass = progressBarClass;
    this.#progressBarPosition = progressBarPosition;
    this.onProgress = onProgress;
    this.#handlers = {
      touchStart: this.#touchStart.bind(this),
      touchMove: this.#touchMove.bind(this),
      touchEnd: this.#touchEnd.bind(this),
      prevClick: this.#handlePrevBtn.bind(this),
      nextStart: this.#handleNextBtnStart.bind(this),
      nextEnd: this.#handleNextBtnEnd.bind(this),
    };
    this.#duration = duration;
    this.#thresholdRatio = thresholdRatio;
    this.index = 0;
    this.#layout = layout;
    this.#init();
    this.#axis = this.#layout === 0 ? "X" : "Y";
  }

  #init() {
    this.#prevBtn = this.#createControlSlideButtons(this.#prevBtn, "prev");
    this.#nextBtn = this.#createControlSlideButtons(this.#nextBtn, "next");
    this.#progressBar = this.#createProgressBar(
      this.#progressBarItem,
      this.#progressBarClass,
      this.#progressBarPosition
    );
    this.#prevBtn.classList.add("midnight-prev-btn");
    this.#nextBtn.classList.add("midnight-next-btn");
    // Reset container
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
    this.#render();
    this.#attachEvents();
    this.#slideWidth =
      this.#container.querySelector(".midnight-slide-card")?.offsetWidth || 0;
    this.#slideHeight =
      this.#container.querySelector(".midnight-slide-card")?.offsetHeight || 0;
    this.#stepDistance =
      this.#layout === 0 ? this.#slideWidth : this.#slideHeight;
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
  #createProgressBar(input, barClass, pos) {
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
    if (barClass) progressBar.classList.add(barClass);
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
    this.#track.addEventListener("mousedown", this.#handlers.touchStart);
    document.addEventListener("mousemove", this.#handlers.touchMove);
    document.addEventListener("mouseup", this.#handlers.touchEnd);
    this.#track.addEventListener("touchstart", this.#handlers.touchStart, {
      passive: true,
    });
    this.#track.addEventListener("touchmove", this.#handlers.touchMove, {
      passive: true,
    });
    this.#track.addEventListener("touchend", this.#handlers.touchEnd);

    this.#prevBtn.addEventListener("click", this.#handlers.prevClick);
    this.#nextBtn.addEventListener("mousedown", this.#handlers.nextStart);
    this.#nextBtn.addEventListener("mouseup", this.#handlers.nextEnd);
  }

  #removeEvents() {
    this.#track.removeEventListener("mousedown", this.#handlers.touchStart);
    document.removeEventListener("mousemove", this.#handlers.touchMove);
    document.removeEventListener("mouseup", this.#handlers.touchEnd);
    this.#track.removeEventListener("touchstart", this.#handlers.touchStart);
    this.#track.removeEventListener("touchmove", this.#handlers.touchMove);
    this.#track.removeEventListener("touchend", this.#handlers.touchEnd);

    this.#prevBtn.removeEventListener("click", this.#handlers.prevClick);
    this.#nextBtn.removeEventListener("mousedown", this.#handlers.nextStart);
    this.#nextBtn.removeEventListener("mouseup", this.#handlers.nextEnd);
  }

  #getPosX(e) {
    return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
  }
  #getPosY(e) {
    return e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
  }

  #touchStart(e) {
    console.log(this.#startX, this.#startY);

    if (e.type === "mousedown") {
      this.#startX = e.clientX;
      this.#startY = e.clientY;
    } else if (e.type === "touchstart") {
      this.#startX = e.touches[0].clientX;
      this.#startY = e.touches[0].clientY;
    }
    if (this.#startX && this.#startY) {
      this.#isDragging = true;
      this.#track.style.transition = "none";
      // Reset mọi transform trước khi áp dụng
      this.#track.style.transform = "";
      const lastChildClone =
        this.#track.children[this.#track.children.length - 1].cloneNode(true);
      this.#track.prepend(lastChildClone);
      this.#track.style.transform = `translate${this.#axis}(${-this
        .#stepDistance}px)`;
    }
  }
  #touchMove(e) {
    if (!this.#isDragging) return;
    const detal = this.#layout
      ? this.#getPosY(e) - this.#startY
      : this.#getPosX(e) - this.#startX;

    this.#track.style.transform = `translate${this.#axis}(${
      detal - this.#stepDistance
    }px)`;
  }
  #backSlide() {
    this.#track.style.transform = `translate${this.#axis}(${
      this.#stepDistance * -2
    }px)`;
    const first = this.#slideItems.shift();
    this.#slideItems.push(first);
  }
  #forwardSlide() {
    this.#track.style.transform = `translate${this.#axis}(${
      this.#stepDistance * 0
    }px)`;
    const last = this.#slideItems.pop();
    this.#slideItems.unshift(last);
  }
  #touchEnd(e) {
    if (!this.#isDragging) return;
    const endX = this.#getPosX(e);
    const endY = this.#getPosY(e);

    this.#isDragging = false;
    const detal = this.#layout ? endY - this.#startY : endX - this.#startX;
    this.#track.style.transition = `transform ${this.#duration}s ease`;
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
        this.#track.style.transform = `translate${this.#axis}(${-this
          .#stepDistance}px)`;
      }
    }

    this.#activeProgressBarItem(this.#slideItems[0].index);
    this.#removeEvents();
    const handleTransitionEnd = () => {
      this.#render();
      this.#track.removeEventListener("transitionend", handleTransitionEnd);
      this.#attachEvents();
    };
    this.#track.addEventListener("transitionend", handleTransitionEnd);
  }
  #handlePrevBtn() {
    this.#track.style.transition = null;
    // Reset mọi transform trước khi áp dụng
    this.#track.style.transform = "";
    this.#track.style.transition = `transform ${this.#duration}s ease`;
    if (this.#layout) {
      this.#track.style.transform = `translate${this.#axis}(${
        this.#stepDistance * -1
      }px)`;
    } else {
      this.#track.style.transform = `translate${this.#axis}(${
        this.#stepDistance * 1
      }px)`;
    }
    const first = this.#slideItems.shift();
    this.#slideItems.push(first);
    this.#activeProgressBarItem(this.#slideItems[0].index);
    this.#removeEvents();
    const handleTransitionEnd = () => {
      this.#render();
      this.#track.removeEventListener("transitionend", handleTransitionEnd);
      this.#attachEvents();
    };
    this.#track.addEventListener("transitionend", handleTransitionEnd);
  }
  #handleNextBtnStart() {
    this.#track.style.transition = null;
    this.#track.style.transform = "";
    const lastChildClone =
      this.#track.children[this.#track.children.length - 1].cloneNode(true);
    this.#track.prepend(lastChildClone);
    this.#track.style.transform = `translate${this.#axis}(${-this
      .#stepDistance}px)`;
  }
  #handleNextBtnEnd() {
    this.#removeEvents();
    this.#track.style.transition = `transform ${this.#duration}s ease`;
    this.#forwardSlide();
    this.#activeProgressBarItem(this.#slideItems[0].index);
    const handleTransitionEnd = () => {
      this.#render();
      this.#track.removeEventListener("transitionend", handleTransitionEnd);
      this.#attachEvents();
    };
    this.#track.addEventListener("transitionend", handleTransitionEnd);
  }
  #activeProgressBarItem(index) {
    Array.from(this.#progressBar.children).forEach((item) => {
      item.classList.remove("active");
    });
    this.#progressBar.children[index]?.classList.add("active");
  }
}

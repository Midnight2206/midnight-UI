export default class MediaPlayer extends HTMLElement {
  constructor() {
    super();
    this.media = null;
    this.playList = [];
    this.currentIndex = 0;
    this.repeatMode = "off";
    this.isRandom = false;
    this.remain = [];

    this.endedMedia = this.endedMedia.bind(this);
    this.previousMedia = this.previousMedia.bind(this);
    this.nextMedia = this.nextMedia.bind(this);
  }

  connectedCallback() {
    this.dataset.playerId = this.dataset.playerId || crypto.randomUUID();

    this.mediaCover = document.createElement("div");
    this.mediaCover.dataset.mediaCover = true;
    this.prepend(this.mediaCover);

    document.addEventListener("random-toggle", (e) => {
      if (e.detail?.playerId === this.dataset.playerId) {
        this.isRandom = e.detail.isRandom;
        this.remain = [];
      }
    });

    document.addEventListener("repeat-toggle", (e) => {
      if (e.detail?.playerId === this.dataset.playerId) {
        this.repeatMode = e.detail.mode;
      }
    });
  }

  setPlayList(list) {
    if (!Array.isArray(list) || list.length === 0) {
      console.warn("Playlist must be a non-empty array");
      return;
    }
    this.playList = list;
    this.currentIndex = 0;
    this.remain = [];
    this.renderMedia();
  }

  renderMedia() {
    const item = this.playList[this.currentIndex];
    if (!item) return;

    if (this.media) {
      this.media.removeEventListener("ended", this.endedMedia);
      this.media.remove();
    }

    this.media = document.createElement(item.type);
    this.media.src = item.src;
    this.media.controls = true;
    this.media.addEventListener("ended", this.endedMedia);

    this.mediaCover.innerHTML = "";
    this.mediaCover.appendChild(this.media);

    document.querySelectorAll(`[data-control-player="${this.dataset.playerId}"]`)
      .forEach(el => {
        if (el.dataset.controlType === "item" && typeof el.setMedia === "function") {
          el.setMedia(this.media);
        }
      });

    this.media.play().catch(console.warn);
  }

  endedMedia() {
    if (this.repeatMode === "one") {
      this.media.currentTime = 0;
      this.media.play();
      return;
    }

    this.nextMedia(true);
  }

  nextMedia(fromEnded = false) {
    if (this.isRandom) {
      const nextIndex = this.createRandomIndex();
      if (nextIndex !== null) {
        this.currentIndex = nextIndex;
        this.renderMedia();
      } else if (this.repeatMode === "all") {
        this.remain = [];
        const next = this.createRandomIndex();
        if (next !== null) {
          this.currentIndex = next;
          this.renderMedia();
        }
      }
      return;
    }

    if (this.currentIndex < this.playList.length - 1) {
      this.currentIndex++;
      this.renderMedia();
    } else if (this.repeatMode === "all") {
      this.currentIndex = 0;
      this.renderMedia();
    } else if (!fromEnded) {
      this.currentIndex = this.playList.length - 1;
    }
  }

  previousMedia() {
    if (this.isRandom) {
      this.currentIndex = this.createRandomIndex();
    } else {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.repeatMode === "all"
          ? this.playList.length - 1
          : 0;
      }
    }
    this.renderMedia();
  }

  createRandomIndex() {
    if (this.remain.length === 0) {
      this.remain = Array.from({ length: this.playList.length }, (_, i) => i);
    }

    // Nếu chỉ còn currentIndex, tránh lặp lại liên tiếp
    if (this.remain.length === 1 && this.remain[0] === this.currentIndex) {
      return null;
    }

    // Xóa currentIndex ra khỏi danh sách nếu chưa phát
    const indexOfCurrent = this.remain.indexOf(this.currentIndex);
    if (indexOfCurrent !== -1) {
      this.remain.splice(indexOfCurrent, 1);
    }

    const randomIndex = Math.floor(Math.random() * this.remain.length);
    const index = this.remain[randomIndex];
    this.remain.splice(randomIndex, 1);
    return index ?? null;
  }
}

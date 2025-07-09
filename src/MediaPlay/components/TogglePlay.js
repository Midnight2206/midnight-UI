export default class TogglePlay extends HTMLElement {
  constructor() {
    super();
    this.media = null;
    this.togglePlay = this.togglePlay.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  connectedCallback() {
    if(!this.dataset.controlPlayer) {
      const player = this.closest("media-player");
      if (player) {
        this.dataset.controlPlayer = player.dataset.playerId
      } else {
        console.warn("TogglePlay: No media player found in the hierarchy.");
      }
    }
    this.dataset.controlType = 'item'
    this.#ensureDefaultIcons();
    this.setAttribute("role", "button");
    this.setAttribute("aria-label", "Toggle Play");
    this.setAttribute("tabindex", "0");
    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.togglePlay();
      }
    });
    this.addEventListener("click", this.togglePlay);
  }
  disconnectedCallback() {
    this.removeEventListener("click", this.togglePlay);
    if (this.media) {
      this.media.removeEventListener("play", this.updateState);
      this.media.removeEventListener("pause", this.updateState);
    }
  }
  setMedia(media) {
    if (this.media) {
      this.media.removeEventListener("play", this.updateState);
      this.media.removeEventListener("pause", this.updateState);
    }
    this.media = media;
    this.updateState();
    this.media.addEventListener("play", this.updateState);
    this.media.addEventListener("pause", this.updateState);
  }
  togglePlay() {
    if (!this.media) return;
    this.media.paused ? this.media.play() : this.media.pause();
  }
  updateState() {
    const playIcon = this.querySelector('[slot="play"]');
    const pauseIcon = this.querySelector('[slot="pause"]');
    if (!playIcon || !pauseIcon) return;
    if (this.media.paused) {
      playIcon.style.display = "inline-block";
      pauseIcon.style.display = "none";
    } else {
      playIcon.style.display = "none";
      pauseIcon.style.display = "inline-block";
    }
    this.setAttribute("data-state", this.media.paused ? "paused" : "playing");
    this.setAttribute("aria-label", this.dataset.label || "Toggle Play");
  }

  // Private methods
  #ensureDefaultIcons() {
    if (!this.querySelector('[slot="play"]')) {
      const play = document.createElement("span");
      play.setAttribute("slot", "play");
      play.textContent = "▶️";
      this.appendChild(play);
    }
    if (!this.querySelector('[slot="pause"]')) {
      const pause = document.createElement("span");
      pause.setAttribute("slot", "pause");
      pause.textContent = "⏸️";
      this.appendChild(pause);
    }
  }
}

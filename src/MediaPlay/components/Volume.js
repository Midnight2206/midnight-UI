export default class VolumeControl extends HTMLElement {
  constructor() {
    super();
    this.dataset.controlType = "item";
    this.media = null;
    this.lastVolume = 1; // volume trước khi mute hoặc chuyển media
    this.lastMuted = false;

    // Tạo slider
    this.volumeSlider = document.createElement("input");
    this.volumeSlider.type = "range";
    this.volumeSlider.min = "0";
    this.volumeSlider.max = "1";
    this.volumeSlider.step = "0.01";
    this.volumeSlider.value = "1";

    // Tạo icon mute/unmute
    const icon = this.#createIcon();
    this.muteIcon = icon.muteIcon;
    this.unmuteIcon = icon.unmuteIcon;

    this.iconWrapper = document.createElement("div");
    this.iconWrapper.append(this.muteIcon, this.unmuteIcon);

    // Gắn vào DOM
    this.appendChild(this.iconWrapper);
    this.appendChild(this.volumeSlider);

    // Bind sự kiện
    this.onInput = this.onInput.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
  }

  connectedCallback() {
    if (!this.dataset.controlPlayer) {
      const player = this.closest("media-player");
      if (player) {
        this.dataset.controlPlayer = player.dataset.playerId || "default";
        const media = player.querySelector("audio, video");
        if (media) {
          this.setMedia(media);
        } else {
          console.warn("VolumeControl: No media element found.");
        }
      } else {
        console.warn("VolumeControl: No <media-player> found.");
      }
    }

    this.volumeSlider.addEventListener("input", this.onInput);
    this.iconWrapper.addEventListener("click", this.toggleMute);
  }

  disconnectedCallback() {
    this.volumeSlider.removeEventListener("input", this.onInput);
    this.iconWrapper.removeEventListener("click", this.toggleMute);
    if (this.media) {
      this.media.removeEventListener("volumechange", this.updateVolume);
    }
  }

  setMedia(media) {
    if (this.media) {
      this.media.removeEventListener("volumechange", this.updateVolume);
    }

    this.media = media;
    if (!media) return;

    // Gán lại giá trị volume/mute đã lưu
    media.volume = this.lastVolume;
    media.muted = this.lastMuted;

    this.volumeSlider.value = media.volume.toFixed(2);
    media.addEventListener("volumechange", this.updateVolume);
    this.updateVolume();
  }

  onInput() {
    if (!this.media) return;
    const volume = parseFloat(this.volumeSlider.value);
    this.media.volume = volume;
    this.media.muted = volume === 0;

    // Lưu lại để dùng khi media thay đổi
    this.lastVolume = volume;
    this.lastMuted = this.media.muted;
  }

  toggleMute() {
    if (!this.media) return;
    const wasMuted = this.media.muted;

    if (wasMuted) {
      this.media.muted = false;
      // Nếu volume = 0 thì tự động đặt lại
      this.media.volume = this.lastVolume > 0 ? this.lastVolume : 0.5;
    } else {
      this.lastVolume = this.media.volume;
      this.media.muted = true;
      this.media.volume = 0;
    }

    this.lastMuted = this.media.muted;
  }

  updateVolume() {
    if (!this.media) return;

    const volume = this.media.volume.toFixed(2);
    this.volumeSlider.value = volume;
    this.volumeSlider.setAttribute("aria-valuenow", volume);

    const isMuted = this.media.muted || this.media.volume == 0;
    this.muteIcon.style.display = isMuted ? "inline" : "none";
    this.unmuteIcon.style.display = isMuted ? "none" : "inline";

    // Cập nhật lại giá trị lưu
    this.lastVolume = this.media.volume;
    this.lastMuted = this.media.muted;
  }

  // Tạo icon mặc định nếu chưa có
  #createIcon() {
    let muteIcon = this.querySelector('[slot="mute"]');
    let unmuteIcon = this.querySelector('[slot="unmute"]');

    if (!muteIcon) {
      muteIcon = document.createElement("span");
      muteIcon.textContent = "🔇";
      muteIcon.slot = "mute";
      this.prepend(muteIcon);
    }

    if (!unmuteIcon) {
      unmuteIcon = document.createElement("span");
      unmuteIcon.textContent = "🔊";
      unmuteIcon.slot = "unmute";
      this.prepend(unmuteIcon);
    }

    return { muteIcon, unmuteIcon };
  }
}

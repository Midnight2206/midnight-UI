import MediaPlayer from "./components/MediaPlayer.js";
import TogglePlay from "./components/TogglePlay.js";
import MediaSwitch from "./components/MediaSwitch.js";
import MediaSeek from "./components/MediaSeek.js";
import VolumeControl from "./components/Volume.js";
import RandomBtn from "./components/RandomBtn.js";
import RepeatControl from "./components/RepeatControl.js";

customElements.define('media-player', MediaPlayer);
customElements.define('media-toggle', TogglePlay);
customElements.define('media-switch', MediaSwitch);
customElements.define('media-seek', MediaSeek);
customElements.define('media-volume', VolumeControl);
customElements.define('media-random', RandomBtn);
customElements.define('media-repeat', RepeatControl);

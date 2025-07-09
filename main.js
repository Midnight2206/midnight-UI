const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// import tracks from './src/MediaPlay/data.json';

const mediaCover = $(".media-cover");
const togglePlay = $(".toggle-play");

const playList = [
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    cover:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    cover:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    cover:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
  },
  {
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    cover:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
  },
];
const mediaPlayer = document.querySelector("media-player");
mediaPlayer.setPlayList(playList);


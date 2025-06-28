import { InfiniteSlider } from './slide.js';

const images = [
  'https://placebear.com/400/300',
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3'

];

const slider = new InfiniteSlider({
  container: '#slider-container',
  slideItems: images,
  onProgress: (index) => {
    console.log('Đang ở ảnh:', index);
  },
  layout: 0,
  thresholdRatio: 0,
  duration: 0.3
});

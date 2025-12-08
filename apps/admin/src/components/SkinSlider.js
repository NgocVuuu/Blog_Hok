import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import './SkinSlider.css';

const SkinSlider = ({ skins }) => (
  <div className="skin-slider-glass">
    <Swiper
      effect="coverflow"
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={window.innerWidth < 600 ? 1 : 2.5}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 300,
        modifier: 2,
        slideShadows: true,
      }}
      speed={700}
      navigation
      modules={[EffectCoverflow, Navigation]}
      className="skin-swiper"
    >
      {skins.map((skin, idx) => (
        <SwiperSlide key={idx}>
          <div className="skin-slide">
            <img src={skin.image} alt={skin.name} />
            <div className="skin-name">{skin.name}</div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default SkinSlider; 
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    image: './images/banner_1.jpg',
   
  },

  {
    image: './images/banner_3.jpg',

  },

  {
    image: './images/banner_2.jpg',
    
  },
];



const HeroCarousel = () => {
  return (
    <section className="relative w-full min-h-[30vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
       
        pagination={{ clickable: true }}
        loop
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
        }}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex items-center justify-center absolute inset-0 w-full h-full z-0">
              <img
                src={slide.image}
                alt={slide.headline}
                className="object-cover w-full h-full max-h-[100vh]"
                draggable="false"
              />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-[30vh] md:h-[100vh] px-4">
              <motion.div
                className="text-center"
                initial="initial"
                whileInView="animate"
                exit="exit"
                viewport={{ once: true }}
              >
                
                 
             
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-primary-700/40 z-5 pointer-events-none" />
    </section>
  );
};

export default HeroCarousel; 
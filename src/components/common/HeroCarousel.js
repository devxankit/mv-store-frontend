import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    image: './images/banner_1.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_3.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_2.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
];

const contentVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.5, ease: 'easeIn' } },
};

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
                alt="Banner"
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
                variants={contentVariants}
                viewport={{ once: true }}
              >
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-white text-primary-600 px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-sm md:text-base"
                >
                  {slide.buttonText}
                </Link>
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
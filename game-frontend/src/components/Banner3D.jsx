import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

const BANNER_DATA = [
  {
    id: 1,
    name: "Banner Mặc Định",
    splineUrl: "https://prod.spline.design/rt8i5SfP8x3rCjLW/scene.splinecode",
    bgColor: "#ffffff" // Mã màu của banner này
  }
  // Thêm các banner khác ở đây nếu muốn...
];

// Thêm prop 'onColorChange' để truyền dữ liệu ra ngoài
export default function Banner3D({ onColorChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBanner = BANNER_DATA[currentIndex];

  // DÙNG USEEFFECT: Mỗi khi currentBanner thay đổi, bắn mã màu ra cho file Home
  useEffect(() => {
    if (onColorChange) {
      onColorChange(currentBanner.bgColor);
    }
  }, [currentIndex, currentBanner.bgColor, onColorChange]);

  return (
    <section className="relative h-[450px] w-full bg-transparent group">
      
      <div className="absolute inset-0 size-full">
        <Spline key={currentBanner.splineUrl} scene={currentBanner.splineUrl} />
      </div>

      {BANNER_DATA.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 pointer-events-auto">
          {BANNER_DATA.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => setCurrentIndex(index)}
              title={banner.name}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-8 h-2.5 bg-primary shadow-[0_0_10px_rgba(37,244,106,0.5)]' 
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {BANNER_DATA.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? BANNER_DATA.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 backdrop-blur-sm pointer-events-auto"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev === BANNER_DATA.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 backdrop-blur-sm pointer-events-auto"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </>
      )}
    </section>
  );
}
import React, { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import useAuthStore from '../store/useAuthStore';

gsap.registerPlugin(ScrollTrigger);

function ThreeScene() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef(null);
  const shapesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0x4f46e5, 2);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    light2.position.set(-5, -3, 5);
    scene.add(light2);

    const pointLight = new THREE.PointLight(0x10b981, 1, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const geometryConfigs = [
      { geo: new THREE.TetrahedronGeometry(1.8, 0), color: 0x4f46e5, pos: [-4, 1, 0], rotSpeed: 0.005 },
      { geo: new THREE.OctahedronGeometry(1.5, 0), color: 0x06b6d4, pos: [4, -1.5, -1], rotSpeed: 0.007 },
      { geo: new THREE.IcosahedronGeometry(1.2, 0), color: 0x10b981, pos: [0, 2.5, -2], rotSpeed: 0.009 },
      { geo: new THREE.DodecahedronGeometry(1, 0), color: 0xf59e0b, pos: [-2.5, -2, -3], rotSpeed: 0.006 },
      { geo: new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8), color: 0xec4899, pos: [3, 2, -4], rotSpeed: 0.01 },
    ];

    const shapes = geometryConfigs.map((cfg) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        metalness: 0.3,
        roughness: 0.2,
        wireframe: false,
        transparent: true,
        opacity: 0.85,
        emissive: cfg.color,
        emissiveIntensity: 0.1,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.userData = { rotSpeed: cfg.rotSpeed, basePos: [...cfg.pos] };
      scene.add(mesh);
      return mesh;
    });

    shapesRef.current = shapes;
    sceneRef.current = { scene, camera, renderer, shapes };

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const handleMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const mx = mouseRef.current.x * 0.3;
      const my = mouseRef.current.y * 0.3;

      shapes.forEach((shape) => {
        shape.rotation.x += shape.userData.rotSpeed;
        shape.rotation.y += shape.userData.rotSpeed * 1.5;
        shape.position.x = shape.userData.basePos[0] + mx * (1 + shape.userData.rotSpeed * 100);
        shape.position.y = shape.userData.basePos[1] + my * (1 + shape.userData.rotSpeed * 100);
      });

      camera.position.x += (mx * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (-my * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animId);
      renderer.dispose();
      shapes.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
        scene.remove(s);
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}

function FeatureCard({ icon, title, desc, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-float-in');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="feature-card group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_-10px_rgba(37,244,106,0.15)] opacity-0 translate-y-10"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="text-5xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Discover() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaBtnRef = useRef(null);
  const setShowAuth = useAuthStore((s) => s.setShowAuth);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(titleRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 })
      .fromTo(subtitleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
      .fromTo(ctaBtnRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }, '-=0.3');
  }, []);

  useGSAP(() => {
    const cards = featuresRef.current?.querySelectorAll('.feature-card');
    if (!cards?.length) return;
    ScrollTrigger.create({
      trigger: featuresRef.current,
      start: 'top 75%',
      onEnter: () => {
        cards.forEach((card, i) => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'power3.out',
          });
        });
      },
      once: true,
    });
  }, []);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ctaRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(ctaRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      },
      once: true,
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTA = () => {
    setShowAuth(true);
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <ThreeScene />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="mb-6 inline-block">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/60 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              MathQuest — Nền tảng tư duy
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6"
          >
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">KHÁM PHÁ</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-300 to-cyan-400 bg-clip-text text-transparent">TƯ DUY</span>
          </h1>

          <p ref={subtitleRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MathQuest — Nơi những thử thách toán học và tư duy logic kết hợp cùng hệ thống RPG đầy cuốn hút
          </p>

          <div ref={ctaBtnRef} className="flex items-center justify-center gap-4">
            <button
              onClick={handleCTA}
              className="group relative px-10 py-4 bg-primary text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(37,244,106,0.4)] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Bắt Đầu Hành Trình
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-emerald-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button onClick={scrollToFeatures} className="px-8 py-4 border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/5 transition-all active:scale-95">
              Tìm Hiểu Thêm
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col items-center gap-2 text-gray-500 text-xs font-mono tracking-widest uppercase">
            <span>Cuộn xuống</span>
            <div className="w-5 h-8 border-2 border-gray-500/50 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary/60">Tại sao MathQuest?</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Mọi thứ bạn cần để</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">rèn luyện tư duy</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🧠"
              title="Thử thách tư duy"
              desc="Hàng trăm câu đố toán học và logic từ cơ bản đến nâng cao, được thiết kế để kích thích mọi khía cạnh của trí não bạn."
              index={0}
            />
            <FeatureCard
              icon="⚡"
              title="Hệ thống RPG"
              desc="Kiếm Coin, tích lũy EXP, lên Level và mở khóa những phần thưởng hấp dẫn. Mỗi câu trả lời đúng đều được đền đáp."
              index={1}
            />
            <FeatureCard
              icon="🌐"
              title="Cộng đồng"
              desc="Kết bạn, trò chuyện, tham gia Guild và cạnh tranh trên bảng xếp hạng. Biến việc học thành cuộc phiêu lưu chung."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-20 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 relative z-10">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Sẵn sàng</span>{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">thử thách?</span>
            </h2>

            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 relative z-10">
              Hàng ngàn câu đố đang chờ bạn. Tham gia MathQuest ngay hôm nay và bắt đầu hành trình chinh phục tư duy.
            </p>

            <button
              onClick={() => navigate('/')}
              className="relative z-10 px-12 py-5 bg-gradient-to-r from-primary to-emerald-500 text-white font-bold text-xl rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Khám Phá Ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold">
            Math<span className="text-primary">Quest</span>
          </div>
          <div className="text-xs font-mono tracking-widest uppercase text-gray-600">
            &copy; {new Date().getFullYear()} Project By Khoi
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Discover;

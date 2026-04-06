import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/about.css';

// --- 1. Magnetic Button ---
const MagneticButton = ({ children, className, onClick, to }) => {
    const btnRef = useRef(null);
    const handleMouseMove = (e) => {
        const btn = btnRef.current;
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4; 
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handleMouseLeave = () => {
        if(btnRef.current) {
            btnRef.current.style.transform = `translate(0px, 0px)`;
        }
    };
    const content = (
        <div ref={btnRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick} className={`inline-block transition-transform duration-100 ease-linear cursor-pointer ${className}`}>
            {children}
        </div>
    );
    return to ? <Link to={to}>{content}</Link> : content;
};

// --- 2. Glow & Tilt Card ---
const GlowCard = ({ children, className, style }) => {
    const cardRef = useRef(null);
    const handleMouseMove = (e) => {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        const tiltX = (y / rect.height - 0.5) * -10;
        const tiltY = (x / rect.width - 0.5) * 10;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    const handleMouseLeave = () => {
        if(cardRef.current) {
            cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
    };
    return (
        <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className={`glow-card rounded-3xl transition-transform duration-300 ease-out ${className}`}>
            <div className="glow-card-content flex flex-col justify-between p-10 h-full">{children}</div>
        </div>
    );
};

// --- 3. Interactive Particle Canvas ---
const InteractiveCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };
        let animationFrameId;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };
        window.addEventListener('mousemove', handleMouseMove);

        class Particle {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x; this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
            }
            draw() {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.6)'; // Hạt màu đen xám
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 10;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 10;
                }
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = (canvas.width * canvas.height) / 6000;
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 60) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(15, 23, 42, ${0.15 - distance/80})`; // Dây nối
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// --- 4. Number Counter ---
const NumberCounter = ({ end, duration, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const increment = end / (duration / 16);
                const timer = setInterval(() => {
                    start += increment;
                    if (start >= end) {
                        clearInterval(timer);
                        setCount(end);
                    } else {
                        setCount(Math.floor(start));
                    }
                }, 16);
                observer.disconnect();
            }
        });
        if (countRef.current) observer.observe(countRef.current);
        return () => observer.disconnect();
    }, [end, duration]);
    return <span ref={countRef}>{count}{suffix}</span>;
};

// === TRANG CHÍNH ===
const About = () => {
    const ballRef = useRef(null); // Ref cho quả bóng lăn
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const reveals = document.querySelectorAll('.reveal-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        reveals.forEach(reveal => observer.observe(reveal));
        return () => observer.disconnect();
    }, []);

    // Hiệu ứng quả bóng lăn theo Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (!ballRef.current) return;
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = maxScroll > 0 ? scrollY / maxScroll : 0;
            
            const ballSize = 64; 
            const topPos = scrollFraction * (window.innerHeight - ballSize);
            
            const rotation = scrollY * 0.5;

            // Di chuyển và xoay toàn bộ quả bóng
            ballRef.current.style.transform = `translateY(${topPos}px) rotate(${rotation}deg)`;
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-black overflow-x-hidden relative">
            
            {/* ============================================================ */}
            {/* QUẢ BÓNG ĐỎ ĐƯỢC VẼ BẰNG CODE (CSS)                         */}
            {/* ============================================================ */}
            <div 
                ref={ballRef}
                className="fixed right-4 md:right-8 top-0 w-12 h-12 md:w-16 md:h-16 rounded-full z-50 pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ 
                    transition: 'transform 0.05s linear',
                    // Vẽ quả bóng đỏ 3D bằng Gradient (Màu sáng ở góc trái trên, tối ở góc phải dưới)
                    background: 'radial-gradient(circle at 35% 35%, #ff4d4d 0%, #d50000 40%, #7f0000 100%)', 
                    // Thêm bóng đổ bên ngoài để quả bóng nổi lên
                    boxShadow: '4px 8px 15px rgba(0,0,0,0.3), inset -4px -4px 10px rgba(0,0,0,0.4)', 
                }}
            >
                {/* Đốm sáng (Glare) giúp tạo hiệu ứng khối cầu trong suốt/bóng bẩy */}
                <div 
                    className="absolute rounded-full"
                    style={{
                        width: '35%',
                        height: '35%',
                        top: '15%',
                        left: '20%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                    }}
                ></div>

                {/* Vẽ thêm 2 đường kẻ mờ (như rãnh trên quả bóng) để nhìn rõ hiệu ứng lăn (rotate) */}
                <div className="absolute w-full h-[1px] bg-black/20" style={{ transform: 'rotate(30deg)' }}></div>
                <div className="absolute h-full w-[1px] bg-black/20" style={{ transform: 'rotate(-20deg)' }}></div>
            </div>
            {/* ============================================================ */}

            {/* Part 1: Hero */}
            <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 logic-grid opacity-30"></div>
                
                <div className="absolute top-10 left-20 w-[30rem] h-[30rem] bg-slate-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
                <div className="absolute top-20 right-20 w-[30rem] h-[30rem] bg-gray-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute -bottom-8 left-1/3 w-[30rem] h-[30rem] bg-slate-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

                <div className="relative group z-10 text-center w-full px-4">
                    <div className="text-mask-wrapper">
                        <h1 className="font-extrabold text-[4rem] md:text-[7rem] lg:text-[9rem] tracking-tighter text-black leading-tight pb-6 reveal-up">
                            Tính toán và suy luận
                        </h1>
                    </div>
                    <br/>
                    <div className="text-mask-wrapper">
                        <h1 className="font-extrabold text-[3rem] md:text-[5rem] lg:text-[7rem] tracking-tight text-slate-300 leading-tight pb-6 reveal-up" style={{ transitionDelay: '100ms' }}>
                            Theo cách của bạn
                        </h1>
                    </div>
                </div>
            </section>

            {/* Part 2: Motivation */}
            <section className="min-h-[70vh] bg-white flex items-center justify-center px-8 py-32 border-t border-black/5">
                <div className="max-w-4xl text-center">
                    <div className="text-mask-wrapper">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-black reveal-up">
                            Không chỉ là trò chơi
                        </h2>
                    </div>
                    <div className="text-mask-wrapper mt-2">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-400 reveal-up" style={{ transitionDelay: '100ms' }}>
                            Đó là kiến trúc của tư duy
                        </h2>
                    </div>
                    <p className="mt-12 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed reveal-up" style={{ transitionDelay: '200ms' }}>
                        Chúng tôi bóc tách sự phức tạp của thực tại thành những trải nghiệm tương tác thuần túy. Mỗi thử thách là một công trình logic hoàn hảo
                    </p>
                </div>
            </section>

            {/* Part 3: Blueprint (Bento Box Glow & Tilt) */}
            <section className="py-32 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 reveal-up">
                        <span className="font-mono tracking-[0.2em] text-slate-400 font-bold text-xs uppercase">Bản thiết kế</span>
                        <h2 className="text-4xl font-bold mt-2 text-black">Cấu trúc cốt lõi</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                        <GlowCard className="md:col-span-7 bg-slate-50 shadow-sm reveal-up">
                            <span className="material-symbols-outlined text-black text-5xl mb-6">architecture</span>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-black">Chính xác tuyệt đối</h3>
                                <p className="text-slate-500 leading-relaxed text-lg">Độ chính xác của thuật toán nằm ở trung tâm của mọi tương tác, đảm bảo dòng chảy logic mượt mà.</p>
                            </div>
                        </GlowCard>

                        <GlowCard className="md:col-span-5 bg-white shadow-sm border border-black/5 reveal-up" style={{ transitionDelay: '100ms' }}>
                            <span className="material-symbols-outlined text-black text-5xl mb-6">memory</span>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-black">Tư duy trừu tượng</h3>
                                <p className="text-slate-500 leading-relaxed text-lg">Tách biệt hình ảnh khỏi các phép tính phức tạp.</p>
                            </div>
                        </GlowCard>

                        <GlowCard className="md:col-span-4 bg-white shadow-sm border border-black/5 reveal-up" style={{ transitionDelay: '200ms' }}>
                            <span className="material-symbols-outlined text-black text-5xl mb-6">speed</span>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 text-black">Độ trễ bằng 0</h3>
                                <p className="text-slate-500 leading-relaxed text-lg">Phản hồi ngay lập tức cho từng nước đi của bạn.</p>
                            </div>
                        </GlowCard>

                        <GlowCard className="md:col-span-8 bg-slate-50 border border-black/5 group shadow-sm reveal-up" style={{ transitionDelay: '300ms' }}>
                            <div className="absolute inset-0 w-full h-full logic-grid opacity-30 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                                <span className="material-symbols-outlined text-black text-5xl mb-6">dashboard_customize</span>
                                <div>
                                    <h3 className="text-2xl font-bold mt-6 mb-3 text-black">Hệ sinh thái đa diện</h3>
                                    <p className="text-slate-500 max-w-md leading-relaxed text-lg">Một không gian hỗ trợ hàng ngàn miền logic từ hình học đến lý thuyết trò chơi.</p>
                                </div>
                            </div>
                        </GlowCard>
                    </div>
                </div>
            </section>

            {/* Part 4: Ecosystem (Horizontal Scroll) */}
            <section className="py-32 bg-white overflow-hidden border-y border-black/5">
                <div className="max-w-7xl mx-auto px-8 mb-16 reveal-up">
                    <span className="font-mono tracking-[0.2em] text-slate-400 font-bold text-xs uppercase">Vùng đất thử thách</span>
                    <h2 className="text-4xl font-bold mt-2 text-black">Các Tựa Game Lõi</h2>
                </div>

                <div ref={scrollContainerRef} className="flex gap-8 px-8 md:px-[calc((100vw-1280px)/2+32px)] overflow-x-auto pb-12 no-scrollbar scroll-smooth">
                    {[
                        { img: "/images/thumbnail/rubik.jpg", title: "Khối Rubik", type: "Chiến Lược", link: "/rubik.html" },
                        { img: "/images/thumbnail/puzzle.jpg", title: "Giải Mã Không Gian", type: "Hình Học", link: "/puzzle.html" },
                        { img: "/images/thumbnail/decryption.jpg", title: "Hệ Thống Mật Mã", type: "Thuật Toán", link: "/decryption.html" }
                    ].map((game, index) => (
                        <div key={index} className="min-w-[450px] bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                            <div className="h-72 relative overflow-hidden bg-slate-100">
                                <img src={game.img} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold mb-2 text-black">{game.title}</h3>
                                <p className="text-slate-400 text-xs font-mono uppercase font-bold tracking-widest mb-6">Logic {game.type}</p>
                                <Link to={game.link} className="text-black font-bold text-sm flex items-center gap-2 group/btn">
                                    Khám Phá
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Part 5: Engine (Interactive Canvas trên nền Trắng) */}
            <section className="bg-white text-slate-900 py-40 relative overflow-hidden border-b border-black/5">
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="w-full h-full logic-grid !bg-[radial-gradient(#d1d5db_1px,transparent_1px)]"></div>
                </div>
                <div className="max-w-7xl mx-auto px-8 relative z-10 grid md:grid-cols-2 gap-20 items-center">
                    <div className="reveal-up pointer-events-none">
                        <span className="font-mono tracking-[0.3em] text-slate-400 font-bold text-xs uppercase">Động cơ vận hành</span>
                        <h2 className="text-5xl font-extrabold mt-6 mb-8 leading-tight text-black">Sức mạnh đằng sau mỗi nước đi.</h2>
                        <div className="flex gap-12 mt-12">
                            <div>
                                <div className="text-4xl font-bold text-black mb-1">0.02ms</div>
                                <div className="font-mono text-xs uppercase font-bold tracking-widest text-slate-500">Độ trễ</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-black mb-1">Thuật toán</div>
                                <div className="font-mono text-xs uppercase font-bold tracking-widest text-slate-500">Mạng lưới Logic</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* BẢNG TƯƠNG TÁC HẠT */}
                    <div className="aspect-square border border-black/5 bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden reveal-up shadow-sm" style={{ transitionDelay: '200ms' }}>
                        <InteractiveCanvas />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(255,255,255,0.8))] pointer-events-none"></div>
                       
                    </div>
                </div>
            </section>

            {/* Part 6: Community Counters */}
            <section className="py-32 bg-white text-center border-b border-black/5">
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 reveal-up">
                    <div className="p-16">
                        <span className="font-mono text-xs uppercase font-bold tracking-[0.4em] text-slate-400 mb-6 block">Người chơi</span>
                        <div className="text-[5rem] font-black text-black leading-none mb-4">
                            <NumberCounter end={125} duration={2000} suffix="K+" />
                        </div>
                        <div className="text-lg font-bold text-slate-500">Kết nối toàn cầu</div>
                    </div>
                    <div className="p-16 md:border-l border-black/5">
                        <span className="font-mono text-xs uppercase font-bold tracking-[0.4em] text-slate-400 mb-6 block">Câu đố</span>
                        <div className="text-[5rem] font-black text-black leading-none mb-4">
                            <NumberCounter end={45} duration={2500} suffix="M+" />
                        </div>
                        <div className="text-lg font-bold text-slate-500">Đã được giải mã</div>
                    </div>
                </div>
            </section>

            {/* Part 7: Finale */}
            <section className="py-40 bg-white relative overflow-hidden flex flex-col items-center">
                <div className="relative z-10 text-center max-w-3xl px-8 reveal-up">
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-16 text-black">Thế giới đang chờ tư duy của bạn</h2>
                    <MagneticButton to="/">
                        <div className="inline-block px-12 py-6 bg-black text-white rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform duration-300 shadow-2xl shadow-black/30">
                            Bắt Đầu Hành Trình Ngay
                        </div>
                    </MagneticButton>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-white border-t border-black/5">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-12 max-w-7xl mx-auto">
                    <div className="text-xl font-bold text-black mb-4 md:mb-0">MathQuest</div>
                    <div className="text-[10px] tracking-widest uppercase text-slate-400 font-bold">© {new Date().getFullYear()} Project By Khoi</div>
                </div>
            </footer>

        </div>
    );
};

export default About;
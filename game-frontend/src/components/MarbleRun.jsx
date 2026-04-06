import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const MarbleRun = () => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        // 1. Khởi tạo Engine
        const engine = Matter.Engine.create();
        const render = Matter.Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight,
                wireframes: false,
                background: 'transparent' // Nền trong suốt
            }
        });
        engineRef.current = engine;

        // 2. Dựng các "bức tường" dựa trên class 'marble-wall'
        const buildWalls = () => {
            Matter.Composite.clear(engine.world);
            const wallElements = document.querySelectorAll('.marble-wall');
            const walls = [];

            wallElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                // Cộng thêm window.scrollY để lấy đúng tọa độ tuyệt đối trên toàn bộ trang
                const y = rect.top + window.scrollY + rect.height / 2;
                
                walls.push(
                    Matter.Bodies.rectangle(x, y, rect.width, rect.height, { 
                        isStatic: true, 
                        render: { visible: false }, // Ẩn tường vật lý đi vì đã có giao diện web
                        friction: 0.05,
                        restitution: 0.4
                    })
                );
            });

            // Sàn nhà để bi không rơi ra khỏi map
            walls.push(
                Matter.Bodies.rectangle(
                    document.documentElement.scrollWidth / 2, 
                    document.documentElement.scrollHeight + 50, 
                    document.documentElement.scrollWidth, 
                    100, 
                    { isStatic: true }
                )
            );

            Matter.Composite.add(engine.world, walls);
        };

        // Đợi DOM render xong mới đo kích thước
        setTimeout(buildWalls, 500);

        // 3. Hàm thả bi
        const dropMarble = () => {
            const startX = Math.random() * document.documentElement.scrollWidth;
            const marble = Matter.Bodies.circle(startX, -50, 20, {
                restitution: 0.7, // Độ nảy
                friction: 0.005,
                render: {
                    fillStyle: '#475569', // Màu xám dự phòng nếu ảnh lỗi
                    sprite: {
                        // Đảm bảo ảnh này có trong thư mục public/images/ của bạn
                        texture: '/images/z7696764312246_813f4a2e51a703fede087cdb5eda995d.jpg',
                        xScale: 0.08, 
                        yScale: 0.08
                    }
                }
            });
            Matter.Composite.add(engine.world, marble);

            // Xóa bi cũ để khỏi lag máy
            if (engine.world.bodies.length > 40) {
                const oldestBody = engine.world.bodies.find(b => !b.isStatic);
                if (oldestBody) Matter.Composite.remove(engine.world, oldestBody);
            }
        };

        const intervalId = setInterval(dropMarble, 1500);

        // 4. Khởi chạy
        Matter.Runner.run(Matter.Runner.create(), engine);
        Matter.Render.run(render);

        // Cập nhật tường khi thay đổi kích thước màn hình
        window.addEventListener('resize', () => {
            render.canvas.width = document.documentElement.scrollWidth;
            render.canvas.height = document.documentElement.scrollHeight;
            buildWalls();
        });

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', buildWalls);
            Matter.Render.stop(render);
            Matter.Engine.clear(engine);
            if (render.canvas) render.canvas.remove();
        };
    }, []);

    return (
        // Quan trọng: z-index phải cao (vd: 50) để nổi lên trên nền trắng, 
        // pointer-events-none để không chặn các nút click của bạn
        <div 
            ref={sceneRef} 
            className="absolute top-0 left-0 w-full pointer-events-none z-50" 
            style={{ height: '100%' }}
        />
    );
};

export default MarbleRun;
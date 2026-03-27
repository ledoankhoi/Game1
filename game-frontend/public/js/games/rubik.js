// file: public/js/games/rubik.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Sử dụng OrbitControls ổn định hơn

// --- 1. BIẾN TOÀN CỤC & SETUP ---
let cubeSize = 3; 
let isAnimating = false;
let isPrimePressed = false;
const spacing = 1.05; 

const container = document.getElementById('cube-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Nền trắng tinh

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(6, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Chặn menu chuột phải
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

// OrbitControls: Giúp xoay camera quanh trục ổn định, không bị lộn ngược đầu gây chóng mặt
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.mouseButtons = { 
    LEFT: THREE.MOUSE.ROTATE, 
    MIDDLE: THREE.MOUSE.DOLLY, 
    RIGHT: THREE.MOUSE.ROTATE 
};

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); 
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); 
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const cubeGroup = new THREE.Group();
scene.add(cubeGroup);
const cubies = [];

// Màu sắc Rubik chuẩn
const colors = [
    0xff002a, 0xff7b00, 0xffffff, 0xffea00, 0x00d856, 0x0055ff  
];
const faceMaterials = colors.map(color => new THREE.MeshPhongMaterial({
    color: color, shininess: 90, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
}));
const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });

// --- MÀNG CHỌN HIGHLIGHT TĨNH (Sáng nhẹ, không rối mắt) ---
const highlightGroup = new THREE.Group();
const hPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ 
        color: 0x8ff5ff, transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false
    })
);
const hEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
    new THREE.LineBasicMaterial({ color: 0x006a71, linewidth: 3 }) 
);
highlightGroup.add(hPlane);
highlightGroup.add(hEdges);
scene.add(highlightGroup);
highlightGroup.visible = false;

function highlightFace(axisWorld, size) {
    highlightGroup.visible = true;
    const s = size * spacing;
    highlightGroup.scale.set(s, s, 1); 
    
    const offset = (size * spacing) / 2 + 0.06; 
    highlightGroup.position.copy(axisWorld).multiplyScalar(offset);
    highlightGroup.lookAt(highlightGroup.position.clone().add(axisWorld));
}

let currentMapping = {};
function resetMapping() {
    currentMapping = {
        f: new THREE.Vector3(0, 0, 1), b: new THREE.Vector3(0, 0, -1),
        u: new THREE.Vector3(0, 1, 0), d: new THREE.Vector3(0, -1, 0),
        r: new THREE.Vector3(1, 0, 0), l: new THREE.Vector3(-1, 0, 0)
    };
}

// --- 2. HÀM TẠO RUBIK ---
function createCube(size) {
    if(isAnimating) return;
    cubeSize = size;
    
    cubies.forEach(c => {
        c.geometry.dispose(); c.material.forEach(m => m.dispose()); cubeGroup.remove(c);
    });
    cubies.length = 0;
    camera.position.set(size*2, size*1.6, size*2.6);
    const offset = (size - 1) / 2; 

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const mats = [
                    x === size - 1 ? faceMaterials[0] : blackMaterial, x === 0 ? faceMaterials[1] : blackMaterial,        
                    y === size - 1 ? faceMaterials[2] : blackMaterial, y === 0 ? faceMaterials[3] : blackMaterial,        
                    z === size - 1 ? faceMaterials[4] : blackMaterial, z === 0 ? faceMaterials[5] : blackMaterial         
                ];
                const cubie = new THREE.Mesh(geometry, mats);
                const cx = x - offset, cy = y - offset, cz = z - offset;
                cubie.position.set(cx * spacing, cy * spacing, cz * spacing);

                const edges = new THREE.EdgesGeometry(geometry);
                cubie.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })));

                cubie.userData = { currentPos: new THREE.Vector3(cx, cy, cz) };
                cubeGroup.add(cubie); cubies.push(cubie);
            }
        }
    }
    resetMapping();
    highlightFace(currentMapping.f, size);
}
createCube(3);

// --- 3. LOGIC KÉO THẢ THÔNG MINH ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let startX = 0, startY = 0;
let isDraggingOnCube = false;
let startHit = null;

container.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 2) return; // Nhận chuột trái/phải
    if (isAnimating) return;

    startX = e.clientX; 
    startY = e.clientY;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubies, true);
    startHit = intersects.find(intersect => intersect.face);

    if (startHit) {
        // Nhấn VÀO khối Rubik -> Tắt xoay camera để ưu tiên vuốt xoay lớp
        isDraggingOnCube = true;
        controls.enabled = false;
    } else {
        // Nhấn vào NỀN TRỐNG -> Kích hoạt xoay camera
        isDraggingOnCube = false;
        controls.enabled = true;
    }
});

container.addEventListener('pointerup', (e) => {
    controls.enabled = true; // Luôn bật lại camera khi nhả chuột
    
    if (!isDraggingOnCube || isAnimating) {
        startHit = null;
        isDraggingOnCube = false;
        return;
    }

    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);

    if (dist <= 5) {
        // CLICK -> CHỌN MẶT F
        const hitNormal = startHit.face.normal.clone().transformDirection(startHit.object.matrixWorld);
        const selectedAxis = new THREE.Vector3(Math.round(hitNormal.x), Math.round(hitNormal.y), Math.round(hitNormal.z));
        
        updateLogicalMapping(selectedAxis);
        highlightFace(selectedAxis, cubeSize); 
        logText(`[Góc Nhìn] Chọn F: (${selectedAxis.x}, ${selectedAxis.y}, ${selectedAxis.z})`);
    } else {
        // VUỐT (SWIPE) -> XOAY LỚP RUBIK
        const rect = renderer.domElement.getBoundingClientRect();
        const eX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const eY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const sX = ((startX - rect.left) / rect.width) * 2 - 1;
        const sY = -((startY - rect.top) / rect.height) * 2 + 1;
        const dragVec = new THREE.Vector2(eX - sX, eY - sY).normalize();

        const hitNormal = startHit.face.normal.clone().transformDirection(startHit.object.matrixWorld);
        const fAxis = new THREE.Vector3(Math.round(hitNormal.x), Math.round(hitNormal.y), Math.round(hitNormal.z));

        // Tạm mượn update để lấy trục U và R của mặt vừa vuốt
        updateLogicalMapping(fAxis);
        highlightFace(fAxis, cubeSize);

        const center3D = fAxis.clone().multiplyScalar((cubeSize * spacing) / 2);
        const pCenter = center3D.clone().project(camera);
        const pU = center3D.clone().add(currentMapping.u).project(camera);
        const pR = center3D.clone().add(currentMapping.r).project(camera);

        const vecU = new THREE.Vector2(pU.x - pCenter.x, pU.y - pCenter.y).normalize();
        const vecR = new THREE.Vector2(pR.x - pCenter.x, pR.y - pCenter.y).normalize();

        const dotU = dragVec.dot(vecU);
        const dotR = dragVec.dot(vecR);

        let rotationAxis, isClockwise;
        if (Math.abs(dotU) > Math.abs(dotR)) {
            rotationAxis = currentMapping.r; 
            isClockwise = dotU > 0;
        } else {
            rotationAxis = currentMapping.u; 
            isClockwise = dotR < 0;
        }

        rotateLayer("swipe", rotationAxis, isClockwise, false, 250, null, startHit.object);
        logMove("SWIPE");
    }

    startHit = null;
    isDraggingOnCube = false;
});

function updateLogicalMapping(f) {
    let camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    let projectedUp = camUp.clone().projectOnPlane(f).normalize();

    let u = new THREE.Vector3();
    if (projectedUp.lengthSq() < 0.01) {
        u = new THREE.Vector3(0, 1, 0);
        if (Math.abs(f.y) === 1) u.set(0, 0, -f.y);
    } else {
        let absX = Math.abs(projectedUp.x), absY = Math.abs(projectedUp.y), absZ = Math.abs(projectedUp.z);
        if (absX > absY && absX > absZ) u.set(Math.sign(projectedUp.x), 0, 0);
        else if (absY > absX && absY > absZ) u.set(0, Math.sign(projectedUp.y), 0);
        else u.set(0, 0, Math.sign(projectedUp.z));
    }

    let r = new THREE.Vector3().crossVectors(u, f).normalize();
    let l = r.clone().negate();
    let d = u.clone().negate();
    let b = f.clone().negate();

    currentMapping = { f, b, u, d, r, l };
}

// --- 4. LOGIC XOAY TOÁN HỌC ---
function rotateLayer(faceKey, axisWorld, isClockwise, isDouble = false, duration = 300, callback = null, targetCubie = null) {
    isAnimating = true;
    const group = new THREE.Group();
    scene.add(group);

    const offset = (cubeSize - 1) / 2;
    let targetDot = offset;
    
    if (targetCubie) {
        targetDot = targetCubie.userData.currentPos.clone().dot(axisWorld);
        targetDot = Math.round(targetDot * 2) / 2; 
    }

    let affectedCubies = [];
    cubies.forEach(cubie => {
        const dot = cubie.userData.currentPos.clone().dot(axisWorld);
        if (Math.abs(dot - targetDot) < 0.1) affectedCubies.push(cubie);
    });

    affectedCubies.forEach(c => group.attach(c));

    const angleStep = (isClockwise ? -1 : 1) * Math.PI / 2;
    const targetAngle = isDouble ? angleStep * 2 : angleStep;
    const startTime = performance.now();

    function animateRotation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); 
        
        group.setRotationFromAxisAngle(axisWorld, targetAngle * easedProgress);

        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            group.updateMatrixWorld();
            const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axisWorld, targetAngle);

            affectedCubies.forEach(cubie => {
                cubeGroup.attach(cubie); 
                cubie.userData.currentPos.applyMatrix4(rotationMatrix);
                cubie.userData.currentPos.x = Math.round(cubie.userData.currentPos.x * 2) / 2;
                cubie.userData.currentPos.y = Math.round(cubie.userData.currentPos.y * 2) / 2;
                cubie.userData.currentPos.z = Math.round(cubie.userData.currentPos.z * 2) / 2;
            });

            scene.remove(group);
            isAnimating = false;
            if (callback) callback();
        }
    }
    requestAnimationFrame(animateRotation);
}

// --- 5. HỆ THỐNG LOG VÀ NHẬP LIỆU BÀN PHÍM ---
const moveLogDiv = document.getElementById('move-log');
function logMove(moveStr) {
    if(moveLogDiv.innerHTML.includes('Chưa có thao tác nào')) moveLogDiv.innerHTML = '';
    
    const span = document.createElement('span');
    span.className = 'log-item shadow-sm';
    if(moveStr.includes("'")) span.classList.add('prime');
    if(moveStr.includes("2")) span.classList.add('double');
    span.textContent = moveStr;
    moveLogDiv.appendChild(span);
    moveLogDiv.scrollTop = moveLogDiv.scrollHeight;
}
function logText(text) {
    if(moveLogDiv.innerHTML.includes('Chưa có thao tác nào')) moveLogDiv.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'w-full text-[10px] text-primary font-bold mb-1 mt-1 uppercase opacity-70';
    div.textContent = text;
    moveLogDiv.appendChild(div);
    moveLogDiv.scrollTop = moveLogDiv.scrollHeight;
}
document.getElementById('btn-clear-log').addEventListener('click', () => {
    moveLogDiv.innerHTML = '<div class="w-full text-center text-sm text-zinc-400 mt-4 italic">Đã dọn dẹp...</div>';
});

window.addEventListener('keydown', (event) => {
    if (isAnimating) return;
    if (event.key === "'") { isPrimePressed = true; return; }

    const key = event.key.toLowerCase();
    if (currentMapping[key]) {
        const isClockwise = !isPrimePressed;
        let moveName = key.toUpperCase() + (isClockwise ? "" : "'");
        logMove(moveName);
        rotateLayer(key, currentMapping[key], isClockwise, false, 300);
        isPrimePressed = false;
    }
});
window.addEventListener('keyup', (event) => { if (event.key === "'") isPrimePressed = false; });

// --- 6. HỆ THỐNG TRỘN RUBIK ---
document.getElementById('btn-scramble').addEventListener('click', () => {
    if (isAnimating) return;
    const faces = ['f', 'b', 'u', 'd', 'l', 'r'];
    const modifiers = ['', "'", '2'];
    let scrambleSequence = [];
    let lastFace = '';
    for (let i = 0; i < 20; i++) {
        let face;
        do { face = faces[Math.floor(Math.random() * faces.length)]; } while (face === lastFace);
        lastFace = face;
        scrambleSequence.push(face + modifiers[Math.floor(Math.random() * modifiers.length)]);
    }

    logText("--- BẮT ĐẦU TRỘN ---");
    let step = 0;
    function executeNext() {
        if (step >= scrambleSequence.length) { logText("--- HOÀN TẤT ---"); return; }
        let move = scrambleSequence[step];
        let key = move[0].toLowerCase();
        let isClockwise = !move.includes("'");
        let isDouble = move.includes("2");
        logMove(move.toUpperCase());
        rotateLayer(key, currentMapping[key], isClockwise, isDouble, 60, () => { step++; executeNext(); });
    }
    executeNext();
});

// --- 7. SỰ KIỆN UI & RENDER ---
document.getElementById('cube-size-select').addEventListener('change', (e) => {
    const size = parseInt(e.target.value); logText(`--- ${size}x${size} ---`); createCube(size);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
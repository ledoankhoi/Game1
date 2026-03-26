// Hàm tính khoảng cách Euclidean giữa 2 vector
// vecA, vecB là mảng số, ví dụ: [1, 0, 1, 0] (1 là đã chơi, 0 là chưa)
const calculateEuclideanDistance = (vecA, vecB) => {
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        sum += Math.pow((vecA[i] || 0) - (vecB[i] || 0), 2);
    }
    return Math.sqrt(sum);
};

/**
 * Thuật toán KNN đơn giản để tìm gợi ý
 * @param {Object} currentUserVector - Vector của người dùng hiện tại
 * @param {Object} otherUsersVectors - Danh sách vector của các người dùng khác {userId: [vector]}
 * @param {Array} allGameSlugs - Danh sách tất cả slug game để đối chiếu chỉ mục
 */
exports.getKNNRecommendations = (currentUserVector, otherUsersVectors, allGameSlugs) => {
    let distances = [];

    // 1. Tính khoảng cách từ User hiện tại đến tất cả User khác
    for (const [userId, vector] of Object.entries(otherUsersVectors)) {
        const distance = calculateEuclideanDistance(currentUserVector, vector);
        distances.push({ userId, distance, vector });
    }

    // 2. Sắp xếp tìm những người "gần" nhất (khoảng cách nhỏ nhất)
    distances.sort((a, b) => a.distance - b.distance);

    // Lấy 3 láng giềng gần nhất (K = 3)
    const neighbors = distances.slice(0, 3);

    // 3. Tìm các game mà láng giềng có chơi (1) nhưng User hiện tại chưa chơi (0)
    const recommendedSlugs = new Set();
    neighbors.forEach(neighbor => {
        neighbor.vector.forEach((val, index) => {
            if (val === 1 && currentUserVector[index] === 0) {
                recommendedSlugs.add(allGameSlugs[index]);
            }
        });
    });

    return Array.from(recommendedSlugs);
};
// 輸入欄位自動聚焦功能
document.getElementById('yearInput').oninput = function() {
    if (this.value.length === 4 && this.value >= 1900 && this.value <= new Date().getFullYear()) {
        document.getElementById('monthInput').focus();
    }
};

document.getElementById('monthInput').oninput = function() {
    let value = this.value;
    
    if (value.length === 1 && value >= '1' && value <= '9') {
        setTimeout(() => {
            if (this.value.length === 1) {
                this.value = '0' + this.value;
                document.getElementById('dayInput').focus();
            }
        }, 300);
    } else if (value.length === 2 && value >= '01' && value <= '12') {
        document.getElementById('dayInput').focus();
    }
};

document.getElementById('dayInput').oninput = function() {
    let value = this.value;
    let month = document.getElementById('monthInput').value;
    let year = document.getElementById('yearInput').value;
    let maxDays = new Date(year, month, 0).getDate();

    if (value.length === 1 && value >= '1' && value <= '9') {
        setTimeout(() => {
            if (this.value.length === 1) {
                this.value = '0' + this.value;
                if (parseInt(this.value) <= maxDays) {
                    document.getElementById('generateButton').focus();
                }
            }
        }, 300);
    } else if (value.length === 2 && parseInt(value) >= 1 && parseInt(value) <= maxDays) {
        document.getElementById('generateButton').focus();
    }
};

// 生成序列的主要函數
function generateSequences() {
    const year = parseInt(document.getElementById('yearInput').value);
    const month = parseInt(document.getElementById('monthInput').value);
    const day = parseInt(document.getElementById('dayInput').value);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        alert('請輸入有效的日期');
        return;
    }

    const birthDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    const weekday = birthDate.getDay();

    const zodiac = getChineseZodiac(year);
    const weekdayName = getWeekdayName(weekday);
    document.getElementById('infoText').textContent = `星期${weekdayName}、生肖：${zodiac}`;

    const container = document.getElementById('sequenceContainer');
    container.innerHTML = '';

    const sequences = [
        getWeekdaySequence(weekday),
        getSequence(month%12+1),
        getChineseZodiacSequence(year)
    ];

    sequences.forEach((seq, index) => {
        const row = document.createElement('div');
        row.className = 'number-row';
        seq.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            cell.textContent = num;
            cell.onclick = cycleColors;
            row.appendChild(cell);
        });
        container.appendChild(row);
    });

    // Add separator
    const separator = document.createElement('div');
    separator.className = 'separator';
    container.appendChild(separator);

    // Generate sum row
    const sumRow = document.createElement('div');
    sumRow.className = 'number-row';
    const sumSequence = [];
    for (let i = 0; i < 12; i++) {
        let sum = (i < 7 ? sequences[0][i] : 0) + sequences[1][i] + sequences[2][i];
        sum = (sum - 1) % 12 + 1;
        sumSequence.push(sum);
        const cell = document.createElement('div');
        cell.className = 'number-cell sum-cell';
        cell.textContent = sum;
        cell.onclick = cycleColors;
        sumRow.appendChild(cell);
    }
    container.appendChild(sumRow);

    // Highlight repeated numbers
    const counts = {};
    sumSequence.forEach(num => {
        counts[num] = (counts[num] || 0) + 1;
    });
    sumRow.childNodes.forEach((cell, index) => {
        if (counts[sumSequence[index]] >= 2) {
            cell.classList.add('repeated');
        }
    });

    // Generate additional rows
    const additionalContainer = document.getElementById('additionalRowsContainer');
    additionalContainer.innerHTML = '';
    const age = calculateAge(birthDate, currentDate);
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'number-row';
        for (let j = 0; j < 12; j++) {
            const cell = document.createElement('div');
            cell.className = 'number-cell';
            const cellAge = i * 12 + j + 1;
            cell.textContent = cellAge;
            if (cellAge === age) {
                cell.classList.add('current-age');
            } else if (cellAge <= age) {
                cell.classList.add('past-age');
            }
            cell.onclick = cycleColors;
            row.appendChild(cell);
        }
        additionalContainer.appendChild(row);
    }

    // ====在最下方創建網格====
    // 創建網格的 SVG
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';

    // 獲取實際的 number-cell 尺寸和間距
    const numberCell = document.querySelector('.number-cell');
    const numberRow = document.querySelector('.number-row');
    const computedStyle = window.getComputedStyle(numberCell);
    const cellMargin = parseFloat(computedStyle.marginRight);
    
    // 計算精確的尺寸
    const CELL_SIZE = numberCell.offsetWidth;
    const CELL_MARGIN = cellMargin || 3; // 如果無法獲取margin，使用默認值3
    const GRID_SIZE = 12;
    const PADDING = CELL_MARGIN; // 使用相同的間距作為padding
    
    // 計算總寬度（需要確保與上方的數字行完全一致）
    const TOTAL_WIDTH = numberRow.offsetWidth;
    const TOTAL_HEIGHT = TOTAL_WIDTH; // 保持正方形

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', TOTAL_WIDTH);
    svg.setAttribute('height', TOTAL_HEIGHT);
    svg.setAttribute('viewBox', `0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`);
    
    // 調整容器樣式以確保對齊
    gridContainer.style.width = `${TOTAL_WIDTH}px`;
    gridContainer.style.marginTop = '8px';
    gridContainer.style.display = 'flex';
    gridContainer.style.justifyContent = 'flex-start'; // 確保左對齊

    // 繪製網格背景
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', i * (CELL_SIZE + CELL_MARGIN));
            rect.setAttribute('y', j * (CELL_SIZE + CELL_MARGIN));
            rect.setAttribute('width', CELL_SIZE);
            rect.setAttribute('height', CELL_SIZE);
            rect.setAttribute('fill', '#f1f5f9');
            rect.setAttribute('rx', '4');
            svg.appendChild(rect);
        }
    }

    // 記錄點的位置並畫線
    const points = [];
    sumSequence.forEach((value, index) => {
        const x = index * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2;
        const y = (12 - value) * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2;
        points.push({ x, y });
    });

    // 找出相同 Y 值的點並繪製水平連線
    function findAndDrawHorizontalConnections() {
        // 創建一個以 Y 座標為鍵的映射
        const sameYPoints = {};
        points.forEach((point, index) => {
            const y = point.y;
            if (!sameYPoints[y]) {
                sameYPoints[y] = [];
            }
            sameYPoints[y].push({x: point.x, index: index});
        });

        // 為每組相同 Y 值的點創建水平連線
        Object.entries(sameYPoints).forEach(([y, points]) => {
            if (points.length >= 2) {
                // 按 X 座標排序點
                points.sort((a, b) => a.x - b.x);
                
                // 對每對連續的點創建連線
                for (let i = 0; i < points.length - 1; i++) {
                    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    horizontalLine.setAttribute('d', `M${points[i].x},${y} L${points[i + 1].x},${y}`);
                    horizontalLine.setAttribute('stroke', 'rgba(239, 68, 68, 0.53)'); // 使用紅色來區分
                    horizontalLine.setAttribute('stroke-width', '2');
                    horizontalLine.setAttribute('stroke-dasharray', '4,4'); // 虛線效果
                    svg.appendChild(horizontalLine);
                }
            }
        });
    }

    // 繪製主要的折線
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathD = points.map((p, i) => 
        (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
    ).join(' ');
    
    path.setAttribute('d', pathD);
    path.setAttribute('stroke', '#2563eb');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    // 添加水平連線
    findAndDrawHorizontalConnections();

    // 添加點（確保點在最上層）
    points.forEach(({ x, y }) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#2563eb');
        svg.appendChild(circle);
    });

    gridContainer.appendChild(svg);

    // 添加 Y 軸刻度（從下往上 1-12）
    for (let i = 0; i < GRID_SIZE; i++) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (CELL_SIZE + CELL_MARGIN) / 2 - 6);  // 向左偏移一點
        text.setAttribute('y', (GRID_SIZE - i - 0.5) * (CELL_SIZE + CELL_MARGIN));
        text.setAttribute('fill', '#94a3b8');  // 使用淡灰色
        text.setAttribute('font-size', '12');
        text.textContent = i + 1;
        svg.appendChild(text);
    }

    // 修改 X 軸刻度，放在網格內部第一行
    for (let i = 0; i < GRID_SIZE; i++) {
        if (i==0) continue;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', i * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2);
        text.setAttribute('y', (GRID_SIZE - 1) * (CELL_SIZE + CELL_MARGIN) + CELL_SIZE / 2 + 5); // 放在第一行
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '12');
        text.textContent = i + 1;
        svg.appendChild(text);
    }

    // 在 points 處理之前，先計算當前年齡所在的行數和對應的數字範圍
    const currentAge = calculateAge(birthDate, currentDate);
    const rowIndex = Math.floor((currentAge - 1) / 12); // 計算在第幾行（0-based）
    const startNumber = rowIndex * 12 + 1; // 該行的起始數字

    // 在添加點的部分之後，加上標籤
    points.forEach(({ x, y }, index) => {
        const number = startNumber + index;
        const isCurrentAge = number === currentAge;
        
        // 先畫點
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        
        if (isCurrentAge) {
            // 當前年齡的點樣式
            circle.setAttribute('r', '6');  // 更大的點
            circle.setAttribute('fill', '#ef4444');  // 紅色
            // 添加光暈效果
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('cx', x);
            glow.setAttribute('cy', y);
            glow.setAttribute('r', '12');
            glow.setAttribute('fill', 'none');
            glow.setAttribute('stroke', '#ef4444');
            glow.setAttribute('stroke-width', '2');
            glow.setAttribute('opacity', '0.3');
            svg.appendChild(glow);
        } else {
            // 普通點的樣式
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', '#2563eb');
        }
        svg.appendChild(circle);
    
        // 添加標籤
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let labelX = x + 10;
        let labelY = y - 5;
        
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('fill', isCurrentAge ? '#ef4444' : '#2563eb');  // 當前年齡的標籤也用紅色
        label.setAttribute('font-size', isCurrentAge ? '14' : '12');  // 當前年齡的標籤字體更大
        label.setAttribute('font-weight', isCurrentAge ? 'bold' : 'normal');  // 當前年齡的標籤加粗
        label.setAttribute('text-anchor', 'start');
        label.textContent = number;
        svg.appendChild(label);
    });

    // Add fade-in effect
    container.classList.add('fade-in');
    additionalContainer.classList.add('fade-in');
}

function cycleColors() {
    if (!this.classList.contains('clicked-1') && !this.classList.contains('clicked-2')) {
        this.classList.add('clicked-1');
    } else if (this.classList.contains('clicked-1')) {
        this.classList.remove('clicked-1');
        this.classList.add('clicked-2');
    } else {
        this.classList.remove('clicked-2');
    }
}

function calculateAge(birthDate, currentDate) {
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age + 1;
}

function getWeekdaySequence(weekday) {
    const sequence = [];
    for (let i = 0; i < 7; i++) {
        sequence.push(((weekday + i) % 7) + 1);
    }
    return sequence;
}

function getChineseZodiacSequence(year) {
    const zodiacStartNumber = (year - 1900) % 12;
    const sequence = [];
    for (let i = 0; i < 12; i++) {
        sequence.push((zodiacStartNumber + i) % 12 + 1);
    }
    return sequence;
}

function getSequence(start) {
    const sequence = [];
    for (let i = 0; i < 12; i++) {
        sequence.push((start + i - 1) % 12 + 1);
    }
    return sequence;
}

function getChineseZodiac(year) {
    const zodiac = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
    return zodiac[(year - 1900) % 12];
}

function getWeekdayName(weekday) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[weekday];
}

// 新增的截圖和分享功能
async function captureAndShare() {
    try {
        const captureArea = document.getElementById('captureArea');
        
        // Create a new container for cloned content
        const cloneContainer = document.createElement('div');
        cloneContainer.style.position = 'absolute';
        cloneContainer.style.left = '-9999px';
        cloneContainer.style.top = '-9999px';
        document.body.appendChild(cloneContainer);

        // Clone the capture area content
        const clone = captureArea.cloneNode(true);
        cloneContainer.appendChild(clone);

        // Replace number cells with SVG
        const cells = clone.querySelectorAll('.number-cell');
        cells.forEach(cell => {
            const svgns = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgns, "svg");
            svg.setAttribute('width', '40');
            svg.setAttribute('height', '40');
            svg.setAttribute('viewBox', '0 0 40 40');

            const rect = document.createElementNS(svgns, 'rect');
            rect.setAttribute('width', '40');
            rect.setAttribute('height', '40');
            rect.setAttribute('fill', '#f1f5f9');
            rect.setAttribute('rx', '4');
            svg.appendChild(rect);

            const text = document.createElementNS(svgns, 'text');
            text.setAttribute('x', '20');
            text.setAttribute('y', '24');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '16');
            text.setAttribute('fill', '#000');
            text.textContent = cell.textContent;
            svg.appendChild(text);

            cell.innerHTML = '';
            cell.appendChild(svg);
        });

        // Adjust styles for SVG containers
        cells.forEach(cell => {
            cell.style.display = 'inline-block';
            cell.style.margin = '2px';
        });

        // Give the page some time to fully render
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(clone, {
            scale: 3,
            useCORS: true,
            logging: true,
            backgroundColor: null,
            imageTimeout: 0,
            onclone: function(clonedDoc) {
                // Additional modifications to the cloned document if needed
            }
        });

        // Clean up: remove the temporarily created container
        document.body.removeChild(cloneContainer);

        const imageData = canvas.toDataURL("image/png", 1.0);

        if (navigator.share) {
            await navigator.share({
                title: '我的日期序列',
                text: '查看我生成的日期序列！',
                files: [new File([await (await fetch(imageData)).blob()], 'date-sequence.png', { type: 'image/png' })]
            });
        } else {
            const link = document.createElement('a');
            link.href = imageData;
            link.download = 'date-sequence.png';
            link.click();
        }
    } catch (error) {
        console.error('截圖或分享失敗:', error);
        alert('截圖或分享失敗，請稍後再試。');
    }
}
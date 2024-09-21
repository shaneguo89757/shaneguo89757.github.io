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
        const canvas = await html2canvas(captureArea);
        const imageData = canvas.toDataURL("image/png");

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
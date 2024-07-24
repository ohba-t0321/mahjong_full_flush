function findWaitingTiles() {
    const hand = document.getElementById('hand').value.trim();
    const resultElement = document.getElementById('result');

    if (!hand) {
        resultElement.textContent = "手牌を入力してください。";
        return;
    }

    const tiles = parseHand(hand);
    const sortedTiles = sortHand(tiles);
    const waitingTiles = calculateWaitingTiles(sortedTiles);

    displayHand(sortedTiles);

    resultElement.textContent = waitingTiles.length > 0 
        ? `待ちは: ${waitingTiles.join(", ")}`
        : "有効な待ちがありません。";
}

function parseHand(hand) {
    const tileTypes = ['m', 'p', 's'];
    const tiles = [];

    tileTypes.forEach(type => {
        const regex = new RegExp(`[1-9]+${type}`, 'g');
        const matches = hand.match(regex);
        if (matches) {
            matches.forEach(match => {
                const nums = match.slice(0, -1).split('').map(Number);
                tiles.push(...nums.map(num => `${num}${type}`));
            });
        }
    });

    return tiles;
}

function generateRandomHand() {
    const suits = ['m', 'p', 's'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const tiles = [];
    while (tiles.length < 13) {
        const tile = `${Math.floor(Math.random() * 9) + 1}${suit}`;
        const tileCounts = {};
        for (let i=1; i<= 9; i++){
            tileCounts[`${i}${suit}`] = 0;
        }
        console.log(tile)
        if (tiles.length === 0){
            tiles.push(tile);
        } else {
            tiles.forEach(tile1_9 => {
                tileCounts[tile1_9]++;
            });
            if (tileCounts[tile]<4){
                tiles.push(tile);
            }
        }
    }

    const sortedTiles = sortHand(tiles);

    document.getElementById('hand').value = sortedTiles.join('');
    document.getElementById('result').textContent = "";

    displayHand(sortedTiles);
}

function sortHand(tiles) {
    const tileTypes = ['m', 'p', 's'];
    const sortedTiles = [];

    tileTypes.forEach(type => {
        const filteredTiles = tiles.filter(tile => tile.endsWith(type));
        filteredTiles.sort((a, b) => parseInt(a) - parseInt(b));
        sortedTiles.push(...filteredTiles);
    });

    return sortedTiles;
}

function displayHand(tiles) {
    const tilesContainer = document.getElementById('tiles');
    tilesContainer.innerHTML = '';

    tiles.forEach(tile => {
        const img = document.createElement('img');
        img.src = `images/${tile}.gif`;
        img.alt = tile;
        img.classList.add('tile');
        tilesContainer.appendChild(img);
    });
}

function calculateWaitingTiles(tiles) {
    const allTiles = generateAllTiles();
    const waitingTiles = [];

    allTiles.forEach(tile => {
        const newHand = [...tiles, tile];
        const sortedHand = sortHand(newHand);
        if (isWinningHand(sortedHand)) {
            waitingTiles.push(tile);
        }
    });

    return waitingTiles;
}

function generateAllTiles() {
    const suits = ['m', 'p', 's'];
    const allTiles = [];

    suits.forEach(suit => {
        for (let i = 1; i <= 9; i++) {
            allTiles.push(`${i}${suit}`);
        }
    });

    return allTiles;
}

function isWinningHand(tiles) {
    if (tiles.length !== 14) return false;
    const tileCounts = getTileCounts(tiles);

    for (let tile in tileCounts) {
        if (tileCounts[tile] >= 2) {
            const remainingTiles = [...tiles];
            removeTiles(remainingTiles, tile, 2);
            if (canFormMelds(remainingTiles)) {
                return true;
            }
        }
    }

    return false;
}

function getTileCounts(tiles) {
    const tileCounts = {};
    tiles.forEach(tile => {
        if (!tileCounts[tile]) {
            tileCounts[tile] = 0;
        }
        tileCounts[tile]++;
    });
    return tileCounts;
}

function removeTiles(tiles, tile, count) {
    for (let i = 0; i < count; i++) {
        const index = tiles.indexOf(tile);
        if (index > -1) {
            tiles.splice(index, 1);
        }
    }
}

function canFormMelds(tiles) {
    if (tiles.length === 0) return true;
    const tileCounts = getTileCounts(tiles);

    for (let tile in tileCounts) {
        if (tileCounts[tile] >= 3) {
            const remainingTiles = [...tiles];
            removeTiles(remainingTiles, tile, 3);
            if (canFormMelds(remainingTiles)) {
                return true;
            }
        }

        const num = parseInt(tile[0]);
        const suit = tile[1];
        if (num <= 7) {
            const sequence = [`${num}${suit}`, `${num + 1}${suit}`, `${num + 2}${suit}`];
            if (sequence.every(t => tileCounts[t] > 0)) {
                const remainingTiles = [...tiles];
                sequence.forEach(t => removeTiles(remainingTiles, t, 1));
                if (canFormMelds(remainingTiles)) {
                    return true;
                }
            }
        }
    }

    return false;
}

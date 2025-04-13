function findWaitingTiles() {
    /*
    目的： 手牌から待ち牌を求め、画面に表示する。
    処理の流れ：
        入力欄（id: hand）から手牌文字列を取得。
        空であればエラーメッセージを出して終了。
        parseHand で手牌を配列に変換。
        sortHand で手牌を種類・数字順に整列。
        calculateWaitingTiles でテンパイ状態かどうかチェック。
        結果を画面に表示。
    */
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
    /*
    目的： テキスト入力（例：123m456p789s）を配列に変換（例：["1m", "2m", "3m", ...]）。
    */
    const suits = ['m', 'p', 's'];
    const tiles = [];

    suits.forEach(suit => {
        const regex = new RegExp(`[1-9]+${suit}`, 'g');
        const matches = hand.match(regex);
        if (matches) {
            matches.forEach(match => {
                const nums = match.slice(0, -1).split('').map(Number);
                tiles.push(...nums.map(num => `${num}${suit}`));
            });
        }
    });

    return tiles;
}

function generateRandomHand() {
    /*
    目的： ランダムな13枚の手牌を生成。
    処理：
        m, p, s のどれか1種類をランダムに選ぶ。
        その種類で1〜9の数字から重複上限（4枚）まで手牌を13枚作る。
        画像表示と入力欄の値を更新。
        現在は清一色の手牌のみ生成。
    */

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
    /*
    目的： 手牌を種類（m→p→s）・数字順に整列。
    */
    const suits = ['m', 'p', 's'];
    const sortedTiles = [];

    suits.forEach(suit => {
        const filteredTiles = tiles.filter(tile => tile.endsWith(suit));
        filteredTiles.sort((a, b) => parseInt(a) - parseInt(b));
        sortedTiles.push(...filteredTiles);
    });

    return sortedTiles;
}

function displayHand(tiles) {
    /*
    目的： 手牌を画像で表示。
    処理：
        画像ファイル（例：images/5p.gif）を <img> タグで生成し、画面に追加。

    */
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
    /*
    目的： すべての可能な牌を1枚加えてアガリになるか調べる。
    流れ：
        generateAllTiles() で全牌（1m～9s）を列挙。
        各牌を1枚ずつ加えて14枚にして、isWinningHand() で判定。
        アガリになる牌をリストアップして返す。
    */
    const allTiles = generateAllTiles();
    const waitingTiles = [];
    const tileCounts = getTileCounts(tiles);

    allTiles.forEach(tile => {
        // すでに4枚ある牌はアガリに使えない
        if (tileCounts[tile] >= 4) return;
        const newHand = [...tiles, tile];
        const sortedHand = sortHand(newHand);
        if (isWinningHand(sortedHand)) {
            waitingTiles.push(tile);
        }
    });

    return waitingTiles;
}

function generateAllTiles() {
    /*
    目的： 1m～9sまでの27種類の牌を生成。
    */
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
    /*
    目的： 14枚の手牌がアガリ形かどうか判定。
    処理の流れ：
        14枚でなければNG。
        各牌を「対子（2枚）」と仮定し、それを除いた残りでメンツ（順子・刻子）を作れるか確認。
        canFormMelds でメンツを構成できるかを再帰的にチェック。
    */
    if (tiles.length !== 14) return false;
    const tileCounts = getTileCounts(tiles);

    // 七対子（チートイツ）のチェック
    const pairs = Object.values(tileCounts).filter(count => count === 2);
    if (pairs.length === 7) {
        return true;
    }
    // 通常のアガリ形（1対子 + 4メンツ）のチェック
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
    /*
    目的： 各牌の枚数をカウント。
    */
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
    /*
    目的： 指定した牌を指定枚数だけ配列から削除。
    */
    for (let i = 0; i < count; i++) {
        const index = tiles.indexOf(tile);
        if (index > -1) {
            tiles.splice(index, 1);
        }
    }
}

function canFormMelds(tiles) {
    /*
    目的： 残った手牌で3枚1組のメンツをすべて作れるかチェック。
    方法：
        同じ牌3枚（刻子）があれば除外し再帰呼び出し。
        順子（連番3枚）があれば除外し再帰呼び出し。
        上記ができなければアガリ形ではない。
    */
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

document.getElementById('hand').addEventListener('input', function(){
    const hand = document.getElementById('hand').value.trim();
    if (!hand) {
        return;
    }

    const tiles = parseHand(hand);
    const sortedTiles = sortHand(tiles);

    displayHand(sortedTiles);
});
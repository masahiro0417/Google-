// Canvas要素とコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲームのワールド設定
const world = {
    gravity: 0.5,
    width: 1600, // ステージの幅を広げる
    ground: 500, // 地面のY座標
};

// カメラオブジェクト
const camera = {
    x: 0,
    y: 0,
};

// プレイヤー（ゴリラ）のオブジェクト
const player = {
    x: 50,
    y: world.ground - 40,
    width: 40,
    height: 40,
    color: 'saddlebrown',
    dx: 0,
    dy: 0,
    speed: 5,
    jumpPower: -12,
    onGround: true
};

// キー入力状態
const keys = {
    right: false,
    left: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space' && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

// アイテム（バナナ）のオブジェクト配列
const bananas = [
    { x: 200, y: 400, width: 20, height: 20, color: 'yellow', type: 'good', eaten: false },
    { x: 450, y: 350, width: 20, height: 20, color: 'yellow', type: 'good', eaten: false },
    { x: 800, y: 400, width: 20, height: 20, color: 'yellow', type: 'good', eaten: false },
    // 悪いバナナ
    { x: 300, y: world.ground - 20, width: 20, height: 20, color: '#A0522D', type: 'bad', eaten: false },
    { x: 600, y: world.ground - 20, width: 20, height: 20, color: '#A0522D', type: 'bad', eaten: false },
    { x: 1000, y: world.ground - 20, width: 20, height: 20, color: '#A0522D', type: 'bad', eaten: false }
];

// ゴールオブジェクト (新しいワールドの端に配置)
const goal = {
    x: world.width - 80,
    y: world.ground - 100,
    width: 10,
    height: 100,
    color: 'gold'
};

// 足場オブジェクトの配列
const platforms = [
    { x: 300, y: 420, width: 150, height: 20 },
    { x: 550, y: 350, width: 150, height: 20 },
    { x: 800, y: 280, width: 150, height: 20 },
    { x: 1100, y: 350, width: 200, height: 20 }
];

let gameClear = false;

function update() {
    if (gameClear) return;

    // プレイヤーの移動
    if (keys.left) {
        player.dx = -player.speed;
    } else if (keys.right) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }
    player.x += player.dx;

    // 重力
    player.dy += world.gravity;
    player.y += player.dy;

    // 足場との衝突判定
    platforms.forEach(platform => {
        // プレイヤーが落下中で、足の上に乗った場合
        if (player.dy > 0 &&
            (player.y + player.height) > platform.y &&
            (player.y + player.height) < platform.y + platform.height &&
            (player.x + player.width) > platform.x &&
            player.x < (platform.x + platform.width))
        {
            // プレイヤーを足場の上に着地させる
            player.y = platform.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
    });

    // 地面との衝突
    if (player.y + player.height > world.ground) {
        player.y = world.ground - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // ワールドの境界から出ないようにする
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > world.width) {
        player.x = world.width - player.width;
    }

    // バナナとの衝突
    bananas.forEach(banana => {
        if (!banana.eaten &&
            player.x < banana.x + banana.width &&
            player.x + player.width > banana.x &&
            player.y < banana.y + banana.height &&
            player.y + player.height > banana.y)
        {
            banana.eaten = true;
            const oldHeight = player.height;
            if (banana.type === 'good') {
                player.width *= 1.5;
                player.height *= 1.5;
            } else {
                player.width = Math.max(20, player.width / 1.5);
                player.height = Math.max(20, player.height / 1.5);
            }
            player.y += oldHeight - player.height;
        }
    });

    // ゴールとの衝突
    if (player.x < goal.x + goal.width && player.x + player.width > goal.x) {
        gameClear = true;
    }

    // カメラの更新
    // プレイヤーを画面の中央に保つようにカメラのx位置を調整
    camera.x = player.x - canvas.width / 2;

    // カメラがワールドの左端より先に行かないように
    if (camera.x < 0) {
        camera.x = 0;
    }
    // カメラがワールドの右端より先に行かないように
    if (camera.x + canvas.width > world.width) {
        camera.x = world.width - canvas.width;
    }
}

function draw() {
    // 背景色（空）でクリア
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // カメラの位置に合わせて描画領域を移動
    ctx.save();
    ctx.translate(-camera.x, 0);

    // --- ここから下の描画はワールド座標系で行われる ---

    // 地面を描画
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, world.ground, world.width, canvas.height - world.ground);

    // ゴールを描画
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // 足場を描画
    ctx.fillStyle = '#A52A2A'; // Brown
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // バナナを描画
    bananas.forEach(banana => {
        if (!banana.eaten) {
            ctx.fillStyle = banana.color;
            ctx.fillRect(banana.x, banana.y, banana.width, banana.height);
        }
    });

    // プレイヤーを描画
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // --- ワールド座標系の描画はここまで ---

    // 描画領域を元に戻す
    ctx.restore();

    // --- ここから下の描画はスクリーン座標系（カメラに影響されない） ---

    // ゲームクリアメッセージ
    if (gameClear) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL!', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Canvas要素とコンテキストの取得
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲームのワールド設定
const world = {
    gravity: 0.5,
    ground: 500, // 地面のY座標
};

// プレイヤー（ゴリラ）のオブジェクト
const player = {
    x: 50,
    y: world.ground - 40, // 初期位置を地面の上にする
    width: 40,
    height: 40,
    color: 'saddlebrown', // ゴリラの色
    dx: 0, // X軸方向の速度
    dy: 0, // Y軸方向の速度
    speed: 5,
    jumpPower: -12,
    onGround: true
};

// キー入力状態
const keys = {
    right: false,
    left: false
};

// キーが押されたときのイベントリスナー
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space' && player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }
});

// キーが離されたときのイベントリスナー
document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

// アイテム（バナナ）のオブジェクト配列
const bananas = [
    // 良いバナナ (木の上にあるイメージ)
    { x: 200, y: 400, width: 20, height: 20, color: 'yellow', type: 'good', eaten: false },
    { x: 450, y: 350, width: 20, height: 20, color: 'yellow', type: 'good', eaten: false },
    // 悪いバナナ (地面に落ちている)
    { x: 300, y: world.ground - 20, width: 20, height: 20, color: '#A0522D', type: 'bad', eaten: false }, // sienna (腐った色)
    { x: 600, y: world.ground - 20, width: 20, height: 20, color: '#A0522D', type: 'bad', eaten: false }
];

// ゴールオブジェクト
const goal = {
    x: canvas.width - 80,
    y: world.ground - 100,
    width: 10,
    height: 100,
    color: 'gold'
};

let gameClear = false;

// ゲームの状態を更新する関数
function update() {
    if (gameClear) return; // ゲームクリアなら更新を停止

    // キー入力に基づくプレイヤーの移動
    if (keys.left) {
        player.dx = -player.speed;
    } else if (keys.right) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }

    // プレイヤーの位置を更新
    player.x += player.dx;

    // 重力
    player.dy += world.gravity;
    player.y += player.dy;

    // 地面との衝突判定
    if (player.y + player.height > world.ground) {
        player.y = world.ground - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // 画面端から出ないようにする
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // バナナとの衝突判定
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
                // 大きくなる
                player.width *= 1.5;
                player.height *= 1.5;
            } else if (banana.type === 'bad') {
                // 小さくなる（最小サイズ制限あり）
                player.width = Math.max(20, player.width / 1.5);
                player.height = Math.max(20, player.height / 1.5);
            }
            // サイズ変更後に地面に足がつくようにy座標を調整
            player.y += oldHeight - player.height;
        }
    });

    // ゴールとの衝突判定
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y)
    {
        gameClear = true;
    }
}

// ゲームを描画する関数
function draw() {
    // Canvasをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景色（空）で塗りつぶし
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地面を描画
    ctx.fillStyle = '#228B22'; // ForestGreen
    ctx.fillRect(0, world.ground, canvas.width, canvas.height - world.ground);

    // ゴールを描画
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // バナナを描画
    bananas.forEach(banana => {
        if (!banana.eaten) {
            ctx.fillStyle = banana.color;
            ctx.fillRect(banana.x, banana.y, banana.width, banana.height);
        }
    });

    // プレイヤー（ゴリラ）を描画
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // ゲームクリアメッセージの表示
    if (gameClear) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL!', canvas.width / 2, canvas.height / 2);
    }
}

// メインのゲームループ
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲーム開始
requestAnimationFrame(gameLoop);

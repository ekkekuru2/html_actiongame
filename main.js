window.addEventListener('load',init);//読み込まれたときにinit関数が呼ばれます。
/*
init
*/
var i;//いろいろ使うやつ
//SmartPhone
window.addEventListener('touchmove', function(event) {
    // 画面のスクロールを防止する
    event.preventDefault();
}, {passive:false});
document.onselectstart = function(){
    return false;
}

//ステージ生成
var Stages ={};
Stages.stage1 = [0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,1,1,1,1,1];

//canvas関係のプロパティ
var canvas;
var ctx;
var SCREEN_WIDTH=500;
var SCREEN_HEIGHT=400;

//ゲーム本体のプロパティ
var lastTimestamp=null;//前回フレームのタイムスタンプ
var second=0;//敵を出すための秒数
var second2=0;//ジャンプ処理に使う秒数
var score=0;
var old_score=0;
var time_span=2.5;
var jump_h=0;




//フラグ
var gameState_Flag=0;//ゲームの状態 0:start_menu 1:game 2:ending

function init(){
    console.log("Thank you for playing This Game!!!");
    console.log("-copyright- 2020 kerry.starfree.jp");

    //キャンバスの初期化
    canvas=document.getElementById('maincanvas');
    ctx=canvas.getContext('2d');
    canvas.width=SCREEN_WIDTH;
    canvas.height=SCREEN_HEIGHT;
    ctx.font="30px sans-serif";
    //色を指定
    ctx.strokeStyle="yellow";  //線の色を青に指定
    ctx.fillStyle="black";     //塗りつぶしの色を赤に指定
    //タッチイベントリスナー
    canvas.addEventListener("touchstart", touchStartHandler, false);
    canvas.addEventListener('touchend',touchEndHanler , false);


    Asset.loadAssets(function(){//アセット読み込み完了したら、、
        //ゲーム開始
        requestAnimationFrame(start_menu);//スタートメニュー毎フレーム呼ぶよ
    });
}


//******assets
var Asset={};//Assetというオブジェクトを定義
Asset.assets=[//Assetの定義
    {type:'image',name:'background',src:'./assets/background.png'},
    {type:'image',name:'mainchar',src:'./assets/maincharactor2.png'},
    {type:'image',name:'enemy',src:'./assets/teki.png'},
    {type:'image',name:'start_menu',src:'./assets/start_menu2.png'},
    {type:'image',name:'gameover',src:'./assets/gameover.png'},
    {type:'audio',name:'jump_sound1',src:'./assets/punch-swing1.mp3'},
    {type:'audio',name:'jump_sound2',src:'./assets/landing1.mp3'}
];
Asset.images={};//種類が画像のアセットの格納場所
Asset.audios={};//種類が音声のアセットの格納場所
Asset.loadAssets=function(onComplete){//Assetオブジェクトのなかの画像読み込み関数
    var total=Asset.assets.length;//アセットの合計数
    var loadCount=0;//読み込みが完了したアセット数

    //アセットが読み込み終わった時に呼ばれるコールバック関数
    var onLoad=function(){
        loadCount++;//読み込み完了数を増やす。
        if(loadCount>=total){//読み込み完了数とアセット総数が等しい
            onComplete();//全部終わったよおおおおおお
        }
    };

    //アセットの種類に応じた読み込み処理関数を呼ぶ
    Asset.assets.forEach(function(asset){//forEach関数は与えられた関数を配列の各要素に対して一度ずつ実行する。与えられた関数の引数の一番目は現在処理されている配列の要素
        switch(asset.type){
            case 'image':
                Asset._loadImage(asset,onLoad);
                break;
            case 'audio':
                Asset._loadAudio(asset,onLoad);
                break;
        }
    });

};
Asset._loadImage=function(asset,onLoad){//読み込みを実際に担当する人
    var image=new Image();//新しいImageオブジェクト
    image.src=asset.src;//この関数内のImageオブジェクトに関数に与えられたアセットの場所を指定
    Asset.images[asset.name]=image;//かくのう
    image.onload=onLoad;//読み終わったら、関数に与えられたonLoadを呼ぶ

};
Asset._loadAudio=function(asset,onLoad){
    var audio=new Audio();
    audio.src=asset.src;
    Asset.audios[asset.name]=audio;
    audio.onloadeddata=onLoad;//audio はonloadeddata！！
};


var mainCharactor={//キャラのプロパティとか
    Y:0,
    ground:1,//設置の判定
    jump:0,//jump
    jump_v0:16,//初速
    gravity:-30,//重力
    speed:0,//y軸の移動速度

    map:0,//今いる場所のマップの左端の添え字
    X:0,//マップの格子ぴったりからどれだけずれているか(0<=X<=50)
};



//キー入力
document.addEventListener("keydown", keyDownHandler,false);
function keyDownHandler(e) {
    switch (e.keyCode) {
        case 32://space
        case 38://upkey
            key_jump_Input();
            break;
        case 37://leftkey
            key_left_Input();
            break;
        case 39://rightkey
            key_right_Input();
            break;
    }
}
document.addEventListener("keyup", keyUpHandler,false);
function keyUpHandler(e) {
    switch (e.keyCode) {
        case 32:
        case 38:
            key_jump_End();
            break;
    }
}
//タッチ入力
function touchStartHandler(e){
    key_jump_Input();
} 
function touchEndHanler(e) {
    // タッチイベントの処理を記述
    key_jump_End();
    e.preventDefault();
}
function key_jump_Input(){
    if(gameState_Flag==0){
        gameState_Flag=1;
        requestAnimationFrame(update);
    }    
    else if(gameState_Flag==1){
        if(mainCharactor.ground==1){
        //Asset.audios['jump_sound1'].play();
        mainCharactor.jump=1;
        jump_h=1;
        }
    }
    else if(gameState_Flag==2){
        location.reload(false);
    }
}
function key_jump_End(){
    if(gameState_Flag==1){
        mainCharactor.jump=0;
        jump_h=0.9;
    }
}
function key_left_Input(){

}
function key_right_Input(){
    mainCharactor.X+=50;
    if (mainCharactor.X>=50) {
        if (mainCharactor.map>=Stages.stage1.length) {
            
        }
        else{
            mainCharactor.map++; 
        }
        mainCharactor.X=0;

    }
}

function start_menu(){//スタートメニュー
    ctx.clearRect(0,0,canvas.width,canvas.height);//canvas clear
    ctx.drawImage(Asset.images['start_menu'],0,0);
    requestAnimationFrame(start_menu);
}
function end_menu(){//endメニュー
    ctx.clearRect(0,0,canvas.width,canvas.height);//canvas clear
    ctx.drawImage(Asset.images['gameover'],0,0);
    ctx.fillText(score,300,210);
    requestAnimationFrame(end_menu);
}

function update(timestamp){//ゲーム本体 毎フレーム呼ばれる
    //updateが呼ばれるタイミングが一定じゃなくてもゲームの速度を一定にする
    var delta=0;//前回フレームからの経過時間(単位は秒)
    if(lastTimestamp != null){
        delta=(timestamp - lastTimestamp)/1000;//秒に直す
    }
    lastTimestamp=timestamp;
    second+=delta;

    if(mainCharactor.Y<=0){//地面との当たり判定
        if(mainCharactor.ground==0){
            Asset.audios['jump_sound2'].play();
        }
        mainCharactor.Y=0;
        mainCharactor.ground=1;
    }
    else{
        mainCharactor.ground=0;
    }


    /*if(0<=score&&score<=50){//スコアによって敵が出てくる間隔が変わる
        time_span = Math.floor( Math.random() * 11 ) + 15;
        time_span=time_span*0.1;
    }
    else if(50<=score&&score<=120){
        time_span = Math.floor( Math.random() * 16 ) + 10;
        time_span=time_span*0.1;
    }
    else if(120<=score){
        time_span = Math.floor( Math.random() * 19 ) + 7;
        time_span=time_span*0.1;
    }*/

    //**********処理*******// 
    if(mainCharactor.ground){//ジャンプの処理
        if(mainCharactor.jump==1){
        mainCharactor.speed=0;
        mainCharactor.speed=mainCharactor.jump_v0;
        mainCharactor.Y+=mainCharactor.speed;
        }
    }
    else{
        mainCharactor.speed+=mainCharactor.gravity*delta;
        mainCharactor.Y+=mainCharactor.speed;
        if(mainCharactor.speed>0){
            mainCharactor.speed*=jump_h;
        }
    }
/*
    if(second>time_span){//敵を出すかどうか
        for(i=0;i<=2;i++){
            if(Enemy_alive[i]==0){
                Enemy_alive[i]=1;
                break;
            }
        }
        second=0;
    }
    for(i=0;i<=2;i++){//敵の座標移動
        if(Enemy_alive[i]==1){
            Enemy_x[i]-=(1.7*score+150)*delta;
            if(Enemy_x[i]<=0){
                Enemy_x[i]=500;
                Enemy_alive[i]=0;
                score+=4;
            }
        }
    }
    for(i=0;i<=2;i++){//敵との当たり判定
        if(mainCharactor.X<=Enemy_x[i]&&Enemy_x[i]<=mainCharactor.X+60&&mainCharactor.Y+240<=270&&mainCharactor.Y+60+240>=270){
            gameState_Flag=2;
            cancelAnimationFrame(update);
            requestAnimationFrame(end_menu);
            return 0;
        }
        else if(mainCharactor.X<=Enemy_x[i]+30&&Enemy_x[i]+30<=mainCharactor.X+60&&mainCharactor.Y+240<=270&&mainCharactor.Y+60+240>=270){
            gameState_Flag=2;
            cancelAnimationFrame(update);
            requestAnimationFrame(end_menu);
            return 0;
        }
    }*/


    if(mainCharactor.Y<=0){//地面にめりこんじゃった時用
        if(mainCharactor.ground==0){
            Asset.audios['jump_sound2'].play();
        }
        mainCharactor.Y=0;
    }

    //canvasの描画
    render();
    //毎フレーム呼ぶよってやつ
    requestAnimationFrame(update);
}

function rotateCanvas(degree){
    ctx.translate(SCREEN_WIDTH/2,SCREEN_HEIGHT/2);
    ctx.rotate(degree * Math.PI / 180);
    ctx.translate(-1 * SCREEN_WIDTH/2 , -1 * SCREEN_HEIGHT/2);
}


function drawMap(){
    for (let i = 0; i < 10; i++) {
        var draw_num=mainCharactor.map+i;
        var draw_x=i*50;
        draw_x-=mainCharactor.X;
        switch (Stages.stage1[draw_num]) {
            case 0:break;
            case 1:
                ctx.drawImage(Asset.images['enemy'],draw_x,250);
                break;
        }

    }
    
  
};


function render(){//ゲーム本体のレンダリング関数
    //まずcanvasをクリア
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(Asset.images['background'],0,0);

    drawMap();
    
    //メインキャラクターを表示
    ctx.drawImage(Asset.images['mainchar'],225,250-mainCharactor.Y);
    ctx.fillText("SCORE:"+score,5,35);

}




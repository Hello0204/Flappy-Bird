// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import AudioSourceControl, { SoundType } from "./AudioSourceControl";

const {ccclass, property} = cc._decorator;

export enum GameStatus {
    Game_Ready = 0, // ready state
    Game_Playing,   // game playing
    Game_Over
}

@ccclass
export default class MainControl extends cc.Component {
    // background
    @property(cc.Sprite)
    spBg: cc.Sprite [] = [null, null];

    // vật cản
    @property(cc.Prefab)
    pipePrefab: cc.Prefab = null;

    pipe: cc.Node[] = [null, null, null]

    @property(AudioSourceControl)
    audioSourceControl: AudioSourceControl = null;

    // game over
    spGameOver: cc.Sprite = null;

    // start button
    btnStart: cc.Button = null;

    // game state
    gameStatus: GameStatus = GameStatus.Game_Ready;

    @property(cc.Label)
    labelScore: cc.Label = null;

    // record score
    gameScore: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // hệ thống va chạm
        var collisionManager = cc.director.getCollisionManager();

        // công tắc hệ thống va chạm
        collisionManager.enabled = true;

        // debug mode
        collisionManager.enabledDebugDraw = false;

        // find the GameOver node, and set active property to false
        this.spGameOver = this.node.getChildByName("GameOver").getComponent(cc.Sprite);
        this.spGameOver.node.active = false;

        // find the start button
        this.btnStart = this.node.getChildByName("BtnStart").getComponent(cc.Button);
        // register clicked callback
        this.btnStart.node.on(cc.Node.EventType.TOUCH_END, this.touchStartBtn, this);
    }



    start () {
    // khởi tạo vật cản
        for (let i = 0; i < this.pipe.length; i++) {
            this.pipe[i] = cc.instantiate(this.pipePrefab);
            this.node.getChildByName("Pipe").addChild(this.pipe[i]);
            
            // tọa độ x (vị trí các cột)
            this.pipe[i].x = 170 + 200 * i;

            // tọa độ y (chiều dài các cột)
            var minY = -120;
            var maxY = 120;
            this.pipe[i].y = minY + Math.random() * (maxY - minY);
        }
    }

    // hàm cập nhật trạng thái theo thời gian
    update (dt: number) { 
    // if game status is not playing, stop caculat and return
    if (this.gameStatus !== GameStatus.Game_Playing){
        return;
    }

    //di chuyển background
    for (let i = 0; i < this.spBg.length; i++) {
        // di chuyển Bg sang trái
        this.spBg[i].node.x -= 1.0;

        // cuộn lại
    if (this.spBg[i].node.x <= -288) {
        this.spBg[i].node.x = 288;
        
        }
    }

    // di chuyển chướng ngại vật
    for (let i = 0; i < this.pipe.length; i++) {
        // di chuyển chướng ngại vật sang trái 
        this.pipe[i].x -= 1.0;

        // nếu chướng ngại vật rời khỏi màn hình, đặt lại từ đầu, reset chiều dài 
        if (this.pipe[i].x <= -170) {
            this.pipe[i].x = 430;

        // set giới hạn chiều cao của chướng ngại vật
            var minY = -120;
            var maxY = 120;
            this.pipe[i].y = minY + Math.random() * (maxY - minY);
        }
    }

    }

    // game over
    gameOver () {
        this.spGameOver.node.active = true;

        // when game is over, show the start button
        this.btnStart.node.active = true;
        // change game status to Game_Over
        this.gameStatus = GameStatus.Game_Over;

        // play game over sound 
        this.audioSourceControl.playSound(SoundType.E_Sound_Die);
    }
    
    touchStartBtn () {
        // hide start button
        this.btnStart.node.active = false;
        // set game status to playing
        this.gameStatus = GameStatus.Game_Playing;

        // hide GameOver node
        this.spGameOver.node.active = false;
        // reset position of all the pipes
        for (let i = 0; i < this.pipe.length; i++) {
            this.pipe[i].x = 170 + 200*i;
            var minY = -120;
            var maxY = 120;
            this.pipe[i].y = minY + Math.random()* (maxY - minY);
        }
        // reset angle and position of bird
        var bird = this.node.getChildByName("Bird");
        bird.y = 0;
        bird.rotation = 0;

        // reset score when restart game
        this.gameScore = 0;
        this.labelScore.string = this.gameScore.toString();
        }
}
var sw = 20,
    sh = 20,
    row = 30,
    col = 30;

var snake = null,
    food = null,
    game = null;


//方块的构造函数
function Square(x, y, className) {
    this.x = x * sw;
    this.y = y * sh;
    this.class = className;
    this.viewContent = document.createElement("div");
    this.viewContent.className = this.class;
    this.parent = document.getElementById("snake")
}
//创建方块
Square.prototype.create = function() {
        this.viewContent.style.position = "absolute";
        this.viewContent.style.width = sw + "px";
        this.viewContent.style.height = sh + "px";
        this.viewContent.style.left = this.x + "px";
        this.viewContent.style.top = this.y + "px";
        this.parent.appendChild(this.viewContent);
    }
    //删除方块
Square.prototype.remove = function() {
        this.parent.removeChild(this.viewContent)
    }
    //蛇的构造实例
function Snake() {
    this.head = null;
    this.tail = null;
    this.pos = [];
    this.diractionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}
//蛇的初始化
Snake.prototype.init = function() {
        var snakeHead = new Square(2, 0, "snakeHeader");
        this.head = snakeHead;
        snakeHead.create()
        this.pos.push([2, 0]);

        var snakeBody1 = new Square(1, 0, "snakeBody");
        snakeBody1.create();
        this.pos.push([1, 0]);

        var snakeBody2 = new Square(0, 0, "snakeBody");
        snakeBody2.create();
        this.tail = snakeBody2;
        this.pos.push([0, 0]);

        //定义蛇头蛇身的链表关系
        snakeHead.last = null;
        snakeHead.next = snakeBody1;
        snakeBody1.last = snakeHead;
        snakeBody1.next = snakeBody2;
        snakeBody2.last = snakeBody1;
        snakeBody2.next = null;
        this.diraction = this.diractionNum.right;
    }
    //蛇的下一步判断
Snake.prototype.getNextPos = function() {
        var nextPos = [
            this.head.x / sw + this.diraction.x,
            this.head.y / sh + this.diraction.y
        ]

        var collision = false;
        //循环判断自身是否与下一步相等
        this.pos.forEach(function(value) {
                if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
                    collision = true;
                }
            })
            //判断下一步是否是自身
        if (collision) {
            this.doing.die.call(this);
            return;
        }
        //判断下一步是否是墙
        if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > col - 1 || nextPos[1] > row - 1) {
            this.doing.die.call(this)
            return;
        }
        //判断是否是食物
        if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
            this.doing.eat.call(this);
            return;
        }
        //如果下一步什么也没有，就继续移动
        this.doing.go.call(this)
    }
    //判断下一步之后要做的事
Snake.prototype.doing = {
    go: function(format) {
        var newBody = new Square(this.head.x / sw, this.head.y / sh, "snakeBody");
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove();
        newBody.create();


        var newHead = new Square(this.head.x / sw + this.diraction.x, this.head.y / sh + this.diraction.y, "snakeHeader")
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = "rotate(" + this.diraction.rotate + "deg)"
        newHead.create();

        this.pos.splice(0, 0, [this.head.x / sw + this.diraction.x, this.head.y / sh + this.diraction.y])
        this.head = newHead;


        if (!format) {
            this.tail.remove();
            this.tail = this.tail.last
            this.pos.pop()
        }
    },
    eat: function() {
        this.doing.go.call(this, true)
        createFood();
        game.score++;

    },
    die: function() {
        game.over();

    }
}
snake = new Snake()

//创建苹果
function createFood() {
    var x = null;
    var y = null;
    x = Math.round(Math.random() * (row - 1));
    y = Math.round(Math.random() * (col - 1));

    //循环遍历判断苹果是否在蛇身上
    snake.pos.forEach(function(value) {
        var contain = true;
        if (x != value[0] && y != value[1]) {
            contain = false
        }
    })
    food = new Square(x, y, "food");
    food.pos = [x, y]
    var foodDom = document.querySelector(".food");
    if (foodDom) {
        foodDom.style.left = x * sw + "px";
        foodDom.style.top = y * sh + "px";
    } else {
        food.create()
    }
}

//创建游戏
function Game() {
    this.timer = null;
    this.score = 0;
}

//游戏初始化
Game.prototype.init = function() {
    snake.init();
    snake.getNextPos();
    createFood();
    document.onkeydown = function(e) {
        console.log(e.which);
        if (e.which == 37 && snake.diraction != snake.diractionNum.right) {
            snake.diraction = snake.diractionNum.left;
        } else if (e.which == 38 && snake.diraction != snake.diractionNum.down) {
            snake.diraction = snake.diractionNum.up;
        } else if (e.which == 39 && snake.diraction != snake.diractionNum.left) {
            snake.diraction = snake.diractionNum.right;
        } else if (e.which == 40 && snake.diraction != snake.diractionNum.up) {
            snake.diraction = snake.diractionNum.down;
        }

    }

    this.start()
}

//游戏开始，设置定时器
Game.prototype.start = function() {
    this.timer = setInterval(function() {
        snake.getNextPos();
    }, 200)
}

//暂停，清除定时器
Game.prototype.pause = function() {
    clearInterval(this.timer);
}

//游戏结束,返回初始状态
Game.prototype.over = function() {
    clearInterval(this.timer);
    alert("您的得分是：" + this.score + "\r" + "加油！继续努力！！！");
    var snakeBtn = document.getElementById("snake");
    snakeBtn.innerHTML = ""
    snake = new Snake();
    game = new Game();
    var startBtn = document.querySelector(".startBtn");
    startBtn.parentNode.style.display = "block";
    startBtn.style.display = "block";
}
game = new Game();

//点击隐藏开始游戏按钮
var startWrap = document.querySelector(".startBtn");
startWrap.onclick = function() {
    pauseBtn.parentNode.style.display = "none";
    startWrap.style.display = "none";
    game.init();
}

//点击显示暂停按钮，游戏停止
var btn = document.getElementById("snake");
var pauseBtn = document.querySelector(".pauseBtn");
btn.onclick = function() {
    pauseBtn.parentNode.style.display = "block";
    pauseBtn.style.display = "block";
    game.pause();

}

//点击隐藏暂停按钮继续游戏
pauseBtn.onclick = function() {
    game.start();
    pauseBtn.parentNode.style.display = "none";
    pauseBtn.style.display = "none";

}
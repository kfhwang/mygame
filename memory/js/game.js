
var dragSound = new Audio("./sounds/Collect_Point.mp3");
var dropSound = new Audio("./sounds/Craft.mp3");
var oridropSound = new Audio("./sounds/Hit.mp3");
oridropSound.volume = 0.2;
var loseSound = new Audio("./sounds/Jingle_Lose.mp3");
var winSound = new Audio("./sounds/Jingle_Win.mp3");
var coinSound = new Audio("./sounds/Point.mp3");
var newReward;
var gameTm;
var startTime;
var modal_menu, modal_win, modal_howto;
var currentClick = 0;
var record = null;
var newGame;
var cover = { "easy": "Card_Easy.png", "mid": "Card_Mid.png", "hard": "Card_Hard.png" };
var BoardLayout = { "easy": "px-5 row row-gap-3 row-cols-2 row-cols-lg-4", "mid": "row row-gap-2 g-2 row-cols-4 row-cols-lg-4", "hard": "w-100 row row-gap-0 g-0 row-cols-4 row-cols-lg-8" };
// var CardLayout = { "easy": "col-6 col-lg-3", "mid": "col-3 col-lg-3", "hard": "col-lg-3" };
var openedCard = [], correct = 0;
var Animation = [];
var gameVue = Vue.createApp({
    data() {
        return { board: [], level: "easy" }
    },
    render() {
        $("#cardBoard").removeClass().addClass(BoardLayout[this.level]);
        var vnodes = [];
        this.board.forEach((item, idx) => {
            vnodes.push(Vue.h("div", { class: "d-flex justify-content-center" },
                Vue.h("div", { class: "card d-felx justify-content-start", "data-cardNo": idx },
                    [Vue.h("img", { src: "animations/" + item.ani, id: "card_" + idx, class: "cardAni", style: "width:" + item.width + "px" }),
                    Vue.h("img", { src: "covers/" + cover[this.level], class: "cardCover", "data-cardNo": idx })
                    ]
                )))
        })
        return vnodes;
    },
    updated: function () {
        $("#gamebox").removeClass("hardBox midBox easyBox");
        if (gameVue.level == "hard")
            $("#gamebox").addClass("hardBox");
        else if (gameVue.level == "easy")
            $("#gamebox").addClass("easyBox");
        else $("#gamebox").addClass("midBox");

        Animation = [];
        gameVue.board.forEach((item, idx) => {
            var newAni = gsap.timeline();
            var frame_count = item.frames, offset_value = 128;
            var selector = "#card_" + idx;
            newAni.to(selector, {
                x: (-offset_value * frame_count),
                ease: "steps(" + frame_count + ")", // use a stepped ease for the sprite sheet
                // end: "+=" + (offset_value * frame_count),
                duration: item.frames / 6,
                repeat: -1,
                repeatDelay: 0
            })
            newAni.pause();
            Animation.push(newAni);
        });
        if (gameVue.board.length > 0) {
            $("#gamebox").removeClass("invisible");
            gsap.from("#gamebox", {
                y: -500, opacity: 0, duration: 1, delay: 0.3, onComplete: () => {
                    gsap.set("#gamebox", { clearProps: 'all' });
                }
            });

            startTime = new Date();
            gameTm = setInterval(() => {
                $(".timer").show();
                var now = new Date();
                var elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                $(".timer p").html(formatSecondsToHMS(elapsed));
            }, 1000);

            $(".card").on("click", (event) => {
                var cardno = parseInt(event.currentTarget.dataset.cardno);
                if ((openedCard.length == 1 && openedCard[0] == cardno) || newGame.board[cardno].done) return;
                else if (!$(".card[data-cardno='" + cardno + "']").hasClass("toHide")) {
                    if (openedCard.length < 2 && !newGame.board[cardno].done) {
                        openedCard.push(cardno);
                        $(event.currentTarget).children(".cardCover").addClass("toHide");
                        redayToPlay(parseInt(event.currentTarget.dataset.cardno));
                    } else
                        return;
                }
            });
            $(".card").hover((event)=>{
                var cardno = parseInt(event.currentTarget.dataset.cardno);
                if(Animation[cardno].paused() && newGame.board[cardno].done)
                    Animation[cardno].restart();
                },
            (event)=>{
                var cardno = parseInt(event.currentTarget.dataset.cardno);
                 if(Animation[cardno].isActive() && newGame.board[cardno].done)
                    Animation[cardno].pause(0);
                }
        )
        } else {
            $("#gamebox").addClass("invisible");
            adjVolume();
        }
    }
}).mount("#cardBoard");

$(function () {

    //prevent the modal's attrib 'ari-hidden' been blocked

    document.querySelectorAll('.modal').forEach((modalElement) => {
        modalElement.addEventListener('hide.bs.modal', () => {
            if (document.activeElement && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });
    });

    $("#memoryHowto").on("ended", function () {
        setTimeout(() => {
            modal_howto.hide();
            $("#memoryHowto").get(0).currentTime = 0;
            modal_menu.show();
        }, 1500);
    })
    $(window).on("resize", resizeHandler);
    var vol = localStorage.getItem("volume");
    if (vol == null) {
        localStorage.setItem("volume", 5);
    } else {
        $("#auVolume").val(parseInt(vol));
        $("#lblVolume").html("音量: " + (vol / 10) * 100 + "%");
    }
    $("#auVolume").on("input", adjVolume);

    modal_menu = new bootstrap.Modal(document.getElementById("menuModal"), {});
    modal_menu.show();
    modal_win = new bootstrap.Modal(document.getElementById("winModal"), {});
    modal_win.hide();
    modal_howto = new bootstrap.Modal(document.getElementById("howtoModal"), {});
    modal_howto.hide();

    record = JSON.parse(localStorage.getItem("MemoryRecord"));

    $("#btnMenu1").on("click", () => { modal_menu.hide(); setTimeout(startGame, 500, "easy"); });
    $("#btnMenu2").on("click", () => { modal_menu.hide(); setTimeout(startGame, 500, "mid") });
    $("#btnMenu3").on("click", () => { modal_menu.hide(); setTimeout(startGame, 500, "hard") });
    $("#btnBack").on("click", () => { history.back() });
    $("#btnBackMenu").on("click", () => { backtoMenu() });
    $("#btnHowToMenu").on("click", () => {
        modal_howto.hide();
        modal_menu.show();
    });
    $("#btnHow").on("click", () => { openHowto() });
    $("#btnReplay").on("click", () => { replayGame() })
    adjVolume();
    $("#logo").on("click",()=>{
        record[gameVue.level]={ time: 99999, click: 99999 };
        localStorage.setItem("MemoryRecord", JSON.stringify(record));
    })
});

function startGame(_level) {

    currentClick = 0;
    if (record == null) {
        record = { "easy": { time: 99999, click: 99999 }, "mid": { time: 99999, click: 99999 }, "hard": { time: 99999, click: 99999 } };
    }
    if (record[_level].time < 99999 || record[_level].click < 99999)
        $(".score").html("紀錄:" + record[_level].time + "秒/" + record[_level].click + "次");
    else {
        $(".score").html("最佳紀錄:無");
    }
    correct = 0; openedCard = [];
    if (_level == "hard")
        $("body").css('background-image', 'url("images/Bg_Hard_Blur.jpg")');
    else
        $("body").css('background-image', 'url("images/Bg_Normal_Blur.jpg")');

    // modal_win.hide();
    newGame = new Pair(_level);
    newGame.addEventListener("pairready", (event) => {
        // console.log(event);
        if (event.detail.boardSize > 0) {
            //build game
            gameVue.board = newGame.board;
            gameVue.level = _level;
        }
        else {
            //error
        }
    })
}

function adjVolume() {
    var vol = $("#auVolume").val();
    localStorage.setItem("volume", vol);
    $("#lblVolume").html("音量: " + (vol / 10) * 100 + "%");
    dragSound.volume = vol / 10;
    dropSound.volume = vol / 10;
    oridropSound.volume = vol / 10;
    loseSound.volume = vol / 10;
    winSound.volume = vol / 10;
    coinSound.volume = vol / 10;
}
function resizeHandler() {
    // size.width = window.innerWidth;
    // size.height = window.innerHeight;
}

function redayToPlay(no) {
    currentClick++;
    Animation[no].restart();
    dragSound.currentTime = 0;
    dragSound.play();
    if (openedCard.length == 2) {
        if (newGame.checkAnswer(openedCard[0], openedCard[1])) {
            //right
            var re1 = openedCard[0], re2 = openedCard[1];
            newGame.board[re1].done = true;
            newGame.board[re2].done = true;
            $(".card[data-cardno='" + re1 + "']").addClass("bravo").append("<h3 class='wordname'>" + newGame.board[re1].wordName + "</h3>");
            $(".card[data-cardno='" + re2 + "']").addClass("bravo").append("<h3 class='wordname'>" + newGame.board[re1].wordName + "</h3>");
            correct += 2;
            coinSound.play();
            setTimeout(() => {
                Animation[re1].pause(0);
                Animation[re2].pause(0);;
            }, newGame.board[re2].frames / 6 * 1000);
            openedCard = []
            if (correct == newGame.board.length) {
                //success
                var newRecord = false;
                clearInterval(gameTm);
                var level = gameVue.level;

                now = new Date()
                elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                if (elapsed < record[level].time) {
                    newRecord = true;
                    record[level].time = elapsed;
                }
                if (currentClick < record[level].click) {
                    newRecord = true;
                    record[level].click = currentClick;
                }
                var showScore = "<h3 id='scoreTitle'>成績: " + elapsed + "秒/" + currentClick + "次</h3>"
                if (newRecord) {
                    showScore = showScore.concat("<img src='./images/award.png' width='70' height='70'>破紀錄");
                    localStorage.setItem("MemoryRecord", JSON.stringify(record));
                    $("#IOSVid").attr("src", "./images/very_good.mov");
                    $("#AndroidVid").attr("src", "./images/very_good.webm");
                } else {
                    $("#IOSVid").attr("src", "./images/keep_going.mov");
                    $("#AndroidVid").attr("src", "./images/keep_going.webm");
                }
                $("#vidplayer")[0].load();
                $("#vidplayer").fadeIn();
                $('#vidplayer').get(0).play();
                setTimeout(() => {
                    $("#winModal .modal-header").empty().append(showScore);
                    modal_win.show();
                    winSound.play();
                }, 2000);
            }
        } else {//reset
            var re1 = openedCard[0], re2 = openedCard[1];
            setTimeout(() => {
                Animation[re1].pause(0);
                Animation[re2].pause(0);
                if (!newGame.board[re1].done)
                    $(".cardCover[data-cardno='" + re1 + "']").removeClass("toHide");
                if (!newGame.board[re2].done)
                    $(".cardCover[data-cardno='" + re2 + "']").removeClass("toHide");

            }, newGame.board[re2].frames / 8 * 1000);
            openedCard = [];
        }

    } else return;
}

function replayGame() {
    $(".card").off("click");
    newGame = null;
    gameVue.board = [];
    modal_win.hide();
    setTimeout(startGame, 300, gameVue.level);
}
function openHowto() {
    modal_menu.hide();
    modal_howto.show();
    setTimeout(() => {
        $("#memoryHowto").get(0).currentTime = 0;
        $("#memoryHowto").get(0).play();
    }, 1000);
}
function backtoMenu() {
    $(".card").off("click");
    newGame = null;
    gameVue.board = [];
    modal_win.hide();
    modal_menu.show();
}

function formatSecondsToHMS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => (num < 10 ? '0' + num : num);
    return `${pad(minutes)}:${pad(seconds)}`;
}

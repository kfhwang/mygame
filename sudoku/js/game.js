var dragSound = new Audio("./sounds/Collect_point.mp3");
var dropSound = new Audio("./sounds/Craft.mp3");
var oridropSound = new Audio("./sounds/Hit.mp3");
oridropSound.volume = 0.2;
var loseSound = new Audio("./sounds/Jingle_Lose.mp3");
var winSound = new Audio("./sounds/Jingle_Win.mp3");
var coinSound = new Audio("./sounds/point.mp3");
var level = 3; //level=3~11 easy to hard 
var newReward;
var newGame;
var gameTm;
var startTime;
var modal_menu, modal_win, modal_howto;
var currentScore = 0, newRecord = false;
var levelRepeat = new Array(15).fill(0);

var myBlock = Vue.createApp({
    data() {
        return {
            Block: []
        }
    },
    render() {
        const vnodes = [];
        this.Block.forEach((block, idx) => {
            const subNodes = [];
            this.Block[idx].forEach(item => {
                subNodes.push(Vue.h("div", { class: "col w-50 position-relative" }, Vue.h("div", { class: (item.val == 0) ? 'drop p-0' : 'undrop p-0', "data-row": item.r, "data-col": item.c },
                    [
                        (item.val != 0) ? Vue.h("h3", { class: "wordname text-center rounded-pill", style: "display:none" }, item.img) : null,
                        (item.val != 0) ? Vue.h("img", { src: 'images/' + item.img + '.jpg', alt: item.img, class: "img-fluid h-100 rounded" }) : null
                    ])
                ))
            });
            vnodes.push(Vue.h("div", { class: "col" }, Vue.h("div", { class: "card h-100 border border-1 border-info" }, Vue.h("div", { class: "card-body p-1" }, Vue.h("div", { class: "row row-cols-2 g-1" },
                subNodes
            )))))
        });
        return vnodes;
    },
    updated: function () {
        if (myBlock.Block.length > 0) {
            startTime = new Date();
            redayToPlay();
            adjVolume();
            setTimeout(resizeHandler, 500);
        } else {
            setTimeout(startGame, 2000, level);
        }
    }
}).mount("#boxBlock");

var myCandi = Vue.createApp({
    data() {
        return {
            Candidate: []
        }
    },
    render() {
        const vnodes = [];
        this.Candidate.forEach((item, idx) => {
            const subNodes = [];
            this.Candidate[idx].forEach((cand, cidx) => {
                subNodes.push(Vue.h("div", { "data-val": cand.val, class: "drag p-0 border border-3 rounded-3 border-warning" },
                    [
                        Vue.h("h3", { class: "wordname text-center rounded-pill", style: "display:none" }, cand.img),
                        Vue.h("img", { src: 'images/' + cand.img + '.jpg', alt: cand.img, class: "img-fluid rounded" })
                    ]
                ))
            });
            vnodes.push(Vue.h("div", { id: 'ori-drop' + (idx + 1), class: "col-3 col-lg-12 ori-drop border-warning" },
                [
                    Vue.h("div", { class: "" },
                        subNodes
                    ),
                    Vue.h("h4", { style: "position:absolute;left:10px;top:10px;z-index:100;" }, item[0].img)
                ]
            ));
        });
        return vnodes;
    }
}).mount("#boxCandidate")

$(function () {
    //prevent the modal's attrib 'ari-hidden' been blocked
    document.querySelectorAll('.modal').forEach((modalElement) => {
        modalElement.addEventListener('hide.bs.modal', () => {
            if (document.activeElement && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });
    });
    $("#sudokuHowto").on("ended", function () {
        setTimeout(() => {
            modal_howto.hide();
            $("#sudokuHowto").get(0).currentTime = 0;
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

    //gsap.to("#logo",{repeat:2, yoyo:true,motionPath:{path:"#logopath", autoRotate:true, aligh:"#path", start:0.5, end:1.5}});
    modal_menu = new bootstrap.Modal(document.getElementById("menuModal"), {});
    modal_menu.show();
    modal_win = new bootstrap.Modal(document.getElementById("winModal"), {});
    modal_win.hide();
    modal_howto = new bootstrap.Modal(document.getElementById("howtoModal"), {});
    modal_howto.hide();
    var record = localStorage.getItem("SudokuRecord")
    if (record == null) record = 0;
    $(".score").html("最高" + record + "分");
    $("#btnMenu1").on("click", () => { startGame(3) });
    $("#btnMenu2").on("click", () => { startGame(6) });
    $("#btnMenu3").on("click", () => { startGame(9) });
    $("#btnBack").on("click", () => { history.back() });
    $("#btnBackMenu").on("click", () => { backtoMenu() });
    $("#btnHow").on("click", () => { openHowto() });
    $("#logo").on("click", () => {
        localStorage.setItem("SudokuRecord", 0);
    })
});

function startGame(_level) {
    $("body").css('background-image', 'url("images/Bg_Hard_Blur.jpg")');
    level = _level;
    if (levelRepeat[level] >= 2)
        level += 1;
    level = (level > 11) ? 12 : level;

    modal_menu.hide();
    modal_win.hide();
    newGame = new Sudoku(4, level);

    myBlock.Block = newGame.block;
    var cand = [
        new Array(level).fill(newGame.fourWords[1]),
        new Array(level).fill(newGame.fourWords[2]),
        new Array(level).fill(newGame.fourWords[3]),
        new Array(level).fill(newGame.fourWords[4])];

    myCandi.Candidate = cand;
    //gsap.from(".timer",{x:-50, duration:1, yoyo:true,repeat:2})
    $("#gamebox").removeClass("invisible");
    gsap.from("#gamebox", { y: -500, opacity: 0, duration: 1 });
    newReward = '<div class="reward notyet col-1 p-1"><p class="fs-3"></p><img src="images/medal-' + (level - 2) + '.png" alt="reward" width="100%" class="img-fluid"></div>';
    $("#rewardBox").append(newReward);

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
    $(".drop").height($(".undrop").height());
    $(".ori-drop").height($(".drag").height() + 10);

    size.width = window.innerWidth;
    size.height = window.innerHeight;
}

function redayToPlay() {

    gameTm = setInterval(() => {
        $(".timer").show();
        var now = new Date();
        var elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        $(".timer p").html(formatSecondsToHMS(elapsed));
    }, 1000);
    $(".drag").draggable({
        revert: "invalid",
        revertDuration: 200,
        //cursorAt: {top:5,left:5},
        start: function (event, ui) {
            dragSound.play();
            $(this).data("dropped", false);

            $(this).css("z-index", 9999);

            $(this).children('h3').show();

            if (ui.helper.parent().hasClass("dropped")) {
                ui.helper.parent().removeClass("dropped");
                ui.helper.css("z-index", 10);
                //change value to puzzleBoard
                newGame.puzzleBoard[$(this).data("row")][$(this).data("col")] = 0;
                $(this).data("row", "-1");
                $(this).data("col", "-1");
            }
        },
        stop: function (event, ui) {
            //console.log("this id:" + $(this).attr("id"));
            $(this).children('h3').hide();
            //$(this).css("z-index", 99);

            oridropSound.play();
            if (!$(this).data("dropped")) {
                //ui.helper.parent().css("z-index",10);
                $(this).css("z-index", 10);
                $(this).prependTo($("#ori-drop" + $(this).data("val"))).css({ left: "", top: "" });
            }

        },
        cursor: "pointer"

    });

    $(".ori-drop").droppable({
        accept: ".drag",
        drop: function (event, ui) {
            //$(this).data("dropped", true);
            //console.log("Drop id:" + $(this).attr("id"));
            $("#ori-drop" + ui.draggable.data("val")).css("z-index", 998);
            ui.draggable.css({
                "left": "0px",
                "top": "0px",
                "z-index": 10
            }).prependTo($("#ori-drop" + ui.draggable.data("val")));
            //ui.draggable.appendTo($("#ori-drop"+ui.draggable.data("val")));
        },
        classes: {
            "ui-droppable-hover": "dropover"
        }

    })
    $(".drop").droppable(
        {
            accept: ".drag",
            drop: function (event, ui) {

                if ($(this).hasClass("dropped")) {
                    ui.draggable.appendTo($("#" + ui.draggable.attr("id"))).css({ top: "", left: "" });
                } else {
                    dropSound.play();
                    ui.draggable.data("row", $(this).data("row"));
                    ui.draggable.data("col", $(this).data("col"));

                    //change value to puzzleBoard
                    newGame.puzzleBoard[$(this).data("row")][$(this).data("col")] = Number(ui.draggable.data("val"))
                    ui.draggable.data("dropped", true);

                    $(this).addClass("dropped");
                    $(this).css("z-index", 99);
                    //appendto drop box
                    ui.draggable.css({
                        "margin": 0,
                        "left": "0px",
                        "top": "0px",
                        "z-index": 98
                    }).appendTo(this);
                    if (newGame.findEmpty() == null) {
                        endGame();
                    }
                }

            },
            classes: {
                "ui-droppable-hover": "dragover"
            }

        });
}
function countPoint(sec) {
    pLevel = level - 2;
    extraPoint = (1000 * pLevel) - (100 * pLevel) * (Math.floor(sec / 15))
    point = pLevel * 100 + ((extraPoint < 0) ? 0 : extraPoint);
    currentScore += point;
    var record = localStorage.getItem("SudokuRecord")
    if (record == null || parseInt(record) < currentScore) {
        localStorage.setItem("SudokuRecord", currentScore);
        newRecord = true;
    }
    levelRepeat[level] += 1;
    //console.log(point);
    gsap.fromTo("#point", { opacity: 1, "y": "0px" }, { "y": "-50px", "opacity": 0, "repeat": point / 100, "repeatRefresh": true, "duration": 0.3 })
    gsap.fromTo("#coin", { scale: 0.5 }, {
        "scale": 1, "repeat": point / 100, "duration": 0.3,
        onRepeat: () => { coinSound.play() },
        onComplete: () => {
            var showScore = "<h3 id='scoreTitle'>得分: " + currentScore + "</h3>"
            if (newRecord)
                showScore = showScore.replace("得分", "<img src='./images/award.png' width='70' height='70'>破紀錄");
            $("#winModal .modal-body").prepend(showScore);
        }
    });


    let balloonGenerator = setInterval(() => {
        if (!document.hidden) {
            const newBalloon = createBalloon();
            const isBehind = Math.random() > 0.5 ? true : false;
            if (isBehind) behind_svg.appendChild(newBalloon);
            else svg.appendChild(newBalloon);
            animateBalloon(newBalloon, isBehind);
        }
    }, 400);
    setTimeout(function () {
        gsap.fromTo($("#rewardBox").children().last(), { scale: 0.8 }, {
            filter: 'saturate(1)', duration: 0.2, scale: 1, yoyo: true, repeat: 4, onComplete: () => {
                $("#rewardBox").children().last().removeClass("notyet");
            }
        });
        clearInterval(balloonGenerator);
        myBlock.Block = [];
        myCandi.Candidate = [];
        if (newRecord)
            $(".score").html("<span id='newrecord' span></span>" + currentScore);
        else
            $(".score").html("得分: " + currentScore);
    }, 3000 + point * 3);
}
function endGame() {
    result = newGame.CheckAnswer();
    if (result[0] == true) {
        clearInterval(gameTm);
        var now = new Date();
        var elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

        winSound.play();
        //show win modal
        $("#winHeader").find(".reward").remove();
        $("#winModal .modal-body").children("#scoreTitle").remove();
        $("#winHeader").append(newReward.replace("notyet", ""));
        modal_win.show();
        countPoint(elapsed);
    } else {
        var wrongPos1 = result[1];
        var wrongPos2 = newGame.invalidRCB(undefined, wrongPos1);
        loseSound.play();
        gsap.fromTo($(".drop,.undrop").filter("[data-row='" + wrongPos1[0] + "']").filter("[data-col='" + wrongPos1[1] + "']"), { rotate: -15, scale: 1.2 }, { rotate: 0, scale: 1, repeat: 6, yoyo: true, duration: .4, ease: "Bounce.inOut" });
        gsap.fromTo($(".drop,.undrop").filter("[data-row='" + wrongPos2[0] + "']").filter("[data-col='" + wrongPos2[1] + "']"), { rotate: 15, scale: 1.2 }, { rotate: 0, scale: 1, repeat: 6, yoyo: true, duration: .4, ease: "Bounce.inOut" });
        //$(".drop").filter("[data-row='0']").filter("[data-col='2']").css("filter","saturate(0)")
        console.log(JSON.stringify(wrongPos1) + ";" + JSON.stringify(wrongPos2));

    }

}
function openHowto() {
    modal_howto.show();
    setTimeout(() => {
        $("#sudokuHowto").get(0).currentTime = 0;
        $("#sudokuHowto").get(0).play();
    }, 1000);
}
function backtoMenu() {
    $("#sudokuHowto").get(0).pause();
    modal_howto.hide();
    modal_menu.show();
}
function formatSecondsToHMS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => (num < 10 ? '0' + num : num);
    return `${pad(minutes)}:${pad(seconds)}`;
}


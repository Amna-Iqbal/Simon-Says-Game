const buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let level = 0;
let started = false;
let gameSpeed = 1000; // Default speed (Easy)
let highScore = localStorage.getItem('simonHighScore') || 0;
let isPlayingSequence = false;

// Initialize the game
$(document).ready(function() {
  // Show instructions modal on page load
  $("#instructions-modal").show();
  
  // Close modal when X is clicked
  $(".close-btn").on("click", function() {
    $("#instructions-modal").hide();
  });
  
  // Close modal when "Got it!" button is clicked
  $("#got-it-btn").on("click", function() {
    $("#instructions-modal").hide();
  });
  
  // Close modal when clicking outside of it
  $(window).on("click", function(event) {
    if (event.target.id === "instructions-modal") {
      $("#instructions-modal").hide();
    }
  });
  
  updateHighScore();
  updateCurrentLevel();
});

function nextSequence() {
  userClickedPattern = [];
  level++;
  updateCurrentLevel();
  $("#level-title").text(`Level ${level}`);
  
  let randomNumber = Math.floor(Math.random() * 4);
  let randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);
  
  // Disable buttons during sequence playback
  disableButtons();
  
  // Play the entire sequence with delays
  playSequence();
}

function playSequence() {
  isPlayingSequence = true;
  gamePattern.forEach((color, index) => {
    setTimeout(() => {
      animateButton(color);
      playSound(color);
      
      // Re-enable buttons after sequence is complete
      if (index === gamePattern.length - 1) {
        setTimeout(() => {
          isPlayingSequence = false;
          enableButtons();
        }, gameSpeed / 2);
      }
    }, (index + 1) * gameSpeed);
  });
}

function animateButton(color) {
  $(`#${color}`).fadeOut(100).fadeIn(100);
}

function disableButtons() {
  $(".btn").css("pointer-events", "none").css("opacity", "0.6");
}

function enableButtons() {
  $(".btn").css("pointer-events", "auto").css("opacity", "1");
}

$(".btn").on("click", function () {
  if (!started || isPlayingSequence) return;
  
  let userChosenColor = this.id;
  animatePress(userChosenColor);
  playSound(userChosenColor);
  userClickedPattern.push(userChosenColor);
  checkAnswer(userClickedPattern.length - 1);
});

function playSound(name) {
  try {
    let audio = new Audio(`./sounds/${name}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed:", e));
  } catch (error) {
    console.log("Audio not available:", error);
  }
}

function animatePress(currentColor) {
  $(`#${currentColor}`).addClass("pressed");
  setTimeout(function () {
    $(`#${currentColor}`).removeClass("pressed");
  }, 150);
}

// Enhanced start game functionality
$("#start-game").on("click", function() {
  if (!started) {
    startGame();
  }
});

// Keep keyboard functionality
$(document).on("keydown", function () {
  if (!started) {
    startGame();
  }
});

function startGame() {
  started = true;
  $("#start-game").text("Game in Progress...").prop("disabled", true);
  $(".difficulty-btn").prop("disabled", true);
  nextSequence();
}

function checkAnswer(currentLevel) {
  if (userClickedPattern[currentLevel] === gamePattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      // Correct sequence completed
      $("#level-title").text("Correct! Next level coming...");
      setTimeout(nextSequence, 1000);
    }
  } else {
    // Wrong answer
    gameOver();
  }
}

function gameOver() {
  playSound("wrong");
  $("body").addClass("game-over");
  $("#level-title").text(`Game Over! You reached level ${level}`);
  
  // Update high score
  if (level > highScore) {
    highScore = level;
    localStorage.setItem('simonHighScore', highScore);
    updateHighScore();
    $("#level-title").text(`New High Score! Level ${level}`);
  }
  
  setTimeout(function () {
    $("body").removeClass("game-over");
  }, 200);
  
  setTimeout(function() {
    $("#level-title").text("Game Over - Click Start to Play Again");
  }, 2000);
  
  startOver();
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  isPlayingSequence = false;
  updateCurrentLevel();
  enableButtons();
  $("#start-game").text("Start Game").prop("disabled", false);
  $(".difficulty-btn").prop("disabled", false);
}

function updateCurrentLevel() {
  $("#current-level").text(level);
}

function updateHighScore() {
  $("#high-score").text(highScore);
}

// Difficulty selection
$(".difficulty-btn").on("click", function() {
  if (started) return; // Can't change difficulty during game
  
  $(".difficulty-btn").removeClass("active");
  $(this).addClass("active");
  gameSpeed = parseInt($(this).data("speed"));
});

// Add visual feedback for button interactions
$(".btn").on("mouseenter", function() {
  if (!isPlayingSequence && started) {
    $(this).css("transform", "scale(1.05)");
  }
});

$(".btn").on("mouseleave", function() {
  $(this).css("transform", "scale(1)");
});

// Prevent context menu on buttons
$(".btn").on("contextmenu", function(e) {
  e.preventDefault();
});

// Add touch support for mobile
$(".btn").on("touchstart", function(e) {
  e.preventDefault();
  if (!started || isPlayingSequence) return;
  $(this).trigger("click");
});

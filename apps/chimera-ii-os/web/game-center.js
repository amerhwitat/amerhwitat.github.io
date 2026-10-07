(() => {
  const $ = (id) => document.getElementById(id);
  let db = [];
  let selected = null;
  let raf = 0;
  let cleanup = () => {};
  let state = { xp: 0, score: 0, plays: 0 };

  try {
    const saved = JSON.parse(localStorage.getItem("aurora-game-state") || "{}");
    if (saved && typeof saved === "object") state = Object.assign(state, saved);
  } catch (_) {}

  function log(message) {
    const el = $("log");
    if (!el) return;
    el.textContent += "[" + new Date().toLocaleTimeString() + "] " + message + "\n";
    el.scrollTop = el.scrollHeight;
  }

  function save() {
    localStorage.setItem("aurora-game-state", JSON.stringify(state));
  }

  function hud() {
    $("score").textContent = String(state.score || 0);
    $("xp").textContent = String(state.xp || 0);
    $("selected").textContent = selected ? selected.title : "None";
  }

  function award(points) {
    const n = Math.max(0, Math.floor(Number(points) || 0));
    state.score = Number(state.score || 0) + n;
    state.xp = Number(state.xp || 0) + Math.max(1, Math.floor(n / 10));
    state.plays = Number(state.plays || 0) + 1;
    save();
    hud();
  }

  function safe(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function stopGame() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    cleanup();
    cleanup = () => {};
  }

  function render() {
    const q = ($("q").value || "").toLowerCase();
    const kind = $("kind").value || "";
    const rows = db.filter(function (g) {
      const hay = (g.title + " " + g.type + " " + (g.description || "")).toLowerCase();
      return (!q || hay.includes(q)) && (!kind || g.type === kind);
    });
    $("games").innerHTML = rows.map(function (g) {
      return '<article class="game"><h3>' + safe(g.title) + '</h3>' +
        '<div class="muted">' + safe(g.type) + " · " + safe(g.source || "BizXtreme") + '</div>' +
        '<p>' + safe(g.description || "") + '</p>' +
        '<button class="btn play" data-i="' + db.indexOf(g) + '">Play / Open</button></article>';
    }).join("");
    document.querySelectorAll(".play").forEach(function (button) {
      button.onclick = function () {
        openGame(db[Number(button.dataset.i)]);
      };
    });
  }

  function shell(title, subtitle, controls) {
    $("gameArea").innerHTML =
      '<div class="screen"><canvas id="gameCanvas" width="960" height="500" style="width:100%;height:100%;display:block;touch-action:none"></canvas></div>' +
      '<div class="controls" style="margin-top:10px">' + controls + '</div>' +
      '<div class="muted" id="gameHint" style="margin-top:8px">' + safe(subtitle) + '</div>';
  }

  function openGame(game) {
    stopGame();
    if (!game || typeof game !== "object") {
      log("Unable to start invalid game record.");
      return;
    }
    selected = game;
    hud();
    $("gameArea").innerHTML = '<div class="screen"><div class="muted">Starting ' + safe(game.title || game.id) + "…</div></div>";
    log("Launching " + (game.title || game.id) + "…");

    if (game.id === "trex-runner") {
      trex(game);
      return;
    }
    if (game.type === "aaa-original") {
      aaaPrototype(game);
      return;
    }
    if (game.id === "blackjack" || game.id === "poker-holdem" || game.id === "classic-cards") {
      cards(game);
      return;
    }
    if (game.type === "retro") {
      retro(game);
      return;
    }
    missionGame(game);
  }

  function canvasScale(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: canvas.width / Math.max(1, rect.width),
      y: canvas.height / Math.max(1, rect.height)
    };
  }

  function missionGame(game) {
    const source = Array.isArray(game.storyboard) ? game.storyboard : [];
    const beats = source.filter(function (v) {
      return typeof v === "string" && v.trim();
    }).map(function (v) {
      return v.trim();
    });

    if (!beats.length) {
      beats.push(
        game.description || "Enter the mission zone",
        "Interact with the objective",
        "Survive the encounter",
        "Extract successfully"
      );
    }
    while (beats.length < 3) beats.push("Continue the mission");

    let progress = 0;
    let phase = 0;
    let score = 0;
    let done = false;
    let keys = new Set();
    let last = performance.now();
    let spawn = 0;
    let player = { x: 110, y: 250, r: 18 };
    let target = { x: 700, y: 290, r: 28 };
    let enemies = [];

    shell(
      game.title,
      (game.type === "event" ? "Live event" : "Interactive mission") +
        " — move with WASD/arrows, reach the objective, complete every beat, then extract.",
      '<button class="btn primary" id="action">Interact / Action</button>' +
      '<button class="btn" id="resetGame">Restart</button>' +
      '<button class="btn" id="finishGame">Extract</button>'
    );

    const canvas = $("gameCanvas");
    const ctx = canvas.getContext("2d");

    function reset() {
      progress = 0;
      phase = 0;
      score = 0;
      done = false;
      last = performance.now();
      spawn = 0;
      player = { x: 110, y: 250, r: 18 };
      target = { x: 700, y: 290, r: 28 };
      enemies = [];
      $("gameHint").textContent = "Mission started. Complete objective 1 of " + beats.length + ".";
      draw();
    }

    function interact() {
      if (done) return;

      const distance = Math.hypot(player.x - target.x, player.y - target.y);
      if (distance >= 75) {
        score += 5;
        log("Action registered — move closer to the objective.");
        return;
      }

      if (progress >= beats.length) {
        log("All objectives are complete — use Extract / Finish.");
        return;
      }

      progress += 1;
      score += 100;
      phase = Math.min(progress, beats.length - 1);
      target = {
        x: 120 + Math.random() * 760,
        y: 80 + Math.random() * 330,
        r: 26
      };
      log("Objective " + progress + "/" + beats.length + " completed: " + beats[phase]);

      if (progress >= beats.length) {
        $("gameHint").textContent = "ALL OBJECTIVES COMPLETE — press Extract / Finish.";
        log("All objectives complete. Extraction is unlocked.");
      } else {
        $("gameHint").textContent =
          "Mission started. Complete objective " + (progress + 1) + " of " + beats.length + ".";
      }
    }

    function finish() {
      if (done) return;
      if (progress < beats.length) {
        log("Extraction locked: " + progress + "/" + beats.length + " objectives complete.");
        $("gameHint").textContent =
          "Complete all " + beats.length + " objectives before extraction.";
        return;
      }
      done = true;
      score += 250;
      award(score);
      $("gameHint").textContent = "MISSION COMPLETE — score " + score + ". Press Restart to replay.";
      log("Mission complete: " + game.title + " (" + score + " points)");
      draw();
    }

    function keyDown(event) {
      const key = event.key.toLowerCase();
      keys.add(key);
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
        event.preventDefault();
      }
    }

    function keyUp(event) {
      keys.delete(event.key.toLowerCase());
    }

    function pointer(event) {
      const scale = canvasScale(canvas);
      const rect = canvas.getBoundingClientRect();
      player.x = Math.max(25, Math.min(canvas.width - 25, (event.clientX - rect.left) * scale.x));
      player.y = Math.max(25, Math.min(canvas.height - 25, (event.clientY - rect.top) * scale.y));
      interact();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 960, 500);
      gradient.addColorStop(0, "#071522");
      gradient.addColorStop(1, "#02070d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 960, 500);

      ctx.strokeStyle = "rgba(95,208,255,.15)";
      for (let x = 0; x < 960; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 500);
        ctx.stroke();
      }
      for (let y = 0; y < 500; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#eef7ff";
      ctx.font = "700 22px system-ui";
      ctx.fillText(game.title, 28, 36);
      ctx.font = "15px system-ui";
      ctx.fillText("LIVE BEAT " + Math.min(progress + 1, beats.length) + " / " + beats.length, 28, 61);
      ctx.fillText("Score " + score, 790, 36);

      ctx.fillStyle = done ? "#7d8cff" : "#5fd0ff";
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      enemies.forEach(function (enemy) {
        ctx.fillStyle = "#ff6b7a";
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#7d8cff";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      ctx.fillStyle = "#eef7ff";
      ctx.font = "16px system-ui";
      ctx.fillText(beats[Math.min(phase, beats.length - 1)] || game.description, 28, 475);
    }

    function frame(now) {
      const dt = Math.min(2, (now - last) / 16);
      last = now;

      if (!done) {
        let dx = 0;
        let dy = 0;
        if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
        if (keys.has("arrowright") || keys.has("d")) dx += 1;
        if (keys.has("arrowup") || keys.has("w")) dy -= 1;
        if (keys.has("arrowdown") || keys.has("s")) dy += 1;

        const length = Math.hypot(dx, dy) || 1;
        player.x = Math.max(25, Math.min(935, player.x + (dx / length) * 4.2 * dt));
        player.y = Math.max(25, Math.min(475, player.y + (dy / length) * 4.2 * dt));

        spawn += dt;
        if (spawn > 75 && progress < beats.length && enemies.length < 4) {
          spawn = 0;
          enemies.push({
            x: 960 + Math.random() * 120,
            y: 70 + Math.random() * 350,
            r: 10 + Math.random() * 8,
            v: 1.2 + Math.random() * 1.8
          });
        }

        enemies.forEach(function (enemy) {
          const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          enemy.x += Math.cos(angle) * enemy.v * dt;
          enemy.y += Math.sin(angle) * enemy.v * dt;
        });

        enemies = enemies.filter(function (enemy) {
          return enemy.x > -30 && enemy.x < 990 && enemy.y > -30 && enemy.y < 530;
        });

        if (enemies.some(function (enemy) {
          return Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.r + enemy.r;
        })) {
          score = Math.max(0, score - 25);
          player.x = 110;
          player.y = 250;
          log("Contact detected — repositioned. -25 points");
        }
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    $("action").onclick = interact;
    $("resetGame").onclick = reset;
    $("finishGame").onclick = finish;

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    canvas.addEventListener("pointerdown", pointer);

    cleanup = function () {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      canvas.removeEventListener("pointerdown", pointer);
    };

    reset();
    raf = requestAnimationFrame(frame);
  }

  function aaaPrototype(game) {
    const source = Array.isArray(game.storyboard) ? game.storyboard : [];
    const beats = source.filter(function (v) {
      return typeof v === "string" && v.trim();
    }).map(function (v) {
      return v.trim();
    });

    if (!beats.length) beats.push(
      game.description || "Enter the scene",
      "Explore the environment",
      "Make the branch choice",
      "Extract from the mission zone"
    );

    let step = 0;
    let score = 0;
    let done = false;

    shell(
      game.title,
      "Playable cinematic vertical slice — advance beats, make the branch choice, then extract.",
      '<button class="btn primary" id="move">Advance Beat</button>' +
      '<button class="btn" id="choice">Branch Choice</button>' +
      '<button class="btn" id="extract">Extract / Finish</button>' +
      '<button class="btn" id="aaaReset">Restart</button>'
    );

    const canvas = $("gameCanvas");
    const ctx = canvas.getContext("2d");

    function draw() {
      ctx.clearRect(0, 0, 960, 500);
      ctx.fillStyle = "#050914";
      ctx.fillRect(0, 0, 960, 500);
      ctx.fillStyle = "#5fd0ff";
      ctx.font = "700 28px system-ui";
      ctx.fillText(game.title, 30, 42);
      ctx.fillStyle = "#eef7ff";
      ctx.font = "17px system-ui";
      ctx.fillText("CINEMATIC BEAT " + (step + 1) + " / " + beats.length, 30, 75);
      ctx.font = "21px system-ui";
      ctx.fillText(beats[step], 30, 125);
      ctx.fillStyle = "#7d8cff";
      ctx.fillRect(40, 205, Math.max(30, ((step + 1) / beats.length) * 850), 14);
      ctx.fillStyle = "#eef7ff";
      ctx.font = "16px system-ui";
      ctx.fillText("Score " + score + (done ? " — EXTRACTION COMPLETE" : ""), 30, 465);
    }

    function move() {
      if (done) return;
      if (step < beats.length - 1) {
        step += 1;
        score += 50;
        log("Beat advanced: " + beats[step]);
        if (step === beats.length - 1) {
          $("gameHint").textContent = "Final beat reached — make the branch choice, then extract.";
        }
        draw();
        return;
      }
      log("Final beat already reached.");
    }

    function choice() {
      if (done) return;
      if (step < beats.length - 1) {
        $("gameHint").textContent = "Advance to the branch beat first.";
        log("Branch choice locked until the final beat.");
        return;
      }
      score += 100;
      $("gameHint").textContent = "Choice locked in. Continue to extraction.";
      log("Branch choice recorded.");
      draw();
    }

    function finish() {
      if (done) return;
      if (step < beats.length - 1) {
        log("Extraction locked: advance all cinematic beats first.");
        return;
      }
      done = true;
      award(200 + score);
      $("gameHint").textContent = "VERTICAL SLICE COMPLETE — " + (200 + score) + " points. Press Restart to replay.";
      log("Playable slice complete: " + game.title);
      draw();
    }

    function reset() {
      step = 0;
      score = 0;
      done = false;
      $("gameHint").textContent = "Scene started. Advance the first beat.";
      draw();
    }

    $("move").onclick = move;
    $("choice").onclick = choice;
    $("extract").onclick = finish;
    $("aaaReset").onclick = reset;
    reset();
  }

  function cards(game) {
    const deck = ["A♠", "K♥", "Q♦", "J♣", "10♠", "9♥", "8♦", "7♣"];
    let hand = [];

    $("gameArea").innerHTML =
      '<div class="screen"><div class="cardtable"><h2>' + safe(game.title) + '</h2>' +
      '<p class="muted">Interactive table: deal, draw, then resolve the hand.</p>' +
      '<div class="cards" id="cards"></div>' +
      '<div class="controls"><button class="btn primary" id="deal">Deal</button>' +
      '<button class="btn" id="hit">Hit / Draw</button>' +
      '<button class="btn" id="stand">Stand / Resolve</button></div>' +
      '<div class="muted" id="cardStatus">Ready.</div></div></div>';

    function draw() {
      $("cards").innerHTML = hand.map(function (card) {
        return '<div class="card">' + safe(card) + "</div>";
      }).join("");
    }

    $("deal").onclick = function () {
      hand = deck.slice().sort(function () { return Math.random() - 0.5; }).slice(0, game.id === "classic-cards" ? 5 : 2);
      $("cardStatus").textContent = "Hand dealt. Choose Hit or Stand.";
      draw();
    };

    $("hit").onclick = function () {
      hand.push(deck[Math.floor(Math.random() * deck.length)]);
      award(10);
      $("cardStatus").textContent = "Card drawn. Keep playing or resolve.";
      draw();
    };

    $("stand").onclick = function () {
      if (!hand.length) {
        $("cardStatus").textContent = "Deal a hand first.";
        return;
      }
      $("cardStatus").textContent = "Hand resolved — " + hand.length + " cards in play.";
      award(35);
      log("Card hand resolved.");
    };

    cleanup = function () {};
  }

  function trex(game) {
    let score = 0;
    let running = true;
    const obstacles = [];
    let last = performance.now();
    let spawn = 0;
    const player = { x: 80, y: 330, vy: 0 };

    $("gameArea").innerHTML =
      '<div class="screen"><canvas id="trex" width="900" height="430"></canvas></div>' +
      '<div class="touch"><button data-k="ArrowUp">▲</button><button data-k="Space">JUMP</button><button data-k="ArrowDown">▼</button></div>';

    const canvas = $("trex");
    const ctx = canvas.getContext("2d");

    function jump() {
      if (player.y >= 330) player.vy = -15;
    }

    function keyDown(event) {
      if (event.code === "Space" || event.code === "ArrowUp") jump();
      if (event.code === "ArrowDown" && player.y < 330) player.vy += 2;
    }

    window.addEventListener("keydown", keyDown);
    document.querySelectorAll("[data-k]").forEach(function (button) {
      button.onclick = function () {
        if (button.dataset.k === "Space" || button.dataset.k === "ArrowUp") jump();
      };
    });

    cleanup = function () {
      running = false;
      window.removeEventListener("keydown", keyDown);
    };

    function frame(now) {
      if (!running) return;
      const dt = Math.min(2, (now - last) / 16);
      last = now;
      player.vy += 0.8 * dt;
      player.y += player.vy * dt;

      if (player.y > 330) {
        player.y = 330;
        player.vy = 0;
      }

      spawn += dt;
      if (spawn > 75) {
        spawn = 0;
        obstacles.push({ x: 900, w: 20 + Math.random() * 20 });
      }

      obstacles.forEach(function (obstacle) {
        obstacle.x -= 6 * dt;
      });

      if (obstacles.some(function (obstacle) {
        return obstacle.x < 105 && obstacle.x + obstacle.w > 75 && player.y > 300;
      })) {
        running = false;
        log("T-Rex run ended at " + Math.floor(score));
        award(Math.floor(score));
        return;
      }

      score += dt * 0.1;
      ctx.clearRect(0, 0, 900, 430);
      ctx.fillStyle = "#10263b";
      ctx.fillRect(0, 350, 900, 2);
      ctx.fillStyle = "#5fd0ff";
      ctx.fillRect(player.x, player.y, 28, 20);
      ctx.fillStyle = "#7d8cff";
      obstacles.forEach(function (obstacle) {
        ctx.fillRect(obstacle.x, 330, obstacle.w, 20);
      });
      ctx.fillStyle = "#eef7ff";
      ctx.fillText("Score " + Math.floor(score), 20, 30);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
  }

  function retro(game) {
    $("gameArea").innerHTML =
      '<div class="screen"><div><h2>' + safe(game.title) + '</h2>' +
      '<p class="muted">' + safe(game.description || "") + '</p>' +
      '<p>Browser mode does not emulate the machine directly. Use your owned media with the compatible emulator center.</p>' +
      '<a class="btn primary" href="mame-center.html">Open MAME / Retro Center</a></div></div>';
    cleanup = function () {};
  }

  $("q").oninput = render;
  $("kind").onchange = render;

  $("resetSave").onclick = function () {
    state = { xp: 0, score: 0, plays: 0 };
    save();
    hud();
    log("Local game save reset.");
  };

  $("export").onclick = function () {
    const blob = new Blob([JSON.stringify({ database: db, state: state }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "aurora-game-state.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  Promise.all([
    fetch("bizx-game-database.json").then(function (response) {
      if (!response.ok) throw new Error("game database HTTP " + response.status);
      return response.json();
    }),
    fetch("bizx-game-events.json").then(function (response) {
      if (!response.ok) throw new Error("event database HTTP " + response.status);
      return response.json();
    })
  ]).then(function (records) {
    const all = (Array.isArray(records[0]) ? records[0] : []).concat(Array.isArray(records[1]) ? records[1] : []);
    const seen = new Set();

    db = all.filter(function (game) {
      if (!game || typeof game !== "object" || !game.id || seen.has(game.id)) return false;
      seen.add(game.id);
      return true;
    }).map(function (game) {
      return Object.assign({}, game, {
        title: String(game.title || game.id),
        type: String(game.type || "story"),
        description: String(game.description || "")
      });
    });

    render();
    hud();
    log("Loaded " + db.length + " validated game/event records. Interactive runtime ready.");
  }).catch(function (error) {
    log("Database load error: " + error.message);
  });
})();
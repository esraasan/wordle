const KELIME_UZUNLUĞU = 5;
const ANIMASYON_DANS = 500;
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");

const rnd = Math.floor(Math.random() * wordlist.length);
const targetWord = wordlist[rnd];

// random kelimenin harflerinii diziye atamak için
const targetWordArray = Array.from(targetWord.toLowerCase());

let userGuess = []; // kullanıcının kelimesini eklemek için

startInteraction();

function startInteraction() {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key);
        return;
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess();
        return;
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey();
        return;
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        shakeTiles(getActiveTiles());
        submitGuess();
        return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey();
        return;
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles();
    if (activeTiles.length >= KELIME_UZUNLUĞU) return;
    const nextTile = guessGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";

    // girilen karakterleri diziye ekle
    userGuess.push(key.toLowerCase());
}

function deleteKey() {
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    if (lastTile == null) return;
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;

    // diziyi boşalt
    userGuess.pop();
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()];
    if (activeTiles.length !== KELIME_UZUNLUĞU) {
        showAlert("Yeterli karakter yok!");
        shakeTiles(activeTiles);
        return;
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter;
    }, "");

    if (!wordlist.includes(guess)) {
        showAlert("Listede yok!");
        shakeTiles(activeTiles);
        return;
    }

    // kullanıcıdan alınan harfler diziye atılır
    const userGuessArray = Array.from(guess.toLowerCase());

    // harfleri kontrol ederek arkaplan renklerini belirlemek için
    let allCorrect = true;
    for (let i = 0; i < KELIME_UZUNLUĞU; i++) {
        const targetChar = targetWordArray[i];
        const userChar = userGuessArray[i];

        const tile = activeTiles[i];
        const key = keyboard.querySelector(`[data-key="${userChar}"i]`);

        if (userChar === targetChar) {
            tile.dataset.state = "correct";
            key.classList.add("correct");
        } else if (targetWordArray.includes(userChar)) {
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
            allCorrect = false;
        } else {
            tile.dataset.state = "wrong";
            key.classList.add("wrong");
            allCorrect = false;
        }
    }

    // Doğru tahmin edilen harfleri klavyede renklendir
    targetWordArray.forEach((char, index) => {
        const key = keyboard.querySelector(`[data-key="${char}"i]`);
        if (userGuessArray.includes(char)) {
            key.classList.add("correct");
        }
    });

    stopInteraction();

    if (allCorrect) {
        danceTiles(activeTiles);
        showAlert("Kazandın!");
        setTimeout(() => {
            resetGame();
        }, ANIMASYON_DANS + 1000); // Dans animasyonunun bitmesini beklemek için
    } else {
        showAlert("Tekrar deneyin!");
        startInteraction();
    }
}


function getActiveTiles() {
    return [...guessGrid.querySelectorAll('[data-state="active"]')];
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement("div");
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);
    if (duration == null) return;

    setTimeout(() => {
        alert.classList.add("hide");
        alert.addEventListener("transitionend", () => {
            alert.remove();
        });
    }, duration);
}

//dalgalanma efekti için
function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake");
        tile.addEventListener(
            "animationend",
            () => {
                tile.classList.remove("shake");
            },
            { once: true }
        );
    });
}

//dans efektini çalıştırmak için
function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance");
            tile.addEventListener(
                "animationend",
                () => {
                    tile.classList.remove("dance");
                },
                { once: true }
            );
        }, (index * ANIMASYON_DANS) / 5);
    });
}

function resetGame() {
    //kutucukları temizler
    userGuess = [];
    guessGrid.querySelectorAll('[data-state="active"]').forEach(tile => {
        tile.textContent = "";
        delete tile.dataset.state;
        delete tile.dataset.letter;
    });

    // Renkleri temizler
    keyboard.querySelectorAll('.key').forEach(key => {
        key.classList.remove("correct", "wrong", "wrong-location");
    });

    startInteraction();
}
console.log(targetWord)
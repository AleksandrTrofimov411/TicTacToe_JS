let parent = document.querySelector('.parent');
createForm();
function createForm() {
    clearElem(parent);
    let form = document.createElement('div');
    form.id = 'form';
    form.textContent = 'Введите размер игрового поля от 3 до 9';
    let input = document.createElement('input');
    input.id = 'board-size';
    let message = document.createElement('div');
    message.id = 'message';
    let button = document.createElement('button');
    button.textContent = 'Начать';
    button.id = 'button';
    button.addEventListener('click', startGame);
    let game = document.createElement('div');
    game.id = 'game';
    form.appendChild(input);
    form.appendChild(message);
    form.appendChild(button);
    game.appendChild(form);
    parent.appendChild(game);
}

function startGame(event) {
    try {
        let input = document.querySelector('#board-size');
        isValidBoardSize(input.value);
        let table = createGameBoard(Number(input.value));
        let JSONGameBoard = createJSONWithGameBoard(Number(input.value));
        setBoardSizeInLocalStorage(Number(input.value));
        initGameStateInLocalStorage(JSONGameBoard);
        table.addEventListener('click', updateGameState);
        updateStepCount();
        addElemToTag(parent, table);
        document.querySelector('#game').remove();
    } catch (e) {
        let message = document.querySelector('#message');
        message.innerHTML = e.message;
    }
}

function isValidBoardSize(size) {
    size = size.replaceAll(' ', '')
    if (!Number(size) || Number(size) < 3 || Number(size) > 9) {
        throw new Error('Не правильный ввод');
    }
}

function addElemToTag(parent, child, replace = false) {

    if (typeof child === 'object') {
        if (replace) {
            clearElem(parent);
            parent.appendChild(child);
        } else {
            parent.appendChild(child);
        }
    } else {
        if (replace) {
            clearElem(parent);
            parent.textContent = child;
        } else {
            parent.textContent = child;
        }
    }

}

function clearElem(elem) {
    elem.innerHTML = '';
}

function createGameBoard(size) {
    let table = document.createElement('table');
    for (let i = 0; i < size; i++) {
        let tr = document.createElement('tr');
        tr.id = i;
        for (let j = 0; j < size; j++) {
            let td = document.createElement('td');
            td.id = j;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}

function updateGameState(event) {
    try {
        isCellFree(event.target);
        increaseStepCount();
        addElemToTag(event.target, isWalkingNow());
        let coordinate = {
            x: Number(event.target.parentElement.id),
            y: Number(event.target.id)
        };
        addPlayerMoveToLocalStorage(coordinate, isWalkingNow());
        if (isVictory()) {
            let p = document.createElement('p');
            p.textContent = isWalkingNow() + ' победили!' + ' Нажмите по тексту что бы попробовать еще раз';
            p.addEventListener('click', createForm);
            addElemToTag(parent, p, true);
        }
        if (isDraw()) {
            let p = document.createElement('p');
            p.textContent = 'Ничья. Нажмите по тексту что бы попробовать еще раз';
            p.addEventListener('click', createForm);
            addElemToTag(parent, p, true);
        }
    } catch (e) {
        console.log(e.message);
    }
}



function isCellFree(td) {
    if (td.textContent !== '') {
        throw new Error('Ячейка занята');
    }
}

function isDraw() {
    let gameBoard = getGameStateFromLocalStorage();
    let rowTableLength = getBoardSizeInLocalStorage();
    for (let i = 0; i < rowTableLength; i++) {
        for (let j = 0; j < rowTableLength; j++) {
            if (!gameBoard[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function isVictory() {
    let tableRowLength = getBoardSizeInLocalStorage();
    let gameBoard = getGameStateFromLocalStorage();
    let stone = isWalkingNow();
//  Горизонталь
    let counterStone = 0;
    for (let i = 0; i < tableRowLength; i++) {
        counterStone = 0;
        for (let j = 0; j < tableRowLength; j++) {
            if (gameBoard[i][j] !== stone) {
                counterStone = 0;
                break;
            } else {
                counterStone++;
            }
        }
        if (counterStone === tableRowLength) {
            return true;
        }
    }
//  Вертикаль
    counterStone = 0;
    for (let i = 0; i < tableRowLength; i++) {
        counterStone = 0;
        for (let j = 0; j < tableRowLength; j++) {
            if (gameBoard[j][i] !== stone) {
                counterStone = 0;
                break;
            } else {
                counterStone++;
            }
        }
        if (counterStone === tableRowLength) {
            return true;
        }
    }

//  Горизонталь \
    counterStone = 0;
    for (let i = 0; i < tableRowLength; i++) {
        if (gameBoard[i][i] !== stone) {
            break;
        }
        counterStone++;
        if (counterStone === tableRowLength) {
            return true;
        }
    }
//  Горизонталь /
    counterStone = 0;
    let indexCounter = 0;
    for (let i = tableRowLength - 1; i >= 0; i--) {
        if (gameBoard[indexCounter][i] !== stone) {
            break;
        }
        counterStone++;
        indexCounter++;
        if (counterStone === tableRowLength) {
            return true;
        }
    }
    return false;
}

function addPlayerMoveToLocalStorage(coordinate, stone) {
    let gameState = getGameStateFromLocalStorage();
    gameState[coordinate['x']][coordinate['y']] = stone;
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function getGameStateFromLocalStorage() {
    return JSON.parse(localStorage.getItem('gameState'));
}

function initGameStateInLocalStorage(JSONWithGameBoard) {
    localStorage.setItem('gameState', JSON.stringify(JSONWithGameBoard));
}

function createJSONWithGameBoard(size) {
    let gameBoard = JSON;
    for (let i = 0; i < size; i++) {
        gameBoard[i] = {};
        for (let j = 0; j < size; j++) {
            gameBoard[i][j] = '';
        }
    }
    return gameBoard;
}

function setBoardSizeInLocalStorage(size) {
    localStorage.setItem('boardSize', size);
}

function getBoardSizeInLocalStorage() {
    return Number(localStorage.getItem('boardSize'));
}

function isWalkingNow() {
    return getStepCount()%2 === 1 ? 'X': 'O';
}

function getStepCount() {
    return Number(localStorage.getItem('stepCount'));
}

function increaseStepCount() {
    localStorage.setItem('stepCount', getStepCount() + 1);
}

function updateStepCount() {
    localStorage.setItem('stepCount', 0);
}
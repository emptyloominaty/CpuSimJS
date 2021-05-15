window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return;
    }

    switch (event.key) {
        case "ArrowDown":
            keyPressed = "ArrowDown"
            pressKey(1)
            break;
        case "ArrowUp":
            keyPressed = "ArrowUp"
            pressKey(2)
            break;
        case "ArrowLeft":
            keyPressed = "ArrowLeft"
            pressKey(3)
            break;
        case "ArrowRight":
            keyPressed = "ArrowRight"
            pressKey(4)
            break;
        default:
            return;
    }

    event.preventDefault();
}, true);

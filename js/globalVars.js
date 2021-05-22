let g_prevent = 0













let preventToggle = function() {
     g_prevent = 1 - g_prevent
    document.getElementById("btnToggleKeyboard").innerText = "Prevent Keyboard: "+g_prevent
}
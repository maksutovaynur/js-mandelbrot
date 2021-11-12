import "../style/index.sass"
import createApp from "./app"

const app = createApp(
    document.getElementById("app"),
    {
        sens: document.getElementById('control-sens'),
        inv: document.getElementById('control-inv'),
        down: document.getElementById('control-down'),
        up: document.getElementById('control-up'),
        mode: {
            scale: document.getElementById('control-or-scale'),
            move: document.getElementById('control-or-move'),
        }
    },
    128
);

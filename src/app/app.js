import * as PIXI from 'pixi.js'
import * as PIXIEv from "@pixi/events"
import shader_vert from "../shader/common.vert"
import shader_frag from "../shader/mand.frag"
import paletteSrc from '../public/pal.png'

delete PIXI.Renderer.__plugins.interaction;

function sc(scale) {
    return Math.exp(scale);
}

export default function createApp(parent, scaleControls, shaderIter) {
    const shape = createShape(parent.clientWidth, parent.clientHeight, sc(-1), shaderIter);
    const app = new PIXI.Application({resizeTo: parent});
    parent.appendChild(app.view);
    app.stage.addChild(shape);
    app.ticker.add((delta) => {});
    if (!('events' in app.renderer)) {
        app.renderer.addSystem(PIXIEv.EventSystem, 'events');
    }
    setupEvents(app.stage, shape, scaleControls);
}

function setupEvents(stage, shape, scaleControls) {
    stage.interactive = true;
    let cx = undefined, cy = undefined, ccx, ccy, sx = 0, sy = 0;
    refreshShapeCache();

    stage.addEventListener('pointerdown', onDragStart);
    stage.addEventListener('pointerup', onDragEnd);
    stage.addEventListener('pointerupoutside', onDragEnd);
    stage.addEventListener('wheel', onWheel);

    if (scaleControls.up !== undefined) {
        const zeroPoint = cx === undefined ? {x: sx, y: sy} : {c: cx, y: cy};
        scaleControls.up.addEventListener('mousedown', () => wheelTrack(-100, zeroPoint));
        scaleControls.down.addEventListener('mousedown', () => wheelTrack(+100, zeroPoint));
    }

    function refreshShapeCache(){
        sx = shape.position.x;
        sy = shape.position.y;
    }

    function onDragStart(e) {
        stage.addEventListener('pointermove', onDragMove);
        cx = e.global.x;
        cy = e.global.y;
        ccx = e.global.x;
        ccy = e.global.y;
        refreshShapeCache();
    }

    function onDragEnd(e) {
        stage.removeEventListener('pointermove', onDragMove);
    }

    function onDragMove(e) {
        const deltaX = e.global.x - cx;
        const deltaY = e.global.y - cy;

        if (!isScaleMode()) shape.position.set(sx + deltaX, sy + deltaY);
        else wheelTrack(deltaY, {x: ccx, y: ccy});

        cx = e.global.x;
        cy = e.global.y;
        refreshShapeCache();
    }

    function isScaleMode() {
        const {scale} = scaleControls.mode;
        if (scale !== undefined) {
            if (scale.checked) return true;
        }
        return false;
    }

    function onWheel(e) {
        wheelTrack(e.deltaY, e.global);
    }

    function wheelTrack(delta, point) {
        const {value: sensVal, max: sensMax} = scaleControls.sens;
        const inverted = scaleControls.inv ? scaleControls.inv.checked : true;

        const sensitivity = (Math.exp(sensVal / sensMax) - 1) / 250;
        const deltaScale = Math.exp((inverted ? -1 : 1) * delta * sensitivity);
        const {x: _ssx, y: _ssy} = shape.scale;
        const {x: _sx, y: _sy} = shape.position;
        const {x: _cx, y: _cy} = point;
        shape.position.set(_cx + (_sx - _cx)*deltaScale, _cy + (_sy - _cy)*deltaScale);
        shape.scale.set(_ssx * deltaScale, _ssy * deltaScale);
    }
}

function createShape(x, y, minscale = 0.01, shaderIter=128) {
    const scale = 2 / Math.min(x, y);
    const shape = new PIXI.Mesh(
        loadGeometry(x / minscale, y / minscale, scale, scale * minscale),
        loadShader(shaderIter)
    );
    shape.position.set(x / 2, y / 2);
    shape.scale.set(minscale);
    return shape;
}

function loadShader(iter = 5) {
    const fragSrc = shader_frag.replace("{iter}", iter);
    const vertSrc = shader_vert;
    const uniform = {
        tex: PIXI.Texture.from(paletteSrc),
        center: {type: 'v2', value: {x: 0, y: 0}}
    }
    return PIXI.Shader.from(vertSrc, fragSrc, uniform);
}

function loadGeometry(w, h, worldScale = 1, colorScale = 1) {
    const X = w / 2, Y = h / 2;
    const wX = X * worldScale, wY = Y * worldScale;
    const cX = X * colorScale, cY = Y * colorScale;
    return new PIXI.Geometry()
        .addAttribute('aVertexPosition', [-X, -Y, X, -Y, X, Y, -X, Y], 2)
        .addAttribute('aColor', [0, 0, 0, /**/ cX, 0, 0, /**/ cX, cY, 0, /**/ 0, cY, 0], 3)
        .addAttribute('aUvs', [-wX, -wY, wX, -wY, wX, wY, -wX, wY], 2)
        .addIndex([0, 1, 2, 0, 2, 3]);
}

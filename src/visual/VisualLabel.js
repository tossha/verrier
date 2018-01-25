import VisualModelAbstract from "./ModelAbstract";

export default class VisualLabel extends VisualModelAbstract {
    constructor(functionOfEpoch, parameters) {
        super();

        this.visible = true;

        this.parameters = Object.assign({}, VisualLabel.DEFAULT_SETTINGS, parameters);
        this.functionOfEpoch = functionOfEpoch;

        this.canvas = document.createElement('canvas');

        this.setThreeObj(new THREE.Sprite(new THREE.SpriteMaterial(
            {map: new THREE.CanvasTexture(this.canvas)}
        )));

        this.setText(this.parameters.text);
    }

    setText(text) {
        let context = this.canvas.getContext('2d');
        context.font = this.parameters.fontSize + 'px ' + this.parameters.font;

        let canvasWidth = context.measureText(text).width;
        let canvasHeight = this.parameters.fontSize * 2;
        this.canvas.width = THREE.Math.ceilPowerOfTwo(canvasWidth);
        this.canvas.height = THREE.Math.ceilPowerOfTwo(canvasHeight);

        context.font = this.parameters.fontSize + 'px ' + this.parameters.font;
        context.fillStyle = this.parameters.color;
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.fillText(
            text,
            this.canvas.width / 2,
            this.parameters.fontSize
        );

        this.threeObj.material.map.needsUpdate = true;
    }

    render(epoch) {
        if (!this.visible) {
            this.threeObj.visible = false;
            return;
        }

        this.threeObj.position.copy(sim.getVisualCoords(this.functionOfEpoch.evaluate(epoch)));

        const distance = this.threeObj.position.length();

        const scaleCoeff = this.calculateScaleCoeff(distance, this.parameters.scaling) / 2;
        this.threeObj.scale.x = this.canvas.width  * scaleCoeff;
        this.threeObj.scale.y = this.canvas.height * scaleCoeff;

        this.threeObj.visible = 1 < Math.max(this.threeObj.scale.x, this.threeObj.scale.y) /
            (distance * sim.raycaster.getPixelAngleSize()) / 2;
    }

    calculateScaleCoeff(distance, scaling) {
        if (typeof scaling.callback === 'string') {
            return VisualLabel.scalingFunctions[scaling.callback](distance, scaling.range);
        }
        return scaling.callback(distance, scaling.range);
    }
}

VisualLabel.DEFAULT_SETTINGS = {
    text: '',
    font: 'Arial',
    color: 'white',
    fontSize: 32,
    scaling: {
        range: {
            from: 30000,
            to: 700000,
        },
        callback: 'range'
    }
};

VisualLabel.scalingFunctions = {
    alwaysVisible: (distance) => distance * sim.raycaster.getPixelAngleSize(),
    range: (distance, range) => {
        if (distance < range.from) {
            return range.from * sim.raycaster.getPixelAngleSize();
        }
        if (distance > range.to) {
            return range.to * sim.raycaster.getPixelAngleSize();
        }
        return distance * sim.raycaster.getPixelAngleSize();
    }
};

import * as THREE from "three";

import VisualBodyModelAbstract from "./Abstract";
import VisualModelAbstract from "../ModelAbstract"
import { sim } from "../../simulation-engine";

export default class VisualBodyModelRings extends VisualBodyModelAbstract
{
    constructor(shape, config) {
        super(shape, config);

        this.texturePath = config.texturePath;
        this.ringsRadius = config.ringsRadius;
        this.ringsColorMapPath = config.ringsColorMapPath;
        this.ringsAlphaMapPath = config.ringsAlphaMapPath;
        this.isTextureRequested = false;
    }

    getThreeObj() {
        let container = new THREE.Object3D();

        this.bodyThreeObj = new THREE.Mesh(
            this.shape.getThreeGeometry(),
            this.getMaterial({color: this.color, wireframe: true})
        );

        this.ringsThreeObj = new THREE.Mesh(
            new THREE.CircleGeometry(140220, 64),
            this.getMaterial({color: this.color, wireframe: true})
        );

        container.add(this.bodyThreeObj);
        container.add(this.ringsThreeObj);

        return container;
    }

    updateRingsMaterial() {
        if (this.ringsColorMap && this.ringsAlphaMap) {
            this.ringsThreeObj.material.dispose();
            this.ringsThreeObj.material = this.getMaterial({
                map: this.ringsColorMap,
                alphaMap: this.ringsAlphaMap,
                side: THREE.DoubleSide,
                transparent: true
            });
        }
    }

    getMaterial(parameters) {
        parameters.metalness = 0;
        parameters.roughness = 1;
        return new THREE.MeshStandardMaterial(parameters);
    }

    render(epoch) {
        super.render(epoch);
        if (!this.isTextureRequested
            && this.texturePath
            && this.shape.getMaxDimension() / this.threeObj.position.length() > this.pixelAngleSize
        ) {
            this.isTextureRequested = true;
            sim.textureLoader.load(
                VisualModelAbstract.texturePath + this.texturePath,
                (txt) => {
                    this.bodyThreeObj.material.dispose();
                    this.bodyThreeObj.material = this.getMaterial({map: txt});
                },
                undefined,
                function(err) {
                    console.log(err);
                }
            );
            sim.textureLoader.load(
                VisualModelAbstract.texturePath + this.ringsColorMapPath,
                (txt) => {
                    this.ringsColorMap = txt;
                    this.updateRingsMaterial();
                },
                undefined,
                function(err) {
                    console.log(err);
                }
            );
            sim.textureLoader.load(
                VisualModelAbstract.texturePath + this.ringsAlphaMapPath,
                (txt) => {
                    this.ringsAlphaMap = txt;
                    this.updateRingsMaterial();
                },
                undefined,
                function(err) {
                    console.log(err);
                }
            );
        }
    }
}

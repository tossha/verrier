class VisualBodyModelLight extends VisualBodyModelBasic
{
    constructor(shape, color, texturePath, lightColor, lightIntensity, lightDistance, lightDecay) {
        super(shape, color, texturePath);

        this.light = new THREE.PointLight(lightColor, lightIntensity, lightDistance, lightDecay);
        scene.add(this.light);
    }

    render(epoch, pos) {
        super.render(epoch, pos);
        this.light.position.set(pos.x, pos.y, pos.z);
    }

    getMaterial(parameters) {
        return new THREE.MeshBasicMaterial(parameters);
    }
}
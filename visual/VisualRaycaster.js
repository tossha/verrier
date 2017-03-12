class VisualRaycaster
{
    constructor(threeCamera, pixelPrecistion) {
        let that = this;
        window.addEventListener('mousemove', function (event) {
            that.onMouseMove(event);
        });

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = threeCamera;

        this.setPixelPrecistion(pixelPrecistion);
        this.updatePixelAngleSize();
        window.addEventListener('resize', this.updatePixelAngleSize);
    }

    getPixelDistance(point) {
    	this.raycaster.setFromCamera(this.mouse, this.camera);

    	var pointDirection = (new THREE.Vector3).subVectors(
    		point,
    		this.raycaster.ray.origin
    	);

    	var angle = Math.acos(
    		this.raycaster.ray.direction.normalize().dot(
    		pointDirection.normalize())
    	);

    	return angle / this.raycaster.pixelAngleSize;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    setPixelPrecistion(value) {
        this.raycaster.pixelPrecistion = value;
    }

    updatePixelAngleSize() {
        this.raycaster.pixelAngleSize = deg2rad(this.camera.fov) / window.innerHeight;
    }

    intersectObjects(threeObjects) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObjects(threeObjects);
    }
}
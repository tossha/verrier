import * as THREE from "three";
import $ from "jquery";
import EventHandler from "./EventHandler";
import { Vector } from "./algebra";
import Events from "./Events";
import ReferenceFrameFactory, { ReferenceFrame } from "./ReferenceFrame/Factory";
import TimeLine from "../ui-legacy/TimeLine";
import StarSystemLoader from "../interface/StarSystemLoader";
import VisualRaycaster from "./visual/Raycaster";
import SelectionHandler from "../ui-legacy/SelectionHandler";
import UI from "../ui-legacy/UI";
import StarSystem from "./StarSystem";
import Camera from "../ui-legacy/Camera";
import StarSystemManager from "../interface/StarSystemManager";
import VisualFlightEventImpulsiveBurn from "./visual/FlightEvent/ImpulsiveBurn";
import VisualMarkerApocenter from "./visual/Marker/Apocenter";
import VisualMarkerPericenter from "./visual/Marker/Pericenter";

class SimulationEngine {
    /**
     * @param {SimulationModel} simulationModel
     */
    constructor(simulationModel) {
        this._simulationModel = simulationModel;
        this._globalTime = null;
        this.propagators = {};
        this._renderLoopActive = false;
        this.starSystemManager = new StarSystemManager();

        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xFFEFD5, 0.15));
        this.textureLoader = new THREE.TextureLoader();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });

        this.rendererEvents = new EventHandler(this.renderer.domElement);
        this.selection = new SelectionHandler(this);
    }

    _render = curTime => {
        if (!this._renderLoopActive) {
            return;
        }

        this.tick((curTime - this._globalTime) / 1000);

        this._globalTime = curTime;
        this._simulationModel.statisticsModel.updateStatistics();

        requestAnimationFrame(this._render);
    };

    _firstRender = curTime => {
        this._globalTime = curTime;
        requestAnimationFrame(this._render);
    };

    startRenderLoop() {
        if (!this._simulationModel) {
            throw new Error("SimulationModel must be initialized");
        }

        this.domElement = document.getElementById(this._simulationModel.viewportId);
        this._setRenderSize();
        this.domElement.appendChild(this.renderer.domElement);



        this.camera = new Camera(this.renderer.domElement);
        this.raycaster = new VisualRaycaster(this, this.renderer.domElement, this.camera.threeCamera, /* pixelPrecision */ 7);

        this.time = new TimeLine(0, 1, this._simulationModel.timeModel);
        this.ui = new UI(this);

        VisualFlightEventImpulsiveBurn.preloadTexture();
        VisualMarkerPericenter.preloadTexture();
        VisualMarkerApocenter.preloadTexture();

        this.starSystemManager.loadDefault(() => requestAnimationFrame(this._firstRender));
        this.loadModule("PatchedConics");

        window.addEventListener("resize", this.onWindowResize);
    }

    tick(timeDelta) {
        this.time.tick(timeDelta);
        this.camera.update(this.time.epoch);

        Events.dispatch(Events.RENDER, {epoch: this.time.epoch});

        if (this._renderLoopActive) {
            this.renderer.render(this.scene, this.camera.threeCamera);
        }
    }

    loadStarSystem(jsonFile, onLoadFinish) {
        return Promise.resolve($.getJSON("./star_systems/" + jsonFile, starSystemConfig => {
            this._stopRendering();
            this.selection.deselect();
            this.starSystem && this.starSystem.unload();

            this._simulationModel.activeUniverse.reselectStarSystem(new StarSystem(starSystemConfig.id));

            StarSystemLoader.loadFromConfig(this.starSystem, starSystemConfig);

            this.camera.init(
                ReferenceFrameFactory.buildId(
                    this.starSystem.mainObject,
                    ReferenceFrame.INERTIAL_BODY_EQUATORIAL
                ),
                new Vector([30000, 30000, 20000])
            );

            onLoadFinish && onLoadFinish(this.starSystem);
            Events.dispatch(Events.STAR_SYSTEM_LOADED, {starSystem: this.starSystem});

            this._startRendering();
        }));
    }

    _startRendering() {
        this._renderLoopActive = true;
    }

    _stopRendering() {
        this._renderLoopActive = false;
    }

    get currentEpoch() {
        return this.time.epoch;
    }

    get currentDate() {
        return this.time.getDateByEpoch(this.time.epoch);
    }

    get settings() {
        const showBodyLabels = this._simulationModel ? this._simulationModel.isBodyLabelsVisible : true;

        return {
            ui: {
                showBodyLabels,
                showAnglesOfSelectedOrbit: true,
                camera: {
                    mouseSensitivity: 0.007,
                    zoomFactor: 1.5
                }
            }
        }
    };

    get starSystem() {
        return this._simulationModel.activeUniverse.activeStarSystem;
    }

    forceEpoch(epoch) {
        return this.time.forceEpoch(epoch);
    }

    addEventListener(eventName, listener, priority) {
        this.rendererEvents.addListener(eventName, listener, priority);
    }

    removeEventListener(eventName, listener) {
        this.rendererEvents.removeListener(eventName, listener);
    }

    onWindowResize = () => {
        this._setRenderSize();
        this.camera.onResize();
    };

    getVisualCoords(simCoords) {
        return (new THREE.Vector3()).fromArray(simCoords.sub(this.camera.lastPosition));
    }

    getSimCoords(visualCoords) {
        return (new Vector(visualCoords.toArray())).add_(this.camera.lastPosition);
    }




    /**
     * @param moduleName
     * @param callback
     * @return {Promise}
     */
    loadModule(moduleName, callback) {
        return this._simulationModel.activeUniverse.moduleManager.loadModule(moduleName, callback);
    }

    getModule(moduleName) {
        return this._simulationModel.activeUniverse.moduleManager.getModule(moduleName);
    }

    isModuleLoaded(moduleName) {
        return this._simulationModel.activeUniverse.moduleManager.isModuleLoaded(moduleName);
    }





    getClass(alias) {
        const periodPos = alias.indexOf(".");
        if (periodPos === -1) {
            throw new Error('Incorrect class alias! Period expected in ' + alias);
        }
        return this.getModule(alias.substr(0, periodPos)).getClass(alias.substr(periodPos + 1));
    }

    addPropagator(alias, propagatorClass) {
        this.propagators[alias] = propagatorClass;
    }

    getPropagator(alias) {
        return this.propagators[alias];
    }

    _setRenderSize() {
        if(!this._footerDomElement) {
            this._footerDomElement = document.getElementById("app-footer");
        }

        const footerHeight = (this._footerDomElement ? this._footerDomElement.clientHeight : 0);
        const height = window.innerHeight - footerHeight;

        this.renderer.setSize(this.domElement.clientWidth, height);
    }
}

/**
 * @type {SimulationEngine | null}
 */
export let sim = null;

export function createSimulationEngine(simulationModel) {
    sim = new SimulationEngine(simulationModel)
    return sim;
}
import React from "react";
import { ReactComponent as FullscreenIcon } from "../../../../../common/images/fullscreen.svg";

import Panel, { Field, FieldLabel, FieldControl } from "../../../../../common/panel";
import "./camera-panel.scss";

const CameraPanel = ({ className }) => (
    <Panel
        id="cameraPanel"
        className={`camera-panel ${className}`}
        caption="Camera"
        titleIcon={<FullscreenIcon className="camera-panel__icon" />}
        collapseDirection="right"
    >
        <Field className="camera-panel__field">
            <FieldLabel>Target</FieldLabel>
            <FieldControl>
                <select className="camera-panel__field-control" id="targetSelect" />
            </FieldControl>
        </Field>
        <Field className="camera-panel__field">
            <FieldLabel>Frame type</FieldLabel>
            <FieldControl>
                <select className="camera-panel__field-control" id="rfTypeSelect" />
            </FieldControl>
        </Field>
    </Panel>
);

export default CameraPanel;

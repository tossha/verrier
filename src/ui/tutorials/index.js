import * as wizardIds from "./wizards/wizard-ids";
import LocalStorageWatchStatusService from "./services/local-storage-watch-status-service";
import { showLangSelectorDialog } from "./language-selector";
import StepHandlerService from "./services/step-handler-service";

let isAnyTutorialVisible = false;

async function showWizard({
    wizardId,
    ignoreWatchStatusCheck = false,
    watchStatusService = new LocalStorageWatchStatusService(window.localStorage),
    stepHandlerService = new StepHandlerService("tutorial_", "duration_tut_"),
} = {}) {
    if (isAnyTutorialVisible || (!watchStatusService.canWatch(wizardId) && !ignoreWatchStatusCheck)) {
        return;
    }

    const { default: wizard } = await import(/* webpackChunkName: "[request]" */ `./wizards/${wizardId}/index`);
    isAnyTutorialVisible = true;

    stepHandlerService.handleStep(0);
    const selectedId = await showLangSelectorDialog(wizard.langs);

    Promise.all([
        import(/* webpackChunkName: "[request]" */ `./wizards/${wizardId}/${selectedId}`),
        import(/* webpackChunkName: "createIntroJs" */ `./create-intro-js`),
        import(/* webpackChunkName: "introjsStyles" */ "./introjs.scss"),
    ])
        .then(([{ default: wizardConfig }, { createIntroJs }]) => {
            const intro = createIntroJs(wizardConfig, {
                onStep() {
                    stepHandlerService.handleStep(this._currentStep + 1);
                },
                onComplete() {
                    stepHandlerService.handleStep(this._currentStep + 2);
                    watchStatusService.markAsWatched(wizardId);
                    isAnyTutorialVisible = false;
                },
            });
            intro.start();
        })
        .catch(error => {
            console.error(error.message);
            isAnyTutorialVisible = false;
        });
}

export { showWizard, wizardIds };

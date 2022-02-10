import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import stateFeatureLister from "./stateFeatureLister";
import {getGfiFeature} from "../../../../api/gfi/getGfiFeaturesByTileFeature";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateFeatureLister),
    /**
     * Sets the compare List.
     * @param {Object} state context object.
     * @param {Array} layers array with all visible vector layers
     * @returns {void}
     */
    setGfiFeaturesOfLayer: (state, layers) => {
        if (state.layer.features) {
            const gfiFeatures = [],
                rawFeatures = [],
                sourceOfSelectedLayer = layers.find((layer) => layer.get("id") === state.layer.id);

            state.layer.features.forEach(feature => {
                if (Object.prototype.hasOwnProperty.call(feature.values_, "features")) {
                    feature.values_.features.forEach(nestedFeature => {
                        rawFeatures.push(nestedFeature);
                        gfiFeatures.push(getGfiFeature(sourceOfSelectedLayer.values_, nestedFeature.values_));
                    });
                    state.nestedFeatures = true;
                }
                else {
                    rawFeatures.push(feature);
                    gfiFeatures.push(getGfiFeature(sourceOfSelectedLayer.values_, feature.values_));
                    state.nestedFeatures = false;
                }
            });
            state.rawFeaturesOfLayer = rawFeatures;
            state.gfiFeaturesOfLayer = gfiFeatures;
        }
    }
};

export default mutations;

import Layer2dRasterStaticImage from "./layer2dRasterStaticImage";
import Layer2dRasterWms from "./layer2dRasterWms";
import Layer2dRasterWmts from "./layer2dRasterWmts";
import Layer2dRasterWmsTime from "./Layer2dRasterWmsTime";
import Layer2dVector from "./layer2dVector";
import Layer2dVectorGeojson from "./layer2dVectorGeojson";
import Layer2dVectorOaf from "./layer2dVectorOaf";
import Layer2dVectorSensorThings from "./layer2dVectorSensorThings";
import Layer2dVectorTile from "./layer2dVectorTile";
import Layer2dVectorVectorbase from "./layer2dVectorVectorbase";
import Layer2dVectorWfs from "./layer2dVectorWfs";
import Layer3dEntities from "./layer3dEntities";
import Layer3dTerrain from "./layer3dTerrain";
import Layer3dTileset from "./layer3dTileset";

const layerTypes2d = {
        GEOJSON: Layer2dVectorGeojson,
        OAF: Layer2dVectorOaf,
        SENSORTHINGS: Layer2dVectorSensorThings,
        STATICIMAGE: Layer2dRasterStaticImage,
        VECTORBASE: Layer2dVectorVectorbase,
        VECTORTILE: Layer2dVectorTile,
        WFS: Layer2dVectorWfs,
        WMS: Layer2dRasterWms,
        WMTS: Layer2dRasterWmts,
        WMSTime: Layer2dRasterWmsTime
    },
    layerTypes3d = {
        ENTITIES3D: Layer3dEntities,
        TERRAIN3D: Layer3dTerrain,
        TILESET3D: Layer3dTileset
    };

/**
 * Creates layer instances.
 * @param {Object} layerConf The layer configuration.
 * @param {String} mapMode The current map mode.
 * @returns {Layer} The layer instance.
 */
function createLayer (layerConf, mapMode) {
    const typ = layerConf?.typ?.toUpperCase();
    let layer;

    if (layerTypes2d[typ]) {
        layer = new layerTypes2d[typ](layerConf);
    }
    else if (mapMode === "3D" && layerTypes3d[typ]) {
        layer = new layerTypes3d[typ](layerConf);
    }

    return layer;
}

/**
 * Return 3D layer types
 * @returns {Array} The 3D layer types as an array.
 */
function getLayerTypes3d () {
    return Object.keys(layerTypes3d);
}

/**
 * Return vector layer types
 * @returns {Array} The vectorLayer types as an array.
 */
function getVectorLayerTypes () {
    const vectorLayerTypes = [];

    Object.keys(layerTypes2d).forEach(layerTyp => {
        if (layerTypes2d[layerTyp].prototype instanceof Layer2dVector) {
            vectorLayerTypes.push(layerTyp);
        }
    });

    return vectorLayerTypes;
}

export default {
    createLayer,
    getLayerTypes3d,
    getVectorLayerTypes
};

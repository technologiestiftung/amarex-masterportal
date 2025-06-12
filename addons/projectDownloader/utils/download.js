import GeoJSON from "ol/format/GeoJSON";
// import VectorLayer from "ol/layer/Vector";
import { transform } from "ol/proj";

/**
 * Reproject coordinates from one projection to another
 * @param {Array} coordinates - The coordinates to reproject
 * @param {string} sourceProj - The source projection
 * @param {string} destProj - The destination projection
 * @returns {Array} - The reprojected coordinates
 */
function reprojectCoordinates(coordinates, sourceProj, destProj, geometryType) {
  if (geometryType === "Point") {
    return transform(coordinates, sourceProj, destProj);
  }
  if (!coordinates || coordinates.length === 0) {
    return [];
  }
  if (Array.isArray(coordinates[0][0])) {
    return coordinates.map((coord) =>
      reprojectCoordinates(coord, sourceProj, destProj),
    );
  }
  return coordinates.map((coord) => transform(coord, sourceProj, destProj));
}

/**
 * Gets the measures type from feature
 * @param {object} measure - The destination projection
 * @returns {string|null} - The matched keyword in src or null if not found
 */
function getMeasureTypeFromFeature(measure) {
  if (!Array.isArray(measure?.style_)) return null;

  const keywords = ["swale", "greenroof", "unpvd"];
  const iconUrls = {
    swale:
      "https://amarex-webtool.technologiestiftung-berlin.de/amarex/resources/img/measure-swale.svg",
    greenroof:
      "https://amarex-webtool.technologiestiftung-berlin.de/amarex/resources/img/measure-greenroof.svg",
    unpvd:
      "https://amarex-webtool.technologiestiftung-berlin.de/amarex/resources/img/measure-unpvd.svg",
  };

  for (const style of measure.style_) {
    const image = style?.image_;
    const src = image?.iconImage_?.src_;
    if (typeof src === "string") {
      const keyword = keywords.find((k) => src.toLowerCase().includes(k));
      if (keyword)
        return {
          measureType: keyword,
          iconUrl: iconUrls[keyword] || null,
          iconSize: [50, 50],
        };
    }
  }

  return null;
}

/**
 * Export layer as GeoJSON
 * @param {VectorLayer} layer - The vector layer to export
 * @param {string} sourceProjectionCode - The source projection code
 * @returns {string} - The GeoJSON string
 */
function exportLayerAsGeoJSON(layer, sourceProjectionCode) {
  const source = layer.getSource(),
    features = source.getFeatures(),
    geoJSONFormatter = new GeoJSON(),
    geoJSONData = geoJSONFormatter.writeFeaturesObject(features),
    isAbimoMeasures = layer.get("id") === "abimo_measures";

  geoJSONData.features = geoJSONData.features.map((feature, index) => {
    feature.geometry.coordinates = reprojectCoordinates(
      feature.geometry.coordinates,
      sourceProjectionCode,
      "EPSG:4326",
      feature.geometry.type,
    );

    // add measure properties to abimo_measures layer
    if (isAbimoMeasures) {
      const getMeasureTypeProperties = getMeasureTypeFromFeature(
        features[index],
      );
      if (getMeasureTypeProperties) {
        feature.properties.measureType = getMeasureTypeProperties.measureType;
        feature.properties.iconUrl = getMeasureTypeProperties.iconUrl;
        feature.properties.iconSize = getMeasureTypeProperties.iconSize;
      }
    }
    return feature;
  });

  const geoJSONString = JSON.stringify(geoJSONData, null, 2);

  return geoJSONString;
}

export { exportLayerAsGeoJSON };


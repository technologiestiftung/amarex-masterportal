/* eslint-disable no-console */
const fs = require("fs-extra"),
    path = require("path"),
    createMainMenu = require("./createMainMenu"),
    createSecondaryMenu = require("./createSecondaryMenu"),
    {copyDir, replaceInFile, removeAttributesFromTools} = require("./utils"),
    {PORTALCONFIG, TOPICS, BASEMAPS, BASEMAPS_OLD, SUBJECTDATA} = require("./constants"),
    rootPath = path.resolve(__dirname, "../../../"),
    {deprecated, toolsNotToMigrate, toRemoveFromTools} = require("./configuration"),
    migratedTools = toolsNotToMigrate.concat(deprecated);

/**
 * Migrates the mapView.
 * @param {Object} data content of v2 config.json
 * @returns {Object} the migrated mapView
 */
function readMapView (data) {
    console.info("mapView");
    return data[PORTALCONFIG].mapView;
}

/**
 * Migrates the controls.
 * @param {Object} data content of v2 config.json
 * @returns {Object} the migrated controls
 */
function migrateControls (data) {
    console.info("controls");
    const controls = data[PORTALCONFIG].controls;

    controls.expandable = {};
    console.info("--- HINT: fill controls into expandable, to expand and collapse controlbar.");
    console.info("--- HINT: use control 'startModule' to start tool by control-icon.");
    return controls;
}

/**
 * Migrates the gfi to getFeatureInfo.
 * @param {Object} data content of v2 config.json
 * @returns {Object} the migrated getFeatureInfo
 */
function migrateGFI (data) {
    const gfi = data[PORTALCONFIG].menu.tools?.children?.gfi || data[PORTALCONFIG].menu.gfi;
    let getFeatureInfo = null;

    if (gfi) {
        console.info("getFeatureInfo");
        getFeatureInfo = {...gfi};

        getFeatureInfo.type = "getFeatureInfo";
        removeAttributesFromTools(toRemoveFromTools, getFeatureInfo);
        migratedTools.push("gfi");
    }

    return getFeatureInfo;
}

/**
 * Migrates the tree.
 * @param {Object} data content of v2 config.json
 * @param {Object} configJS the javascript config.js content
 * @returns {Object} the migrated tree
 */
function migrateTree (data, configJS) {
    console.info("tree");
    const oldTree = data[PORTALCONFIG].tree,
        newTree = {};

    if (oldTree?.highlightedFeatures) {
        newTree.highlightedFeatures = oldTree.highlightedFeatures;
    }
    newTree.addLayerButton = true;
    newTree.layerPills = {};
    newTree.layerPills.active = true;

    if (data[PORTALCONFIG].treeType === "default") {
        if (configJS.tree) {
            newTree.layerIDsToIgnore = [...configJS.tree.layerIDsToIgnore];
            newTree.layerIDsToStyle = [...configJS.tree.layerIDsToStyle];
            newTree.metaIDsToMerge = [...configJS.tree.metaIDsToMerge];
            newTree.metaIDsToIgnore = [...configJS.tree.metaIDsToIgnore];
        }
        newTree.type = "auto";
        newTree.validLayerTypesAutoTree = [
            "WMS",
            "SENSORTHINGS",
            "TERRAIN3D",
            "TILESET3D",
            "OBLIQUE"
        ];
        newTree.categories = [
            {
                "key": "kategorie_opendata",
                "name": "common:modules.layerTree.categoryOpendata",
                "active": true
            },
            {
                "key": "kategorie_inspire",
                "name": "common:modules.layerTree.categoryInspire"
            },
            {
                "key": "kategorie_organisation",
                "name": "common:modules.layerTree.categoryOrganisation"
            }
        ];

    }

    return newTree;
}

/**
 * Migrates the footer.
 * @param {Object} configJS the javascript configJs content
 * @returns {Object} the migrated footer
 */
function migrateFooter (configJS) {
    let newFooter = {};

    if (configJS.footer) {
        console.info("portalFooter");
        newFooter = configJS.footer;

        if (typeof configJS.scaleLine === "boolean") {
            newFooter.scaleLine = configJS.scaleLine;
        }
        delete newFooter.showVersion;
    }
    return newFooter;
}

/**
 * Migrates the topics.
 * @param {Object} data content of v2 config.json's topics
 * @returns {Object} the migrated topics
 */
function migrateTopics (data) {
    console.info(TOPICS);
    const oldTopics = data[TOPICS],
        oldBaseMaps = oldTopics[BASEMAPS] || oldTopics[BASEMAPS_OLD],
        oldSubjectData = oldTopics[SUBJECTDATA],
        topics = {};

    topics[BASEMAPS] = migrateBaseMaps(oldBaseMaps);
    topics[SUBJECTDATA] = migrateSubjectData(oldSubjectData);
    return topics;
}

/**
 * Migrates the basemaps.
 * @param {Object} oldData content of v2 config.json's basemaps
 * @returns {Object} the migrated basemaps
 */
function migrateBaseMaps (oldData) {
    console.info("   " + BASEMAPS);
    const baseMaps = {
        elements: []
    };

    if (oldData.Layer) {
        baseMaps.elements = oldData.Layer;
    }

    return baseMaps;
}

/**
 * Migrates the subject data.
 * NOTICE migration of folder structure with 'Ordner' is not implemented!
 * @param {Object} oldData content of v2 config.json's subjectdata
 * @returns {Object} the migrated subject data
 */
function migrateSubjectData (oldData) {
    console.info("   " + SUBJECTDATA + "\n");
    const subjectData = {
        elements: []
    };

    if (oldData && JSON.stringify(oldData).includes("Ordner")) {
        console.warn("NOTICE --- migrating layers in folder strucure ist not implemented yet!");
    }
    else if (oldData?.Layer) {
        subjectData.elements = oldData.Layer;
    }
    return subjectData;
}

/**
 * Migrates the index.html and removes loader stuff.
 * @param {String} sourceFolder the spurce folder
 * @param {String} destFolder the destination folder
 * @param {Object} indexFile the index.html file
 * @returns {void}
 */
function migrateIndexHtml (sourceFolder, destFolder, indexFile) {
    fs.readFile(path.resolve(sourceFolder, indexFile), "utf8")
        .then(data => {
            const regex = /<div id="loader" [\s\S]*loaders.js"><\/script>/g,
                // removes <div id="loader"... and load of special_loaders.js from index.html - loader is no longer provided.
                result = data.replace(regex, "");

            fs.writeFile(path.resolve(destFolder, indexFile), result, "utf8");
        })
        .catch(err => {
            console.error("write index.html", err);
        });
}

/**
 * Checks config.js file for module.exports and adds it if not found.
 * @param {String} sourceFolder the spurce folder
 * @param {Object} configJsFile the config.js file
 * @returns {void}
 */
async function checkConfigJS (sourceFolder, configJsFile) {
    if (Object.keys(require(path.resolve(sourceFolder, configJsFile))).length === 0) {
        fs.readFile(path.resolve(sourceFolder, configJsFile), "utf8")
            .then((data) => {
                const dataToWrite = data + "\n  if (typeof module !== \"undefined\") { module.exports = Config; }";

                fs.writeFile(path.resolve(sourceFolder, configJsFile), dataToWrite, "utf8");
            })
            .catch(err => {
                console.error(err);
            });
    }
}

/**
 * Migrates config.js file to destFolder.
 * @param {String} destFolder the destination folder
 * @param {Object} configJsFile the config.js file
 * @param {Object} config the javascript configJs content
 * @returns {void}
 */
async function migrateConfigJS (destFolder, configJsFile, config) {
    const configJS = {...config};
    let result = null,
        unquoted = null,
        destPath = null;

    delete configJS.footer;
    delete configJS.defaultToolId;
    delete configJS.scaleLine;
    if (configJS.tree) {
        delete configJS.tree.layerIDsToIgnore;
        delete configJS.tree.layerIDsToStyle;
        delete configJS.tree.metaIDsToMerge;
        delete configJS.tree.metaIDsToIgnore;
    }
    result = "const Config = " + JSON.stringify(configJS, null, " ") + ";";
    // JSON.stringify produces keys with quotes -  now replace all keys with quotes with keys without quotes
    unquoted = result.replace(/"([^"]+)":/g, "$1:");
    destPath = path.resolve(destFolder, configJsFile);
    fs.writeFile(destPath, unquoted, "utf8")
        .catch(err => {
            console.error(err);
        });
}

/**
 * Migrates config.json, config.js and index.html to version 3.0.0.
 * @param {String} sourcePath the source path of the portal
 * @param {String} destPath the destination path to store the portal
 * @returns {void}
 */
function migrateFiles (sourcePath, destPath) {
    const
        sourceFolder = path.resolve(rootPath, sourcePath),
        destFolder = path.resolve(rootPath, destPath);

    fs.readdir(sourceFolder)
        .then(files => {
            let configJS = null;
            const configJsonFile = files.find(fileName => fileName === "config.json"),
                configJsFile = files.find(fileName => fileName === "config.js"),
                indexFile = files.find(fileName => fileName === "index.html"),
                srcFile = path.resolve(sourceFolder, configJsonFile),
                destFile = path.resolve(destFolder, configJsonFile);

            checkConfigJS(sourceFolder, configJsFile).then(() => {
                configJS = require(path.resolve(sourceFolder, configJsFile));

                copyDir(sourcePath, destPath).then(() => {
                    fs.readFile(srcFile, "utf8")
                        .then(data => {
                            const migrated = {},
                                parsed = JSON.parse(data);

                            if (!parsed[PORTALCONFIG].mainMenu) {
                                console.info("\n#############################     migrate     #############################\n");
                                console.info("ATTENTION --- the following tools are not migrated: ", toolsNotToMigrate.join(", ") + "\n");
                                console.info("source: ", srcFile, "\ndestination: ", destFile, "\n");
                                const gfi = migrateGFI(parsed);

                                migrated[PORTALCONFIG] = {};
                                migrated[PORTALCONFIG].mapView = readMapView(parsed);
                                migrated[PORTALCONFIG].portalFooter = migrateFooter(configJS);
                                migrated[PORTALCONFIG].controls = migrateControls(parsed);
                                if (gfi) {
                                    migrated[PORTALCONFIG].getFeatureInfo = gfi;
                                }
                                migrated[PORTALCONFIG].tree = migrateTree(parsed, configJS);
                                migrated[PORTALCONFIG].mainMenu = createMainMenu(parsed, configJS, migratedTools, toRemoveFromTools);
                                migrated[PORTALCONFIG].secondaryMenu = createSecondaryMenu(parsed, migratedTools, toRemoveFromTools);
                                migrated[TOPICS] = migrateTopics(parsed);

                                fs.ensureDir(destPath)
                                    .then(() => {
                                        fs.writeFile(destFile, JSON.stringify(migrated, null, 4), "utf8")
                                            .then(() => {
                                                replaceInFile(destFile);
                                                migrateConfigJS(destFolder, configJsFile, configJS).then(() => {
                                                    migrateIndexHtml(sourceFolder, destFolder, indexFile);
                                                    console.info("SUCCESSFULL MIGRATED: ", destFolder);
                                                })
                                                    .catch(err => {
                                                        console.error(err);
                                                    });
                                            })
                                            .catch(err => {
                                                console.error(err);
                                            });
                                    })
                                    .catch(err => {
                                        console.error(err);
                                    });
                            }
                            else {
                                console.warn("IS ALREADY IN V3.0.0 - NOT MIGRATED: ", srcFile);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                    .catch(err => {
                        console.error(err);
                    });
            })
                .catch(err => {
                    console.error(err);
                });
        })
        .catch(err => {
            console.error(err);
        });
}


/**
 * Migrates config.json, config.js and index.html to version 3.0.0.
 * @param {Object} answers contains the sourcePath and the destPath
 * @returns {void}
 */
module.exports = function migrate (answers) {
    const sourcePath = path.resolve(rootPath, answers.sourcePath);

    fs.readdir(sourcePath)
        .then(files => {
            if (files.find(fileName => fileName === "config.json")) {
                migrateFiles(answers.sourcePath, answers.destPath);
            }
            else {
                files.forEach(file => {
                    const sourceFolder = path.resolve(sourcePath, file);

                    fs.readdir(sourceFolder)
                        .then(sourcePathFiles => {
                            if (sourcePathFiles.find(fileName => fileName === "config.json")) {
                                migrateFiles(answers.sourcePath + path.sep + file, answers.destPath + path.sep + file);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });
            }
        })
        .catch(err => {
            console.error(err);
        });
};


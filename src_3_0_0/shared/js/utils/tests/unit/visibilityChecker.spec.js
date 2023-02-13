import {expect} from "chai";
import visibilityChecker from "../../visibilityChecker";

describe("src_3_0_0/shared/js/utils/isModuleVisible", () => {
    describe("visibilityChecker.isModuleVisible", () => {
        it("should return true if mapMode is '2D' and deviceMode is 'Desktop'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Desktop", "light")).to.be.true;
        });

        it("should return true if mapMode is '2D' and deviceMode is 'Mobile'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Mobile", "light")).to.be.true;
        });

        it("should return true if mapMode is '2D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Table", "light")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Desktop", "light")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Mobile'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Mobile", "light")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", "light")).to.be.true;
        });

        it("should return true if supportedMapModes and supportedDevices contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", "light", ["3D"], ["Table"], ["light"])).to.be.true;
        });

        it("should return false if supportedMapModes and supportedDevices doesn't contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", "light", ["2D"], ["Mobile"], ["light"])).to.be.false;
        });

        it("should return false if supportedTreeType doesn't contains treeType ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", "light", ["3D"], ["Table"], ["auto"])).to.be.false;
        });

        it("should return false if one of supportedMapModes and supportedDevices doesn't contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", ["3D"], ["Mobile"], "light")).to.be.false;
            expect(visibilityChecker.isModuleVisible("3D", "Table", ["2D"], ["Table"], "light")).to.be.false;
        });
    });
});

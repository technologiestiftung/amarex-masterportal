import { generateSimpleGetters } from "../../../src/shared/js/utils/generators";
import ProjectUploaderState from "./stateProjectUploader";

const getters = {
  ...generateSimpleGetters(ProjectUploaderState),
};

export default getters;

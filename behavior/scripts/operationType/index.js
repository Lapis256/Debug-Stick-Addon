import GUI from "./gui.js";
import Duplicate from "./duplicate.js";
import Tap from "./tap.js";


export const OPERATION_TYPES = [
    new GUI(), new Duplicate(), new Tap()
];

export { default as TEXT_PREFIX } from "./prefix.js";

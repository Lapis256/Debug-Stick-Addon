import DebugStick from "./debugStick.js";
import GUI from "./operationType/gui.js";
import Duplicate from "./operationType/duplicate.js";
import Tap from "./operationType/tap.js";


const debugStick = new DebugStick("lapis256:debug_stick");

debugStick.registerOperationType(new GUI());
debugStick.registerOperationType(new Duplicate());
debugStick.registerOperationType(new Tap());

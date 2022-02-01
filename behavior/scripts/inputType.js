export const INPUT_TYPE_TAG_NAMESPACE = "debug_stick_input_type:";

class InputTypeBase {
    #tagPrefix = "";
    id;

    get name() {
        return `settings.input.${this.id}`;
    }

    get tag() {
        return INPUT_TYPE_TAG_NAMESPACE + this.id;
    }
}

class Tap extends InputTypeBase {
    id = "tap";
}

class Others extends InputTypeBase {
    id = "others";
}

export const INPUT_TYPES = {
    "tap": new Tap(),
    "others": new Others()
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONParam = exports.ListParam = exports.BooleanParam = exports.FloatParam = exports.IntParam = exports.StringParam = exports.Param = void 0;
class Param {
    constructor(name, options = {}) {
        this.name = name;
        this.options = options;
    }
    get rawValue() {
        return process.env[this.name];
    }
    get value() {
        return this.rawValue || this.options.default || '';
    }
    toString() {
        return `{{params.${this.name}}}`;
    }
    toJSON() {
        return this.toString();
    }
    toSpec() {
        var _a, _b;
        const out = {
            name: this.name,
            ...this.options,
            valueType: this.constructor.valueType,
        };
        if (this.options.default && typeof this.options.default !== 'string') {
            out.default = (_b = (_a = this.options.default) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
        return out;
    }
}
exports.Param = Param;
Param.valueType = 'string';
class StringParam extends Param {
}
exports.StringParam = StringParam;
class IntParam extends Param {
    get value() {
        var _a;
        const intVal = parseInt(this.rawValue || ((_a = this.options.default) === null || _a === void 0 ? void 0 : _a.toString()) || '0', 10);
        if (Number.isNaN(intVal)) {
            throw new Error(`unable to load param "${this.name}", value ${JSON.stringify(this.rawValue)} could not be parsed as integer`);
        }
        return intVal;
    }
}
exports.IntParam = IntParam;
IntParam.valueType = 'int';
class FloatParam extends Param {
    get value() {
        var _a;
        const floatVal = parseFloat(this.rawValue || ((_a = this.options.default) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
        if (Number.isNaN(floatVal)) {
            throw new Error(`unable to load param "${this.name}", value ${JSON.stringify(this.rawValue)} could not be parsed as float`);
        }
        return floatVal;
    }
}
exports.FloatParam = FloatParam;
FloatParam.valueType = 'float';
class BooleanParam extends Param {
    get value() {
        var _a;
        const lowerVal = (this.rawValue ||
            ((_a = this.options.default) === null || _a === void 0 ? void 0 : _a.toString()) ||
            'false').toLowerCase();
        if (!['true', 'y', 'yes', '1', 'false', 'n', 'no', '0'].includes(lowerVal)) {
            throw new Error(`unable to load param "${this.name}", value ${JSON.stringify(this.rawValue)} could not be parsed as boolean`);
        }
        return ['true', 'y', 'yes', '1'].includes(lowerVal);
    }
}
exports.BooleanParam = BooleanParam;
BooleanParam.valueType = 'boolean';
class ListParam extends Param {
    get value() {
        return typeof this.rawValue === 'string'
            ? this.rawValue.split(/, ?/)
            : this.options.default || [];
    }
    toSpec() {
        const out = {
            name: this.name,
            valueType: 'list',
            ...this.options,
        };
        if (this.options.default && this.options.default.length > 0) {
            out.default = this.options.default.join(',');
        }
        return out;
    }
}
exports.ListParam = ListParam;
ListParam.valueType = 'list';
class JSONParam extends Param {
    get value() {
        var _a;
        if (this.rawValue) {
            try {
                return JSON.parse(this.rawValue);
            }
            catch (e) {
                throw new Error(`unable to load param "${this.name}", value ${this.rawValue} could not be parsed as JSON: ${e.message}`);
            }
        }
        else if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('default')) {
            return this.options.default;
        }
        return {};
    }
}
exports.JSONParam = JSONParam;
JSONParam.valueType = 'json';

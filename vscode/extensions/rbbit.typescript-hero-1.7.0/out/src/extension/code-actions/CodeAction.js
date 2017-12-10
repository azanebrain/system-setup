"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const IoC_1 = require("../IoC");
const IoCSymbols_1 = require("../IoCSymbols");
const ClassManager_1 = require("../managers/ClassManager");
const ImportManager_1 = require("../managers/ImportManager");
class AddImportCodeAction {
    constructor(document, importToAdd) {
        this.document = document;
        this.importToAdd = importToAdd;
    }
    static get logger() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.logger);
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            AddImportCodeAction.logger.debug('[%s] add import for declaration "%s"', AddImportCodeAction.name, this.importToAdd.declaration.name);
            const controller = yield ImportManager_1.ImportManager.create(this.document);
            return controller.addDeclarationImport(this.importToAdd).commit();
        });
    }
}
exports.AddImportCodeAction = AddImportCodeAction;
class AddMissingImportsCodeAction {
    constructor(document, resolveIndex) {
        this.document = document;
        this.resolveIndex = resolveIndex;
    }
    static get logger() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.logger);
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            AddMissingImportsCodeAction.logger.debug('[%s] add all missing imports for document "%s"', AddMissingImportsCodeAction.name, this.document.fileName);
            const controller = yield ImportManager_1.ImportManager.create(this.document);
            return controller.addMissingImports(this.resolveIndex).commit();
        });
    }
}
exports.AddMissingImportsCodeAction = AddMissingImportsCodeAction;
class NoopCodeAction {
    execute() {
        return Promise.resolve(true);
    }
}
exports.NoopCodeAction = NoopCodeAction;
class ImplementPolymorphElements {
    constructor(document, managedClass, polymorphObject, typeParameterMappings) {
        this.document = document;
        this.managedClass = managedClass;
        this.polymorphObject = polymorphObject;
        this.typeParameterMappings = typeParameterMappings;
    }
    static get logger() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.logger);
    }
    execute() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            ImplementPolymorphElements.logger.debug('[%s] implement polymorph elements for class "%s"', ImplementPolymorphElements.name, this.managedClass, { file: this.document.fileName });
            const controller = yield ClassManager_1.ClassManager.create(this.document, this.managedClass);
            let typeKeys;
            if (this.typeParameterMappings) {
                typeKeys = Object.keys(this.typeParameterMappings);
            }
            for (const property of this.polymorphObject.properties.filter(o => !controller.hasProperty(o.name))) {
                if (!property.visibility) {
                    property.visibility = 2;
                }
                if (this.typeParameterMappings) {
                    const type = property.type || '';
                    if (typeKeys.indexOf(type) >= 0) {
                        property.type = this.typeParameterMappings[type];
                    }
                }
                controller.addProperty(property);
            }
            for (const method of this.polymorphObject.methods.filter(o => !controller.hasMethod(o.name) && o.isAbstract)) {
                if (!method.visibility) {
                    method.visibility = 2;
                }
                if (this.typeParameterMappings) {
                    const type = method.type || '';
                    if (typeKeys.indexOf(type) >= 0) {
                        method.type = this.typeParameterMappings[type];
                    }
                    for (const param of method.parameters) {
                        const paramType = param.type || '';
                        if (typeKeys.indexOf(paramType) >= 0) {
                            param.type = this.typeParameterMappings[paramType];
                        }
                    }
                }
                controller.addMethod(method);
            }
            return controller.commit();
        });
    }
}
exports.ImplementPolymorphElements = ImplementPolymorphElements;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const errors_1 = require("../../common/errors");
const IoC_1 = require("../IoC");
const IoCSymbols_1 = require("../IoCSymbols");
const Changeable_1 = require("../proxy-objects/Changeable");
function sortByVisibility(o1, o2) {
    const left = o1.object.visibility;
    const right = o2.object.visibility;
    if ((left === undefined && right === undefined) || (left === right)) {
        return 0;
    }
    if (left !== undefined && right === undefined) {
        return -1;
    }
    if (left === undefined && right !== undefined) {
        return 1;
    }
    return right - left;
}
class ClassManager {
    constructor(document, parsedDocument, managedClass) {
        this.document = document;
        this.parsedDocument = parsedDocument;
        this.managedClass = managedClass;
        this.properties = [];
        this.methods = [];
        ClassManager.logger.debug('[%s] create class manager', ClassManager.name, { file: document.fileName, class: managedClass.name });
        this.ctor = new Changeable_1.Changeable(managedClass.ctor);
        this.properties = managedClass.properties.map(o => new Changeable_1.Changeable(o));
        this.methods = managedClass.methods.map(o => new Changeable_1.Changeable(o));
    }
    static get parser() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.typescriptParser);
    }
    static get generator() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.generatorFactory)();
    }
    static get logger() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.logger);
    }
    static create(document, className) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const source = yield ClassManager.parser.parseSource(document.getText());
            const managedClass = source.declarations.find(o => o.name === className && o instanceof typescript_parser_1.ClassDeclaration);
            if (!managedClass) {
                throw new errors_1.ClassNotFoundError(className);
            }
            return new ClassManager(document, source, managedClass);
        });
    }
    hasProperty(name) {
        return this.properties.some(o => o.object.name === name && !o.isDeleted);
    }
    addProperty(nameOrDeclaration, visibility, type) {
        let declaration;
        if (nameOrDeclaration instanceof typescript_parser_1.PropertyDeclaration) {
            if (this.properties.some(o => o.object.name === nameOrDeclaration.name && !o.isDeleted)) {
                throw new errors_1.PropertyDuplicated(nameOrDeclaration.name, this.managedClass.name);
            }
            declaration = nameOrDeclaration;
        }
        else {
            if (this.properties.some(o => o.object.name === nameOrDeclaration && !o.isDeleted)) {
                throw new errors_1.PropertyDuplicated(nameOrDeclaration, this.managedClass.name);
            }
            declaration = new typescript_parser_1.PropertyDeclaration(nameOrDeclaration, visibility, type);
        }
        this.properties.push(new Changeable_1.Changeable(declaration, true));
        ClassManager.logger.debug('[%s] add property to class', ClassManager.name, { property: declaration.name, class: this.managedClass.name });
        return this;
    }
    removeProperty(name) {
        if (!this.properties.some(o => o.object.name === name && !o.isDeleted)) {
            throw new errors_1.PropertyNotFound(name, this.managedClass.name);
        }
        const property = this.properties.find(o => o.object.name === name);
        if (!property) {
            return this;
        }
        property.isDeleted = true;
        if (property.isNew) {
            this.properties.splice(this.properties.indexOf(property), 1);
        }
        ClassManager.logger.debug('[%s] remove property from class', ClassManager.name, { property: name, class: this.managedClass.name });
        return this;
    }
    hasMethod(name) {
        return this.methods.some(o => o.object.name === name && !o.isDeleted);
    }
    addMethod(nameOrDeclaration, visibility, type, parameters) {
        let declaration;
        if (nameOrDeclaration instanceof typescript_parser_1.MethodDeclaration) {
            if (this.methods.some(o => o.object.name === nameOrDeclaration.name && !o.isDeleted)) {
                throw new errors_1.MethodDuplicated(nameOrDeclaration.name, this.managedClass.name);
            }
            declaration = nameOrDeclaration;
        }
        else {
            if (this.methods.some(o => o.object.name === nameOrDeclaration && !o.isDeleted)) {
                throw new errors_1.MethodDuplicated(nameOrDeclaration, this.managedClass.name);
            }
            declaration = new typescript_parser_1.MethodDeclaration(nameOrDeclaration, false, visibility, type);
            declaration.parameters = parameters || [];
        }
        this.methods.push(new Changeable_1.Changeable(declaration, true));
        ClassManager.logger.debug('[%s] add method to class', ClassManager.name, { property: declaration.name, class: this.managedClass.name });
        return this;
    }
    removeMethod(name) {
        if (!this.methods.some(o => o.object.name === name && !o.isDeleted)) {
            throw new errors_1.MethodNotFound(name, this.managedClass.name);
        }
        const method = this.methods.find(o => o.object.name === name);
        if (!method) {
            return this;
        }
        method.isDeleted = true;
        if (method.isNew) {
            this.methods.splice(this.methods.indexOf(method), 1);
        }
        ClassManager.logger.debug('[%s] remove method from class', ClassManager.name, { property: name, class: this.managedClass.name });
        return this;
    }
    commit() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const edits = [
                ...this.calculatePropertyEdits(),
                ...this.calculateMethodEdits(),
            ];
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            workspaceEdit.set(this.document.uri, edits);
            ClassManager.logger.debug('[%s] commit the class', ClassManager.name, { class: this.managedClass.name });
            return vscode_1.workspace.applyEdit(workspaceEdit);
        });
    }
    isInConstructor(property) {
        if (!this.ctor || !this.ctor.object) {
            return false;
        }
        return property.start >= this.ctor.object.start && property.end <= this.ctor.object.end;
    }
    calculatePropertyEdits() {
        const edits = [];
        for (const property of this.properties.filter(o => o.isDeleted)) {
            edits.push(vscode_1.TextEdit.delete(new vscode_1.Range(this.document.lineAt(this.document.positionAt(property.object.start).line).rangeIncludingLineBreak.start, this.document.lineAt(this.document.positionAt(property.object.end).line).rangeIncludingLineBreak.end)));
        }
        for (const property of this.properties.filter(o => o.isNew).sort(sortByVisibility)) {
            const lastProperty = this.properties.filter(o => !o.isNew &&
                !o.isDeleted &&
                !this.isInConstructor(o.object) &&
                o.object.visibility === property.object.visibility).pop();
            const lastPosition = lastProperty ?
                this.document.positionAt(lastProperty.object.end).line + 1 :
                this.document.positionAt(this.managedClass.start).line + 1;
            edits.push(vscode_1.TextEdit.insert(new vscode_1.Position(lastPosition, 0), ClassManager.generator.generate(property.object)));
        }
        return edits;
    }
    calculateMethodEdits() {
        const edits = [];
        for (const method of this.methods.filter(o => o.isDeleted)) {
            const endPosition = this.document.positionAt(method.object.end);
            let endLine = endPosition.line;
            if (this.document.lineAt(endLine + 1).isEmptyOrWhitespace) {
                endLine += 1;
            }
            edits.push(vscode_1.TextEdit.delete(new vscode_1.Range(this.document.lineAt(this.document.positionAt(method.object.start).line).rangeIncludingLineBreak.start, this.document.lineAt(endLine).rangeIncludingLineBreak.end)));
        }
        for (const method of this.methods.filter(o => o.isNew).sort(sortByVisibility)) {
            const lastMethod = this.methods.filter(o => !o.isNew && !o.isDeleted && o.object.visibility === method.object.visibility).pop();
            const lastPosition = lastMethod ?
                this.document.positionAt(lastMethod.object.end).line + 1 :
                this.document.positionAt(this.managedClass.end).line;
            edits.push(vscode_1.TextEdit.insert(new vscode_1.Position(lastPosition, 0), '\n' + ClassManager.generator.generate(method.object)));
        }
        return edits;
    }
}
exports.ClassManager = ClassManager;

'use strict';
const constants_1 = require("./constants");
exports.BlameAnnotationStyle = {
    Compact: 'compact',
    Expanded: 'expanded',
    Trailing: 'trailing'
};
exports.CodeLensCommand = {
    BlameAnnotate: constants_1.Commands.ToggleBlame,
    ShowBlameHistory: constants_1.Commands.ShowBlameHistory,
    ShowFileHistory: constants_1.Commands.ShowFileHistory,
    DiffWithPrevious: constants_1.Commands.DiffWithPrevious,
    ShowQuickFileHistory: constants_1.Commands.ShowQuickFileHistory
};
exports.CodeLensLocation = {
    All: 'all',
    DocumentAndContainers: 'document+containers',
    Document: 'document',
    Custom: 'custom',
    None: 'none'
};
exports.CodeLensVisibility = {
    Auto: 'auto',
    OnDemand: 'ondemand',
    Off: 'off'
};
exports.StatusBarCommand = {
    BlameAnnotate: constants_1.Commands.ToggleBlame,
    ShowBlameHistory: constants_1.Commands.ShowBlameHistory,
    ShowFileHistory: constants_1.Commands.ShowFileHistory,
    DiffWithPrevious: constants_1.Commands.DiffWithPrevious,
    ToggleCodeLens: constants_1.Commands.ToggleCodeLens,
    ShowQuickFileHistory: constants_1.Commands.ShowQuickFileHistory
};
exports.OutputLevel = {
    Silent: 'silent',
    Errors: 'errors',
    Verbose: 'verbose'
};
//# sourceMappingURL=configuration.js.map
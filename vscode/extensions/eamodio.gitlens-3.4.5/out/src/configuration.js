'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("./commands");
exports.BlameAnnotationStyle = {
    Compact: 'compact',
    Expanded: 'expanded',
    Trailing: 'trailing'
};
exports.CodeLensCommand = {
    BlameAnnotate: commands_1.Commands.ToggleBlame,
    ShowBlameHistory: commands_1.Commands.ShowBlameHistory,
    ShowFileHistory: commands_1.Commands.ShowFileHistory,
    DiffWithPrevious: commands_1.Commands.DiffWithPrevious,
    ShowQuickCommitDetails: commands_1.Commands.ShowQuickCommitDetails,
    ShowQuickCommitFileDetails: commands_1.Commands.ShowQuickCommitFileDetails,
    ShowQuickFileHistory: commands_1.Commands.ShowQuickFileHistory,
    ShowQuickCurrentBranchHistory: commands_1.Commands.ShowQuickCurrentBranchHistory
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
    BlameAnnotate: commands_1.Commands.ToggleBlame,
    ShowBlameHistory: commands_1.Commands.ShowBlameHistory,
    ShowFileHistory: commands_1.Commands.ShowFileHistory,
    DiffWithPrevious: commands_1.Commands.DiffWithPrevious,
    ToggleCodeLens: commands_1.Commands.ToggleCodeLens,
    ShowQuickCommitDetails: commands_1.Commands.ShowQuickCommitDetails,
    ShowQuickCommitFileDetails: commands_1.Commands.ShowQuickCommitFileDetails,
    ShowQuickFileHistory: commands_1.Commands.ShowQuickFileHistory,
    ShowQuickCurrentBranchHistory: commands_1.Commands.ShowQuickCurrentBranchHistory
};
//# sourceMappingURL=configuration.js.map
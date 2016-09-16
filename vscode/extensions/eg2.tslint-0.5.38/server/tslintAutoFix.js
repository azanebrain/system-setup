"use strict";
exports.tsLintAutoFixes = [];
/**
 * AutoFix rules are all in this file
 * each autoFix should support the interface TsLintAutoFix and added in this.tsLintAutoFixes
 *
 * the key to map tsLint problem and autofix rules is => tsLintMessage
 */
var autoFix;
autoFix = {
    tsLintCode: "one-line",
    tsLintMessage: "missing whitespace",
    autoFixMessage: "Add a whitespace",
    autoFix: function (codeBefore) {
        var codeAfter = " " + codeBefore;
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "semicolon",
    tsLintMessage: "Missing semicolon",
    autoFixMessage: "Add semicolon",
    autoFix: function (codeBefore) {
        var codeAfter = codeBefore + ";";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "trailing-comma",
    tsLintMessage: "missing trailing comma",
    autoFixMessage: "Add trailing comma",
    autoFix: function (codeBefore) {
        var codeAfter = codeBefore + ",";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "quotemark",
    tsLintMessage: "' should be \"",
    autoFixMessage: "Replace ' by \" ",
    autoFix: function (codeBefore) {
        var codeAfter = "\"" + codeBefore.slice(1, codeBefore.length - 1) + "\"";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "quotemark",
    tsLintMessage: "\" should be '",
    autoFixMessage: "Replace \" by ' ",
    autoFix: function (codeBefore) {
        var codeAfter = "'" + codeBefore.slice(1, codeBefore.length - 1) + "'";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "no-trailing-whitespace",
    tsLintMessage: "trailing whitespace",
    autoFixMessage: "Trim whitespace",
    autoFix: function (codeBefore) {
        var codeAfter = "";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "indent",
    tsLintMessage: "tab indentation expected",
    autoFixMessage: "Replace 4 spaces by 1 tab",
    autoFix: function (codeBefore) {
        var howManySpaces = codeBefore.length;
        var codeAfter = Array(Math.round(howManySpaces / 4) + 1).join(" ");
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "indent",
    tsLintMessage: "space indentation expected",
    autoFixMessage: "Replace 1 tab by 4 spaces",
    autoFix: function (codeBefore) {
        var howManyTabs = codeBefore.length;
        var codeAfter = Array(howManyTabs + 1).join("	");
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "no-var-keyword",
    tsLintMessage: "Forbidden 'var' keyword, use 'let' or 'const' instead",
    autoFixMessage: "Replace var by let",
    autoFix: function (codeBefore) {
        var codeAfter = "let";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "eofline",
    tsLintMessage: "file should end with a newline",
    autoFixMessage: "add new line",
    autoFix: function (codeBefore) {
        var codeAfter = "\n";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "no-var-keyword",
    tsLintMessage: "Forbidden 'var' keyword, use 'let' or 'const' instead",
    autoFixMessage: "Replace var by let",
    autoFix: function (codeBefore) {
        var codeAfter = "let";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "triple-equals",
    tsLintMessage: "== should be ===",
    autoFixMessage: "Replace == by ===",
    autoFix: function (codeBefore) {
        var codeAfter = "===";
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
autoFix = {
    tsLintCode: "comment-format",
    tsLintMessage: "Comment must start with a space",
    autoFixMessage: "Add a space ",
    autoFix: function (codeBefore) {
        var codeAfter = " " + codeBefore;
        return codeAfter;
    }
};
this.tsLintAutoFixes.push(autoFix);
//# sourceMappingURL=tslintAutoFix.js.map
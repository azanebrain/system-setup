"use strict";
var vscode = require('vscode');
var fs = require('fs');
var path = require('path');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "vscode-file-peek" is now active!');
    var config = vscode.workspace.getConfiguration('file_peek');
    var active_languages = config.get('activeLanguages');
    var search_file_extensions = config.get('searchFileExtensions');
    /*
    vscode.languages.getLanguages().then((languages: string[]) => {
       console.log("Known languages: " + languages);
    });
    */
    var peek_filter = active_languages.map(function (language) {
        return {
            language: language,
            scheme: 'file'
        };
    });
    // Register the definition provider
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(peek_filter, new PeekFileDefinitionProvider(search_file_extensions)));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * Provide the lookup so we can peek into the files.
 */
var PeekFileDefinitionProvider = (function () {
    function PeekFileDefinitionProvider(fileSearchExtensions) {
        if (fileSearchExtensions === void 0) { fileSearchExtensions = []; }
        this.fileSearchExtensions = [];
        this.fileSearchExtensions = fileSearchExtensions;
    }
    /**
     * Return list of potential paths to check
     * based upon file search extensions for a potential lookup.
     */
    PeekFileDefinitionProvider.prototype.getPotentialPaths = function (lookupPath) {
        var potential_paths = [lookupPath];
        // Add on list where we just add the file extension directly
        this.fileSearchExtensions.forEach(function (extStr) {
            potential_paths.push(lookupPath + extStr);
        });
        // if we have an extension, then try replacing it.
        var parsed_path = path.parse(lookupPath);
        if (parsed_path.ext !== "") {
            this.fileSearchExtensions.forEach(function (extStr) {
                var new_path = path.format({
                    base: parsed_path.name + extStr,
                    dir: parsed_path.dir,
                    ext: extStr,
                    name: parsed_path.name,
                    root: parsed_path.root
                });
                potential_paths.push(new_path);
            });
        }
        return potential_paths;
    };
    PeekFileDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
        // todo: make this method operate async
        var working_dir = path.dirname(document.fileName);
        var word = document.getText(document.getWordRangeAtPosition(position));
        var line = document.lineAt(position);
        //console.log('====== peek-file definition lookup ===========');
        //console.log('word: ' + word);
        //console.log('line: ' + line.text);
        // We are looking for strings with filenames
        // - simple hack for now we look for the string with our current word in it on our line
        //   and where our cursor position is inside the string
        var re_str = "\"(.*?" + word + ".*?)\"|'(.*?" + word + ".*?)'";
        var match = line.text.match(re_str);
        //console.log('re_str: ' + re_str);
        //console.log("   Match: ", match);
        if (null !== match) {
            var potential_fname = match[1] || match[2];
            var match_start = match.index;
            var match_end = match.index + potential_fname.length;
            // Verify the match string is at same location as cursor
            if ((position.character >= match_start) &&
                (position.character <= match_end)) {
                var full_path = path.resolve(working_dir, potential_fname);
                //console.log(" Match: ", match);
                //console.log(" Fname: " + potential_fname);
                //console.log("  Full: " + full_path);
                // Find all potential paths to check and return the first one found
                var potential_fnames = this.getPotentialPaths(full_path);
                //console.log(" potential fnames: ", potential_fnames);
                var found_fname = potential_fnames.find(function (fname_full) {
                    //console.log(" checking: ", fname_full);
                    return fs.existsSync(fname_full);
                });
                if (found_fname != null) {
                    console.log('found: ' + found_fname);
                    return new vscode.Location(vscode.Uri.file(found_fname), new vscode.Position(0, 1));
                }
            }
        }
        return null;
    };
    return PeekFileDefinitionProvider;
}());
//# sourceMappingURL=extension.js.map
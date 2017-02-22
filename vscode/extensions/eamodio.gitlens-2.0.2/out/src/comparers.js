'use strict';
class Comparer {
}
class UriComparer extends Comparer {
    equals(lhs, rhs) {
        if (!lhs && !rhs)
            return true;
        if ((lhs && !rhs) || (!lhs && rhs))
            return false;
        return lhs.scheme === rhs.scheme && lhs.fsPath === rhs.fsPath;
    }
}
class TextDocumentComparer extends Comparer {
    equals(lhs, rhs) {
        if (!lhs && !rhs)
            return true;
        if ((lhs && !rhs) || (!lhs && rhs))
            return false;
        return uriComparer.equals(lhs.uri, rhs.uri);
    }
}
class TextEditorComparer extends Comparer {
    equals(lhs, rhs) {
        if (!lhs && !rhs)
            return true;
        if ((lhs && !rhs) || (!lhs && rhs))
            return false;
        return textDocumentComparer.equals(lhs.document, rhs.document);
    }
}
const textDocumentComparer = new TextDocumentComparer();
exports.TextDocumentComparer = textDocumentComparer;
const textEditorComparer = new TextEditorComparer();
exports.TextEditorComparer = textEditorComparer;
const uriComparer = new UriComparer();
exports.UriComparer = uriComparer;
//# sourceMappingURL=comparers.js.map
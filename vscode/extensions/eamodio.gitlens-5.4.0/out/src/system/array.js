'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("./object");
var Arrays;
(function (Arrays) {
    function countUniques(array, accessor) {
        const uniqueCounts = Object.create(null);
        for (const item of array) {
            const value = accessor(item);
            uniqueCounts[value] = (uniqueCounts[value] || 0) + 1;
        }
        return uniqueCounts;
    }
    Arrays.countUniques = countUniques;
    function groupBy(array, accessor) {
        return array.reduce((previous, current) => {
            const value = accessor(current);
            previous[value] = previous[value] || [];
            previous[value].push(current);
            return previous;
        }, Object.create(null));
    }
    Arrays.groupBy = groupBy;
    function makeHierarchical(values, splitPath, joinPath, compact = false) {
        const seed = {
            name: '',
            relativePath: '',
            children: Object.create(null),
            descendants: []
        };
        const hierarchy = values.reduce((root, value) => {
            let folder = root;
            let relativePath = '';
            for (const folderName of splitPath(value)) {
                relativePath = joinPath(relativePath, folderName);
                if (folder.children === undefined) {
                    folder.children = Object.create(null);
                }
                let f = folder.children[folderName];
                if (f === undefined) {
                    folder.children[folderName] = f = {
                        name: folderName,
                        relativePath: relativePath,
                        children: undefined,
                        descendants: undefined
                    };
                }
                if (folder.descendants === undefined) {
                    folder.descendants = [];
                }
                folder.descendants.push(value);
                folder = f;
            }
            folder.value = value;
            return root;
        }, seed);
        if (compact)
            return compactHierarchy(hierarchy, joinPath, true);
        return hierarchy;
    }
    Arrays.makeHierarchical = makeHierarchical;
    function compactHierarchy(root, joinPath, isRoot = true) {
        if (root.children === undefined)
            return root;
        const children = [...object_1.Objects.values(root.children)];
        for (const child of children) {
            compactHierarchy(child, joinPath, false);
        }
        if (!isRoot && children.length === 1) {
            const child = children[0];
            if (child.value === undefined) {
                root.name = joinPath(root.name, child.name);
                root.relativePath = child.relativePath;
                root.children = child.children;
            }
        }
        return root;
    }
    Arrays.compactHierarchy = compactHierarchy;
    function uniqueBy(array, accessor, predicate) {
        const uniqueValues = Object.create(null);
        return array.filter(_ => {
            const value = accessor(_);
            if (uniqueValues[value])
                return false;
            uniqueValues[value] = accessor;
            return predicate ? predicate(_) : true;
        });
    }
    Arrays.uniqueBy = uniqueBy;
})(Arrays = exports.Arrays || (exports.Arrays = {}));
//# sourceMappingURL=array.js.map
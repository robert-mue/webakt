class HierarchyDisplay {

    constructor(spec) {

        this.table = $('<table></table>');

        if (spec && spec.tree) {
            this.displayTree(spec.tree);
        } else {
            var tree = {};
            tree.tree_down = {};
            tree_down.root = [];
            tree.tree_up = {};
            this.displayTree(tree);
        }
    }

    displayTree (tree) {
        for (var id in tree.tree_down) { 
            var lowerIds = tree.tree_down[id];
            for (var j=0; j<lowerIds.length; j++) {
                var lowerId = lowerIds[j];
            }
        }
    }

    displayTree (tree) {
        process(tree,0,tree['top']);

        function process(tree,level,nodeIds) {
            var indents = ['','-- ','-- -- ','-- -- -- '];
            for (var i=0; i<nodeIds.length; i++) {
                var nodeId = nodeIds[i];
                console.log(indents[level],nodeId);
                if (tree[nodeId]) {
                    level += 1;
                    var subNodes = tree[nodeId];
                    process(tree,level,subNodes);
                    level -= 1;
                }
            }
        }
    }

}

                    



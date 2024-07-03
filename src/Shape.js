class Shape {
    // vertices PVector[]
    constructor(vertices, nodes, edges) {
        this.polygon = new Polygon().forShape(vertices, 1)
        this.nodes = nodes
        this.edges = edges
        this.metaEdge = []
    }

    display(color) {
        this.polygon.display(color, false)
        // text(this.id, this.polygon.centerBB.x, this.polygon.centerBB.y)
    }
}
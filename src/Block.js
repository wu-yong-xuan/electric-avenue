class Block {
    constructor(shape) {
        this.shape = shape
        this.poly = shape.polygon
        this.verts = this.poly.verts
        this.nodes = shape.nodes // nodes along perimter
        this.edges = shape.edges // edges between perimeter nodes
        this.mnwEdges = shape.metaEdge
        this.mnwNodes = this.mnwEdges.map(e => e.start).flat()
        this.powered = false
        this.occupied = false
        this.center = geometric.polygonCentroid(this.verts)
    }


    display() {
        this.poly.display('#2d5425', false)
        if (this.occupied) {
            if (!this.powered) {
                this.poly.display('rgba(255,0,0,0.4)', false)
            } else {
                this.poly.display('rgba(0,0,255,0.4)', false)
            }
        } else {
            this.poly.display('rgba(255,255,255,.3)', false)
        }
        // text(this.id, this.polygon.centerBB.x, this.polygon.centerBB.y)
    }



}
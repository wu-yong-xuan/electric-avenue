class Block {
    constructor(shape) {
        this.shape = shape
        this.poly = shape.polygon
        this.verts = this.poly.verts
        this.nodes = shape.nodes // nodes along perimeter
        this.edges = shape.edges // edges between perimeter nodes
        this.mnwEdges = shape.metaEdge
        this.mnwNodes = this.mnwEdges.map(e => e.start).flat()
        this.powered = false
        this.occupied = false
        this.center = geometric.polygonCentroid(this.verts)
    }
    distributePower(powerlines, r = 3){ //input a list of powerlines
        let powah = powerlines.filter(p => p.powered == true)
        let fringe = new MinPQ()
        let visited = []
        this.nodes.forEach(n=>fringe.push(n, 0))
        while (!fringe.isEmpty()) {
            let v = fringe.pop()
            if (v.priority == r) {continue}
            powah.forEach(p=> {
                if (p.node == v.item) {
                    this.powered = true
                }
            })
            visited.push(v.item);
            v.item.neighbors.forEach(n => {
                if (!visited.includes(n)) {
                    fringe.push(n, 1 + v.priority)
                }
            })
        }
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
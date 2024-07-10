class Neighborhood {
    constructor(mnw, trim, net) {
        this.blocks = []
        this.mnw = mnw
        this.trim = trim
        this.net = net
    }
    addBlock(block) {
        this.blocks.push(block)
    }

    //implementation of dijkstras 
    //TODO: implment A*
    shortestPath(start, stop) {
        let fringe = new MinPQ()
        let map = new Map()
        map.set(start, {prev: start, len:0})
        let visited = []
        fringe.push(start, 0);
         while (!fringe.isEmpty()) {
             let v = fringe.pop()
             if (v.item == stop) {
                let out = []
                let temp = stop
                out.splice(0, 0, temp);
                while (temp != start) {
                    temp = map.get(temp).prev
                    out.splice(0, 0, temp);
                }
                return out
            }
            visited.push(v.item);
            v.item.metaNeighbors.forEach(n => {
                 if (!visited.includes(n.node)) {
                     if (!map.has(n.node)) {
                        map.set(n.node, {prev:v.item, len:n.edge.length + v.priority})
                        fringe.push(n.node, n.edge.length + v.priority)
                     } else if (n.edge.length + v.priority < map.get(n.node).len) {
                        map.set(n.node, {prev:v.item, len:n.edge.length + v.priority})
                        fringe.push(n.node, n.edge.length + v.priority)
                     }
                 }
            })
        }
        return null
    }

    //path is a list of nodes from the metanetwork
    //each node has attribute metaneighbors
    displayPath(path) {
        let i = 0
        path.forEach(n => {
            i++
            if (i<path.length) {
                let metaN = n.metaNeighbors.filter(mn => mn.node == path[i])[0]
                //metaN.edge.display('purple')       
                for (let j = 1; j < metaN.edge.verts.length; j++) {
                    metaN.edge.verts[j]
                    stroke('purple')
                    strokeWeight(4)
                    line(metaN.edge.verts[j-1].pos.x, metaN.edge.verts[j-1].pos.y, metaN.edge.verts[j].pos.x, metaN.edge.verts[j].pos.y)
                }         
            }
            n.highlight()
        })
    }

    getBlockFromCoords(x,y, radius = 5) {
        let fringe = new MinPQ()
        this.blocks.forEach(block => {
            let dst = dist(x, y, block.center[0], block.center[1])
            if (dst <= radius) {
                fringe.push(block, dst)
            }
        })
        let out = fringe.pop()
        if (out == null) {return null}
        return out.item
    }
    getNodeFromCoords(x,y, radius = 5) {
        let block = this.getBlockFromCoords(x,y,radius)
        let fringe = new MinPQ()
        block.nodes.forEach(n=>{
            let dst = dist(x, y, n.pos.x, n.pos.y)
            if (dst <= radius) {
                fringe.push(n, dst)
            }
        })
        let out = fringe.pop()
        if (out == null) {return null}
        return out.item
    }
    getBlock(id) {
        return this.blocks[id]
    }
    getBlockID(block) {
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i] == block) {
                return i
            }
        }
        return null
    }

    display() {
        this.blocks.forEach(b => b.display())
    }
}
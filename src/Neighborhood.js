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
        fringe.push(start, 0, 0);
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
                metaN.edge.display('purple')                
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

    display() {
        this.blocks.forEach(b => b.display())
    }
}
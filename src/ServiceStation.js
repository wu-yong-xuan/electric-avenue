class ServiceStation {
    constructor(node) {
        this.crew = []
        this.x = node.pos.x
        this.y = node.pos.y
        this.node = node
        this.teamsReady = 0
    }
    addCrew(team) {
        this.crew.push(team)
        team.joinStation(this)
        this.teamsReady++
    }
    async dispatchCrew(dest, neighborhood) {
        this.teamsReady--
        this.crew.filter(c=> !c.enroute)[0].dispatch(dest, neighborhood)
    }

    display() {
        noStroke()
        fill('blue')
        circle(this.x, this.y, 10)
        this.crew.forEach(c=>{
            if(c.enroute) {
                c.display()
            }
        })
    }



} 
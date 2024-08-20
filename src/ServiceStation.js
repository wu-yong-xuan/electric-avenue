class ServiceStation {
    constructor(node, imgsta, imgcre) {
        this.crew = []
        this.x = node.pos.x
        this.y = node.pos.y
        this.node = node
        this.teamsReady = 0
        this.img = imgsta
        this.crewImg = imgcre
        this.queue = []
    }
    update(node) {
        this.node = node
        this.x = node.pos.x
        this.y = node.pos.y
    }
    addCrew(team) {
        this.crew.push(team)
        team.joinStation(this)
        this.teamsReady++
    }
    async dispatchCrew(dest, neighborhood, sound=null, gs) {
        if (this.teamsReady > 0) {
            this.teamsReady--
            this.crew.filter(c=> !c.enroute)[0].dispatch(dest, neighborhood, sound, gs)
        } else if (this.queue.length < 5 * this.crew.length) {
            this.queue.push([dest, neighborhood, sound])
        }
    }

    display() {
        image(this.img,this.x-10.5,this.y-10.5,21,21,0,0,this.img.width,this.img.height,'CONTAIN')
        //noStroke()
        //fill('blue')
        //circle(this.x, this.y, 10)
        this.crew.forEach(c=>{
            if(c.enroute) {
                c.display()
            }
        })
    }



} 
class GameState {
    constructor(n, c, r = 100000, cost = this.cost1, income = this.income1) {
        this.neighborhood = n
        this.season = 'fall'  
        this.colorScheme = c
        this.bg = c.get(this.season).bg
        this.riverColor = c.get(this.season).river
        this.resource = r
        this.costfn = cost
        this.incomefn = income
        this.step = 0
        this.activeArea = 0
        this.offlineArea = 0
        this.load = 0
        this.cyclesPerStep = 60
        this.startupTime = 30 * this.cyclesPerStep
        this.active = false
        this.numGens = 0
        this.next = 'winter'
    }

    startClock() {
        this.active = true
    }

    changeSeason(season) {
        this.season = season
        this.bg = this.colorScheme.get(this.season).bg
        this.riverColor = this.colorScheme.get(this.season).river
    }
    nextSeason(curr) {
        switch(curr) {
        case 'fall':
            this.changeSeason('winter')
            this.next = 'spring'
            break
        case 'winter':
            this.changeSeason('spring')
            this.next = 'summer'
            break
        case 'spring':
            this.changeSeason('summer')
            this.next = 'fall'
            break
        case 'summer':
            this.changeSeason('fall')
            this.next = 'winter'
            break
        }
    }
    cost1() {
        if (this.startupTime>0) {
            this.startupTime -= 1
        } else {
            this.resource -= Math.round(200 * this.neighborhood.pl.length / this.cyclesPerStep)
        }
    }
    calcArea() {
        this.activeArea = 0
        this.offlineArea = 0
        this.neighborhood.blocks.forEach(b => {
            if (b.occupied && b.powered) {
                this.activeArea += b.area
            } else if (!b.occupied) {
                this.offlineArea -= b.area
            }
        })
        this.activeArea = Math.round(this.activeArea)
        this.offlineArea = Math.round(this.offlineArea)
    }
    income1() {
        this.resource += Math.round(this.activeArea/7/this.cyclesPerStep)
    }

    buyPL(length) {
        this.resource -= this.powerlineCost(length)
    }

    addGen(x, y) {
        this.numGens++
        let gen = new PowerGenerator(x, y)
        this.neighborhood.addPLine(gen)
    }
    powerlineCost(length) {
        return Math.round(10000 + length*50)
    }   

    calculateLoad() {
        this.load = this.activeArea / this.numGens
        this.load *= 1.25
    }
    failure() {
        let r = Math.random()
        if (r < this.load / 1000000 / this.cyclesPerStep) {
            print(this.load, r)
            print(this.load/1000000)
            neighborhood.randomFailure()
        }
        if (r < this.offlineArea / 1000000 / this.cyclesPerStep) {
            print(this.load, r)
            print(this.load/1000000)
            neighborhood.randomFailure()
        }
    }


    async timestep(iteratenet){
        if(this.active) {
            this.step++
            this.calcArea()
            this.calculateLoad()
            this.costfn()
            this.incomefn()
            this.failure()
            if (this.season=='summer' || this.season=='winter') {
                this.failure()
            }
            if (this.step% (60*this.cyclesPerStep) == 0) {
                this.nextSeason(this.season)
                iteratenet()
            } else if (this.step% (60*this.cyclesPerStep) >= 40*this.cyclesPerStep) {
                let c1 = this.colorScheme.get(this.season)
                let c2 = this.colorScheme.get(this.next)
                this.bg = lerpColor(color(c1.bg), color(c2.bg), (this.step% (60*this.cyclesPerStep) - 40*this.cyclesPerStep) / (20*this.cyclesPerStep) )
                this.riverColor = lerpColor(color(c1.river), color(c2.river), (this.step% (60*this.cyclesPerStep) - 40*this.cyclesPerStep) / (20*this.cyclesPerStep ))
            }
        }
    }





} 

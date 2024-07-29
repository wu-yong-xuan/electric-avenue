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
        this.load = 0
        this.startupTime = 30
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
            break
        case 'winter':
            this.changeSeason('spring')
            break
        case 'spring':
            this.changeSeason('summer')
            break
        case 'summer':
            this.changeSeason('fall')
            break
        }
    }
    cost1() {
        if (this.startupTime>0) {
            this.startupTime -= 1
        } else {
            this.resource -= 300 * this.neighborhood.pl.length
        }
    }
    calcArea() {
        this.activeArea = 0
        this.neighborhood.blocks.forEach(b => {
            if (b.occupied && b.powered) {
                this.activeArea += b.area
            }
        })
        this.activeArea = Math.round(this.activeArea)
    }
    income1() {
        this.resource += Math.round(this.activeArea/10)
    }

    buyPL(length) {
        this.resource -= this.powerlineCost(length)
    }
    powerlineCost(length) {
        return Math.round(10000 + length*50)
    }   

    calculateLoad() {
        let numGens = 0
        neighborhood.pl.forEach(p => {
            if (p instanceof PowerGenerator) {numGens++}
        })
        this.load = this.activeArea / numGens
    }
    failure() {
        let r = Math.random()
        if (r < this.load / 1000000) {
            print(this.load, r)
            print(this.load/1000000)
            neighborhood.randomFailure()
        }
    }


    timestep(){
        this.step++
        this.calcArea()
        this.calculateLoad()
        this.costfn()
        this.incomefn()
        this.failure()
        if (this.step%60 == 0) {
            this.nextSeason(this.season)
        }
    }





} 

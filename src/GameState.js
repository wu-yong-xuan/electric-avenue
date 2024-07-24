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
        this.resource -= 10000
    }
    income1() {
        let area = 0
        this.neighborhood.blocks.forEach(b => {
            if (b.occupied && b.powered) {
                area += b.area
            }
        })
        this.resource += Math.round(area)
    }
    buyPL(length) {
        this.resource -= this.powerlineCost(length)
    }
    powerlineCost(length) {
        return Math.round(10000 + length*50)
    }
    timestep(){
        this.step++
        this.costfn()
        this.incomefn()
        if (this.step%6 == 0) {
            this.nextSeason(this.season)
        }
    }



} 

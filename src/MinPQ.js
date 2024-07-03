
class Item {
    constructor(item, priority)
    {
        this.item = item;
        this.priority = priority;
    }
}
 

class MinPQ {
    constructor()
    {
        this.items = [];
    }

    push(item, priority) 
    {
        let element = new Item(item, priority);
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > element.priority) {
                this.items.splice(i, 0, element);
                return;
            }
        }
        this.items.push(element);
    }
    pop()
    {
        if (this.isEmpty())
            return null;
        return this.items.shift();
    }
    isEmpty()
    {
        return this.items.length == 0;
    }
}
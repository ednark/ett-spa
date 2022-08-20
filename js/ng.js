class EttComponent {
    constructor (containerElement) {
      this.containerElement = containerElement
      this.templates = {}
    }
    findTemplates () {
        return true
    }

    render () {
        return true
    }
    renderUpdate () {
        return true
    }

    toPersist () {
        return true
    }
    persist () {
        return true
    }
}

class EttDay extends EttComponent {
    constructor (containerElement, date, storage) {
        super(containerElement)

        this.date = date
        this.storage = storage

        this.headerElement = null
        this.dateElement = null
        this.tasksElement = null

        this.tasksHeader = null
        this.tasksSubHeader = null

        this.tasks = []
        this.defaultData = {
            date: date,
            startHour: 7,
            numHours: 12,
            numTasks: 7,
            numMajor: 3,
            tasks: {
                0:{
                    order:0,
                    name:'task 1',
                    hours:{7:{0:"15", 15:"15", 30:"15", 45:"15"}}
                }
            }
        }

        this.findTemplates()
    }
    findTemplates () {
        this.templates['day'] = null
        let template = document.getElementById('ett-day-template')
        if ( template ) {
            this.templates['day'] = template.content.cloneNode(true)
        }
        return true
    }
    render () {
        // we are given a container element
        this.containerElement.innerHTML = ''

        let newDayElement = this.templates['day'].cloneNode(true)
        this.containerElement.appendChild( newDayElement )

        this.headerElement = this.containerElement.querySelector('header.ett-header')
        this.dateElement = this.containerElement.querySelector('input.ett-date')
        this.tasksElement = this.containerElement.querySelector('main.ett-tasks')

        this.renderUpdate(this.date)

        let self = this

        document.addEventListener('BubbleFill',function(ev){
            if (ev.task.multiSelectActive) { return; }
            self.persist()
        })

        document.addEventListener('TaskChange',function(ev){
            console.log('Heard TaskChange','recalculate daily total')
        })

        document.addEventListener('Persist',function(ev){
            self.persist()
        })

        return true
    }
    renderUpdate (date) {
        this.date = date
        this.dateElement.value = date

        let storedData = this.storage.get(this.date)
        console.log( 'storage.get',this.date,storedData )
        if ( storedData && 'date' in storedData ) {
            this.data = storedData
        } else {
            this.data = JSON.parse(JSON.stringify(this.defaultData))
        }
        this.data.date = this.date

        this.tasks = []

        let headerData = JSON.parse(JSON.stringify(this.data))
        headerData.tasks = {}

        for ( let t=0; t<this.data.numTasks; t++ ) {
            if ( t == 0 ) {
                let newTaskMainHeader = new EttTaskHeader (this.tasksElement, this, 'task-header', 'THE MAJOR TASKS FOR TODAY')
                this.tasksHeader = newTaskMainHeader
                newTaskMainHeader.render()
            } else if ( t == (this.data.numMajor) ) {
                let newTaskSubHeader = new EttTaskHeader (this.tasksElement, this, ['task-header', 'task-subheader'], 'STUFF THAT "JUST HAPPENED"')
                this.tasksSubHeader = newTaskSubHeader
                newTaskSubHeader.render()
            }
            if ( ! t in this.data.tasks ) {
                this.data.tasks[t] = {order:t, name:'', hours:{}}
            }
            let taskNumber = t
            let taskClassName = (t < this.data.numMajor) ? 'ett-major-task' : ''
            let newTask = new EttTask(this.tasksElement, this, taskClassName, taskNumber)
            this.tasks.push(newTask)
			newTask.render()
        }

        return true
    }

    toPersist () {
        console.log('Day toPersist')
        let persist = JSON.parse(JSON.stringify(this.data))
        persist.tasks = {}
        this.tasks.forEach( (ettTask, t) => {
            persist.tasks[t] = ettTask.toPersist()
        });
        persist.date = persist.date || new Date().toLocaleDateString('en-CA')
        return persist
    }
    persist () {
        console.log('Day Persist Save')
        let persist = this.toPersist()
        if ( persist ) {
            this.data = persist
        }
        let date = this.data.date || new Date().toLocaleDateString('en-CA')
        this.storage.set(date,this.data)
        let storedData = this.storage.get(this.date)
       console.log( 'storage.set',date,storedData)
    }

}

class EttTask extends EttComponent {
    constructor (containerElement, day, className, taskNumber) {
        super(containerElement)
        this.day = day
        this.className = Array.isArray(className) ? className : [className]
        this.className = this.className.filter(n => { return n.length })
        this.taskNumber = taskNumber

        this.taskElement = null
        this.totalElement = null
        this.nameElement = null
        this.indexElement = null

        this.hoursContainerElement = null
        this.hourElements = []
        this.hours = []

        this.multiSelectActive = false
        this.multiSelectFill = false
        this.multiFillStartIndex = null

        this.findTemplates()
    }
    findTemplates () {
        this.templates['task'] = null
        let template = document.getElementById('ett-task-template')
        if ( template ) {
            this.templates['task'] = template.content.firstElementChild.cloneNode(true)
        }
        return true
    }
    render () {
        this.taskElement = this.templates['task'].cloneNode(true)
        this.taskElement.classList.add(...this.className)
        this.containerElement.appendChild( this.taskElement )

        this.hourContainerElement = this.taskElement.querySelector('.ett-task-time')
        this.totalElement = this.taskElement.querySelector('.ett-task-total')
        this.nameElement = this.taskElement.querySelector('.ett-task-name > input')
        this.indexElement = this.taskElement.querySelector('.ett-task-index')

        this.renderUpdate()

        let self = this
        this.nameElement.addEventListener('change',function(){
            let evv = new Event('Persist')
            evv.task = self
            document.dispatchEvent(evv)
        })

        this.nameElement.addEventListener('BubbleFill',function(ev){
            if (ev.task.multiSelectActive) { return; }
            console.log('Task Heard BubbleFill')
            // document.dispatchEvent(new Event('TaskChange'))
            // document.dispatchEvent(new Event('TaskChangePersist'))
        })

        this.multiFillStartClosure = function (ev) {
            ev.task = self
            self.multiFillStart(ev)
        }
        this.taskElement.addEventListener('multiFillStart',this.multiFillStartClosure)
        this.multiFillStopClosure = function (ev) {
            ev.task = self
            self.multiFillStop(ev)
        }

        return true
    }
    renderUpdate () {
        this.taskElement.setAttribute('id','task-'+this.taskNumber)

        let taskNumber = this.taskNumber
        if ( this.taskNumber < 9 ) {
            taskNumber = "0"+this.taskNumber
        }
        this.indexElement.innerHTML = taskNumber

        this.hourContainerElement.innerHTML = ''

        this.hourElements = []
        this.hours = []
        console.log('Task Render',this.day.data.tasks[this.taskNumber])
        for ( let h=0; h<this.day.data.numHours; h++ ) {
            let hourNumber = h
            let newHour = new EttHour(this.hourContainerElement, this, this.day, this.taskNumber, hourNumber)
            newHour.render()
            this.hours.push(newHour)
        }
        this.hourElements = this.taskElement.querySelectorAll('[role=bubble-hour]')
    }

    toPersist () {
        let order = parseInt(this.taskElement.getAttribute('id').replace(/[^0-9]/g,''))
        let name = this.taskElement.querySelector('.ett-task-name input').value
        let persist = {
          order: order,
          name: name,
          hours: {}
        }
        this.hours.forEach(ettHour => {
            let hour = ettHour.hourElement.getAttribute('data-hour')
            ettHour.bubbles.forEach(bubble => {
                    let range = parseInt(bubble.bubbleElement.getAttribute('role').replace(/[^0-9]/g,''))
                    let index = bubble.bubbleElement.getAttribute('data-hour-index')*range
                    let minutes = bubble.bubbleElement.getAttribute('data-time')
                    if ( !persist.hours.hasOwnProperty(hour) ) {
                        persist.hours[hour] = {}
                    }
                    persist.hours[hour][index] = minutes
            })
        })
        console.log('Task toPersist',persist)
        return persist
    }

    // manage start/stop indexes and fill/erase flag for multi-select
    multiFillStart (ev) {
        if ( ev.task.taskNumber != ev.bubble.taskNumber ) {
            return
        }
        // console.log({'tt':ev.task.taskNumber,'bt':ev.bubble.taskNumber,'bh':ev.bubble.hourNumber,'bb':ev.bubble.hourIndex})
        let bubbleIndex = parseInt(ev.bubble.taskIndex)
        ev.task.multiFillStartIndex = bubbleIndex
        ev.task.multiSelectActive = true
        const currentTime = parseInt(ev.bubble.bubbleElement.getAttribute('data-time'))
        if (currentTime > 0) {
            ev.task.multiSelectFill = false
            ev.bubble.cycleFill()
            document.body.style.cursor = 'not-allowed'
        } else {
            ev.task.multiSelectFill = true
            ev.bubble.cycleFill()
            document.body.style.cursor = 'copy'
        }
        document.addEventListener('mouseup',ev.task.multiFillStopClosure)
    }
    multiFillStop (ev) {
        if (!ev.task) {
            return
        }
        ev.task.multiSelectActive = false
        ev.task.multiFillStartIndex = null
        document.body.style.cursor = null
        document.removeEventListener('mouseup',ev.task.multiFillStopClosure)
        let evv = new Event('BubbleFill')
        evv.task = ev.task
        document.dispatchEvent(evv)
    }
}

class EttTaskHeader extends EttComponent {
    constructor (containerElement, day, className, title) {
        super(containerElement)
        this.day = day
        this.className = Array.isArray(className) ? className : [className]
        this.className = this.className.filter(n => { return n.length })
        this.title = title

        this.taskElement = null
        this.totalElement = null
        this.nameElement = null

        this.hoursContainerElement = null
        this.hourElements = []

        this.findTemplates()
    }
    findTemplates () {
        this.templates['task'] = null
        this.templates['hour'] = null
        let template = document.getElementById('ett-task-template')
        if ( template ) {
            this.templates['task'] = template.content.firstElementChild.cloneNode(true)
        }
        template = document.getElementById('bubble-hour-template')
        if ( template ) {
            this.templates['hour'] = template.content.firstElementChild.cloneNode(true)
        }
        return true
    }
    render () {
        this.taskElement = this.templates['task'].cloneNode(true)
        this.taskElement.classList.add(...this.className)
        this.containerElement.appendChild( this.taskElement )

        this.hourContainerElement = this.taskElement.querySelector('.ett-task-time')
        this.totalElement = this.taskElement.querySelector('.ett-task-total')
        this.nameElement = this.taskElement.querySelector('.ett-task-name > input')

        this.nameElement.setAttribute('readonly','readonly')

        this.renderUpdate()

        return true
    }
    renderUpdate () {
        this.nameElement.value = this.title

        this.hourContainerElement.innerHTML = ''

        this.hourElements = []

        for ( let h=0; h<this.day.data.numHours; h++ ) {
            let hourElement = this.templates['hour'].cloneNode(true)
            let hour = this.day.data.startHour+h;
            if ( hour > 12 ) {
                hour = hour - 12
                hour += "PM"
            } else if ( hour == 12 ) {
                hour += "PM"
            } else {
                hour += "AM"
            }
            hourElement.innerHTML = hour
            this.hourContainerElement.appendChild( hourElement )
        }
        this.hourElements = this.taskElement.querySelectorAll('[role=bubble-hour]')
    }
}

class EttHour extends EttComponent {
    constructor (containerElement, task, day, taskNumber, hourNumber) {
        super(containerElement)
        this.task = task
        this.day = day
        this.taskNumber = taskNumber
        this.hourNumber = hourNumber

        this.hourElement = null

        this.bubbleElements = []
        this.bubbles = []

        this.findTemplates()
    }
    findTemplates () {
        this.templates['hour'] = null
        let template = document.getElementById('bubble-hour-template')
        if ( template ) {
            this.templates['hour'] = template.content.firstElementChild.cloneNode(true)
        }
        return true
    }
    render () {
        this.hourElement = this.templates['hour'].cloneNode(true)
        this.containerElement.appendChild( this.hourElement )

        this.renderUpdate()

        return true
    }
    renderUpdate () {
        this.hourElement.innerHTML = ''
        let dataHour = this.day.data.startHour + this.hourNumber
        this.hourElement.setAttribute('data-hour', dataHour)

        this.bubbleElements = []
        this.bubbles = []

        console.log('Hour Render',this.taskNumber,this.hourNumber,this.day.data.tasks[this.taskNumber].hours[dataHour])
        for ( let b=0; b<4; b++ ) {
            let m = b*15
            let t = this.taskNumber
            let hourIndex = b
            let taskIndex = (this.hourNumber*4)+hourIndex
            let newBubble = new EttBubble15m(
                this.hourElement, this.task, this.day,
                this.taskNumber, this.hourNumber,
                hourIndex, taskIndex
            );
            newBubble.render()
            this.bubbles.push(newBubble)
        }
        this.bubbleElements = this.hourElement.querySelectorAll('[role=bubble-15m]')
    }
}

class EttBubble15m extends EttComponent {
    constructor (containerElement, task, day, taskNumber, hourNumber, hourIndex, taskIndex) {
        super(containerElement)
        this.task = task
        this.day = day
        this.taskNumber = taskNumber
        this.hourNumber = hourNumber
        this.hourIndex = hourIndex
        this.taskIndex = taskIndex

        this.bubbleElement = null

        this.findTemplates()
    }
    findTemplates () {
        this.templates['bubble'] = null
        let template = document.getElementById('bubble-15m-template')
        if ( template ) {
            this.templates['bubble'] = template.content.firstElementChild.cloneNode(true)
        }
        return true
    }
    render () {
        this.bubbleElement = this.templates['bubble'].cloneNode(true)
        this.bubbleElement.ett = this

        this.bubbleElement.setAttribute('data-task-number',this.taskNumber)
        this.bubbleElement.setAttribute('data-hour-number',this.hourNumber)
        this.bubbleElement.setAttribute('data-hour-index',this.hourIndex)
        this.bubbleElement.setAttribute('data-task-index',this.taskIndex)

        this.containerElement.appendChild( this.bubbleElement )

        this.renderUpdate()

        let self = this
        this.bubbleElement.addEventListener('mousedown', this.preMultiFillStart)
        this.bubbleElement.addEventListener('mouseenter', this.multiFill)

        return true
    }
    renderUpdate ( time ) {
        this.bubbleElement.setAttribute('data-hour-index',this.hourIndex)
        this.bubbleElement.setAttribute('data-task-index',this.taskIndex)

        let skipUpdate = true
        if ( time !== null ) {
            this.fill(time,skipUpdate)
        } else {
            let t = this.taskNumber
            let h = this.hourNumber
            let b = this.hourIndex
            if (t in this.day.data.tasks &&
                h in this.day.data.tasks[t].hours &&
                b in this.day.data.tasks[t].hours[h] &&
                this.day.data.tasks[t].hours[h][b] >= 0)
            {
                this.fill(this.day.data.tasks[t].hours[h][b],skipUpdate)
            } else {
                this.fill(0,skipUpdate)
            }
        }
    }

    fill (time, skipUpdate) {
        let intTime = parseInt(time) | 0
        let currentTime = parseInt(this.bubbleElement.getAttribute('data-time')) | 0

        if ( currentTime === intTime ) { return; }

        this.bubbleElement.setAttribute('data-time', intTime)

        let t = this.taskNumber
        let h = this.hourNumber
        let b = this.hourIndex
        if (t in this.day.data.tasks &&
            h in this.day.data.tasks[t].hours &&
            b in this.day.data.tasks[t].hours[h])
        {
            this.day.data.tasks[t].hours[h][b] = intTime
        }

        if (intTime > 0) {
          this.bubbleElement.classList.add('fill')
        } else {
          this.bubbleElement.classList.remove('fill')
        }
        if (!skipUpdate) {
            /// send update event
            let evv = new Event('BubbleFill')
            evv.bubble = this
            evv.task = this.task
            document.dispatchEvent(evv)
        }
    }
    erase () {
        this.fill(0)
    }

    /// multi-select drag logic

    cycleFill (ev) {
        let self = null
        if ( 'bubbleElement' in this ) {
            self = this
        } else if ( ev && 'target' in ev && 'ett' in ev.target ) {
            self = ev.target.ett
        } else {
            return
        }
        var currentTime = parseInt(self.bubbleElement.getAttribute('data-time'))
        if (currentTime > 0) {
          currentTime = 0
        } else {
          currentTime = 15
        }
        self.fill(currentTime)
        self.preMultiFillStop()
    }
    preMultiFillStart (ev) {
        let self = null
        if ( 'bubbleElement' in this ) {
            self = this
        } else if ( ev && 'target' in ev && 'ett' in ev.target ) {
            self = ev.target.ett
        } else {
            return
        }
        self.bubbleElement.addEventListener('mouseup', self.cycleFill)
        self.bubbleElement.addEventListener('mouseout', self.multiFillStart)
    }
    preMultiFillStop (ev) {
        let self = null
        if ( 'bubbleElement' in this ) {
            self = this
        } else if ( ev && 'target' in ev && 'ett' in ev.target ) {
            self = ev.target.ett
        } else {
            return
        }
        self.bubbleElement.removeEventListener('mouseup', self.cycleFill)
        self.bubbleElement.removeEventListener('mouseout', self.multiFillStart)
    }
    multiFillStart (ev) {
        let self = null
        if ( 'bubbleElement' in this ) {
            self = this
        } else if ( ev && 'target' in ev && 'ett' in ev.target ) {
            self = ev.target.ett
        } else {
            return
        }
        self.preMultiFillStop()
        let evv = new Event('multiFillStart')
        evv.bubble = self
        self.task.taskElement.dispatchEvent(evv)
    }
    multiFill (ev) {
        let self = null
        if ( 'bubbleElement' in this ) {
            self = this
        } else if ( ev && 'target' in ev && 'ett' in ev.target ) {
            self = ev.target.ett
        } else {
            return
        }
        /// check against our task to see if we are currently multi-selecting
        if (!('task' in self && 'multiSelectActive' in self.task && self.task.multiSelectActive)) {
            return
        }
        let bubbleIndex = parseInt(self.bubbleElement.getAttribute('data-task-index'))
        let multiFillStartIndex = parseInt(self.task.multiFillStartIndex)
        if (multiFillStartIndex == bubbleIndex) {
            if (self.task.multiSelectFill) {
                self.fill(15)
            } else {
                self.erase()
            }
        } else if (multiFillStartIndex !== null) {
            let startIndex = Math.min(bubbleIndex,self.task.multiFillStartIndex);
            let endIndex = Math.max(bubbleIndex,self.task.multiFillStartIndex);
            for (let i = startIndex; i <= endIndex; i++) {
                let betweenBubble = self.task.taskElement.querySelector('[data-task-index="' + i + '"]')
                if  ( betweenBubble ) {
                    if (self.task.multiSelectFill) {
                        betweenBubble.ett.fill(15)
                    } else {
                        betweenBubble.ett.erase()
                    }
                }
            }
        }
    }

}


class Storage {

    constructor() {
        this.storage = {}
    }

    get(key) {
        try {
            return this.storage[key]
        } catch (e) {
            return null
        }
    }

    set(key, value) {
        try {
            this.storage[key] = value;
        } catch (e) {
            return false
        }
        return true;
    }

    remove(key) {
        try {
            delete this.storage[key]
        } catch (e) {
            return false
        }
        return true
    }

    clear() {
        this.storage = {}
        return true
    }

}

class LocalStorage extends Storage {
    constructor() {
        super()
        this.storage = window.localStorage
    }
    get(key) {
        try {
            return JSON.parse(this.storage.getItem(key))
        } catch (e) {
            return null
        }
    }

    set(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value))
        } catch (e) {
            return false
        }
        return true
    }

    remove(key) {
        try {
            this.storage.removeItem(key)
        } catch (e) {
            return false
        }
        return true
    }

    clear() {
        try {
            this.storage.clear()
        } catch (e) {
            return false
        }
        return true
    }
}
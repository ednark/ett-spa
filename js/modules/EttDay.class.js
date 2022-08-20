
export { EttDay as default }
export { EttDay }

import { EttTask } from './EttTask.class.js';

class EttDay {
  constructor(date,storage) {
    let self = this

    this.defaultData = {
      date: date,
      startHour: 7,
      numHours: 12,
      numTasks: 7,
      numMajor: 3,
      tasks: {}
    }

    this.data = JSON.parse(JSON.stringify(this.defaultData))

    /// pull ETT container elements out of the DOM
    this.ettDate = document.getElementById('ett-date')
    this.ettTasks = document.getElementById('ett-tasks')

    this.taskTemplateContainer = document.getElementById('ett-task-template')
    this.hourTemplateContainer = document.getElementById('bubble-hour-template')
    this.bubbleTemplateContainer = document.getElementById('bubble-15m-template')

    this.taskTemplate = this.taskTemplateContainer.content.firstElementChild.cloneNode(true)
    this.hourTemplate = this.hourTemplateContainer.content.firstElementChild.cloneNode(true)
    this.bubbleTemplate = this.bubbleTemplateContainer.content.firstElementChild.cloneNode(true)

    // View
    this.render = () => {

      self.ettTasks.innerHTML = '';

      const header = self.taskTemplate.cloneNode(true)
      header.setAttribute('role','ett-header')
      const ettTotal = header.querySelector('.ett-task-total')
      const subHeader = self.taskTemplate.cloneNode(true)
      subHeader.setAttribute('role','ett-subheader')

      // add tasks
      for ( let t=0; t<self.data.numTasks; t++ ) {
          // new header
          if ( t == 0 ) {
              //  add top header - just a specially formatted task
              header.classList.add('task-header')
              // header title
              let headerInput = header.querySelector('.ett-task-name input')
              headerInput.value = 'THE MAJOR TASKS FOR TODAY'
              headerInput.setAttribute('readonly','readonly')
              // header hours
              let hoursContainer = header.querySelector('.ett-task-time')
              hoursContainer.innerHTML = ''
              for ( let h=0; h<self.data.numHours; h++ ) {
                  let newHour = self.hourTemplate.cloneNode(true)
                  let hour = self.data.startHour+h;
                  if ( hour > 12 ) {
                      hour = hour - 12
                      hour += "PM"
                  } else if ( hour == 12 ) {
                      hour += "PM"
                  } else {
                      hour += "AM"
                  // deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>, deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>, deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>
                  }
                  newHour.innerHTML = hour
                  hoursContainer.appendChild(newHour)
              }
              header.setAttribute('id','task-header')
              header.setAttribute('data-date',self.data.date)
              self.ettTasks.appendChild(header)

          // new sub-header
          } else if ( t == (self.data.numMajor) ) {
              //  add sub header - just a specially formatted task
              subHeader.classList.add('task-header')
              // header title
              let headerInput = subHeader.querySelector('.ett-task-name input')
              headerInput.value = 'STUFF THAT "JUST HAPPENED"'
              headerInput.setAttribute('readonly','readonly')
              // header hours
              let hoursContainer = subHeader.querySelector('.ett-task-time')
              hoursContainer.innerHTML = ''
              for ( let h=0; h<self.data.numHours; h++ ) {
                  let newHour = self.hourTemplate.cloneNode(true)
                  let hour = self.data.startHour+h;
                  if ( hour > 12 ) {
                      hour = hour - 12
                      hour += "PM"
                  } else if ( hour == 12 ) {
                      hour += "PM"
                  } else {
                      hour += "AM"
                  // deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>, deepcode ignore DuplicateIfBody: <please specify a reason of ignoring this>
                  }
                  newHour.innerHTML = hour
                  hoursContainer.appendChild(newHour)
              }
              subHeader.setAttribute('id','task-subheader')
              subHeader.setAttribute('data-date',self.data.date)
              self.ettTasks.appendChild(subHeader)
          }
          // new emergent task
          let newTask = self.taskTemplate.cloneNode(true)
          let hourContainer = newTask.querySelector('.ett-task-time')
          if ( t in self.data.tasks && self.data.tasks[t].name ) {
              let taskName = newTask.querySelector('.ett-task-name input')
              if ( taskName ) {
                  taskName.value = self.data.tasks[t].name
              }
          }
          hourContainer.innerHTML = ''
          for ( let hh=0; hh<self.data.numHours; hh++ ) {
              let newHour = self.hourTemplate.cloneNode(true)
              let h = self.data.startHour+hh;
              let hourId = 'task-'+t+'-hour-'+h
              newHour.setAttribute('id',hourId)
              newHour.setAttribute('data-hour',h)
              newHour.innerHTML = '';
              for ( let b=0; b<4; b++ ) {
                  let m = b*15;
                  let newBubble = self.bubbleTemplate.cloneNode(true)
                  newBubble.setAttribute('id',hourId+'-minute-'+m)
                  newBubble.setAttribute('data-hour-index',b)
                  newBubble.setAttribute('data-task-index',(4*hh)+b)
                  if ( t in self.data.tasks &&
                      h in self.data.tasks[t].hours &&
                      m in self.data.tasks[t].hours[h] &&
                      self.data.tasks[t].hours[h][m] >= 0 )
                  {
                      newBubble.setAttribute('data-time',self.data.tasks[t].hours[h][m])
                  }
                  newHour.appendChild(newBubble)
              }
              hourContainer.appendChild(newHour)
          }
          newTask.setAttribute('id','task-'+t)
          let indexElement = newTask.querySelector('.ett-task-index')
          if ( t < 10 ) {
              indexElement.innerHTML = '0'+t
          } else {
              indexElement.innerHTML = t
          }
          newTask.setAttribute('data-date',self.data.date);
          if ( t < self.data.numMajor ) {
              newTask.classList.add('ett-major-task')
          }
          self.ettTasks.appendChild(newTask);
      }

      const sumTime = ev => {
          let total = 0;
          let currTasks = self.ettTasks.querySelectorAll('[role=ett-task]')
          currTasks.forEach(ettTask => {
              total += parseInt(ettTask.getAttribute('data-time'))
          });
          let hours = (total/60)
          ettTotal.innerHTML = hours.toFixed(2)+' H';
      };

      let currTasks = self.ettTasks.querySelectorAll('[role=ett-task]')
      currTasks.forEach( (ettTaskElement, t) => {
          let ettTask = new EttTask(ettTaskElement,sumTime)
      });

    }

    /// Read
    this.renderChangeDate = ev => {
        /// changed value already lives in the ettDate input
        let ettDayData = storage.get(self.ettDate.value)
        if ( ettDayData && 'date' in ettDayData ) {
            self.data = ettDayData
        } else {
            self.data = JSON.parse(JSON.stringify(this.defaultData))
        }
        self.data.date = self.ettDate.value
        self.render()
    }
    this.ettDate.addEventListener('changeDate', this.renderChangeDate )

    /// Create/Update/Delete
    this.toPersist = () => {
        let persist = JSON.parse(JSON.stringify(self.data))
        persist.tasks = {}
        let currTasks = self.ettTasks.querySelectorAll('[role=ett-task]')
        currTasks.forEach( (ettTaskElement, t) => {
            persist.tasks[t] = ettTaskElement.ett.toPersist()
        });
        persist.date = persist.date || new Date().toLocaleDateString('en-CA')
        return persist
    }
    this.save = ev => {
        let persist = self.toPersist()
        if ( persist ) {
            self.data = persist
        }
        let date = self.data.date || new Date().toLocaleDateString('en-CA')
        storage.set(date,self.data)
    }
    document.addEventListener('persist', this.save )

    /// SETUP CAL PICKER
    const calPopup = document.querySelector('#ett-date');
    const datepicker = new Datepicker(calPopup, {
        format: 'yyyy-mm-dd'
    });
    calPopup.addEventListener('focus', ev => {
        let dp = ev.target.parentNode.querySelector('.datepicker')
        dp.style.marginLeft = '-128px';
        dp.style.left = '50%';
    })

    return this
  }
}


export { EttTask as default }
export { EttTask }

import { BubbleHour } from './BubbleHour.class.js';

class EttTask {
  constructor(taskElement, onUpdate) {
    let self = this

    /* data */
    const bubbleHourElements = taskElement.querySelectorAll('[role=bubble-hour]')
    const taskTotal = taskElement.querySelector('.ett-task-total')
    const taskName = taskElement.querySelector('.ett-task-name > input')

    // var lineStart = {x:0,y:0}
    var multiSelectFill = false

    this.element = taskElement
    this.bubbleHours = []
    this.bubbles = []
    this.bubbleStartIndex = null

    /* actions */
    const sumTime = ev => {
      let total = 0
      bubbleHourElements.forEach(bubbleHour => {
        total += parseInt(bubbleHour.getAttribute('data-time'))
      })
      taskElement.setAttribute('data-time', total)
      let hours = (total / 60)
      taskTotal.innerHTML = hours.toFixed(2) + ' H'
      onUpdate()
    }

    this.toPersist = () => {
      let order = parseInt(self.element.getAttribute('id').replace(/[^0-9]/g,''))
      let name = self.element.querySelector('.ett-task-name input').value
      let persist = {
        order: order,
        name: name,
        hours: {}
      }
      self.bubbleHours.forEach(bubbleHour => {
        let hour = bubbleHour.element.getAttribute('data-hour')
        bubbleHour.bubbles.forEach(bubble => {
          let range = parseInt(bubble.element.getAttribute('role').replace(/[^0-9]/g,''))
          let index = bubble.element.getAttribute('data-hour-index')*range
          let minutes = bubble.element.getAttribute('data-time')
          if ( !persist.hours.hasOwnProperty(hour) ) {
              persist.hours[hour] = {}
          }
          persist.hours[hour][index] = minutes
        })
      })
      return persist
    }

    /* init */
    bubbleHourElements.forEach(bubbleHourElement => {
      let bubbleHour = new BubbleHour(bubbleHourElement, sumTime, self)
      self.bubbleHours.push(bubbleHour)
    })

    taskName.addEventListener('change', () => {
      document.dispatchEvent(new Event('persist'))
    })

    taskElement.ett = this

    sumTime()

    return this
  }
}

export { BubbleHour as default }
export { BubbleHour }

import { Bubble } from './Bubble.class.js'

class BubbleHour {
  constructor(hourElement, onUpdate, task) {
    let self = this

    /* data */
    this.element = hourElement
    this.bubbleElements = hourElement.querySelectorAll('[role=bubble-15m]')
    this.bubbles = []

    /* actions */
    const sumTime = ev => {
      let total = 0
      // let bubbles = ev.currentTarget.querySelectorAll('> [role=bubble-15m]')
      self.bubbleElements.forEach(bubbleElement => {
        total += parseInt(bubbleElement.getAttribute('data-time'))
      })
      hourElement.setAttribute('data-time', total)
      onUpdate()
    }

    /* init */
    this.bubbleElements.forEach(bubbleElement => {
      let bubble = new Bubble(bubbleElement, sumTime, task, self)
      self.bubbles.push(bubble)
      task.bubbles.push(bubble)
    })

    hourElement.ett = this

    sumTime()

    return this
  }
}


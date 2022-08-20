export { Bubble3 as default }
export { Bubble3 }

class Bubble3 {
  constructor(bubbleElement, onUpdate, task) {
    let self = this

    /* data */
    this.element = bubbleElement

    this.bubbles5m = bubbleElement.querySelectorAll('.bubble-5m')

    /* actions */
    const fillBubble = (time) => {
      bubbles5m.forEach(bubble => {
        time = parseInt(time)
        let minTrigger = parseInt(bubble.getAttribute('data-value')) - 4
        if (time > 0 && time >= minTrigger) {
          bubble.classList.add('fill')
        } else {
          bubble.classList.remove('fill')
        }
      })
    }

    const sumTime = ev => {
      const currentTime = bubbleElement.getAttribute('data-time')
      fillBubble(currentTime)
    }

    const cycleTime = ev => {
      let currentTime = parseInt(bubbleElement.getAttribute('data-time'))
      if (currentTime >= 15) {
        currentTime = 0
      } else {
        currentTime += 5
      }
      bubbleElement.setAttribute('data-time', currentTime)
      fillBubble(currentTime)
      onUpdate()
    }

    /* init */
    bubbleElement.addEventListener('click', cycleTime)
    bubbleElement.classList.add('bubble3')

    bubbleElement.ett = this
    
    sumTime()

    return this
  }
}

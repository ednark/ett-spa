export { Bubble as default }
export { Bubble }

class Bubble {
  constructor(bubbleElement, onUpdate, task, hour) {
    let self = this

    /* data */
    this.element = bubbleElement

    /* actions */
    this.fillBubble = (time) => {
      bubbleElement.setAttribute('data-time', parseInt(time))
      if (parseInt(time) > 0) {
        bubbleElement.classList.add('fill')
      } else {
        bubbleElement.classList.remove('fill')
      }
      onUpdate()
    }

    const sumTime = ev => {
      const currentTime = bubbleElement.getAttribute('data-time')
      self.fillBubble(currentTime)
    }

    const cycleTime = ev => {
      var currentTime = parseInt(bubbleElement.getAttribute('data-time'))
      if (currentTime > 0) {
        currentTime = 0
      } else {
        currentTime = 15
      }
      self.fillBubble(currentTime)
      // document.dispatchEvent(new Event('persist'))
    }

    /* init */
    const preMultiFill = ev => {
      bubbleElement.addEventListener('mouseup', cycleTime)
      bubbleElement.addEventListener('mouseout', multiSelectActivate)
      document.addEventListener('mouseup', multiSelectCancel)
      task.bubbleStartIndex = parseInt(bubbleElement.getAttribute('data-task-index'))
    }
    const multiSelectActivate = ev => {
      bubbleElement.removeEventListener('mouseup', cycleTime)
      bubbleElement.removeEventListener('mouseout', multiSelectActivate)
      task.multiSelectActive = true
      const currentTime = parseInt(bubbleElement.getAttribute('data-time'))
      if (currentTime > 0) {
        task.multiSelectFill = false
        self.fillBubble(0)
        document.body.style.cursor = 'not-allowed'
      } else {
        task.multiSelectFill = true
        self.fillBubble(15)
        document.body.style.cursor = 'copy'
      }
    }
    const multiSelectCancel = ev => {
      task.multiSelectActive = false
      bubbleElement.removeEventListener('mouseout', multiSelectActivate)
      document.removeEventListener('mouseup', multiSelectCancel)
      task.bubbleStartIndex = null
      document.body.style.cursor = 'default'
      document.dispatchEvent(new Event('persist'))
    }
    const multiFill = ev => {
      if (task.multiSelectActive) {
        if (task.multiSelectFill) {
          self.fillBubble(15)
        } else {
          self.fillBubble(0)
        }
        let bubbleIndex = parseInt(bubbleElement.getAttribute('data-task-index'))
        let bubbleStartIndex = parseInt(task.bubbleStartIndex)
        if (bubbleStartIndex !== null && bubbleStartIndex !== bubbleIndex) {
          let startIndex = Math.min(bubbleIndex,task.bubbleStartIndex);
          let endIndex = Math.max(bubbleIndex,task.bubbleStartIndex);
          for (let i = startIndex; i <= endIndex; i++) {
            let betweenBubble = task.element.querySelector('[data-task-index="' + i + '"]')
            if  ( betweenBubble ) {
              if (task.multiSelectFill) {
                betweenBubble.ett.fillBubble(15)
              } else {
                betweenBubble.ett.fillBubble(0)
              }
            }
          }
        }
      }
    }

    bubbleElement.addEventListener('mousedown', preMultiFill)
    bubbleElement.addEventListener('mouseenter', multiFill)

    bubbleElement.ett = this

    sumTime()

    return this
  }
}

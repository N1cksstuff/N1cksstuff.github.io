// Shortcuts to skip waiting for the flow
const Simulations = {
    localStorageError() {
      return false // Make this true to see the error screens
    },
  
    // This one is a sub-scenario of the one above
    deadEndError() {
      return Simulations.localStorageError() && true
    },
  
    // Maybe false, maybe a view
    workingOnView() {
      return false && Views.something()
    }
  }
  
  // Used in flow decision points
  const Constants = {
    DELETE: 'delete a progress',
    SOMETHING: 'Go to the Store',
    LOCALSTORAGE_ERROR:
      `<p>Cannot access localStorage. Please make sure you have the localStorage / 3rd party cookies enabled and try again.</p>
      <p>If the error persists, please feel free to <a target="_blank" href="mailto:Nickdoesstuff@proton.me">report it.</a></p>`,
    DEAD_END_ERROR:
      `Not a lucky day. Please refresh the page and try again.`
  }
  
  // Helpers
  const Utils = {
    sleep: async (durationMilliseconds) => {
      return new Promise(resolve => {
        return setTimeout(resolve, durationMilliseconds)
      })
    },
  
    branchOff: (srcFlow, subFlows) => async () => {
      const { key } = await srcFlow()
      return subFlows[key]()
    },
  
    toCSSText: (style) => {
      return Object.keys(style).reduce((acc, key) => {
        return `;
          ${acc};
          ${key}: ${style[key]};
        `
      }, ``)
    },
  
    pushStyle: (selector, styles) => {
      const el = document.querySelector(selector)
      const computedStyle = window.getComputedStyle(el)
      const originalStyle = Object.keys(styles).reduce((acc, key) => {
        return {
          ...acc,
          [key]: computedStyle[key]
        }
      }, {})
      const originalCSSText = Utils.toCSSText(originalStyle)
      el.style.cssText += Utils.toCSSText(styles)
      return originalCSSText
    }
  }
  
  // Side-effects
  const Actions = {
    async loadUserProgress() {
      await Utils.sleep(2000)
  
      if (Simulations.localStorageError()) {
        return Promise.resolve(Constants.LOCALSTORAGE_ERROR)
      }
  
      try {
        return window.localStorage.getItem('userProgress')
      } catch (e) {
        return Promise.resolve(Constants.LOCALSTORAGE_ERROR)
      }
    },
  
    async saveUserProgress() {
      await Utils.sleep(2000)
      try {
        return window.localStorage.setItem(
          'userProgress',
          JSON.stringify({some: 'data'})
        )
      } catch (e) {
        return Promise.resolve(Constants.LOCALSTORAGE_ERROR)
      }
    },
  
    async deleteUserProgress() {
      await Utils.sleep(2000)
      try {
        window.localStorage.removeItem('userProgress')
      } catch (e) {
        return Promise.resolve(Constants.LOCALSTORAGE_ERROR)
      }
      return Promise.resolve()
    },
  
    reloadPage() {
      try {
        if (Simulations.deadEndError()) {
          return Promise.resolve(Constants.DEAD_END_ERROR)
        }
        window.location.href = window.location.href
      } catch (e) {
        return Promise.resolve(Constants.DEAD_END_ERROR)
      }
    }
  }
  
  // All the ways the app can be in,
  // named and organized freely, using Promises
  const Flows = {
    master: async () => {
      if (Simulations.workingOnView()) {
        return Simulations.workingOnView()
      }
  
      const [ , progress ] = await Promise.all([
        Views.loading(),
        Actions.loadUserProgress()
      ])
      if (!progress) {
        return Flows.firstTime()
      }
      if (progress === Constants.LOCALSTORAGE_ERROR) {
        return Flows.abort(progress)
      }
      return Flows.continuation()
    },
  
    firstTime: async () => {
      if (Simulations.workingOnView()) {
        return Simulations.workingOnView()
      }
  
      await Views.intro1()
      await Views.intro2()
      await Views.intro3()
   //  await Views.intro4()
  
      await Promise.all([
        Views.saving(),
        Actions.saveUserProgress()
      ])
  
      return Flows.continuation()
    },
  
    // Switch flows based on which button in Views.main is clicked.
    continuation: Utils.branchOff(
      () => Views.main(),
      {
        async [Constants.SOMETHING]() {
          await Views.something()
          return Flows.continuation()
        },
  
        async [Constants.DELETE]() {
          await Promise.all([
            Views.deleting(),
            Actions.deleteUserProgress()
          ])
          return Flows.master()
        }
      }
    ),
  
    abort: async (progress) => {
      await Views.error(progress)
      const reloadError = await Actions.reloadPage()
      if (reloadError === Constants.DEAD_END_ERROR) {
        return Flows.deadEnd(reloadError)
      }
    },
  
    deadEnd: async (reason) => {
      await Views.deadEnd(reason)
    }
  }
  
  // Some low-level components that serve as a screen's layout
  const Layouts = {
    init(el) {
      this.el = el
    },
  
    async message({ content, enter, transitionDuration = 500 }) {
      const template = () => {
        return `
          <div class="layout message-layout">
            ${content}
          </form>
        `
      }
  
      const cssVariables = () => `;
        --transition-duration: ${transitionDuration};
      `
  
      if (typeof enter === 'function') {
        enter()
      }
      this.el.innerHTML = template()
      this.el.style.cssText += cssVariables()
      return new Promise()
    },
  
    async messageWithButtons({ content, btn, enter, exit, transitionDuration = 500 }) {
      const getBtn = (maybeMultipleBtns) => {
        if (Array.isArray(maybeMultipleBtns)) {
          return maybeMultipleBtns
        }
        return [maybeMultipleBtns]
      }
  
      const template = () => {
        return `
          <form id="complete-step-form" class="layout message-layout">
            ${content}
            <footer>
              ${getBtn(btn).map(eachBtn => `
                <button
                  autofocus
                  class="btn ${eachBtn.type || ''}"
                  data-key="${eachBtn.key || Constants.FORWARD}"
                >
                  ${eachBtn.text}
                </button>
              `).join('')}
            </footer>
          </form>
        `
      }
  
      const cssVariables = () => `;
        --transition-duration: ${transitionDuration};
      `
  
      const listenToFormSubmit = (onSubmit) => {
        const form = this.el.querySelector('#complete-step-form')
        form.addEventListener('submit', async e => {
          e.preventDefault()
          form.classList.add('exiting')
          if (typeof exit === 'function') {
            await exit(restoredValues)
          }
          setTimeout(() => {
            onSubmit({
              key: e.submitter.dataset.key
            })
          }, transitionDuration)
        })
      }
  
      let restoredValues
      if (typeof enter === 'function') {
        restoredValues = enter()
      }
      this.el.innerHTML = template()
      this.el.style.cssText += cssVariables()
      return new Promise(listenToFormSubmit)
    },
  
    async statusFeedback({ text, type, animationDuration = 1500 }) {
      const template = () => {
        const typeClassName = type || ''
        return `
          <div class="layout status-feedback-layout">
            <span class="animation-object ${type}"></span>
            <span class="status-text ${type}">${text}</span>
          </div>
        `
      }
  
      const cssVariables = () => `;
        --animation-duration: ${animationDuration}ms;
        --type: ${type};
      `
  
      const listenToAnimationEnd = (onEnd) => {
        setTimeout(onEnd, animationDuration)
      }   
  
      this.el.innerHTML = template()
      this.el.style.cssText += cssVariables()
      await new Promise(listenToAnimationEnd)
    },
  }
  
  // Things to render on the screen
  const Views = {
    async loading() {
      return Layouts.statusFeedback({
        text: 'loading',
        type: 'loading'
      })
    },
  
    async saving() {
      return Layouts.statusFeedback({
        text: 'saving',
        type: 'saving'
      })
    },
  
    async deleting() {
      return Layouts.statusFeedback({
        text: 'deleting',
        type: 'deleting'
      })
    },
  
    async intro1() {
      return Layouts.messageWithButtons({
        content: `
          <h1>Heya,</h1>
          <p>We are <://>, we code the website of your dreams for you.</p>
            <p>And the best thing? It's impressively cheap!</p> <br>
          <p>You seem to be here for the first time. Let me show you. </p>
        `,
        btn: {
          text: "Let's start!"
        }
      })
    },
  
    async intro2() {
      return Layouts.messageWithButtons({
        content: `
          <h1>What we believe in</h1>
          <p>Our goal is to make websites accessible for everyone, even those on a budget.</p>
          <p>Small content creators most of the time do not have the <em>money</em> to afford a fancy website, but it can help you grow, and just is a cool thing to have.</p>
        `,
        btn: {
          text: 'And you will help?'
        }, {
          text: 'See our full believes',
          type: 'absurd',
          key: Constants.MISSION
        }]
      })
    },
  
    async intro3() {
      return Layouts.messageWithButtons({
        content: `
          <h1>Yes!</h1>
          <p>We have multiple plans ranking from just <em>30$</em> to more expensive ones.</p>
          <p>If you want to spend a little bit more, we are also open to custom requests if you cannot find a plan that suits your needs!.</p>
        `,
        btn: {
          text: 'Sounds cool?',
        }
      })
    },
  
  //  async intro4() {
  //    return Layouts.messageWithButtons({
  //      content: `
   //       <h1>Cool!</h1>
   //       <p>After this view, your progress will be saved.</p>
   //       <p>You'll switch to a <em>continuation flow</em>, from this <em>intro</em>.</p>
   //     `,
   //     btn: {
   //       text: "Save it"
   //     }
   //   })
  //  },
  
    async main() {
      return Layouts.messageWithButtons({
        content: `
          <h1>Great!</h1>
          <p>Now, what are you waiting for?</p>
          <p>Get your website, pay less!</p>
        `,
        btn: [{
          text: 'Delete cookies',
          type: 'danger',
          key: Constants.DELETE
        }, {
          text: 'Go to our store',
          type: 'absurd',
          key: Constants.SOMETHING
        }]
      })
    },
  
    async something() {
      return Layouts.messageWithButtons({
        get content() {
            window.location.replace("https://www.fiverr.com/nick_owo/create-a-website-that-suits-your-needs?gig_id=304291991&utm_campaign=base_gig_create_share&utm_content=&utm_medium=shared&utm_source=get_url&utm_term=&view=gig");
        }
      })
    },
  
         async mission() {
      return Layouts.messageWithButtons({
        get content() {
            window.location.replace("https://n1cksstuff.github.io/mission.html");
        }
      })
    },
    
    async error(message) {
      return Layouts.messageWithButtons({
        enter() {
          return Utils.pushStyle('body', {
            background: 'linear-gradient(to bottom, violet, lightblue)',
            color: 'black',
            transition: 'all 0.5s'
          })
        },
        async exit(originalCSSText) {
          document.body.style.cssText += originalCSSText
          await Utils.sleep(500)
          return Promise.resolve()
        },
        content: `
          <h1>Error</h1>
          <p>${message}</p>
        `,
        btn: {
          text: 'Refresh page',
          type: 'absurd'
        }
      })
    },
  
    async deadEnd(reason) {
      return Layouts.message({
        enter() {
          return Utils.pushStyle('body', {
            background: `
              linear-gradient(135deg, white -60%, transparent 30%),
              linear-gradient(135deg, #fd3 50%, black 300%)
            `,
            color: 'black',
            transition: 'all 0.5s'
          })
        },
        content: `
          <h1>Dead end.</h1>
          <p>${reason}</p>
        `
      })
    }
  }
  
  // Layouts should recognize the container
  Layouts.init(document.getElementById('app'))
  
  // Init one of the flows
  Flows.master()

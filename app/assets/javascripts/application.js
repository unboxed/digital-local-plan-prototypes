//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here

  // Side navigation: mobile collapse/expand toggle
  document.querySelectorAll('[data-app-side-navigation-toggle]').forEach((button) => {
    const list = button.closest('.app-side-navigation__section').querySelector('.app-side-navigation__list')
    button.setAttribute('aria-expanded', 'true')
    button.addEventListener('click', () => {
      const isOpen = list.classList.toggle('app-side-navigation__list--open')
      button.setAttribute('aria-expanded', String(isOpen))
    })
  })
})

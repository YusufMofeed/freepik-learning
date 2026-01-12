// const { start } = require('live-server');

class Observers {
  animatedText = document.querySelectorAll('.animated-letter');

  constructor() {
    // const letters = document.querySelectorAll(".animated-text span");
    this.animatedText.forEach((letter, index) => {
      letter.style.animationDelay = `${index * 0.03}s`;
    });

    // ---------------------------------------------- //

    this._CreatObserver('.animated-letter', 'animated-letter-after', {
      thrshold: 0.5,
    });
    this._CreatObserver('.hidden--2', 'reveal--2', { thrshold: 1 });
    this._CreatObserver('.section--aimodels', 'reveal--2', { thrshold: 1 });
  }

  // FUNCTION: Observer
  _CreatObserver(selector, revealClass, options = { thrshold: 0.1 }) {
    const elements = document.querySelectorAll(selector);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(revealClass);
        }
      });
    }, options);
    elements.forEach(el => {
      observer.observe(el);
    });
  }
}

///////////////////////////////////
// PERFECT👌. ⬇️

// CLASS
class GalleryVideoReveal {
  // boxBtns = new Map(
  //   [...document.querySelectorAll('[data-gallery-img-btn-id]')].map(btn => [
  //     btn.dataset.galleryImgBtnId,
  //     btn,
  //   ])
  // );
  // boxInfoBtns = new Map(
  //   [...document.querySelectorAll('[data-gallery-img-info-btn-id]')].map(
  //     btn => [btn.dataset.galleryImgInfoBtnId, btn]
  //   )
  // );
  /////////////////////////////////////////////////////
  /**
   *
   * @param {HTMLElement} currentVisibleGalleryEl
   */
  constructor(currentVisibleGalleryEl) {
    if (!currentVisibleGalleryEl) {
      throw new Error('GalleryVideoReveal: currentVisibleGalleryEl missing');
    }
    this.containerGallery = currentVisibleGalleryEl;

    ({
      tabId: this.tabId,
      vidsSelector: this.vidsSelector,
      itemWithVideoSelector: this.hasVideo,
      vidDisplayBlock: this.revealVideo,
    } = this.containerGallery.dataset);
    //
    this.videosMap = new Map(
      [...this.containerGallery.querySelectorAll(this.vidsSelector)].map(el => [
        el.dataset.videoId,
        el,
      ])
    );
    this._validateConfig();

    // binding
    this._playVideo = this._playVideo.bind(this);
    this._pauseResetVideo = this._pauseResetVideo.bind(this);

    // Start
    this.init();
  }

  /*
  Now your component:
	•	Validates HTML
	•	Validates JS config
	•	Fails early
	•	Fails loudly

🔥 This is real-world robustness.
*/
  _validateConfig() {
    const errors = [];

    if (!this.tabId) errors.push('tabId');

    if (!this.vidsSelector) {
      errors.push('vidsSelector');
    } else if (!this.containerGallery.querySelector(this.vidsSelector)) {
      errors.push(`vidsSelector (no elements found)`);
    }

    if (!this.hasVideo) {
      errors.push('itemWithVideoSelector');
    } else if (!this.containerGallery.querySelector(this.hasVideo)) {
      errors.push(`itemWithVideoSelector (no elements found)`);
    }

    if (!this.revealVideo) errors.push('vidDisplayBlock');

    if (errors.length) {
      throw new Error(
        `GalleryVideoReveal: invalid configuration → ${errors.join(', ')}`
      );
    }
  }
  // API
  init() {
    // Prefer pointerenter / pointerleave (modern)
    // 	•	don’t bubble unexpectedly
    // •	work better for touch + mouse
    // i used 'pointermove' so i can stop/play the video when hovering the buttons inside the box
    // 'pointermove' firing every frame. 😭
    // 'pointerover' 'pointerout'
    this.containerGallery.addEventListener(
      'pointerover',
      this._playVideo,
      true // capture phase
    );

    this.containerGallery.addEventListener(
      'pointerout',
      this._pauseResetVideo,
      true
    );
  }

  destroy() {
    this.containerGallery.removeEventListener(
      'pointerover',
      this._playVideo,
      true // capture phase
    );

    this.containerGallery.removeEventListener(
      'pointerout',
      this._pauseResetVideo,
      true
    );
  }
  ///////////////////////// HELPERS //////////////////////
  _playVideo(e) {
    if (e.target.closest('[data-stop-vid-when-hovered]')) return;
    const targetedVideo = this._targetedVideo(e);
    if (!targetedVideo) return;

    targetedVideo.classList.add(this.revealVideo);

    // AbortError
    // Handle the promise
    if (targetedVideo.paused) targetedVideo.play();
  }

  _pauseResetVideo(e) {
    const targetedVideo = this._targetedVideo(e);
    if (!targetedVideo) return;
    targetedVideo.classList.remove(this.revealVideo);
    targetedVideo.currentTime = 0;
    if (!targetedVideo.paused) targetedVideo.pause();
  }

  _targetedVideo(e) {
    const targetedBox = e.target.closest(`${this.hasVideo}`);
    if (!targetedBox) return;
    return this.videosMap.get(targetedBox.dataset.galleryBoxId);
  }
}

// CLASS
class DropDownModals {
  /**
   * jsDOC
   * @param {String} navContainerSelector
   * @param {String} modalsSelector
   * @param {String} modalsLinksSelector
   * @param {String} hiddenModalClass
   */
  constructor(
    navContainerSelector,
    modalsSelector,
    modalsLinksSelector,
    hiddenModalClass
  ) {
    this.modalBtn = modalsLinksSelector;
    this.hiddenModalClass = hiddenModalClass;
    this.linksContainer = document.querySelector(navContainerSelector);
    this.modalsMap = new Map(
      [...document.querySelectorAll(modalsSelector)].map(el => [
        el.dataset.modalId,
        el,
      ])
    );
    // this.modals = [...document.querySelectorAll(modalsSelector)].map(el => ({
    //   id: el.dataset.modalId,
    //   el,
    // }));

    // bind once
    this._showModal = this._showModal.bind(this);
    this._hideModal = this._hideModal.bind(this);

    this._activateEventListeners();
  }
  _activateEventListeners() {
    if (!this.linksContainer || !this.modalsMap) return;
    this.linksContainer.addEventListener('mouseover', this._showModal);
    this.linksContainer.addEventListener('mouseout', this._hideModal);
  }
  _showModal(e) {
    const link = e.target.closest(this.modalBtn);
    if (!link) return;
    // const linkedModal = this.modals.find(
    //   modal => modal.id === link.dataset.linkId
    // );
    const linkedModal = this.modalsMap.get(link.dataset.linkId);
    linkedModal.classList.remove(this.hiddenModalClass);
  }

  _hideModal(e) {
    const modalLink = e.target.closest(this.modalBtn);
    if (!modalLink || modalLink.contains(e.relatedTarget)) return;
    // const targetModal = this.modals.find(
    //   modal => modal.id === modalLink.dataset.linkId
    // );

    const targetModal = this.modalsMap.get(modalLink.dataset.linkId);

    if (!targetModal.matches(':hover'))
      targetModal.classList.add(this.hiddenModalClass);

    targetModal.addEventListener(
      'mouseleave',
      () => targetModal.classList.add(this.hiddenModalClass),
      {
        // with this, we prevent this listener from running every time mouseout fires
        //  register it once
        once: true,
      }
    );
  }
}

// CLASS
class SearchBarAnimation {
  textIndex = 0;
  charIndex = 0;
  deleting = false;
  /**
   *
   * @param {String} searchInputID
   * @param {Array<String>} texts
   */
  constructor(searchInputID, texts) {
    this.searchInput = document.getElementById(searchInputID);
    this.texts = texts;

    // binding
    this._animateSerchPlaceholder = this._animateSerchPlaceholder.bind(this);
    // Start
    this._animateSerchPlaceholder();
  }

  _animateSerchPlaceholder() {
    const current = this.texts[this.textIndex];
    // Revealing letters
    if (!this.deleting) {
      this.searchInput.placeholder = current.slice(0, this.charIndex++) + '|';
      if (this.charIndex === current.length) {
        setTimeout(() => (this.deleting = true), 1000);
      }
    }
    if (this.deleting) {
      this.searchInput.placeholder = current.slice(0, this.charIndex--);
      if (this.charIndex === 0) {
        this.deleting = false;
        this.textIndex = (this.textIndex + 1) % this.texts.length; // WOW 🤯
      }
    }

    setTimeout(this._animateSerchPlaceholder, this.deleting ? 20 : 40);
  }
}

// CLASS
class GrowOnScrollVideoWithSurroundingImages {
  //// Settings
  heroConfig = {
    scrollRange: [0, 400],
    video: {
      start: 0.025,
      end: 0.8,
      easing: this._easeOut,
    },
    images: {
      start: 0.0,
      end: 0.82,
    },
  };
  //
  START = this.heroConfig.scrollRange[0];
  END = this.heroConfig.scrollRange[1];
  //
  vStart = this.heroConfig.video.start;
  vEnd = this.heroConfig.video.end;
  iStart = this.heroConfig.images.start;
  iEnd = this.heroConfig.images.end;
  //
  ticking = false;
  scrollY = 0;
  progress = 0;
  //
  target = document.querySelector('[data-scroll-event]');
  isActive = false;
  /**
   *
   * @param {String} heroVIdeoSelector
   * @param {String} heroImagesSelector
   */
  constructor(heroVideoSelector, heroImagesSelector) {
    const videoEl = document.querySelector(heroVideoSelector);
    this.video = {
      el: videoEl,
      fromWidth: Number(videoEl.dataset.originalWidth),
      toWidth: Number(videoEl.dataset.maxWidth),
    };

    this.heroImages = [...document.querySelectorAll(heroImagesSelector)].map(
      img => ({
        el: img,
        fromX: Number(img.dataset.originalX),
        toX: Number(img.dataset.maxX),
        fromY: Number(img.dataset.originalY),
        toY: Number(img.dataset.maxY),
        fromOpacity: 1.0,
        toOpacity: 0.6,
        // direction: img.dataset.position === 'left' ? -1 : 1,
      })
    );

    // binding
    this._rAF = this._rAF.bind(this);
    this._animate = this._animate.bind(this);

    // // activate event listener
    // this.observer = new IntersectionObserver(
    //   entries => {
    //     entries.forEach(entry => {
    //       if (entry.isIntersecting && !this.isActive) {
    //         window.addEventListener('scroll', this._rAF);
    //         this.isActive = true;
    //       }
    //       if (!entry.isIntersecting && this.isActive) {
    //         window.removeEventListener('scroll', this._rAF);
    //         this.isActive = false;
    //       }
    //     });
    //   },
    //   { root: null, threshold: 0.1 }
    // );
    // this.observer.observe(this.target);
  }
  init() {
    window.addEventListener('scroll', this._rAF);
  }
  // Cleanup hook
  // If this component is ever destroyed (SPA / route change):
  destroy() {
    window.removeEventListener('scroll', this._rAF);
    // this.observer.disconnect();
  } // That’s production readiness.

  ///////////////////// MATH
  _clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  // حركة أسرع بالبداية
  _easeOut(t) {
    return t * (2 - t);
  }
  // كم قطعت من المسافة بين نقطتين (خذ نسبة بين نقطتين)
  // Linear Interpolation
  _lerp(from, to, t) {
    return from + (to - from) * t;
    // t: نسبة التقدم time or progress...
  }
  ///////////////////////
  _rAF() {
    // console.log(`HEYYYYYY`); // check observer
    this.scrollY = window.scrollY;
    // تحويل وحدة px-->(0-1)نسبة
    this.progress = this._clamp(
      (this.scrollY - this.START) / (this.END - this.START),
      0,
      1
    );

    if (!this.ticking) {
      requestAnimationFrame(this._animate);
      this.ticking = true;
    }
  }
  _animate() {
    this._updateVideo();
    this._updateImages();
    this.ticking = false;
    // requestAnimationFrame(animate); // infinite loop
  }

  _updateVideo() {
    // const [START, END] = heroConfig.scrollRange;
    // const progress = this._clamp((this.scrollY - START) / (END - START), 0, 1);

    // VIDEO

    if (!this.video) return;
    const vProgress = this._clamp(
      (this.progress - this.vStart) / (this.vEnd - this.vStart),
      0,
      1
    );
    const ease = this.heroConfig.video.easing(vProgress);
    // const width = lerp(fromWidth, toWidth, ease);
    const width = this._lerp(
      this.video.fromWidth,
      this.video.toWidth,
      vProgress
    );

    this.video.el.style.width = `${width}px`;
  }

  _updateImages() {
    // const [START, END] = this.heroConfig.scrollRange;
    // const progress = this._clamp((this.scrollY - START) / (END - START), 0, 1);
    if (!this.heroImages) return;
    let iProgress = (this.progress - this.iStart) / (this.iEnd - this.iStart);
    iProgress = this._clamp(iProgress, 0, 1);
    this.heroImages.forEach(img => {
      const x = this._lerp(img.fromX, img.toX, iProgress);
      const y = this._lerp(img.fromY, img.toY, iProgress);
      const opacity = this._lerp(img.fromOpacity, img.toOpacity, iProgress);
      img.el.style.transform = `translate(${x}px, ${y}px)`;
      img.el.style.opacity = opacity;
    });
  }

  /////////////////////////////////////////////////////////

  // old versions
  ////////////////////////////////?//////??/////////////
  // function updateVideo(scrollY) {
  // const ORIGINAL_WIDTH = Number(video.dataset.originalWidth);
  // const speed = Number(video.dataset.speed);
  // const maxWidth = Number(video.dataset.maxWidth);

  //   if (!video) return;
  //   const growth = scrollY * speed;
  //   const width = Math.min(ORIGINAL_WIDTH + growth, maxWidth);
  //   video.style.width = `${width}px`;
  // }

  ////////

  // /// // // // / / /
  ///////////// // Images
  // const newCoords =
  //   img.direction === -1
  //     ? -(img.originalX + scrollY)
  //     : img.originalX + scrollY;

  // const finalX =
  //   img.direction === -1
  //     ? Math.max(newCoords, img.maxX)
  //     : Math.min(newCoords, img.maxX);
  // const finalY = Math.min(img.fromY + scrollY, img.toY);
}

class TabbedGroups {
  /**
   *
   * @param {string} containerBtnsSelector
   * @param {string} btnsSelector
   * @param {string} tabsSelector
   * @param {boolean} [hasVideoRevealEventListener=false]
   */

  constructor(
    containerBtnsSelector,
    btnsSelector,
    tabsSelector,
    hasVideoRevealEventListener = false
  ) {
    this.hasVideoRevealEventListener = hasVideoRevealEventListener;
    this.activeGallery = null;
    //
    this.switchBtnsContainer = document.querySelector(containerBtnsSelector);
    this.switchBtns = document.querySelectorAll(btnsSelector);
    this.btnsSelector = btnsSelector;

    this.currentTab = document.querySelector(`${tabsSelector}.visible`);
    this.tabs = new Map(
      [...document.querySelectorAll(tabsSelector)].map(el => [
        el.dataset.tabId,
        el,
      ])
    );

    if (this.hasVideoRevealEventListener) {
      this.activeGallery = new GalleryVideoReveal(this.currentTab);
    }

    // binding
    this._switchTabs = this._switchTabs.bind(this);
  }
  init() {
    // Activate Listener
    this.switchBtnsContainer.addEventListener('click', this._switchTabs);
  }
  destroy() {
    // Activate Listener
    this.switchBtnsContainer.removeEventListener('click', this._switchTabs);
  }

  _switchTabs(e) {
    const clickedBtn = e.target.closest(this.btnsSelector);
    if (!clickedBtn) return;
    const nextTab = this.tabs.get(clickedBtn.dataset.btnId);
    if (!nextTab) return;

    if (this.isSwitching) return; // rapid clicking gruard
    this._updateButtons(clickedBtn);
    this._updateTabs(nextTab);
  }
  _updateButtons(clicked) {
    this.switchBtns.forEach(btn => btn.classList.remove('btn(clicked)'));
    clicked.classList.add('btn(clicked)');
  }

  _updateTabs(nextTab) {
    this.isSwitching = true;
    this.currentTab.classList.remove('visible'); // op 0
    this.currentTab.addEventListener(
      'transitionend',
      () => this._switch(nextTab),
      {
        once: true,
      }
    );
  }

  _switch(nextTab) {
    this.currentTab.classList.add('hidden'); // d-none
    nextTab.classList.remove('hidden'); // d-block + still op-0
    // // wait for the tab to be d-block

    // // Old solution
    // 	ends the current task
    // schedules a new macrotask
    // 	•	0 means “next macrotask”
    // setTimeout(() => {
    //   nextTab.classList.add('visible');
    // }, 0); // 0, 0.001, 1, ... The number isn’t time — it’s queue semantics.

    // If you want ZERO ambiguity (gold standard)
    // Force layout flush explicitly

    // force style + layout calculation
    void nextTab.offsetHeight; // 🔥 layout flush
    // Equivalent to:⬇️
    // nextTab.offsetHeight;
    // But void is cleaner and expressive.

    nextTab.classList.add('visible'); // opacity transition works

    if (this.hasVideoRevealEventListener) {
      if (this.activeGallery) {
        this.activeGallery.destroy();
        this.activeGallery = null;
      }
      this.activeGallery = new GalleryVideoReveal(nextTab);
    }

    this.currentTab = nextTab;
    this.isSwitching = false;
  }
}

// CLASS
//“Each section declares its own lifecycle boundary”
// Section-based observation
class SectionLifecycleObserver {
  //   “When section enters → mount its components
  // When section leaves → destroy them”

  /**
   *
   * @param {Array<string>} sections
   */
  constructor(sections) {
    this.instances = new Map();

    this.observer = new IntersectionObserver(this._onIntersect.bind(this), {
      threshold: 0.2,
    });

    sections.forEach(section => this.observer.observe(section));
  }

  _onIntersect(entries) {
    entries.forEach(entry => {
      const id = entry.target.dataset.section;
      if (entry.isIntersecting) {
        this._mount(id, entry.target);
      } else {
        this._destroy(id);
      }
    });
  }

  _mount(id, el) {
    if (this.instances.has(id)) return;
    const instance = SectionFactory.create(id, el);
    instance?.init?.();
    this.instances.set(id, instance);
  }

  _destroy(id) {
    const instance = this.instances.get(id);
    instance?.destroy?.();
    this.instances.delete(id);
  }
}

class SectionFactory {
  static create(id, el) {
    switch (id) {
      case 'videoAndImgesScrollEvent':
        return new GrowOnScrollVideoWithSurroundingImages(
          '[data-scroll-growth]',
          '.hero-img'
        );
      case 'gallery':
        return new TabbedGroups(
          '#container-gallery-btns',
          '[data-gallery-btn]',
          '[data-gallery-tab]',
          true
        );
      case 'aiGenerator':
        return new TabbedGroups(
          '#container-ai-generator-btns',
          '[data-ai-generator-btn]',
          '[data-ai-generator-image]'
        );
      default:
        return null;
    }
  }
}

// MAIN CLASS
class App {
  constructor() {
    new Observers();

    if (window.matchMedia('(hover: hover)').matches) {
      new DropDownModals('.nav', '.modal', '.modal-btn', 'hidden-modal');
    }

    new SearchBarAnimation('search', [
      'Search assets or start creating...',
      'Generate an image...',
      "Let's start creativtity...",
    ]);

    //// OOOMMMGG
    new SectionLifecycleObserver([
      document.getElementById('ai-generator'),
      document.getElementById('gallerySection'),
      document.getElementById('scrollVidImgsSection'),
    ]);

    // new TabbedGroups(
    //   '#container-gallery-btns',
    //   '[data-gallery-btn]',
    //   '[data-gallery-tab]',
    //   true
    // );

    // new GrowOnScrollVideoWithSurroundingImages(
    //   '[data-scroll-growth]',
    //   '.hero-img'
    // );

    // new TabbedGroups(
    //   '#container-ai-generator-btns',
    //   '[data-ai-generator-btn]',
    //   '[data-ai-generator-image]'
    // );
  }
}
const app = new App();

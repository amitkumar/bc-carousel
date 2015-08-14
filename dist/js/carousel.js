import $ from 'jquery';
import imagesLoaded from 'imagesloaded';
import trend from 'jquery-trend';
import revealer from 'jquery-revealer';

export default class Carousel {
  constructor(options) {
    this.$el = $(options.el);

    this.currentIndex = 0;
    this.isPlaying = false;

    this.options = $.extend({
      delay: 4000,
      pagination: false,
      autoplay: true,
    }, options);

    this.$items = this.$el.find('.carousel-item');

    this._initPagination();
    this._bindEvents();
    this._setCarouselHeight();
    this._displayNavigation();

    if (this.options.autoplay) {
      this.play();
    }

    // Force show first slide
    this.$items.first().revealer('show', true);
  }

  play() {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this._startLoop();
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    this._pauseLoop();
  }

  _bindEvents() {
    this.$el.on('click', '.carousel-navigation-item', (e) => {
      if ($(e.target).hasClass('carousel-next')) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    });

    this.$el.on('mouseenter', () => {
      if (this.isPlaying) {
        this._pauseLoop();
      }
    });

    this.$el.on('mouseleave', () => {
      if (this.isPlaying) {
        this._startLoop();
      }
    });

    $(window).on('resize', () => {
      this._setCarouselHeight();
    });
  }

  _setCarouselHeight() {
    this.$el.trigger('carousel-resize');

    this.$el.imagesLoaded(() => {
      let carouselHeight = 0;

      for (let i of this.$items.length) {
        const itemHeight = this.$items.eq(i).height();
        carouselHeight = Math.max(carouselHeight, itemHeight);
      }

      this.$el.height(carouselHeight);
      this.$el.trigger('carousel-resized');
    });
  }

  _displayNavigation() {
    this.$el.find('.carousel-navigation').addClass('visible');
  }

  _initPagination() {
    // skip if it's not activated
    if (!this.options.pagination) {
      return;
    }

    const $dotsContainer  = $('<div></div>').addClass('carousel-pagination');

    for (let i of this.$items.length) {
      $(`<a>${i}</a>`)
        .addClass('carousel-pagination-item')
        .attr('data-slide', i)
        .on('click', (e) => {
          e.preventDefault();
          this.changeSlide(i);
        })
        .appendTo($dotsContainer);
    }

    this.$el.append($dotsContainer);
    this._updatePagination(this.currentIndex);
  }

  _updatePagination(index) {
    this.$el.find('.carousel-pagination-item').removeClass('active').filter(`[data-slide=${index}]`).addClass('active');
  }

  previousSlide() {
    // to the end if we're on the first slide, otherwise decrement
    const newIndex = (this.currentIndex === 0) ? this.$items.length - 1 : this.currentIndex - 1;

    this.changeSlide(newIndex, 'right');
  }

  nextSlide() {
    // back to zero if we're on the last slide, otherwise increment
    const newIndex = (this.currentIndex + 1 === this.$items.length) ? 0 : this.currentIndex + 1;

    this.changeSlide(newIndex, 'left');
  }

  changeSlide(targetIndex, animationDirection = 'auto') {
    const currentIndex = this.currentIndex;

    if (currentIndex === targetIndex) {
      return;
    }

    // Trigger change event
    this.$el.trigger('carousel-change', {
      from: currentIndex,
      to: targetIndex,
    });

    // Calculate animation direction
    let direction = null;

    if (animationDirection === 'auto') {
      direction = (targetIndex > currentIndex)
        ? 'animating-left'
        : 'animating-right';
    } else {
      direction = `animating-${animationDirection}`;
    }

    // Change slides
    this.$items.eq(currentIndex)
      .one('revealer-animating', (e) => {
        $(e.currentTarget).addClass(direction);
      })
      .one('revealer-hide', (e) => {
        $(e.currentTarget).removeClass(direction);
      })
      .revealer('hide');

    this.$items.eq(targetIndex)
      .one('revealer-animating', (e) => {
        $(e.currentTarget).addClass(direction);
      })
      .one('revealer-show', (e) => {
        $(e.currentTarget).removeClass(direction);

        // Trigger changed event
        this.$el.trigger('carousel-changed', {
          from: currentIndex,
          to: targetIndex,
        });
      })
      .revealer('show');

    // Update state
    this._updatePagination(targetIndex);
    this.currentIndex = targetIndex;
  }

  _startLoop() {
    const delay = this.options.delay;

    this.autoplay = setInterval(() => {
      this.nextSlide();
    }, delay);

    this.$el.trigger('carousel-play');
  }

  _pauseLoop() {
    clearInterval(this.autoplay);
    this.$el.trigger('carousel-pause');
  }
}

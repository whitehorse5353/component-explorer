import IEAComponent from 'iea-view-backbone';
import template from './template/carousel.hbs';
import 'bxslider';
import './style/bxslider.scss';

/**
 * @class
 * @classdesc Base class for Carousel Component.
 * The component extends from the abstractView and the carousel is instantiated with some settings that are required.
 * Templates, styles and other libraries are imported if required.
 * @param options {object} May contain any one of the following:
 * 'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'
 */

class Carousel extends IEAComponent {

  static template(){
      return template;
  }    
   
  constructor(options) {
    super(options);
  }

  /**
   * We use enable method initiate the carousel using bxSlider.
   */
  enable() {

    this.$el.find('ul').bxSlider({
      mode: 'fade',
      caption: true
    });

  }

}

export default Carousel;

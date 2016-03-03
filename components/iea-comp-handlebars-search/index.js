import IEAComponent from 'iea-view-backbone';
import template from './template/fullresults.hbs';
import newresult from './template/result.hbs';
import './style/search.scss';

/**
 * @class
 * @classdesc Base class for Search Component.
 * The component extends from the abstractView and some methods are overwritten.
 * Templates, styles and other libraries are imported if required.
 * @param options {object} May contain any one of the following:
 * 'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'
 */

class Search extends IEAComponent {

  static template(){
    return template;
  }

  constructor(options) {
    super(options);
  }

  /**
    * We overwrite the enable method as we need to do the event bindings and write the custom search behaviour of our component.
  */
  enable() {
    let _this = this;
    this.$el.find('.showmore').on('click', function() {
      _this.template = newresult;
      var urlData = $(this).data();
      var loadMoreUrl = urlData.baseurl + "?searchParams=" + urlData.queryurl;
      _this.model.modifyUrl(loadMoreUrl);
      _this.model.fetchData().then(() => { _this.render() });
    });
  }
}

export default Search;

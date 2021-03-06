var FancyList = function(container, data, columns, entriesPerPage, paginationAnchor) {
  this.container = jQuery(container);
  this.data = data;
  this.columns = columns;
  if(entriesPerPage && entriesPerPage > 0) {
    this.entriesPerPage = entriesPerPage;
    this.currentPage = 1;
    if(paginationAnchor)
      this.paginationAnchor = paginationAnchor;
  }
  this.container.addClass('fancyList');

  this.isPaginated = function() {
    return (this.entriesPerPage > 0);
  }
  this.hasPaginationAnchor = function() {
    if(this.isPaginated() && this.paginationAnchor)
      return true;
    return false;
  }
  this.getNumberOfPages = function() {
    var numberOfPages = Math.ceil(this.data.length/this.entriesPerPage);
    return numberOfPages;
  }
  this.isOnFirstPage = function() {
    return (this.currentPage === 1);
  }
  this.isOnLastPage = function() {
    return (this.currentPage === this.getNumberOfPages());
  }
  this.isEmpty = function(string) {
      if(typeof string === 'undefined' || !string)
        return true;
      if(string.length === 0 || !string.trim())
        return true;
      return false;
  }
  this.isDownloadableFile = function(url) {
    if(this.isEmpty(url))
      return false;
    modifiedUrl = url.trim();
    var regex = /[.].{3}$/;
    return regex.test(modifiedUrl);
  }
  this.contains = function(string, match, disableCase) {
    disableCase = disableCase || false;
    if(this.isEmpty(string))
      return false;

    var modifiedString = (disableCase) ? string.toLowerCase() : string;
    var modifiedMatch = (disableCase) ? match.toLowerCase() : string;

    return (modifiedString.indexOf(modifiedMatch) > -1);
  }
  this.renderCategories = function(categories) {
    var html = '';

    html += '<li class="makePeopleAwesome-category'+ this.categoryCSSClass(categories.makePeopleAwesome) +'" title="Make People Awesome"><span>Make People Awesome</span></li>';
    html += '<li class="makeSafetyAPrerequisite-category'+ this.categoryCSSClass(categories.makeSafetyAPrerequisite) +'" title="Make Safety a Prerequisite"><span>Make Safety a Prerequisite</span></li>';
    html += '<li class="experimentAndLearnRapidly-category'+ this.categoryCSSClass(categories.experimentAndLearnRapidly) +'" title="Experiment & Learn Rapidly"><span>Experiment & Learn Rapidly</span></li>';
    html += '<li class="deliverValueContinuously-category'+ this.categoryCSSClass(categories.deliverValueContinuously) +'" title="Deliver Value Continuously"><span>Deliver Value Continuously</span></li>';

    if(!this.isEmpty(html))
      html = '<ul class="categories">'+ html +'</ul>';
    return html;
  }
  this.categoryCSSClass = function(hasCategory) {
    return (hasCategory) ? '' : ' hidden';
  }
  this.renderPagination = function(parent) {
    if(Math.ceil(this.data.length/this.entriesPerPage) < 2)
      return;
    if(this.container.find('.pagination').length === 0) {
      var numberOfPages = Math.ceil(this.data.length/this.entriesPerPage);
      var pages = '';
      var numberOfPages = this.getNumberOfPages();
      var paginationAnchor = (this.hasPaginationAnchor()) ? ' data-anchor="'+ this.paginationAnchor +'" ' : ' ';
      for(var page=1; page<=numberOfPages; page++) {
        var active = (page == this.currentPage) ? 'active' : '';
        pages+= '<li class="'+ active +'"><a'+ paginationAnchor +'title="page '+ page +'" class="pagination-pageNumber" data-analytics-event="Pagination,Goto page,'+page+'" data-page="'+page+'">'+ page +'</a></li>';
      }
      var prevDisabledCss = (this.currentPage === 1) ? 'disabled' : '';
      var nextDisabledCss = (this.currentPage === numberOfPages) ? 'disabled' : '';
      var pagination = ' \
      <nav> \
        <ul class="pagination"> \
          <li class="'+ prevDisabledCss +'"> \
            <a class="pagination-button previous"'+ paginationAnchor +'title="Previous" aria-label="Previous" data-analytics-event="Pagination,Previous page"> \
              <span aria-hidden="true">&laquo;</span> \
            </a> \
          </li>'
          + pages +
          '<li class="'+ nextDisabledCss +'"> \
            <a class="pagination-button next"'+ paginationAnchor +'title="Next" aria-label="Next" data-analytics-event="Pagination,Next page"> \
              <span aria-hidden="true">&raquo;</span> \
            </a> \
          </li> \
        </ul> \
        </nav>';
      this.container.append(pagination);
      var that = this;
      this.container.find('.pagination-pageNumber').click(function() {
        that.scrollTo(this, 500);
        var targetPageNumber = parseInt(jQuery(this).attr('data-page'));
        setTimeout(function() {
          that.gotoPage(targetPageNumber);
        }, 500);
      });
      this.container.find('.pagination-button.next').click(function() {
        if(jQuery(this).parent().hasClass('disabled'))
          return;

        that.scrollTo(this, 500);
        setTimeout(function() {that.nextPage()}, 500);
      });
      this.container.find('.pagination-button.previous').click(function() {
        if(jQuery(this).parent().hasClass('disabled'))
          return;

        that.scrollTo(this, 500);
        setTimeout(function() {that.previousPage()}, 500);
      });
    } else {
      jQuery('li.active').removeClass('active');
      jQuery('.pagination-pageNumber[data-page='+this.currentPage+']').parent().addClass('active');

      jQuery('.pagination-button.previous, .pagination-button.next').parent().removeClass('disabled');
      if(this.currentPage === 1)
        jQuery('.pagination-button.previous').parent().addClass('disabled');
      else if(this.currentPage === this.getNumberOfPages())
        jQuery('.pagination-button.next').parent().addClass('disabled');
    }
  }
  this.scrollTo = function(link, duration) {
    var pageLink = jQuery(link);
    if(!pageLink[0].hasAttribute("data-anchor"))
      return;
    $('html, body').stop().animate({
        scrollTop: $(pageLink.attr('data-anchor')).offset().top
    }, duration, 'easeInOutExpo');
  }
  this.renderList = function(entries) {
    this.container.children('.row').remove();
    var list = jQuery('<div/>');
    var numberOfEntries = entries.length;
    var count = 0;
    while(count < entries.length) {
      var row = jQuery('<div/>').addClass('row');
      for(var col=0; col<this.columns; col++) {
        if(count >= entries.length)
          break;

        var entryData = entries[count];

        row.append('<div class="col-sm-'+parseInt(12/this.columns)+'  fancyListEntry">'+this.renderEntry(entryData)+'</div>');
        count++;
      }
      list.append(row);
    }
    this.container.prepend(list.html());
  }
  this.previousPage = function() {
    if(!this.isPaginated() || this.isOnFirstPage())
      return;

    this.gotoPage(this.currentPage-1);
  }
  this.nextPage = function() {
    if(!this.isPaginated() || this.isOnLastPage())
      return;

    this.gotoPage(this.currentPage+1);
  }
  this.gotoPage = function(pageNumber) {
    if(!this.isPaginated() || pageNumber < 1 || pageNumber > this.getNumberOfPages())
      return;

    this.currentPage = pageNumber;
    this.render();
  }
  this.renderEntry = function(entryData) {
    var entry = '';
    for (var property in entryData) {
      if (entryData.hasOwnProperty(property)) {
          entry += '<p class="truncate" style="margin: 0;">'+ property + ': '+ entryData[property] +'</p>';
      }
    }
    return entry;
  }
  this.render = function() {
    var firstEntry = (this.isPaginated()) ? this.entriesPerPage * (this.currentPage-1) : 0;
    var lastEntry = (this.isPaginated()) ? Math.min(firstEntry + this.entriesPerPage - 1, this.data.length-1) : this.data.length-1;

    this.renderList(this.data.slice(firstEntry, lastEntry+1));

    if (this.isPaginated())
      this.renderPagination();
  }
}

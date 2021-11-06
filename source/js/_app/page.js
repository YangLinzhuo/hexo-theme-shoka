const cardActive = function() {
  if(!$('.index.wrap'))
    return

  if (!window.IntersectionObserver) {
    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      if( article.hasClass("show") === false){
          article.addClass("show");
      }
    })
  } else {
    var io = new IntersectionObserver(function(entries) {

        entries.forEach(function(article) {
          if (article.target.hasClass("show")) {
            io.unobserve(article.target)
          } else {
            if (article.isIntersecting || article.intersectionRatio > 0) {
              article.target.addClass("show");
              io.unobserve(article.target);
            }
          }
        })
    }, {
        root: null,
        threshold: [0.3]
    });

    $.each('.index.wrap article.item, .index.wrap section.item', function(article) {
      io.observe(article)
    })

    $('.index.wrap .item:first-child').addClass("show")
  }

  $.each('.cards .item', function(element, index) {
    ['mouseenter', 'touchstart'].forEach(function(item){
      element.addEventListener(item, function(event) {
        if($('.cards .item.active')) {
          $('.cards .item.active').removeClass('active')
        }
        element.addClass('active')
      })
    });
    ['mouseleave'].forEach(function(item){
      element.addEventListener(item, function(event) {
        element.removeClass('active')
      })
    });
  });
}

const registerExtURL = function() {
  $.each('span.exturl', function(element) {
      var link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(atob(element.dataset.url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title || element.innerText;
      link.innerHTML = element.innerHTML;
      if(element.dataset.backgroundImage) {
        link.dataset.backgroundImage = element.dataset.backgroundImage;
      }
      element.parentNode.replaceChild(link, element);
    });
}

const postFancybox = function(p) {
  if($(p + ' .md img')) {
    vendorCss('fancybox');
    vendorJs('fancybox', function() {
      var q = jQuery.noConflict();

      $.each(p + ' p.gallery', function(element) {
        var box = document.createElement('div');
        box.className = 'gallery';
        box.attr('data-height', element.attr('data-height')||220);

        box.innerHTML = element.innerHTML.replace(/<br>/g, "")

        element.parentNode.insertBefore(box, element);
        element.remove();
      });

      $.each(p + ' .md img:not(.emoji):not(.vemoji)', function(element) {
        var $image = q(element);
        var info, captionClass = 'image-info';
        if(!$image.is('a img')) {
          var imageLink = $image.attr('data-src') || $image.attr('src');
          $image.data('safe-src', imageLink)
          var $imageWrapLink = $image.wrap('<a class="fancybox" href="'+imageLink+'" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>').parent('a');
          if (!$image.is('.gallery img')) {
            $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
          } else {
            captionClass = 'jg-caption'
          }
        }
        if(info = element.attr('title')) {
          $imageWrapLink.attr('data-caption', info);
          var para = document.createElement('span');
          var txt = document.createTextNode(info);
          para.appendChild(txt);
          para.addClass(captionClass);
          element.insertAfter(para);
        }
      });

      $.each(p + ' div.gallery', function (el, i) {
        q(el).justifiedGallery({rowHeight: q(el).data('height')||120, rel: 'gallery-' + i}).on('jg.complete', function () {
          q(this).find('a').each(function(k, ele) {
            ele.attr('data-fancybox', 'gallery-' + i);
          });
        });
      });

      q.fancybox.defaults.hash = false;
      q(p + ' .fancybox').fancybox({
        loop   : true,
        helpers: {
          overlay: {
            locked: false
          }
        }
      });
    }, window.jQuery);
  }
}

const postBeauty = function () {
  loadComments();

  if(!$('.md'))
    return

  postFancybox('.post.block');

  $('.post.block').oncopy = function(event) {
    showtip(LOCAL.copyright)

    if(LOCAL.nocopy) {
      event.preventDefault()
      return
    }

    var copyright = $('#copyright')
    if(window.getSelection().toString().length > 30 && copyright) {
      event.preventDefault();
      var author = "# " + copyright.child('.author').innerText
      var link = "# " + copyright.child('.link').innerText
      var license = "# " + copyright.child('.license').innerText
      var htmlData = author + "<br>" + link + "<br>" + license + "<br><br>" + window.getSelection().toString().replace(/\r\n/g, "<br>");;
      var textData = author + "\n" + link + "\n" + license + "\n\n" + window.getSelection().toString().replace(/\r\n/g, "\n");
      if (event.clipboardData) {
          event.clipboardData.setData("text/html", htmlData);
          event.clipboardData.setData("text/plain", textData);
      } else if (window.clipboardData) {
          return window.clipboardData.setData("text", textData);
      }
    }
  }

  $.each('li ruby', function(element) {
    var parent = element.parentNode;
    if(element.parentNode.tagName != 'LI') {
      parent = element.parentNode.parentNode;
    }
    parent.addClass('ruby');
  })

  $.each('ol[start]', function(element) {
    element.style.counterReset = "counter " + parseInt(element.attr('start') - 1)
  })

  $.each('.md table', function (element) {
    element.wrap({
      className: 'table-container'
    });
  });

  $.each('.highlight > .table-container', function (element) {
    element.className = 'code-container'
  });

  $.each('figure.highlight', function (element) {

    var code_container = element.child('.code-container');
    var caption = element.child('figcaption');

    element.insertAdjacentHTML('beforeend', '<div class="operation"><span class="breakline-btn"><i class="ic i-align-left"></i></span><span class="copy-btn"><i class="ic i-clipboard"></i></span><span class="fullscreen-btn"><i class="ic i-expand"></i></span></div>');

    var copyBtn = element.child('.copy-btn');
    if(LOCAL.nocopy) {
      copyBtn.remove()
    } else {
      copyBtn.addEventListener('click', function (event) {
        var target = event.currentTarget;
        var comma = '', code = '';
        code_container.find('pre').forEach(function(line) {
          code += comma + line.innerText;
          comma = '\n'
        })

        clipBoard(code, function(result) {
          target.child('.ic').className = result ? 'ic i-check' : 'ic i-times';
          target.blur();
          showtip(LOCAL.copyright);
        })
      });
      copyBtn.addEventListener('mouseleave', function (event) {
        setTimeout(function () {
          event.target.child('.ic').className = 'ic i-clipboard';
        }, 1000);
      });
    }

    var breakBtn = element.child('.breakline-btn');
    breakBtn.addEventListener('click', function (event) {
      var target = event.currentTarget;
      if (element.hasClass('breakline')) {
        element.removeClass('breakline');
        target.child('.ic').className = 'ic i-align-left';
      } else {
        element.addClass('breakline');
        target.child('.ic').className = 'ic i-align-justify';
      }
    });

    var fullscreenBtn = element.child('.fullscreen-btn');
    var removeFullscreen = function() {
      element.removeClass('fullscreen');
      element.scrollTop = 0;
      BODY.removeClass('fullscreen');
      fullscreenBtn.child('.ic').className = 'ic i-expand';
    }
    var fullscreenHandle = function(event) {
      var target = event.currentTarget;
      if (element.hasClass('fullscreen')) {
        removeFullscreen();
        hideCode && hideCode();
        pageScroll(element)
      } else {
        element.addClass('fullscreen');
        BODY.addClass('fullscreen');
        fullscreenBtn.child('.ic').className = 'ic i-compress';
        showCode && showCode();
      }
    }
    fullscreenBtn.addEventListener('click', fullscreenHandle);
    caption && caption.addEventListener('click', fullscreenHandle);

    if(code_container && code_container.find("tr").length > 15) {
      
      code_container.style.maxHeight = "300px";
      code_container.insertAdjacentHTML('beforeend', '<div class="show-btn"><i class="ic i-angle-down"></i></div>');
      var showBtn = code_container.child('.show-btn');

      var showCode = function() {
        code_container.style.maxHeight = ""
        showBtn.addClass('open')
      }

      var hideCode = function() {
        code_container.style.maxHeight = "300px"
        showBtn.removeClass('open')
      }

      showBtn.addEventListener('click', function(event) {
        if (showBtn.hasClass('open')) {
          removeFullscreen()
          hideCode()
          pageScroll(code_container)
        } else {
          showCode()
        }
      });
    }
  });

  $.each('pre.mermaid > svg', function (element) {
    element.style.maxWidth = ''
  });

  $.each('.reward button', function (element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
      var qr = $('#qr')
      if(qr.display() === 'inline-flex') {
        transition(qr, 0)
      } else {
        transition(qr, 1, function() {
          qr.display('inline-flex')
        }) // slideUpBigIn
      }
    });
  });

  //quiz
  $.each('.quiz > ul.options li', function (element) {
    element.addEventListener('click', function (event) {
      if (element.hasClass('correct')) {
        element.toggleClass('right')
        element.parentNode.parentNode.addClass('show')
      } else {
        element.toggleClass('wrong')
      }
    });
  });

  $.each('.quiz > p', function (element) {
    element.addEventListener('click', function (event) {
      element.parentNode.toggleClass('show')
    });
  });

  $.each('.quiz > p:first-child', function (element) {
    var quiz = element.parentNode;
    var type = 'choice'
    if(quiz.hasClass('true') || quiz.hasClass('false'))
      type = 'true_false'
    if(quiz.hasClass('multi'))
      type = 'multiple'
    if(quiz.hasClass('fill'))
      type = 'gap_fill'
    if(quiz.hasClass('essay'))
      type = 'essay'
    element.attr('data-type', LOCAL.quiz[type])
  });

  $.each('.quiz .mistake', function (element) {
    element.attr('data-type', LOCAL.quiz.mistake)
  });

  $.each('div.tags a', function(element) {
    element.className = ['primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 5)]
  })

  $.each('.md div.player', function(element) {
    mediaPlayer(element, {
      type: element.attr('data-type'),
      mode: 'order',
      btns: []
    }).player.load(JSON.parse(element.attr('data-src'))).fetch()
  })
}

const tabFormat = function() {
  // tab
  var first_tab
  $.each('div.tab', function(element, index) {
    if(element.attr('data-ready'))
      return

    var id = element.attr('data-id');
    var title = element.attr('data-title');
    var box = $('#' + id);
    if(!box) {
      box = document.createElement('div');
      box.className = 'tabs';
      box.id = id;
      box.innerHTML = '<div class="show-btn"></div>'

      var showBtn = box.child('.show-btn');
      showBtn.addEventListener('click', function(event) {
        pageScroll(box)
      });

      element.parentNode.insertBefore(box, element);
      first_tab = true;
    } else {
      first_tab = false;
    }

    var ul = box.child('.nav ul');
    if(!ul) {
      ul = box.createChild('div', {
        className: 'nav',
        innerHTML: '<ul></ul>'
      }).child('ul');
    }

    var li = ul.createChild('li', {
      innerHTML: title
    });

    if(first_tab) {
      li.addClass('active');
      element.addClass('active');
    }

    li.addEventListener('click', function(event) {
      var target = event.currentTarget;
      box.find('.active').forEach(function(el) {
        el.removeClass('active');
      })
      element.addClass('active');
      target.addClass('active');
    });

    box.appendChild(element);
    element.attr('data-ready', true)
  });
}

const loadComments = function () {
  var element = $('#comments');
  if (!element) {
    goToComment.display("none")
    return;
  } else {
    goToComment.display("")
  }

  if (!window.IntersectionObserver) {
    vendorCss('valine');
  } else {
    var io = new IntersectionObserver(function(entries, observer) {
      var entry = entries[0];
      vendorCss('valine');
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        transition($('#comments'), 'bounceUpIn');
        observer.disconnect();
      }
    });

    io.observe(element);
  }
}

const algoliaSearch = function(pjax) {
  if(CONFIG.search === null)
    return

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: '<div class="inner"><div class="header"><span class="icon"><i class="ic i-search"></i></span><div class="search-input-container"></div><span class="close-btn"><i class="ic i-times-circle"></i></span></div><div class="results"><div class="inner"><div id="search-stats"></div><div id="search-hits"></div><div id="search-pagination"></div></div></div></div>'
    });
  }

  var search = instantsearch({
    indexName: CONFIG.search.indexName,
    searchClient  : algoliasearch(CONFIG.search.appID, CONFIG.search.apiKey),
    searchFunction: function(helper) {
      var searchInput = $('.search-input');
      if (searchInput.value) {
        helper.search();
      }
    }
  });

  search.on('render', function() {
    pjax.refresh($('#search-hits'));
  });

  // Registering Widgets
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: CONFIG.search.hits.per_page || 10
    }),

    instantsearch.widgets.searchBox({
      container           : '.search-input-container',
      placeholder         : LOCAL.search.placeholder,
      searchOnEnterKeyPressOnly: true,  // Only search when press enter key
      // Hide default icons of algolia search
      showReset           : false,
      showSubmit          : false,
      showLoadingIndicator: false,
      cssClasses          : {
        input: 'search-input'
      }
    }),

    instantsearch.widgets.stats({
      container: '#search-stats',
      templates: {
        text: function(data) {
          var stats = LOCAL.search.stats
            .replace(/\$\{hits}/, data.nbHits)
            .replace(/\$\{time}/, data.processingTimeMS);
          return stats + '<span class="algolia-powered"></span><hr>';
        }
      }
    }),

    instantsearch.widgets.hits({
      container: '#search-hits',
      templates: {
        item: function(data) {
          var cats = data.categories ? '<span>'+data.categories.join('<i class="ic i-angle-right"></i>')+'</span>' : '';
          return '<a href="' + CONFIG.root + data.path +'">' + cats + 
          '<b>' + data._highlightResult.title.value + '</b><br>' + 
          data._snippetResult.contentStrip.value + '<br>( 匹配字词 : ' + 
          data._highlightResult.contentStrip.matchedWords + ' ) | ( 匹配等级 : ' + 
          data._highlightResult.contentStrip.matchLevel + ' )' + '</a>';
        },
        empty: function(data) {
          return '<div id="hits-empty">'+
              LOCAL.search.empty.replace(/\$\{query}/, data.query) +
            '</div>';
        }
      },
      cssClasses: {
        item: 'item'
      }
    }),

    instantsearch.widgets.pagination({
      container: '#search-pagination',
      scrollTo : false,
      showFirst: false,
      showLast : false,
      templates: {
        first   : '<i class="ic i-angle-double-left"></i>',
        last    : '<i class="ic i-angle-double-right"></i>',
        previous: '<i class="ic i-angle-left"></i>',
        next    : '<i class="ic i-angle-right"></i>'
      },
      cssClasses: {
        root        : 'pagination',
        item        : 'pagination-item',
        link        : 'page-number',
        selectedItem: 'current',
        disabledItem: 'disabled-item'
      }
    })
  ]);

  search.start();

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function() {
      document.body.style.overflow = 'hidden';
      transition(siteSearch, 'shrinkIn', function() {
          $('.search-input').focus();
        }) // transition.shrinkIn
    });
  });

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0); // "transition.shrinkOut"
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });
  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
};

const localSearch = function(pjax) {
  // 参考 hexo next 主题的配置方法
  // 参考 https://qiuyiwu.github.io/2019/01/25/Hexo-LocalSearch/ 博文
  if(CONFIG.search === null)
    return

  if(!siteSearch) {
    siteSearch = BODY.createChild('div', {
      id: 'search',
      innerHTML: `<div class="inner">
                    <div class="header">
                      <span class="icon">
                        <i class="ic i-search">
                        </i>
                      </span>
                      <div class="search-input-container">
                      <input  class="search-input"
                              autocomplete="off"
                              placeholder="${LOCAL.search.placeholder}" 
                              spellcheck="false"
                              type="text" 
                              id="local-search-input">
                      </div>
                        <span class="close-btn">
                          <i class="ic i-times-circle">
                          </i>
                        </span>
                      </div>
                      <div class="results" id="search-results">
                        <div class="inner">
                          <div id="search-stats">
                          </div>
                          <div id="search-hits">
                          </div>
                          <div id="search-pagination">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>`
    });
  }
  
  let isFetched = false;
  let datas;
  let isXml = true;
  let current_page = 0;
  let article_per_page = parseInt(CONFIG.search.article_per_page, 10);
  let total_pages = 0;
  let max_page_on_show = 7; // 一次最多显示 7 个页码
  let start_page = 0;
  let end_page = 0;
  let resultItems = [];

  // search DB path
  let searchPath = CONFIG.search.path;
  if (searchPath.length == 0) {
    searchPath = 'search.xml';
  } else if (searchPath.endsWith('json')) {
    isXml = false;
  }

  const input = $('.search-input'); // document.querySelector('.search-input');
  const resultContent = document.getElementById('search-hits');
  const paginationContent = document.getElementById('search-pagination');

  const getIndexByWord = (word, text, caseSensitive) => {
    if (CONFIG.search.unescape) {
      let div = document.createElement('div');
      div.innerText = word;
      word = div.innerHTML;
    }
    let wordLen = word.length;
    if (wordLen === 0) {
      return [];
    }
    let startPosition = 0;
    let position = [];
    let index = [];
    if (!caseSensitive) {
      text = text.toLowerCase();
      word = word.toLowerCase();
    }

    while ((position = text.indexOf(word, startPosition)) > -1) {
      index.push({position, word});
      startPosition = position + wordLen;
    }
    return index;
  };

  // Merge hits into slices
  const mergeIntoSlice = (start, end, index, searchText) => {
    let item = index[index.length - 1];
    let {position, word} = item;
    let hits = [];
    let searchTextCountInSlice = 0;
    while (position + word.length <= end && index.length !== 0) {
      if (word === searchText) {
        searchTextCountInSlice++;
      }
      hits.push({
        position,
        length: word.length
      });

      let wordEnd = position + word.length;

      // Move to next position of hit
      index.pop();
      while (index.length !== 0) {
        item = index[index.length - 1];
        position = item.position;
        word = item.word;
        if (wordEnd > position) {
          index.pop();
        } else {
          break;
        }
      }
    }
    return {
      hits,
      start,
      end,
      searchTextCount: searchTextCountInSlice
    };
  }

  // Highlight title and content
  const highlightKeyword = (text, slice) => {
    let result = '';
    let prevEnd = slice.start;
    slice.hits.forEach(hit => {
      result += text.substring(prevEnd, hit.position);
      let end = hit.position + hit.length;
      result += `<mark>${text.substring(hit.position, end)}</mark>`;
      prevEnd = end;
    });
    result += text.substring(prevEnd, slice.end);
    return result;
  };

  const pagination = () => {
    const addPrevPage = (current_page) => {
      let classContent = '';
      let numberContent = '';
      if (current_page === 0) {
        classContent = '#search-pagination pagination-item disabled-item';
        numberContent = '<span class="#search-pagination page-number"><i class="ic i-angle-left"></i></span>';
      } else {
        classContent = '#search-pagination pagination-item';
        numberContent = `<a class="#search-pagination page-number" aria-label="Prev" href="#">
                          <i class="ic i-angle-left"></i>
                        </a>`;
      }
      let prevPage = `<li class="${classContent}" id="prev-page">
                        ${numberContent} 
                      </li>`;
      return prevPage;
    };

    const addNextPage = (current_page) => {
      let classContent = '';
      let numberContent = '';
      if ((current_page + 1) === total_pages) {
        classContent = '#search-pagination pagination-item disabled-item';
        numberContent = '<span class="#search-pagination page-number"><i class="ic i-angle-right"></i></span>';
      } else {
        classContent = '#search-pagination pagination-item';
        numberContent = `<a class="#search-pagination page-number" aria-label="Next" href="#">
                          <i class="ic i-angle-right"></i>
                        </a>`;
      }
      let nextPage = `<li class="${classContent}" id="next-page">
                        ${numberContent} 
                      </li>`;
      return nextPage;
    };

    const addPage = (index, current_page) => {
      let classContent = '';
      let numberContent = `<a class="#search-pagination page-number" aria-label="${index + 1}" href="#">
                            ${index + 1}
                          </a>`;
      if (index === current_page) {
        classContent = '#search-pagination pagination-item current';
      } else {
        classContent = '#search-pagination pagination-item';
      }
      let page = `<li class="${classContent}" id="page-${index + 1}">
                    ${numberContent} 
                  </li>`;
      return page;
    }

    const addPaginationEvents = (start_page, end_page) => {
      if (total_pages <= 0) {
        return;
      }
      const onPrevPageClick = (event) => {
        if (current_page > 0) {
          current_page -= 1;
        }
        if (current_page < start_page) {
          start_page = current_page;
          end_page = Math.min(end_page, start_page + max_page_on_show);
        }
        pagination();
      };
      const onNextPageClick = (event) => {
        if ((current_page + 1) < total_pages) {
          current_page += 1;
        }
        if (current_page > end_page) {
          end_page = current_page;
          start_page = Math.max(0, end_page - max_page_on_show);
        }
        pagination();
      };
      const onPageClick = (event) => {
        let page_number = parseInt(event.target.ariaLabel);
        current_page = page_number - 1; // note minus 1 here
        pagination();
      };
      let prevPage = document.getElementById('prev-page');
      prevPage.addEventListener('click', onPrevPageClick);
      let nextPage = document.getElementById('next-page');
      nextPage.addEventListener('click', onNextPageClick);
      for (var i = start_page; i < end_page; i += 1) {
        let page = document.getElementById(`page-${i + 1}`);
        page.addEventListener('click', onPageClick);
      }
    };
    
    paginationContent.innerHTML = ''; // clear
    let begin_index = Math.min(current_page * article_per_page, resultItems.length);
    let end_index = Math.min(begin_index + article_per_page, resultItems.length);
    resultContent.innerHTML = `${resultItems.slice(begin_index, end_index).map(result => result.item).join('')}`;
    
    start_page = Math.max(0, total_pages - max_page_on_show);
    end_page = start_page + Math.min(total_pages, max_page_on_show);
    let pageContent = '<div class="#search-pagination">';
    pageContent += '<div class="#search-pagination pagination">';
    pageContent += '<ul>';
    if (total_pages > 0) {
      // add prev page arrow, when no prev page not selectable
      pageContent += addPrevPage(current_page);
      for (let i = start_page; i < end_page; i += 1) {
        pageContent += addPage(i, current_page);
      }
      // add next page arrow, when no next page not selectable
      pageContent += addNextPage(current_page);
    }
    pageContent += '</ul>';
    pageContent += '</div>';
    pageContent += '</div>';
    paginationContent.innerHTML = pageContent;
    addPaginationEvents(start_page, end_page);
    resultContent.scrollTop = 0;  // scroll to top
    window.pjax && window.pjax.refresh(resultContent);
  };

  const inputEventFunction = () => {
    if (!isFetched) {
      console.log("Data not fetched.");
      return;
    }

    let searchText = input.value.trim().toLowerCase();
    let keywords = searchText.split(/[-\s]+/);
    if (keywords.length > 1) {
      keywords.push(searchText);
    }
    resultItems = [];
    if (searchText.length > 0) {
      // Perform local searching
      datas.forEach(({categories, title, content, url}, index) => {
        let titleInLowerCase = title.toLowerCase();
        let contentInLowerCase = content.toLowerCase();
        let indexOfTitle = [];
        let indexOfContent = [];
        let searchTextCount = 0;
        keywords.forEach(keyword => {
          indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false));
          indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false));
        });

        // Show search results
        if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
          let hitCount = indexOfTitle.length + indexOfContent.length;
          // Sort index by position of keyword
          [indexOfTitle, indexOfContent].forEach(index => {
            index.sort((itemLeft, itemRight) => {
              if (itemRight.position !== itemLeft.position) {
                return itemRight.position - itemLeft.position;
              }
              return itemLeft.word.length - item.word.length;
            });
          });

          let slicesOfTitle = [];
          if (indexOfTitle.length !== 0) {
            let tmp = mergeIntoSlice(0, title.length, indexOfTitle, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfTitle.push(tmp);
          }

          let slicesOfContent = [];
          while (indexOfContent.length !== 0) {
            let item = indexOfContent[indexOfContent.length - 1];
            let {position, word} = item;
            // Cut out 100 characters
            let start = position - 20;
            let end = position + 30;
            if (start < 0) {
              start = 0;
            }
            if (end < position + word.length) {
              end = position + word.length;
            }
            if (end > content.length) {
              end = content.length;
            }
            let tmp = mergeIntoSlice(start, end, indexOfContent, searchText);
            searchTextCount += tmp.searchTextCountInSlice;
            slicesOfContent.push(tmp);
          }

          // Sort slices in content by search text's count and hits' count
          slicesOfContent.sort((sliceLeft, sliceRight) => {
            if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
              return sliceRight.searchTextCount - sliceLeft.searchTextCount;
            } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
              return sliceRight.hits.length - sliceLeft.hits.length;
            }
            return sliceLeft.start - sliceRight.start;
          });

          // Select top N slices in content
          let upperBound = parseInt(CONFIG.search.top_n_per_article, 10);
          if (upperBound >= 0) {
            slicesOfContent = slicesOfContent.slice(0, upperBound);
          }

          let resultItem = '';
          resultItem += '<div class="#search-hits item">';
          // resultItem += '<div class="#search-hits">';
          // resultItem += '<ol class="item">'
          resultItem += '<li>'
          // resultItem += '<li>';
          var cats = categories !== undefined ? '<span>' + categories.join('<i class="ic i-angle-right"></i>') + '</span>' : '<span>No categories</span>';
          resultItem += `<a href="${url}">` + cats;
          if (slicesOfTitle.length !== 0) {
            // resultItem += `<li><a href="${url}">${highlightKeyword(title, slicesOfTitle[0])}</a>`;
            resultItem += `<b>${highlightKeyword(title, slicesOfTitle[0])}</b><br>`;
          } else {
            // resultItem += `<li><a href="${url}">${title}</a>`;
            resultItem += `<b>${title}</b><br>`;
          }

          slicesOfContent.forEach(slice => {
            // resultItem += `<a href="${url}"><p>${highlightKeyword(content, slice)}...</p></a>`;
            resultItem += `<li class="#search-hits subitem">${highlightKeyword(content, slice)} ...</li>`;
          });

          // resultItem += '</li>';
          resultItem += '</a>';
          resultItem += '</li>';
          // resultItem += '</ol>';
          resultItem += '</div>';
          resultItems.push({
            item: resultItem,
            id  : resultItems.length,
            hitCount,
            searchTextCount
          });
        }
      });
    }

    if (keywords.length === 1 && keywords[0] === '') {
      resultContent.innerHTML = '<div id="no-result"><i></i></div>';
    } else if (resultItems.length === 0) {
      resultContent.innerHTML = '<div id="no-result"><i></i></div>';
    } else {
      resultItems.sort((resultLeft, resultRight) => {
        if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
          return resultRight.searchTextCount - resultLeft.searchTextCount;
        } else if (resultLeft.hitCount !== resultRight.hitCount) {
          return resultRight.hitCount - resultLeft.hitCount;
        }
        return resultRight.id - resultLeft.id;
      });
    }
    // Do pagination
    total_pages = Math.ceil(resultItems.length / article_per_page);
    pagination();
  }

  const fetchData = () => {
    fetch(CONFIG.root + searchPath)
      .then(response => response.text())
      .then(res => {
        // Get the contents from search data
        isFetched = true;
        datas = isXml ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => {
          return {
            title  : element.querySelector('title').textContent,
            content: element.querySelector('content').textContent,
            url    : element.querySelector('url').textContent
          };
        }) : JSON.parse(res);
        // Only match articles with not empty titles
        datas = datas.filter(data => data.title).map(data => {
          data.title = data.title.trim();
          data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : '';
          data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/');
          return data;
        });
        // Remove loading animation
        document.getElementById('search-hits').innerHTML = '<i></i>';
        inputEventFunction();
      });
  };

  if (CONFIG.search.preload) {
    console.log("fetch data.");
    fetchData();
  }

  if (CONFIG.search.trigger === 'auto') {
    input.addEventListener('input', inputEventFunction);
  } else {
    document.querySelector('.search-icon').addEventListener('click', inputEventFunction);
    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        inputEventFunction();
      }
    });
  }

  // Handle and trigger popup window
  document.querySelectorAll('.popup-trigger').forEach(element => {
    element.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      document.querySelector('.search-pop-overlay').classList.add('search-active');
      input.focus();
      if (!isFetched) fetchData();
    });
  });

  // Handle and trigger popup window
  $.each('.search', function(element) {
    element.addEventListener('click', function() {
      document.body.style.overflow = 'hidden';
      transition(siteSearch, 'shrinkIn', function() {
          $('.search-input').focus();
        }) // transition.shrinkIn
    });
  });

  // Monitor main search box
  const onPopupClose = function() {
    document.body.style.overflow = '';
    transition(siteSearch, 0); // "transition.shrinkOut"
  };

  siteSearch.addEventListener('click', function(event) {
    if (event.target === siteSearch) {
      onPopupClose();
    }
  });

  $('.close-btn').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });

};
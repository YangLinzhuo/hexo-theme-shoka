const domInit = function() {
  $.each('.overview .menu > .item', function(el) {
    siteNav.child('.menu').appendChild(el.cloneNode(true));
  })

  loadCat.addEventListener('click', Loader.vanish);
  menuToggle.addEventListener('click', sideBarToggleHandle);
  $('.dimmer').addEventListener('click', sideBarToggleHandle);

  quickBtn.child('.down').addEventListener('click', goToBottomHandle);
  quickBtn.child('.up').addEventListener('click', backToTopHandle);

  if(!toolBtn) {
    toolBtn = siteHeader.createChild('div', {
      id: 'tool',
      innerHTML: '<div class="item player"></div><div class="item contents"><i class="ic i-list-ol"></i></div><div class="item chat"><i class="ic i-comments"></i></div><div class="item back-to-top"><i class="ic i-arrow-up"></i><span>0%</span></div>'
    });
  }

  toolPlayer = toolBtn.child('.player');
  backToTop = toolBtn.child('.back-to-top');
  goToComment = toolBtn.child('.chat');
  showContents = toolBtn.child('.contents');

  backToTop.addEventListener('click', backToTopHandle);
  goToComment.addEventListener('click', goToCommentHandle);
  showContents.addEventListener('click', sideBarToggleHandle);

  mediaPlayer(toolPlayer)
  $('main').addEventListener('click', function() {
    toolPlayer.player.mini()
  })
}

const pjaxReload = function () {
  pagePosition()

  if(sideBar.hasClass('on')) {
    transition(sideBar, function () {
        sideBar.removeClass('on');
        menuToggle.removeClass('close');
      }); // 'transition.slideRightOut'
  }

  $('#main').innerHTML = ''
  $('#main').appendChild(loadCat.lastChild.cloneNode(true));
  pageScroll(0);
}

const siteRefresh = function (reload) {
  LOCAL_HASH = 0
  LOCAL_URL = window.location.href
  vendorCss('katex');
  vendorJs('copy_tex');
  vendorCss('mermaid');
  vendorJs('chart');

  // if(CONFIG.valine.appId && CONFIG.valine.appKey) {
  //   vendorJs('valine', function() {
  //     var options = Object.assign({}, CONFIG.valine);
  //     options = Object.assign(options, LOCAL.valine||{});
  //     options.el = '#comments';
  //     options.pathname = LOCAL.path;
  //     options.pjax = pjax;
  //     options.lazyload = lazyload;

  //     new MiniValine(options);

  //     setTimeout(function(){
  //       positionInit(1);
  //       postFancybox('.v');
  //     }, 1000);
  //   }, window.MiniValine);
  // }

  if(CONFIG.waline.serverURL) {
    vendorJs('waline', function() {
      var options = Object.assign({}, CONFIG.waline);
      options = Object.assign(options, LOCAL.waline||{});
      options.el = '#comments';
      options.pathname = LOCAL.path;
      options.pjax = pjax;
      options.lazyload = lazyload;
      options.pageview = '.leancloud-visitors-count'
      // options.pageview = true;

      new Waline(options);

      setTimeout(function(){
        positionInit(1);
        postFancybox('.waline-container');
      }, 1000);
    }, window.Waline);
  }

  if(!reload) {
    $.each('script[data-pjax]', pjaxScript);
  }

  originTitle = document.title

  resizeHandle()

  menuActive()

  sideBarTab()
  sidebarTOC()

  registerExtURL()
  postBeauty()
  tabFormat()

  toolPlayer.player.load(LOCAL.audio || CONFIG.audio || {})

  Loader.hide()

  setTimeout(function(){
    positionInit()
  }, 500);

  cardActive()

  lazyload.observe()
}

const siteInit = function () {

  domInit()

  pjax = new Pjax({
            selectors: [
              'head title',
              '.languages',
              '.pjax',
              'script[data-config]'
            ],
            analytics: false,
            cacheBust: false
          })

  CONFIG.quicklink.ignores = LOCAL.ignores
  quicklink.listen(CONFIG.quicklink)

  visibilityListener()
  themeColorListener()

  // algoliaSearch(pjax)
  localSearch(pjax)

  window.addEventListener('scroll', scrollHandle)

  window.addEventListener('resize', resizeHandle)

  window.addEventListener('pjax:send', pjaxReload)

  window.addEventListener('pjax:success', siteRefresh)

  window.addEventListener('beforeunload', function() {
    pagePosition()
  })

  siteRefresh(1)
}

const printMsg = function () {
  console.log("Load event triggered.")
}

const getPageView = function () {
  console.log("getPageView triggered.");
  if (CONFIG.waline.serverURL) {
    var t = document.querySelector(".leancloud-visitors-count");
    let path = window.location.pathname;
    let url = CONFIG.waline.serverURL;
    if (t) {
      console.log("Load page views");
      console.log("Current page path: " + path);
      let https = url+'/article?path='+path;
      fetch(https)
        .then(response => response.json())
        .then(data => {
          console.log("Pageview: " + data);
          t.innerHTML = data;
        }).catch(console.error);
    }
  }
}

const getRecentComments = function () {
  console.log("getRecentComments triggered.")
  if (CONFIG.waline.serverURL) {
    var t = document.querySelector(".waline-recent-comments");
    function renderTime(date) {
        let myDate = new Date(date).toJSON();
        return new Date(+new Date(myDate) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
    }
    function formatTime(time) {
        let d = Math.floor(time / (1000 * 60 * 60 * 24));
        let h = Math.floor(time / (1000 * 60 * 60) % 24);
        let m = Math.floor(time / (1000 * 60) % 60);
        let s = Math.floor(time / 1000 % 60);
        if (d > 0) {
            return d + ' 天前'
        } else if (h > 0) {
            return h + ' 小时前'
        } else if (m > 0) {
            return m + ' 分钟前'
        } else if (s > 0) {
            return s + ' 秒钟前'
        }

    }
    let str = ' @ '
    let reg = /<.*?>/ig;
    let date = new Date();
    let url = CONFIG.waline.serverURL;
    let count = 10;
    var t = document.querySelector(".waline-recent-comments");
    if (t && !t.classList.contains("loaded")) {
      console.log("load recent comments");
      fetch(url+'/comment?type=recent&count='+count)
        .then(response => response.json())
        .then(data => {
            // let arr = data.filter(item => item.pid !== undefined);
            let arr = data.filter(item => item.nick !== "Linn")
            let i = arr.length;
            console.log("total " + i + " comments");
            for (var r = "", o = 0; o < i; o++) {
                let comment = arr[o].comment.replace(reg, '');
                let gap = formatTime(date - new Date(renderTime(arr[o].createdAt)))
                r += `<li class="item"><a href="${arr[o].url + '#' + arr[o].objectId}">
                    <span class="breadcrumb">${arr[o].nick + str + gap}</span>
                    <span>${comment}</span></a></li>`;
                t.innerHTML = r;
                t.classList.add("loaded"); 
                // e.config.pjax && e.config.pjax.refresh(t)
            }
        }).catch(console.error)
      }
  }
}

window.addEventListener('DOMContentLoaded', siteInit);

// window.addEventListener('DOMContentLoaded', getPageView);

// window.addEventListener('popstate', getPageView);

// window.addEventListener('load', printMsg);

// window.addEventListener('pageshow', getPageView);

window.addEventListener('DOMContentLoaded', getRecentComments);

console.log('%c Theme.Shoka v' + CONFIG.version + ' %c https://shoka.lostyu.me/ ', 'color: white; background: #e9546b; padding:5px 0;', 'padding:4px;border:1px solid #e9546b;')





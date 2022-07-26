'use strict';
const fs = require('hexo-fs');
const url = require('url');

hexo.extend.generator.register('script', function(locals){
  const config = hexo.config;
  const theme = hexo.theme.config;

  var env = require('../../package.json')

  var siteConfig = {
    version: env['version'],
    hostname: config.url,
    root: config.root,
    statics: theme.statics,
    favicon: {
      normal: theme.images + "/favicon.ico",
      hidden: theme.images + "/failure.ico"
    },
    darkmode: theme.darkmode,
    auto_scroll: theme.auto_scroll,
    js: {
      valine: theme.vendors.js.valine,
      waline: theme.vendors.js.waline,
      chart: theme.vendors.js.chart,
      copy_tex: theme.vendors.js.copy_tex,
      fancybox: theme.vendors.js.fancybox
    },
    css: {
      valine: theme.css + "/comment.css",
      waline: theme.css + "/comment.css",
      katex: theme.vendors.css.katex,
      mermaid: theme.css + "/mermaid.css",
      fancybox: theme.vendors.css.fancybox
    },
    loader: theme.loader,
    search : null,
    valine: theme.valine,
    waline: theme.waline,
    quicklink: {
      timeout : theme.quicklink.timeout,
      priority: theme.quicklink.priority
    }
  };

  if(config.algolia) {
    siteConfig.search = {
      appID    : config.algolia.appId,
      apiKey   : config.algolia.apiKey,
      indexName: config.algolia.indexName,
      hits     : theme.search.hits
    }
  }
  
  if (config.search) {
    // search:
    //   path: search.json # search.xml
    //   field: post
    //   format: html
    //   limit: 10000
    //   content: true
    siteConfig.search = {
      path : config.search.path,
      field : config.search.post,
      format: config.search.format,
      limit: config.search.limit,
      content: config.search.content,
      unescape: config.search.unescape,
      preload: config.search.preload,
      trigger: config.search.trigger,
      top_n_per_article: config.search.top_n_per_article,
      article_per_page: config.search.article_per_page,
    }
  }

  if(theme.audio) {
    siteConfig.audio = theme.audio
  }

  var text = '';

  ['utils', 'dom', 'player', 'global', 'sidebar', 'page', 'pjax'].forEach(function(item) {
    text += fs.readFileSync('themes/shoka/source/js/_app/'+item+'.js').toString();
  });

  if(theme.fireworks && theme.fireworks.enable) {
    text += fs.readFileSync('themes/shoka/source/js/_app/fireworks.js').toString();
    siteConfig.fireworks = theme.fireworks.color || ["rgba(255,182,185,.9)", "rgba(250,227,217,.9)", "rgba(187,222,214,.9)", "rgba(138,198,209,.9)"]
  }

  text = 'var CONFIG = ' + JSON.stringify(siteConfig) + ';' + text;

  return {
      path: theme.js + '/app.js',
      data: function(){
        return hexo.render.renderSync({text:  text, engine: 'js'});
      }
    };
});

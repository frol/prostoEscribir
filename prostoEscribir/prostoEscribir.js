/*
prostoEscribir
Copyright (c) 2010-2012, ProstoKSI, http://www.prostoksi.com/
PROJECT HOME: http://github.com/frol/prostoEscribir
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY ProstoKSI ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL ProstoKSI BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
WYSIWYG-BBCODE editor
Copyright (c) 2009, Jitbit Sotware, http://www.jitbit.com/
PROJECT HOME: http://wysiwygbbcode.codeplex.com/
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Jitbit Software ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Jitbit Software BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function($){
    var isIE = /msie|MSIE/.test(navigator.userAgent);
    var isChrome = /Chrome/.test(navigator.userAgent);
    var isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
    var browser = isIE || window.opera;

    $.fn.prostoEscribir = function(options) {
        var obj = new Construct(this, options);
        obj.init();
        return obj;
    }

    function Construct(el, options) {
        this.options = $.extend({
            css_urls: [],
            lang: 'en', // en, ru
            toolbar: 'classic',
            path: ''
        }, options);
        this.$el = $(el);
    }

    Construct.prototype = {
        init: function() {
            this.editorVisible = false;
            this.enabledWYSIWYG = false;
            this.content = '';
            this.toolbar_buttons = new Array();

            this.textarea_id = this.$el.get(0).id;
            var prostoEscribir_id = 'prostoEscribir_' + this.textarea_id;

            this.$prostoEscribir = $('<div class="prostoEscribir" id="' + prostoEscribir_id + '"></div>');
            var $toolbar = $('<div class="toolbar"></div>');
            var $container = $('<div class="container"></div>');

            if (this.options.path == '') {
                path = '';
                $("script").each(function(i,s)
                {
                    if (s.src && s.src.match(/\/prostoEscribir\.js/))
                        path = s.src.replace(/prostoEscribir\.js(\?.*)?/, '');
                });
                this.options.path = path;
            }
            // load locale
            $('head').append($('<script type="text/javascript" src="' + this.options.path
                + 'langs/' + this.options.lang + '.js"></script>'));
            // load toolbar
            $('head').append($('<script type="text/javascript" src="' + this.options.path
                + 'toolbars/' + this.options.toolbar + '.js"></script>'));

            // build toolbar
            $.each(PETOOLBAR, function(name, args) {
                var $li = $('<li></li>');
                var $btn = $('<a title="' + args.title + '" class="imp_btn_' + args.name + '" href="#">&nbsp;</a>');
                if (typeof(args.func) === 'undefined')
                    $btn.click(function(e){ e.preventDefault(); this.exec(args.exec); }.bind2(this));
                else
                    $btn.click(function(e){ e.preventDefault(); this[args.func](e); }.bind2(this));
                $li.append($btn)
                $toolbar.append($li);
                this.toolbar_buttons.push({btn: $btn, hotkey: args.hotkey});
            }.bind2(this));

            // final steps of initialization editor block
            $container.html(this.$el.outerHTML());
            this.$prostoEscribir.html($toolbar);
            this.$prostoEscribir.append($container);
            this.$el.outerHTML(this.$prostoEscribir);
            this.initEditor();
        },

        initEditor: function(wysiwyg) {
            // Init iframe editor
            if(wysiwyg!=undefined)
                this.enabledWYSIWYG = wysiwyg;
            else
                this.enabledWYSIWYG = true;
            this.textbox_element = document.getElementById(this.textarea_id);
            this.textbox_element.setAttribute('class', 'prostoEscribirBBCODE');
            this.textbox_element.className = "prostoEscribirBBCODE";
            if (this.enabledWYSIWYG) {
                this.ifm = document.createElement("iframe");
                this.ifm.setAttribute("id", "rte_" + this.textarea_id);
                this.ifm.setAttribute("class", "prostoEscribirView");
                this.ifm.setAttribute("frameborder", "0");
                this.ifm.style.width = this.textbox_element.style.width;
                this.ifm.style.height = this.textbox_element.style.height;
                this.textbox_element.parentNode.insertBefore(this.ifm, this.textbox_element);
                this.textbox_element.style.display = 'none';
                if (this.ifm) {
                    this.showEditor();
                } else
                    setTimeout('this.showEditor()', 100);
            }
        },

        showEditor: function() {
            // Init iframe HTML and key bindings
            if (!this.enabledWYSIWYG) return;
            this.editorVisible = true;
            this.content = this.textbox_element.value;
            this.myeditor = this.ifm.contentWindow.document;
            this.bbcode2html();
            this.myeditor.designMode = "on";
            this.myeditor.open();
            this.myeditor.write('<html><head>');
            for (index in this.options.css_urls) {
                this.myeditor.write('<link href="' + this.options.css_urls[index]
                    + '" rel="stylesheet" type="text/css" />');
            }
            this.myeditor.write('</head>');
            this.myeditor.write('<body style="margin:0;padding:5px;" class="prostoEscribirWYSIWYG" id="' + this.textarea_id + '">');
            this.myeditor.write(this.content);
            this.myeditor.write('</body></html>');
            this.myeditor.close();
            if (this.myeditor.attachEvent) {
                if(parent.ProcessKeyPress)
                    this.myeditor.attachEvent("onkeydown", parent.ProcessKeyPress);
                this.myeditor.attachEvent("onkeypress", this.keypressed.bind2(this));
            }
            else if (this.myeditor.addEventListener) {
                if (parent.ProcessKeyPress)
                    this.myeditor.addEventListener("keydown", parent.ProcessKeyPress, true);
                this.myeditor.addEventListener("keypress", this.keypressed.bind2(this), true);
            }
        },

        toggle: function() {
            // Toggle iframe/textarea (HTML/BBcodes)
            if (this.editorVisible) {
                this.doCheck();
                this.ifm.style.display = 'none';
                this.textbox_element.style.display = '';
                this.editorVisible = false;
            }
            else {
                if (this.enabledWYSIWYG && this.ifm) {
                    this.ifm.style.display = '';
                    this.textbox_element.style.display = 'none';
                    this.showEditor();
                    this.editorVisible = true;
                }
            }
        },
 
        rep: function(re, str) {
            // Shortcut for regexp replace
            this.content = this.content.replace(re, str);
        },

        html2bbcode: function() {
            // Convert HTML to BBcodes

            // Cleanup pasted text from MS Word
            // Use [\s\S] instead of . (dot) because dot does not match \n \r
            this.rep(/<!--\[if [\s\S]+?<!(--)?\[endif\]-->/gi, "");
            this.rep(/<!--[\s\S]*?-->/gi, "");
            this.rep(/<![\s\S]*?>/gi, "");

            // Here is lots of hacks for different browsers...
            this.rep(/\[/gi,"&#91;");
            this.rep(/\]/gi,"&#93;");
            this.rep(/\<p\>&nbsp;\<\/p\>\r?\n?/gi, '<p></p>');
            this.rep(/<img\s[^<>]*?src=\"?([^<>]*?)\"?(\s[^<>]*)?\/?>/gi,"[img]$1[/img]");
            this.rep(/<\/(strong|b)>/gi, "[/b]");
            this.rep(/<(strong|b)(\s[^<>]*)?>/gi,"[b]");
            this.rep(/<\/(em|i)>/gi,"[/i]");
            this.rep(/<(em|i)(\s[^<>]*)?>/gi,"[i]");
            this.rep(/<\/u>/gi, "[/u]");
            this.rep(/[\n\r]/gi, " ");
            this.rep(/<u(\s[^<>]*)?>/gi, "[u]");
            
            // Firefox fix to prevent double linefeeds
            this.rep(/<p><\/p>/gi, "");
            // Chrome-Safari fix to prevent double linefeeds
            this.rep(/<(div|p)[^>]*><br(\s[^>]*)?>/gi, "<$1>");

            this.rep(/<br(\s[^<>]*)?>/gi,"\n");
            this.rep(/<center>/gi,"[center]");
            this.rep(/<\/center>/gi,"[/center]");
            
            // Chrome-Safari fix to prevent double linefeeds
            this.rep(/<\/div>\s*<div([^<>]*)>/gi, "</span>\n<span$1>");

            this.rep(/<div([^<>]*)>/gi,"\n<span$1>");
            this.rep(/<\/div>/gi,"</span>\n");
            this.rep(/&nbsp;/gi," ");
            this.rep(/&quot;/gi,"\"");
            this.rep(/&amp;/gi,"&");
            var sc, sc2;
            do {
                // Use [\s\S] instead of . (dot) because dot does not match \n \r
                sc = this.content;
                this.rep(/<font\s[^<>]*?color=\"?([^<>]*?)\"?(\s[^<>]*)?>([\s\S]*?)<\/font>/gi,"[color=$1]$3[/color]");
                if(sc==this.content)
                    this.rep(/<font[^<>]*>([\s\S]*?)<\/font>/gi,"$1");
                this.rep(/<a\s[^<>]*?href=\"?([^<>]*?)\"?(\s[^<>]*)?>([\s\S]*?)<\/a>/gi,"[url=$1]$3[/url]");
                sc2 = this.content;
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)font-weight: ?bold;?(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi,"<$1 style=$2$3>[b]$4[/b]</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)font-style: ?italic;?(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi,"<$1 style=$2$3>[i]$4[/i]</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)text-decoration: ?underline;?(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi,"<$1 style=$2$3>[u]$4[/u]</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)(font-weight|font-size|text-decoration): ?none;?(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi,"<$1 style=$2$4>$5</$1>");
                
                // TODO: make bbcode processing customizable. There is no color button now.
                //this.rep(/<(span|blockquote|pre|p)\s[^<>]*?style=\"?color: ?([^<>]*?);\"?\s*([\s\S]*?)\r?\n?<\/\1>/gi, "[color=$2]<$1 style=$3</$1>[/color]");
                
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)text-align: ?(left|justify);(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 style=$2$4>$5</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)text-align: ?right;(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 style=$2$3>[right]$4[/right]\n</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?style=(\"?)text-align: ?center;(\"?[^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 style=$2$3>[center]$4[/center]\n</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?align=\"?(left|justify)\"?([^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 $3>$4</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?align=\"?right\"?([^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 $2>[right]$3[/right]\n</$1>");
                this.rep(/<(span|blockquote|pre|p|ul|ol|li)\s[^<>]*?align=\"?center\"?([^>]*?)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 $2>[center]$3[/center]\n</$1>");

                // TODO: make bbcode processing customizable. There is no font button now.
                //this.rep(/<(span|blockquote|pre|p)\s[^<>]*?style=(\"?)font-family: ?([^<>]*?);(\"?\s*([\s\S]*?)<\/\1>/gi, "[font=$2]<$1 style=$3</$1>[/font]");

                this.rep(/<(blockquote|pre)\s[^<>]*?style=\"?\"? (class=|id=)([^<>]*)>([\s\S]*?)\r?\n?<\/\1>/gi, "<$1 $2$3>$4</$1>");
                this.rep(/<pre>([\s\S]*?)\r?\n?<\/pre>/gi, "[code]$1[/code]");
                this.rep(/<pre code=\"([^\"]+?)\">([\s\S]*?)\r?\n?<\/pre>/gi, "[code=$1]$2[/code]");
                this.rep(/<(span|p)\s[^<>]*?style=\"?\"?>([\s\S]*?)<\/\1>/gi, "$2");
            }while(sc!=this.content);
            this.rep(/<ul( [^>]*?)?>/gi, "[list]");
            this.rep(/<\/ul>/gi, "[/list]\n");
            this.rep(/<ol( [^>]*?)?>/gi, "[list]");
            this.rep(/<\/ol>/gi, "[/list]\n");
            this.rep(/<li( [^>]*?)?>/gi, "[*]");
            this.rep(/<\/li>/gi, "[/*]");

            this.rep(/<p(\s[^>]*)?>/gi,"");
            this.rep(/<\/p>/gi, "\n");
            this.rep(/<[^<>]*>/gi,"");
            this.rep(/&lt;/gi,"<");
            this.rep(/&gt;/gi,">");
            do {
                sc = this.content;
                this.rep(/\[(b|i|u)\]\[quote([^\]]*)\]([\s\S]*?)\[\/quote\]\[\/\1\]/gi, "[quote$2][$1]$3[/$1][/quote]");
                this.rep(/\[color=([^\]]*)\]\[quote([^\]]*)\]([\s\S]*?)\[\/quote\]\[\/color\]/gi, "[quote$2][color=$1]$3[/color][/quote]");
                this.rep(/\[(b|i|u)\]\[code\]([\s\S]*?)\[\/code\]\[\/\1\]/gi, "[code][$1]$2[/$1][/code]");
                this.rep(/\[color=([^\]]*)\]\[code\]([\s\S]*?)\[\/code\]\[\/color\]/gi, "[code][color=$1]$2[/color][/code]");
            }while(sc!=this.content)

            //clean up empty tags
            do {
                sc = this.content;
                this.rep(/\[b\]\[\/b\]/gi, "");
                this.rep(/\[i\]\[\/i\]/gi, "");
                this.rep(/\[u\]\[\/u\]/gi, "");
                this.rep(/\[quote[^\]]*\]\[\/quote\]/gi, "");
                this.rep(/\[code\]\[\/code\]/gi, "");
                this.rep(/\[url=([^\]]+)\]\[\/url\]/gi, "");
                this.rep(/\[img\]\[\/img\]/gi, "");
                this.rep(/\[color=([^\]]*)\]\[\/color\]/gi, "");
            }while(sc!=this.content)
            this.rep(/\[right\]\r?\n? ?\[center\]/gi,"[right]")
            this.rep(/\[center\]\r?\n? ?\[right\]/gi,"[center]")
            this.rep(/(\[\/(right|center)\]\r?\n? ?)+/gi,"$1")
        },

        bbcode2html: function() {
            // Convert BBcode to HTML
            // example: [b]Bold[/b] to <strong>Bold text</strong>
            this.rep(/[\s\r\n]+$/g, ""); //removing linebreaks at the end
            this.rep(/\</gi,"&lt;"); //removing html tags
            this.rep(/\>/gi,"&gt;");
            this.rep(/\[p\]/gi, "");
            this.rep(/\[\/p\]\r?\n?/gi, "\n");

            this.rep(/\[img\]([^\"]*?)\[\/img\]/gi,"<img src=\"$1\" />");
            this.rep(/\[right\]\r?\n?\s*\[center\]/gi,"[right]");
            this.rep(/\[center\]\r?\n?\s*\[right\]/gi,"[center]");
            if(browser) {
                this.rep(/\[b\]/gi,"<strong>");
                this.rep(/\[\/b\]/gi,"</strong>");
                this.rep(/\[i\]/gi,"<em>");
                this.rep(/\[\/i\]/gi,"</em>");
                this.rep(/\[u\]/gi,"<u>");
                this.rep(/\[\/u\]/gi,"</u>");
                this.rep(/\[\*\][\n\r\s]*\[center\]/gi,"<li align=\"center\">");
                this.rep(/\[\*\][\n\r\s]*\[right\]/gi,"<li align=\"right\">");
                this.rep(/\[list\][\n\r\s]*\[center\]/gi,"<ul align=\"center\">");
                this.rep(/\[list\][\n\r\s]*\[right\]/gi,"<ul align=\"right\">");
                this.rep(/\[center\]/gi,"<p align=\"center\">");
                this.rep(/\[right\]/gi,"<p align=\"right\">");
            } else {
                this.rep(/\[b\]/gi,"<span style=\"font-weight: bold;\">");
                this.rep(/\[i\]/gi,"<span style=\"font-style: italic;\">");
                this.rep(/\[u\]/gi,"<span style=\"text-decoration: underline;\">");
                this.rep(/\[\/(b|i|u)\]/gi,"</span>");
                this.rep(/\[\*\][\n\r\s]*\[center\]/gi,"<li style=\"text-align: center;\">");
                this.rep(/\[\*\][\n\r\s]*\[right\]/gi,"<li style=\"text-align: right;\">");
                this.rep(/\[list\][\n\r\s]*\[center\]/gi,"<ul style=\"text-align: center;\">");
                this.rep(/\[list\][\n\r\s]*\[right\]/gi,"<ul style=\"text-align: right;\">");
                this.rep(/\[center\]/gi,"<p style=\"text-align: center;\">");
                this.rep(/\[right\]/gi,"<p style=\"text-align: right;\">");
            }
            this.rep(/\[\/(center|right)\][\n\r\s]*\[\/\*\]/gi,"</li>");
            this.rep(/\[\/(center|right)\][\n\r\s]*\[\/list\]/gi,"</ul>");
            this.rep(/(\[\/(right|center)\]\r?\n? ?)+/gi,"</p>")
            this.rep(/\r?\n?\[list\]/gi, "\n<ul>");
            this.rep(/\[\/list\]\r?\n?/gi, "</ul>");
            this.rep(/\[\*\]/gi, "<li>");
            this.rep(/\[\/\*\]/gi, "</li>");

            var content_length = this.content.length;
            var old_content_length;
            do {
                old_content_length = content_length;
                this.rep(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,"<a href=\"$1\">$2</a>");
                this.rep(/\[url\]([\s\S]*?)\[\/url\]/gi,"<a href=\"$1\">$1</a>");
                if(browser) {
                    this.rep(/\[color=([^\]]*?)\]([\s\S]*?)\[\/color\]/gi, "<font color=\"$1\">$2</font>");
                    this.rep(/\[font=([^\]]*?)\]([\s\S]*?)\[\/font\]/gi, "<font face=\"$1\">$2</font>");
                } else {
                    this.rep(/\[color=([^\]]*?)\]([\s\S]*?)\[\/color\]/gi, "<span style=\"color: $1;\">$2</span>");
                    this.rep(/\[font=([^\]]*?)\]([\s\S]*?)\[\/font\]/gi, "<span style=\"font-family: $1;\">$2</span>");
                }
                this.rep(/\[code=([^\]]+?)\]([\s\S]*?)\[\/code\]/gi,"<pre code=\"$1\">$2</pre>&nbsp;");
                this.rep(/\[code\]([\s\S]*?)\[\/code\]/gi,"<pre>$1</pre>&nbsp;");
                content_length = this.content.length;
            } while(old_content_length!=content_length);

            // Parse paragraphs. ul and p are already in content, so we must NOT create paragraps there,
            // because it will be converted into double line breaks.
            var sc = Array();
            var tmp_content = '';
            var closing_tag;
            var openned_block = 0;
            var tag, last_open_tag;
            for (var i = 0; i < content_length; ++i) {
                if (this.content.charAt(i) == '\n') {
                    if (openned_block <= 0) {
                        if ($.trim(tmp_content) == '') {
                            sc.push('<p><br></p>');
                        } else {
                            sc.push('<p>' + tmp_content + '</p>');
                            tmp_content = '';
                        }
                    }
                } else if (this.content.charAt(i) == '<') {
                    tmp_content += '<';
                    closing_tag = false;
                    if (this.content.charAt(i+1) == '/') {
                        tmp_content += '/';
                        ++i;
                        closing_tag = true;
                    }
                    tag = null;
                    if (this.content.substr(i+1, 2) == 'ul') {
                        var next_ch = this.content.charAt(i+3);
                        if (next_ch == '>' || next_ch == ' ')
                            tag = 'ul';
                    } else if (this.content.charAt(i+1) == 'p') {
                        var next_ch = this.content.charAt(i+2);
                        if (next_ch == '>' || next_ch == ' ')
                            tag = 'p';
                    }
                    if (tag) {
                        i += tag.length;
                        tmp_content += tag;
                        if (closing_tag) {
                            --openned_block;
                            if (openned_block == 0) {
                                tmp_content += '>';
                                ++i;
                                if (tag == 'p') {
                                    sc.push(tmp_content);
                                    var ch = this.content.charAt(i+1);
                                    while (ch == ' ' || ch == '\t') {
                                        ++i;
                                        var ch = this.content.charAt(i + 1);
                                    }
                                } else {
                                    sc.push('<p>' + tmp_content + '</p>');
                                }
                                tmp_content = '';
                            }
                        }
                        else
                            ++openned_block;
                    }
                } else
                    tmp_content += this.content.charAt(i);
            }
            if (tmp_content != '') {
                sc.push('<p>' + tmp_content + '</p>');
            }
            this.content = sc.join('');

            // TODO: make this optional
            /*
            // Leading spaces in line must be saved, so converting they into &nbsp;
            this.rep(/(^|>)(\s+)/g, function(full, first, second) {
                // replace with &nbsp; so match as spaces replaces
                return first + new Array(second.length + 1).join('&nbsp;');
            });
            */
        },

        stopEvent: function(evt) {
            evt || window.event;
            if (evt.stopPropagation){ evt.stopPropagation();
                evt.preventDefault();
            }else if(typeof evt.cancelBubble != "undefined"){
                evt.cancelBubble = true;
                evt.returnValue = false;
            }
            return false;
        },

        doQuote: function() {
            if (editorVisible) { this.ifm.contentWindow.focus();
                if (isIE) {
                    var textRange = this.ifm.contentWindow.document.selection.createRange();
                    var newTxt = "[quote=]" + textRange.text + "[/quote]";
                    textRange.text = newTxt;
                }
                else {
                    var edittext = this.ifm.contentWindow.getSelection().getRangeAt(0);
                    var original = edittext.toString();
                    edittext.deleteContents();
                    edittext.insertNode(document.createTextNode("[quote=]" + original + "[/quote]"));
                }
            }
            else {
                this.addTag('[quote=]', '[/quote]');
            }
        },

        keypressed: function(e){
            // process keypressing in iframe. Fix IE enter and process hotkeys
            if(isIE)
                var key = e.keyCode;
            else
                var key = e.which;
            if(key == 13) {
                if(isIE) {
                    var r = this.myeditor.selection.createRange();
                    if ((r.parentElement().tagName.toLowerCase() != "li") &&
                        (r.parentElement().tagName.toLowerCase() != "p")) {
                        r.pasteHTML('<br/>');
                        if (r.move('character'))
                            r.move('character', -1);
                        r.select();
                        this.stopEvent(e);
                        return false;
                    }
                }
            }
            // check is any hotkey pressed
            for (btn_index in this.toolbar_buttons) {
                var toolbar_btn = this.toolbar_buttons[btn_index];
                if (typeof(toolbar_btn.hotkey) != 'undefined' && toolbar_btn.hotkey(e, key)) {
                    toolbar_btn.btn.click();
                    this.stopEvent(e);
                    return false;
                }
            }
        },
        
        exec: function(command) {
            // Exec built-in browser formating commands or add bbcode tags if
            // textarea activated.
            if (this.editorVisible) {
                this.ifm.contentWindow.focus();
                if (command == 'InsertParagraph')
                    this.myeditor.execCommand('FormatBlock', false, "p");
                else
                    this.myeditor.execCommand(command, false, null);
            }
            else {
                switch (command) {
                    case 'bold':
                        this.addTag('[b]', '[/b]'); break;
                    case 'italic':
                        this.addTag('[i]', '[/i]'); break;
                    case 'underline':
                        this.addTag('[u]', '[/u]'); break;
                    case 'InsertUnorderedList':
                        this.addTag('[list][*]', '[/*][/list]'); break;
                }
            }
        },

        link: function() {
            // Insert link
            if (this.editorVisible) {
                this.ifm.contentWindow.focus();
                var mylink = prompt("Enter a URL:", "http://");
                if ((mylink != null) && (mylink != "")) {
                    if (isIE) { //IE
                        var range = this.ifm.contentWindow.document.selection.createRange();
                        if (range.text == '') {
                            range.pasteHTML("<a href='" + mylink + "'>" + mylink + "</a>");
                        }
                        else
                            this.myeditor.execCommand("CreateLink", false, mylink);
                    }
                    else if (window.getSelection) { //FF
                        var userSelection = this.ifm.contentWindow.getSelection().getRangeAt(0);
                        if(userSelection.toString().length==0)
                            this.myeditor.execCommand('inserthtml', false,
                                "<a href='" + mylink + "'>" + mylink + "</a>");
                        else
                            this.myeditor.execCommand("CreateLink", false, mylink);
                    }
                    else
                        this.myeditor.execCommand("CreateLink", false, mylink);
                }
            }
            else {
                this.addTag('[url=',']click here[/url]');
            }
        },

        image: function() {
            // Insert image
            if (this.editorVisible) {
                this.ifm.contentWindow.focus();
                myimg = prompt('Enter Image URL:', 'http://');
                if ((myimg != null) && (myimg != "")) {
                    this.myeditor.execCommand('InsertImage', false, myimg);
                }
            }
            else {
                this.addTag('[img]', '[/img]');
            }
        },

        insertHtml: function(html) {
            this.ifm.contentWindow.focus();
            if (isIE)
                this.ifm.contentWindow.document.selection.createRange().pasteHTML(html);
            else
                this.myeditor.execCommand('inserthtml', false, html);
        },

        // textarea-mode functions
        mozillaInsertText: function(element, text, pos) {
            element.value = element.value.slice(0, pos) + text + element.value.slice(pos);
        },

        addTag: function(t1, t2) {
            var element = textboxelement;
            if (isIE) {
                if (document.selection) {
                    element.focus();

                    var txt = element.value;
                    var str = document.selection.createRange();

                    if (str.text == "") {
                        str.text = t1 + t2;
                    }
                    else if (txt.indexOf(str.text) >= 0) {
                        str.text = t1 + str.text + t2;
                    }
                    else {
                        element.value = txt + t1 + t2;
                    }
                    str.select();
                }
            }
            else if (typeof(element.selectionStart) != 'undefined') {
                var sel_start = element.selectionStart;
                var sel_end = element.selectionEnd;
                this.mozillaInsertText(element, t1, sel_start);
                this.mozillaInsertText(element, t2, sel_end + t1.length);
                element.selectionStart = sel_start;
                element.selectionEnd = sel_end + t1.length + t2.length;
                element.focus();
            }
            else {
                element.value = element.value + t1 + t2;
            }
        },

        doCheck: function() {
            // Useful function for call at form submit event for sync iframe
            // content to textarea, which one will send at sumbit.
            // Example:
            //      $('#book_form').submit(function() {
            //          bbeditor.doCheck();
            //      });
            if (!this.editorVisible) {
                this.showEditor();
            }
            this.content = this.myeditor.body.innerHTML;
            this.html2bbcode();
            this.textbox_element.value = this.content;
        },

        focus: function() {
            var iframe_editor = this.$prostoEscribir.find('iframe')
            iframe_editor.focus();
            iframe_editor.contents().find('body').focus();
        },

        disable: function() {
            this.$prostoEscribir.outerHTML($(this.textbox_element).outerHTML());
        }
        //,

        /*
        Not tested implementations of extra features: colors, smiles, youtube

        color: function(color) {
            this.ifm.contentWindow.focus();
            if (isIE) {
                var textRange = this.ifm.contentWindow.document.selection.createRange();
                textRange.select();
            }
            this.myeditor.execCommand('forecolor', false, color);
        },

        insertSmile: function(txt) {
            this.insertText(txt);
            document.getElementById('divSmilies').style.display = 'none';
        },

        insertYoutube: function() {
            this.insertText("http://www.youtube.com/watch?v=XXXXXXXXXXX");
        },

        insertText: function(txt) {
            if (this.editorVisible)
                this.insertHtml(txt);
            else
                this.textbox_element.value += txt;
        },

        //=======color picker
        getScrollY: function() {
            var scrOfX = 0, scrOfY = 0; if (typeof (window.pageYOffset) == 'number') { scrOfY = window.pageYOffset; scrOfX = window.pageXOffset; } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) { scrOfY = document.body.scrollTop; scrOfX = document.body.scrollLeft; } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) { scrOfY = document.documentElement.scrollTop; scrOfX = document.documentElement.scrollLeft; } return scrOfY;
        }

        // XXX: move to init?
        // document.write("<style type='text/css'>.colorpicker201{visibility:hidden;display:none;position:absolute;background:#FFF;z-index:999;filter:progid:DXImageTransform.Microsoft.Shadow(color=#D0D0D0,direction=135);}.o5582brd{padding:0;width:12px;height:14px;border-bottom:solid 1px #DFDFDF;border-right:solid 1px #DFDFDF;}a.o5582n66,.o5582n66,.o5582n66a{font-family:arial,tahoma,sans-serif;text-decoration:underline;font-size:9px;color:#666;border:none;}.o5582n66,.o5582n66a{text-align:center;text-decoration:none;}a:hover.o5582n66{text-decoration:none;color:#FFA500;cursor:pointer;}.a01p3{padding:1px 4px 1px 2px;background:whitesmoke;border:solid 1px #DFDFDF;}</style>");

        getTop2: function() {
            csBrHt = 0; if (typeof (window.innerWidth) == 'number') { csBrHt = window.innerHeight; } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) { csBrHt = document.documentElement.clientHeight; } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) { csBrHt = document.body.clientHeight; } ctop = ((csBrHt / 2) - 115) + getScrollY(); return ctop;
        }
        
        // XXX: move to init?
        //var nocol1 = "&#78;&#79;&#32;&#67;&#79;&#76;&#79;&#82;",
        //clos1 = "X";

        getLeft2: function() {
            var csBrWt = 0; if (typeof (window.innerWidth) == 'number') { csBrWt = window.innerWidth; } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) { csBrWt = document.documentElement.clientWidth; } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) { csBrWt = document.body.clientWidth; } cleft = (csBrWt / 2) - 125; return cleft;
        }

        //function setCCbldID2(val, textBoxID) { document.getElementById(textBoxID).value = val; }
        setCCbldID2: function(val) {
            if (editorVisible) doColor(val); else addTag('[color=' + val + ']', '[/color]');
        }

        setCCbldSty2: function(objID, prop, val) {
            switch (prop) {
                case "bc": if (objID != 'none') { document.getElementById(objID).style.backgroundColor = val; }; break;
                case "vs": document.getElementById(objID).style.visibility = val; break;
                case "ds": document.getElementById(objID).style.display = val; break;
                case "tp": document.getElementById(objID).style.top = val; break;
                case "lf": document.getElementById(objID).style.left = val; break;
            }
        }

        putOBJxColor2: function(Samp, pigMent, textBoxId) {
            if (pigMent != 'x') { setCCbldID2(pigMent, textBoxId); setCCbldSty2(Samp, 'bc', pigMent); } setCCbldSty2('colorpicker201', 'vs', 'hidden'); setCCbldSty2('colorpicker201', 'ds', 'none');
        }

        showColorGrid2: function(Sam, textBoxId) {
            var objX = new Array('00', '33', '66', '99', 'CC', 'FF');
            var c = 0;
            var xl = '"' + Sam + '","x", "' + textBoxId + '"'; var mid = '';
            mid += '<table bgcolor="#FFFFFF" border="0" cellpadding="0" cellspacing="0" style="border:solid 0px #F0F0F0;padding:2px;"><tr>';
            mid += "<td colspan='9' align='left' style='margin:0;padding:2px;height:12px;' ><input class='o5582n66' type='text' size='12' id='o5582n66' value='#FFFFFF'><input class='o5582n66a' type='text' size='2' style='width:14px;' id='o5582n66a' onclick='javascript:alert(\"click on selected swatch below...\");' value='' style='border:solid 1px #666;'></td><td colspan='9' align='right'><a class='o5582n66' href='javascript:onclick=putOBJxColor2(" + xl + ")'><span class='a01p3'>" + clos1 + "</span></a></td></tr><tr>";
            var br = 1;
            for (o = 0; o < 6; o++) {
                mid += '</tr><tr>';
                for (y = 0; y < 6; y++) {
                    if (y == 3) { mid += '</tr><tr>'; }
                    for (x = 0; x < 6; x++) {
                        var grid = '';
                        grid = objX[o] + objX[y] + objX[x];
                        var b = "'" + Sam + "','" + grid + "', '" + textBoxId + "'";
                        mid += '<td class="o5582brd" style="background-color:#' + grid + '"><a class="o5582n66"  href="javascript:onclick=putOBJxColor2(' + b + ');" onmouseover=javascript:document.getElementById("o5582n66").value="#' + grid + '";javascript:document.getElementById("o5582n66a").style.backgroundColor="#' + grid + '";  title="#' + grid + '"><div style="width:12px;height:14px;"></div></a></td>';
                        c++;
                    }
                }
            }
            mid += "</tr></table>";
            //var ttop=getTop2();
            //setCCbldSty2('colorpicker201','tp',ttop);
            //document.getElementById('colorpicker201').style.left=getLeft2();
            document.getElementById('colorpicker201').innerHTML = mid;
            setCCbldSty2('colorpicker201', 'vs', 'visible');
            setCCbldSty2('colorpicker201', 'ds', 'inline');
        }
        */
    }
    
    // bind2
    Function.prototype.bind2 = function(object) {
        var method = this; var oldArguments = $.makeArray(arguments).slice(1);
        return function (argument) {
            if (argument == new Object) { method = null; oldArguments = null; }
            else if (method == null) throw "Attempt to invoke destructed method reference.";
            else { var newArguments = $.makeArray(arguments); return method.apply(object, oldArguments.concat(newArguments)); }
        };
    };
})(jQuery);

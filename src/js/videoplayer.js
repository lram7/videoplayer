/*!
 *vedioPlayer.js
 *HTML5 <video> player
 *
 *chreate a javascript Object that mimics html5 Media API
 *can play MP4,Ogg,WebM
 *
 *License:MIT
 *
 */
(function(root, $, factory) {
    //set up videoplayer appropriately for the enviroment.
    if (typeof define === 'function' && (define.cmd || define.amd)) {
        define(function() {
            return factory();
        });
    } else {
        //as a browser global
        root.videoPlayer = factory();
    }
})(window, $, function() {
    // body...

    //video player manage
    var videoPlayer = function() {
        this.videos = [];
    };

    $.extend(videoPlayer.prototype, {}, {
        init: function() {

        },
        //add player push videos
        add: function(playerId, params) {
            var index = this.videos.length;
            var video = new Video(playerId, params, index, this);
            this.videos.push(video);

            return video;
        }

    });
    //video object
    var Video = function(playerId, params, index, parent) {
            this.index = index;
            this._parent = parent;
            this.placeholder = $('#' + playerId);
            this.src = '';
            this.params = $.extend({
                setSource: null,
                autoPlay: false,
                continuousPlay: false,
                virtualFullScreen: true,
                muted: false,
                width: 853,
                height: 480
            }, params);
            this.init();
        }
        //init video
    $.extend(Video.prototype, {}, {
        init: function() {
            this.render();
            this.renderSource();
            this.controlsInit();
            this.events()
        },
        render: function() {
            this.$warp=$('<div id="mod_yvideo_player_${index}"></div></div>'.replace(/\${.*\}/i, this.index));
            this.$el=$('<div class="yvp_container"></div>');

            this.placeholder.html(this.$warp);
            this.$el.appendTo(this.$warp);
            this.$warp.height(this.params.height)
            this.$warp.width(this.params.width)
        },
        events: function() {
            var __ = this;
            this.$video.on('stalled', function() {
                console.log('----- onstalled', __.index)
            }).on('waiting', function() {
                console.log('---- waiting', __.index)
            }).on('loadeddata', function() {
                console.log('----- loadeddata', __.index)
            }).on('playing', function() {
                console.log('----- playing', __.index)
            }).on('seeking', function() {
                //快进 寻找
                console.log('----  seeking', __.index)
            }).on('suspend', function() {
                console.log('----  suspend', __.index)
            }).on('seeked', function() {
                //寻找完成
                console.log('----  seeked', __.index)
            }).on('error', function(e) {
                console.log('error', e, __.$video[0].readyState, __.$video[0].error)

            })
        }
    });

    //get can play file type
    $.extend(Video.prototype, {
        videoType: ['video/mp4; codecs="avc1.42E01E"', 'video/ogg; codecs="theora"', 'video/webm; codecs="vp8, vorbis"'],
        getCanPlayType: function() {
            var myvideo = document.createElement('video');
            var playMsg, videotype;
            if (myvideo.canPlayType) {
                videotype = this.videoType[0];
                playMsg = myvideo.canPlayType(videotype);
                if ('' != playMsg) {
                    return this._slideType(videotype)
                }

                videotype = this.videoType[1];
                playMsg = myvideo.canPlayType(videotype);
                if ('' != playMsg) {
                    return this._slideType(videotype)
                }

                videotype = this.videoType[2];
                playMsg = myvideo.canPlayType(videotype);
                if ('' != playMsg) {
                    return this._slideType(videotype)
                }
            } else {
                return false;
            }
        },
        _slideType: function(str) {
            return /\/(.*);/i.exec(str)[1]
        }
    });
    //render Video srource
    $.extend(Video.prototype, {
        renderSource: function() {
            var setSource = this.params.setSource;
            if (!setSource) {
                this._sourceEmpty();
                return;
            }
            var canType = this.getCanPlayType();

            if (!canType) {
                this._contSuppotVideo();
                return;
            }

            var src = setSource(canType);
            this._renderVideo(src);
            this._videoControl()
        },
        //when source is empty
        _sourceEmpty: function() {

        },
        //when browse not support video
        _contSuppotVideo: function() {

        },
        //render video element and set $video oubject
        _renderVideo: function(src) {
            var video = $('<div class="yvp_video"><video width="100%" height="100%" _preload="none" x-webkit-airplay="true" src="${videosrc}"></video></div>'.replace(/\${.*\}/i, src));
            this.$el.append(video);
            this.$video = video.find('video');
        },
        _videoControl: function() {
            var params = this.params;
            if (params.autoPlay) {
                this.$video[0].play();
            }
        }
    });

    //controls bar
    $.extend(Video.prototype, {
        $_control: '',
        controlsInit: function() {

            this.renderControls();
            this.playRender();
            this.nextRender()
            this.fullScreenRender();
            this.mutedRender();
            this.progressRender();
            this.continueInit();
        },
        renderControls: function() {
            var controlswarp = $('<div class="yvp_controls"></div>');
            this.$el.append(controlswarp);
            this.$_control = controlswarp;

        },
        renderDefProgress: function() {
            var defProg = $('<div class="yvp_progress yvp_progress_status"></div>');
            this.$el.append(defProg);
        }
    });

    //play control
    $.extend(Video.prototype, {
        $_playbtn: '',
        $_playFullBtn: '',
        playRender: function() {
            var playpause = $('<div class="yvp_button yvp_play_pause">\
                    <div class="yvp_button_under"></div>\
                    <button type="button" title="播放/暂停">\
                        <span class="yvp_btn_val">\
                        </span>\
                    </button>\
                </div>');
            this.$_control.append(playpause);
            var fullPlay = $('<a href="javascript:;" class="yvp_overlay_play">\
                <span class="yvp_button_play"></a>\
            </div>');
            this.$el.append(fullPlay);
            //cache button element
            this.$_playbtn = playpause;
            this.$_playFullBtn = fullPlay;

            this._playControl()
        },
        _playControl: function() {
            var __ = this,
                video = this.$video;
            //when video is paused
            video.on('pause', function() {
                __._playChangeStatus();
            });
            video.on('play', function() {
                __._playChangeStatus();
            })

            var playcontrol = function() {
                if (video[0].paused) {
                    video[0].play();
                } else {
                    video[0].pause();
                }
                // __._playChangeStatus();
            };
            //trigger events
            this.$_playbtn.on('click', 'button', function() {
                playcontrol();
            })
            this.$_playFullBtn.on('click', function() {
                playcontrol()
            });
            this._playChangeStatus();
        },
        _playChangeStatus: function() {
            var video = this.$video;
            if (video[0].paused) {
                this._play_playicon();
                this.$_playFullBtn.show();
            } else {
                this._play_puaseicon();
                this.$_playFullBtn.hide();
            }


        },
        _play_playicon: function() {
            var icon = this.$_playbtn.find('.yvp_btn_val');
            icon.html('<em class="yvphicon yvphicon-play"></em>');
        },
        _play_puaseicon: function() {
            var icon = this.$_playbtn.find('.yvp_btn_val');
            icon.html('<em class="yvphicon yvphicon-pause"></em>');
        }
    });

    //next control
    $.extend(Video.prototype, {
        nextRender: function() {
            var nextObj = $('<div class="yvp_button yvp_next">\
                    <div class="yvp_button_under"></div>\
                    <button type="button" title="next">\
                        <span class="yvp_btn_val">\
                            <em class="yvphicon yvphicon-next"></em>\
                        </span>\
                    </button>\
                </div>');
            this.$_control.append(nextObj);
        },
        _nextControl: function() {

        }
    });

    //fullScreen control

    $.extend(Video.prototype, {
        $_fullscreen: '',
        _isFullScreen: false,
        fullScreenRender: function() {
            var fullScreenObj = $('<div class="yvp_button yvp_fullscreen">\
                    <div class="yvp_button_under"></div>\
                    <button type="button" title="full_screen">\
                        <span class="yvp_btn_val">\
                            <em class="yvphicon yvphicon-fullscreen"></em>\
                        </span>\
                    </button>\
                </div>');
            this.$_control.append(fullScreenObj);
            this.$_fullscreen = fullScreenObj;
            this._fullScreenControl()
        },
        _fullScreenControl: function() {
            var __ = this;
            var params = this.params;

            var fullScreen =  new virtualFullScreen(__);

            this.$_fullscreen.on('click', 'button', function() {

                if (params.virtualFullScreen) {
                    __._isFullScreen = !__._isFullScreen;
                    if (__._isFullScreen) {

                        __._fullscreen_nfullicon();
                    } else {

                        __._fullscreen_toFull();
                    }

                } else {
                    //default fullscreen
                    __._fullscreen_defaultFull();
                }
            });


        },
        _fullscreen_nfullicon: function() {

        },
        _fullscreen_fullicon: function() {

        },
        _fullscreen_toFull: function() {
            var __ = this;
            // if()
        },
        _fullscreen_cancel: function() {

        },
        _fullscreen_defaultFull:function(){
            var video = document.createElement("video");
            if(video.mozRequestFullScreen){
                return function(){
                    var __=this;
                    __.$video[0].mozRequestFullScreen();
                }
            }else if(video.webkitEnterFullScreen){
                return function(){
                    var __=this;
                    __.$video[0].webkitEnterFullScreen();
                }
            }else{
                return function(){
                    alert('can not enter fullscreen');
                }
            }
        }()

    });

    //muted control
    $.extend(Video.prototype, {
        $_muted: '',
        $_muted_bar: '',
        $_muted_flag: '',
        mutedRender: function() {
            var __ = this;
            var mutedObj = $('<div class="yvp_button yvp_muted">\
                    <div class="yvp_button_under"></div>\
                    <div class="yvp_muted_warp">\
                            <div class="muted_barwarp">\
                                <div class="muted_arrow_b">\
                                    <span class="yvp_muted_tbg"></span>\
                                </div>\
                                <div class="muted_arrow_b muted_arrow_u" node-type="volum_flag">\
                                    <span class="yvp_muted_tbg"></span>\
                                </div>\
                                <a href="javascript:;" class="muted_ribtn" node-type="volum_cbar"></a>\
                            </div>\
                        </div>\
                    <button type="button" title="muted">\
                        <span class="yvp_btn_val">\
                            <em class="yvphicon yvphicon-muted"></em>\
                        </span>\
                    </button>\
                </div>');
            __.$_control.append(mutedObj);
            __.$_muted = mutedObj;
            __.$_muted_bar = mutedObj.find('a[node-type="volum_cbar"]');
            __.$_muted_flag = mutedObj.find('div[node-type="volum_flag"]')
            __.$volumHeight = mutedObj.find('.muted_barwarp').height();
            __._mutedControl()
        },
        _mutedControl: function() {
            var __ = this,
                video = __.$video;
            var params = __.params;
            this.$_muted.on('mousemove', function() {
                __.$_muted.addClass('yvp_muted_over');
            }).on('mouseout', function() {
                __.$_muted.removeClass('yvp_muted_over');
            });
            this.$_muted.find('.yvp_btn_val').on('click', function() {
                if (video[0].muted == true) {
                    video[0].muted = false
                } else {
                    video[0].muted = true
                }
                __._mutedSet();
            })

            video.on('volumechange', function() {
                if (video[0].muted) {
                    __._mutedunSet();
                } else {
                    __._mutedSet();
                    __._muted_setVolum()
                }
            }).on('loadedmetadata', function() {
                __._muted_setVolum();
            });
            //control volume
            var mutedBar = new mouseMove(__.$_muted_bar, function(nx, ny, oldLT) {
                __._mutedVolume(nx, ny, oldLT);
            });

            //set define
            video[0].muted = params.muted;
        },
        //set muted value for muted or not muted
        _mutedSet: function() {
            var __ = this;
            var icon = __.$_muted.find('.yvp_btn_val');
            icon.html('<em class="yvphicon yvphicon-muted"></em>');
            icon.find('.yvphicon').css({
                'color': '#fff'
            })
        },
        _mutedunSet: function() {
            var __ = this;
            var icon = __.$_muted.find('.yvp_btn_val');
            icon.html('<em class="yvphicon yvphicon-nomuted"></em>');
            icon.find('.yvphicon').css({
                'color': '#aaa'
            })
        },
        _muted_setVolum: function() {
            var __ = this;
            var hei = __.$volumHeight;
            var volum = __.$video[0].volume;
            var percent = 1 - volum;
            var Postop = hei * volum;

            this.$_muted_bar.css({
                'bottom': Postop
            });
            this.$_muted_flag.css({
                "height": percent * 100 + '%'
            });
        },
        //set volume value
        _mutedVolume: function(nx, ny, oldLT) {
            var __ = this;
            var hei = __.$volumHeight;
            var newTop = oldLT.bottom - ny;

            if (newTop > hei) newTop = hei;
            if (newTop < 0) newTop = 0;
            this.$video[0].volume = newTop / hei;


        }
    })

    //progress control
    $.extend(Video.prototype, {
        $_progress: '',
        $_progressBtn: '',
        progressRender: function() {
            var progressObj = $('<div class="yvp_prograss_wrap">\
                    <div class="yvp_progress">\
                        <span class="yvp_time_panel yvp_time_panel_curr" node-type="curr-time"></span>\
                        <span class="yvp_time_panel yvp_time_panel_total" node-type="total-time"></span>\
                        <span class="yvp_time_total" node-node="prog-rail">\
                            <span class="yvp_time_loaded" node-type="buffer"></span>\
                            <span class="yvp_time_current" node-type="progress-bar">\
                                <a href="javascript:;" class="yvp_time_handle" node-type="progpress-btn"></a>\
                            </span>\
                        </span>\
                        <span class="yvp_contplay" node-type="contp-lay">\
                            <span class="yvp_icon checkbox"></span>\
                            <span class="yvp_icon checkflag"></span>\
                            <b>连播</b>\
                        </span>\
                    </div>\
                </div>');
            this.$_control.append(progressObj);
            this.$_progress = progressObj;
            this.$_progressBtn = progressObj.find('a[node-type="progpress-btn"]');
            this._progressControl();
        },
        _progressControl: function() {
            var __ = this,
                video = this.$video;
            video.on('timeupdate', function() {
                __._updataCurrentTime(__._formateTime(video[0].currentTime));
                __._updataPlayProgress(video[0].currentTime);

            })

            video.on('loadedmetadata', function() {
                __._updataTotalTime(__._formateTime(video[0].duration));
            })
            //progress downloading the media
            video.on('progress', function() {
                var timeRange = video[0].buffered;
                if (timeRange.length == 1) {
                    __._updataBufferProgress(timeRange.start(0), timeRange.end(0));
                }

            })
            //when video start play
            video.on('play', function() {
                console.log('played')
            })

            video.on('pause', function() {
                console.log('---pause')

            })
            //progress button slide
            var mousemove = new mouseMove(this.$_progressBtn, function(lx, ly, oldLT) {
                __._progressBtnControl(lx, ly, oldLT);
            });
            mousemove.mouseup(function() {
                // __.$video[0].play()
            });

            this._updataCurrentTime(__._formateTime(video[0].currentTime));
            this._updataTotalTime(__._formateTime(video[0].duration));
            //this._progressBtnControl();
        },
        //formate time exampla 1:05:54
        _formateTime: function(time) {
            var second = Math.ceil(time);
            return [second / 3600 | 0, second / 60 % 60 | 0, second % 60 | 0].join(":")
                .replace(/\b(\d)\b/g, "0$1").replace(/^0{1,2}\:*/, '')
        },
        //updata current time value
        _updataCurrentTime: function(time) {
            this.$_currTimeNode || (this.$_currTimeNode = this.$_progress.find('span[node-type="curr-time"]'));
            this.$_currTimeNode.text(time);
        },
        //updata total time value
        _updataTotalTime: function(time) {
            this.$_totalTimeNode || (this.$_totalTimeNode = this.$_progress.find('span[node-type="total-time"]'));
            this.$_totalTimeNode.text(time);
        },
        //updata buffer bar width
        _updataBufferProgress: function(start, end) {
            this.$_totalBuffer || (this.$_totalBuffer = this.$_progress.find('span[node-type="buffer"]'));
            var video = this.$video;
            var persent = end / video[0].duration * 100;
            this.$_totalBuffer.width(persent + '%');
        },
        //updata current play probress bar width
        _updataPlayProgress: function(second) {
            this.$_playProgress || (this.$_playProgress = this.$_progress.find('span[node-type="progress-bar"]'));
            this.$_progRailObj || (this.$_progRailObj = this.$_progress.find('span[node-node="prog-rail"]'));

            var video = this.$video;
            var persent = second / video[0].duration;
            this.$_playProgress.width(persent * 100 + '%');
            this.$_progressBtn.css({
                left: this.$_progRailObj.width() * persent
            });
        },
        //control progress button
        _progressBtnControl: function(lx, ly, oldLT) {
            this.$_progRailObj || (this.$_progRailObj = this.$_progress.find('span[node-node="prog-rail"]'));
            var video = this.$video;
            var totalWidth = this.$_progRailObj.width();
            var proBtn = this.$_progressBtn;
            var newLeft = oldLT.left + lx;

            if (newLeft < 0) newLeft = 0;
            if (newLeft > totalWidth) newLeft = totalWidth;
            proBtn.css({
                left: newLeft
            });
            var currtime = newLeft / totalWidth * video[0].duration;
            //video[0].pause();
            video[0].currentTime = currtime;

            this._updataCurrentTime(this._formateTime(currtime));
            this._updataPlayProgress(currtime);

        }
    });

    //continues play
    $.extend(Video.prototype, {
        $_continuePlay: '',
        continueInit: function() {
            this.$_continuePlay = this.$_progress.find('span[node-type="contp-lay"]');
            this._continueEvents();
        },
        _continueEvents: function() {
            var __ = this;
            this.$_continuePlay.on('click', function() {
                console.log('======= conplay')
                var params = __.params;
                params.continuousPlay = !params.continuousPlay;
                __._continueControl();
            });
            __._continueControl()
        },
        _continueControl: function() {
            if (this.params.continuousPlay) {
                this._continueSelect()
            } else {
                this._continueUnSelect()
            }
        },
        _continueSelect: function() {
            this.$_continuePlay.addClass('yvp_contplay_check');
        },
        _continueUnSelect: function() {
            this.$_continuePlay.removeClass('yvp_contplay_check');
        }
    });

    //mousemove class
    var $dcmen = $(document);
    var mouseMove = function(targetObj, callback) {
        this.target = targetObj;
        this.random = (Math.random() * 10000 * 8 | 0).toString(16);
        this.whenmousedown = null;
        this.wnenmouseup = null;
        this.oldPos;
        this.oldmouse;
        this.oldLT;
        this.groupStatus = false;
        this.callback = callback;
        this.init();
    };
    $.extend(mouseMove.prototype, {
        init: function() {
            var __ = this;
            this.target.css({
                'cursor': 'pointer'
            });
            this.target.on('mousedown.' + this.random, function(e) {
                __._mousedown(e);
                __.oldLT = {
                    left: parseInt(__.target.css('left')),
                    top: parseInt(__.target.css('top')),
                    bottom: parseInt(__.target.css('bottom')),
                    right: parseInt(__.target.css('right')),
                }
                if (typeof __.whenmousedown === 'function') {
                    __.whenmousedown()
                }
                __.groupStatus = true;
                $dcmen.on('mousemove.' + __.random, function(e) {
                    //清除选择
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                    if (!__.groupStatus) return;
                    __._mousemove(e);
                }).on('mouseup.' + __.random, function(e) {
                    __._mouseup();
                });
            });

        },
        _mousedown: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.groupStatus = true;
            this.oldmouse = {
                x: e.clientX,
                y: e.clientY
            }
        },
        _mousemove: function(e) {
            var currs = {
                x: e.clientX,
                y: e.clientY
            }
            var nx = currs.x - this.oldmouse.x;
            var ny = currs.y - this.oldmouse.y;

            if (typeof this.callback === 'function') {
                this.callback(nx, ny, this.oldLT);
            }
        },
        _mouseup: function() {
            var __ = this;
            __.groupStatus = false;
            $dcmen.unbind('mousemove.' + __.random);
            $dcmen.unbind('mouseup.' + __.random);
            if (typeof __.wnenmouseup === 'function') {
                __.wnenmouseup()
            }
        },
        mousedown: function(fn) {
            if (typeof fn === 'function') {
                this.whenmousedown = fn;
                return;
            }
        },
        mouseup: function(fn) {
            if (typeof fn === 'function') {
                this.wnenmouseup = fn;
                return;
            }
        }


    });

    //fullscreen
    var $body = $("body"),$win=$(window);
    var virtualFullScreen = function(video) {
        this.$mask;
        this.video = video;
        this.switch=false;
        this.init();
    };
    $.extend(virtualFullScreen.prototype, {
        init:function(){
            this._insertMask()
            this.enterFullScreen();
        },
        events:function(){
            var __=this;
            $win.on('resize',function(){
                __._setWarpInfo()
            });
        },
        _setWarpInfo:function(){
            var width = this.$mask.width();
            var height = this.$mask.height();
            var params = this.video.params;
            var videoRatio= params.width/params.height;
            var nwidth = width*0.9;
            if(nwidth<320) nwidth=320;
            var nheight = nwidth / videoRatio;

            this.$warp.width(nwidth);
            this.$warp.height(nheight)
            this.$warp.css({'padding-top':(height-nheight)/2})

        },
        enterFullScreen:function(){
            this.video.$el.appendTo(this.$warp)
            this._setWarpInfo()
            this.events()

        },
        cancelFullScreen:function(){
            this.video.$el.appendTo(this.video.$warp);
            
        },
        _insertMask:function(){
            $body.css({'overflow':'hidden'});
            var mask=$('<div class="yvp_fullscreen_mask"></div>');
            $body.append(mask);
            this.$mask=mask;
            this._insertVideoWarp();
        },
        _insertVideoWarp:function(){
           this.$warp=$('<div class="yvp_fullscreen_vwarp"></div>');
           this.$mask.append(this.$warp);
        }
    });

    var videPlayerObj = new videoPlayer();

    return function(playerId, params) {
        return videPlayerObj.add(playerId, params);
    };
});
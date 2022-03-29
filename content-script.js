var player;
var videoCheckInterval;
var loopCheckInterval;
var firstLoad = true;
var isVideoToLoop = false;
var videoSettings = undefined;
var videoId = document.URL.replace(/.*youtube.com\/watch\?v=([^&]*)(.*)/, '$1');
var defaultVolume;

document.getElementsByClassName("html5-main-video")[0].addEventListener('stateChange',(event)=>{
  console.log('iojwefiojwefoijowf', event);
})

// NOPE
document.getElementsByClassName("html5-main-video")[0].addEventListener('volumechange',(event)=>{
  if(firstLoad && document.getElementsByClassName("html5-main-video")[0]){
    document.getElementsByClassName("html5-main-video")[0].volume = videoSettings.volume;
    console.log('START VOLUME', videoSettings.volume);
    firstLoad = false;
  }
})



console.log(document.getElementById('movie_player'));
var observer = new MutationObserver(function (event) {
  // console.log(event)
  var _player = document.getElementsByClassName("html5-main-video")[0];
  event.forEach((record)=>{
    switch(record.attributeName){
      case 'class':
        if(record.target.id === 'movie_player'){
          // console.log(record.target.classList)
          console.log('MOVIE_PLAYER')
          if(record.target.classList.contains('ad-showing')){
            if(!defaultVolume) defaultVolume = _player.volume;
            _player.volume = 0;
            console.log('MUTE AD');
          }
          else{
            if(defaultVolume){
              _player.volume = defaultVolume;
              console.log('UNMUTE AD');
              defaultVolume = undefined;
            }

            // if(firstLoad){
            //   if(_player){
            //     console.log('START VOLUME');
            //     firstLoad = false;
            //     _player.volume = videoSettings.volume;
            //   }
            // }
          }
        }
        break;
      default:
        console.log('not supposed to raise that');
        break;
    }
  })
})
observer.observe(document.getElementById('movie_player'), {
  attributes: true,
  attributeFilter: ['class'],
  childList: false,
  characterData: false
})


function videoLoadSetup(){
  console.log('settingVolume');
  player.volume = videoSettings.volume;
}

function loopCheck(){
  if( videoSettings.loop && (player.currentTime >= videoSettings.endTime || player.currentTime < videoSettings.startTime) ){
    console.log('looping video')
    player.currentTime = videoSettings.startTime;
    try{
      player.play();
    } catch(err){
      console.log('loopCheck', err);
    }
  }
}

function CheckIfVideoIsLoaded(){
  player = document.getElementsByClassName("html5-main-video")[0]
  if(player != null && player.readyState === 4 && document.getElementsByClassName("ytp-live-badge")[0].getAttribute('disabled') === 'true'){
    // if(document.getElementById("movie_player").classList.contains('ad-showing')){
    //   if(!defaultVolume) defaultVolume = player.volume
    //   player.volume = 0;
    // }
    // else{
      // if(defaultVolume) player.volume = defaultVolume;
      clearInterval(videoCheckInterval);
      if(isVideoToLoop){
        // setTimeout(videoLoadSetup, 1000); // disgusting hack 'cause I can't figure out what overrides the volume set
        loopCheckInterval = setInterval(loopCheck, 10);
      }
    // }
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if(request.action == 'getPlayerInfo'){
      console.log(player)
      sendResponse({duration: player.duration, currentTime: player.currentTime, playing: player.playing, volume: player.volume});
    }else if(request.action == 'getLiveStatus'){
      sendResponse({live: (document.getElementsByClassName('ytp-live-badge')[0].getAttribute('disabled') !== 'true')});
    }else if(request.action == 'updateSettings'){
      if(!isVideoToLoop && request.settings.loop){
        // setTimeout(videoLoadSetup, 1000); // disgusting hack 'cause I can't figure out what overrides the volume set
        loopCheckInterval = setInterval(loopCheck, 10);
      }
      else if(isVideoToLoop && !request.settings.loop){
        clearInterval(loopCheckInterval);
      }
      sendResponse({});
      console.log('update settings')
    }else{
      sendResponse({});
    }
    return true;
  }
);

chrome.storage.local.get(videoId).then((res) => {
  if(res) res = res[videoId];
  if(res) res = JSON.parse(res);

  if(res !== undefined){
    console.log("get", res);
    videoSettings = res;
    console.log('applying settings')
    isVideoToLoop = videoSettings.loop;
  }
  videoCheckInterval = setInterval(CheckIfVideoIsLoaded, 100);
}).catch((err)=>{
  console.log(err);
});


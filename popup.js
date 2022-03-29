// Initialize butotn with users's prefered color
let debugSpan = document.getElementById("debug");

let storageStatus = document.getElementById("storage-status");
let loopCheckbox = document.getElementById("loop-checkbox");
let loopSliderMin = document.getElementById("min");
let loopSliderMax = document.getElementById("max");
let volumeInput = document.getElementById("volume-input");
let saveButton = document.getElementById("save-settings");


var videoId;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var currTab = tabs[0];
  if (currTab) { // Sanity check
    videoId = currTab.url.replace(/.*youtube.com\/watch\?v=([^&]*)(.*)/, '$1');
    var isLive = false;

    chrome.tabs.sendMessage(currTab.id, {action: "getLiveStatus"} ,function(response){
      if(response.live){
        isLive = true;
        storageStatus.innerText = 'This video is live.';
        document.querySelector('#settings').style.height = '0';
        document.querySelector('#settings').style.visibility = 'hidden';
        document.querySelector('#save-settings').style.height = '0';
        document.querySelector('#save-settings').style.visibility = 'hidden';
      }
    });

    loopCheckbox.onchange = function(event){
      if(event.target.checked && !isLive){
        document.querySelector('.slider-wrapper').style.height = 'auto';
        document.querySelector('#current-buttons').style.height = 'auto';
        document.querySelector('#volume-div').style.height = 'auto';
        document.querySelector('.slider-wrapper').style.visibility = 'visible';
        document.querySelector('#current-buttons').style.visibility = 'visible';
        document.querySelector('#volume-div').style.visibility = 'visible';
      }else{
        document.querySelector('.slider-wrapper').style.height = '0';
        document.querySelector('#current-buttons').style.height = '0';
        document.querySelector('#volume-div').style.height = '0';
        document.querySelector('.slider-wrapper').style.visibility = 'hidden';
        document.querySelector('#current-buttons').style.visibility = 'hidden';
        document.querySelector('#volume-div').style.visibility = 'hidden';
      }
    }

    // not sure the videoId is pulled correctly I think it's pulling the whole storage but meh
    chrome.storage.local.get(videoId).then((videoSettings) => {
      console.log("debug",videoSettings)
      if(videoSettings) videoSettings = videoSettings[videoId];
      if(videoSettings) videoSettings = JSON.parse(videoSettings);

      if(videoSettings !== undefined){
        storageStatus.innerText = 'Video is already setup.';
        loopCheckbox.checked = videoSettings.loop;
        chrome.tabs.sendMessage(currTab.id, {action: "getPlayerInfo"} ,function(response){
          setSliderMinMax({min: 0, max: Math.floor(response.duration)});
          updateSlider({min: videoSettings.startTime, max: videoSettings.endTime});
        });
        volumeInput.value = Math.floor(videoSettings.volume * 100);
      }
      else{
        storageStatus.innerText = 'Video has not been setup yet.';
        chrome.tabs.sendMessage(currTab.id, {action: "getPlayerInfo"} ,function(response){
          setSliderMinMax({min: 0, max: Math.floor(response.duration)});
          updateSlider({min: 0, max: Math.floor(response.duration)});
        });
        document.querySelector('.slider-wrapper').style.height = '0';
        document.querySelector('#current-buttons').style.height = '0';
        document.querySelector('#volume-div').style.height = '0';
        document.querySelector('.slider-wrapper').style.visibility = 'hidden';
        document.querySelector('#current-buttons').style.visibility = 'hidden';
        document.querySelector('#volume-div').style.visibility = 'hidden';
      }
    }).catch((err)=>{
      console.log(err);
    }); //chrome.storage.local.get

    // defined here to have currTab in the scope
    saveButton.onclick = function(){
      if(!isLive){
        storageStatus.innerText = 'Video is now setup';
        var videoSettings = {
          loop: loopCheckbox.checked,
          startTime: Math.floor(loopSliderMin.value),
          endTime: Math.floor(loopSliderMax.value),
          volume: volumeInput.value / 100,
        };

        toStore = {};
        toStore[videoId] = JSON.stringify(videoSettings);

        chrome.storage.local.set(toStore, function (){
          console.log('value is set', toStore)
        });

        chrome.tabs.sendMessage(currTab.id, {action: "updateSettings", settings: JSON.stringify(videoSettings)});
      } //!live
    } //saveButton.onclick
  }; //currTab sanity check
}); //chrome.tabs.query



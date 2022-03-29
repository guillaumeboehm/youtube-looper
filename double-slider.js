// Utterly ripped off https://codepen.io/joosts/pen/rNLdxvK
var thumbsize = 14;

function drawSlider(slider,splitvalue) {

    /* set function vars */
    var min = slider.querySelector('.min');
    var max = slider.querySelector('.max');
    var minInput = document.querySelector('#min-input');
    var maxInput = document.querySelector('#max-input');
    var legend = slider.querySelector('.legend');
    var thumbsize = parseInt(slider.getAttribute('data-thumbsize'));
    var rangewidth = parseInt(slider.getAttribute('data-rangewidth'));
    var rangemin = parseInt(slider.getAttribute('data-rangemin'));
    var rangemax = parseInt(slider.getAttribute('data-rangemax'));

    /* set min and max attributes */
    min.setAttribute('max',splitvalue);
    max.setAttribute('min',splitvalue);

    /* set css */
    min.style.width = parseInt(thumbsize + ((splitvalue - rangemin)/(rangemax - rangemin))*(rangewidth - (2*thumbsize)))+'px';
    max.style.width = parseInt(thumbsize + ((rangemax - splitvalue)/(rangemax - rangemin))*(rangewidth - (2*thumbsize)))+'px';
    min.style.left = '0px';
    max.style.left = parseInt(min.style.width)+'px';
    legend.style.marginTop = min.offsetHeight+'px';
    slider.style.height = (min.offsetHeight + legend.offsetHeight)+'px';

    /* correct for 1 off at the end */
    // if(max.value>(rangemax - 1)) max.setAttribute('data-value',rangemax);

    /* write value and labels */
    max.value = max.getAttribute('data-value');
    min.value = min.getAttribute('data-value');
    minInput.value = min.getAttribute('data-value');
    maxInput.value = max.getAttribute('data-value');

}

function initSlider(slider) {
    /* set function vars */
    var min = slider.querySelector('.min');
    var max = slider.querySelector('.max');
    var minInput = document.querySelector('#min-input');
    var maxInput = document.querySelector('#max-input');
    var rangemin = parseInt(min.getAttribute('min'));
    var rangemax = parseInt(max.getAttribute('max'));
    var avgvalue = (rangemin + rangemax)/2;
    var legendnum = slider.getAttribute('data-legendnum');

    /* set data-values */
    min.setAttribute('data-value',rangemin);
    max.setAttribute('data-value',rangemax);

    /* set data vars */
    slider.setAttribute('data-rangemin',rangemin);
    slider.setAttribute('data-rangemax',rangemax);
    slider.setAttribute('data-thumbsize',thumbsize);
    slider.setAttribute('data-rangewidth',slider.offsetWidth);

    /* write legend */
    var legend = document.createElement('div');
    legend.classList.add('legend');
    var legendvalues = [];
    for (var i = 0; i < legendnum; i++) {
        legendvalues[i] = document.createElement('div');
        var val = Math.round(rangemin+(i/(legendnum-1))*(rangemax - rangemin));
        legendvalues[i].appendChild(document.createTextNode(val));
        legend.appendChild(legendvalues[i]);

    }
    slider.appendChild(legend);

    /* draw */
    drawSlider(slider,avgvalue);

    /* events */
    min.addEventListener("input", function() {
      updateSlider(min);
    });
    max.addEventListener("input", function(){
      updateSlider(max);
    });
    minInput.addEventListener("input", function(){
      updateSlider(minInput);
    });
    maxInput.addEventListener("input", function(){
      updateSlider(maxInput);
    });
}

// HTML input element or {min,max} for script modif
function updateSlider(el){
    /* set function vars */
    var slider = document.querySelector('.min-max-slider');
    var min = slider.querySelector('#min');
    var max = slider.querySelector('#max');
    var minInput = document.querySelector('#min-input');
    var maxInput = document.querySelector('#max-input');

    var minvalue = Math.floor(min.value);
    var maxvalue = Math.floor(max.value);
    if(el && el.toString() !== '[object HTMLInputElement]'){
      // Yeah yeah it's disgusting but I can't be bothered
      minvalue = el.min;
      maxvalue = el.max;
    }
    else if(el && el.type !== 'range'){
      minvalue = Math.floor(minInput.value);
      maxvalue = Math.floor(maxInput.value);
    }

    console.log(minvalue, maxvalue)
    /* set inactive values before draw */
    min.setAttribute('data-value',minvalue);
    max.setAttribute('data-value',maxvalue);
    var avgvalue = (minvalue + maxvalue)/2;

    console.log(minvalue, maxvalue, avgvalue)
    /* draw */
    drawSlider(slider,avgvalue);
}

function setSliderMinMax(values){
    console.log('setting minmax', values)
    var slider = document.querySelector('.min-max-slider');
    var min = slider.querySelector('#min');
    var max = slider.querySelector('#max');
    var legend = slider.querySelectorAll('.legend div');

    min.setAttribute('data-value',min.value);
    max.setAttribute('data-value',max.value);
    var avgvalue = (min.value + max.value)/2;

    min.setAttribute('min', values.min);
    max.setAttribute('max', values.max);
    slider.setAttribute('data-rangemin', values.min);
    slider.setAttribute('data-rangemax', values.max);
    legend[0].innerText = values.min;
    legend[1].innerText = values.max;

    drawSlider(slider, avgvalue);
}

var sliders = document.querySelectorAll('.min-max-slider');
sliders.forEach( function(slider) {
    initSlider(slider);
});

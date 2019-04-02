var $text = null;
var $save = null;
var $poster = null;
var $themeButtons = null;
var $aspectRatioButtons = null;
var $quote = null;
var $fontSize = null;
var $show = null;
var $source = null;
var $quote = null;
var $logoWrapper = null;
var $highlightButtons = null;
var $resetHighlight = null;

var quotes = [
    {
        "quote": "I'd been drinking.",
        "source": "Dennis Rodman<br>Basketball guy"
    },
    {
        "quote": "I've made a huge mistake.",
        "source": "G.O.B.<br>Local Magician"
    },
    {
        "quote": "Yes, I have smoked crack cocaine",
        "source": "Rob Ford<br>Toronto Mayor",
        "size": 65
    },
    {
        "quote": "Annyong.",
        "source": "Annyong<br>Annyong",
        "size": 90
    },
    {
        "quote": "STEVE HOLT!",
        "source": "Steve Holt<br>High schooler",
        "size": 65
    },
    {
        "quote": "Whoa, whoa, whoa. There's still plenty of meat on that bone. Now you take this home, throw it in a pot, add some broth, a potato. Baby, you've got a stew going.",
        "source": "Carl Weathers<br>Acting Coach",
        "size": 40
    }
];


// Change straight quotes to curly and double hyphens to em-dashes.
function smarten(a) {
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/--/g, "\u2014");                           // em-dashes
  a = a.replace(/ \u2014 /g, "\u2009\u2014\u2009");         // full spaces wrapping em dash
  return a;
}

var aspectRatioOutputs = {
    square: [1080, 1080],
    'sixteen-by-nine': [1920, 1080],
    'two-by-one': [1024, 512],
    'facebook-ratio': [1200, 630],
    'eight-by-ten': [1080, 1350]
};
function getOutputDims() {
    return aspectRatioOutputs[
        $aspectRatioButtons.filter('.active').attr('id')
    ];
}

function convertToSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

function processText() {
    $('.poster blockquote p').each(function() {
        var rawText = $.trim($(this).html());
        $(this).html(smarten(rawText)).find('br').remove();
    });
    $('.source').each(function() {
        var rawText = $.trim($(this).html());
        $(this).html(smarten(rawText));
    });
}

function isTextTooLong() {
    return ($source.offset().top + $source.height()) > $logoWrapper.offset().top
}

function saveImage() {
    // first check if the quote actually fits
    if ( isTextTooLong() ) autoFontSize();

    // don't print placeholder text if source is empty
    if ($source.text() === '') {
        alert("A source is required.");
        return;
    }

    // make sure source begins with em dash
    // if (!$source.text().match(/^[\u2014]/g)) {
    //     $source.html('&mdash;&thinsp;' + $source.text());
    // }

    $('canvas').remove();
    processText();

    var dims = getOutputDims();
    var scale = dims[0] / $poster.outerWidth();

    html2canvas($poster[0], { scale: scale }).then(function(canvas) {
        document.body.appendChild(canvas);
        var canvases = document.getElementsByTagName("canvas");
        window.oCanvas = canvases[0];
        var strDataURI = window.oCanvas.toDataURL();

        var quote = $('blockquote').text().split(' ', 5);
        var filename = convertToSlug(quote.join(' '));

        var a = $("<a>").attr("href", strDataURI).attr("download", "quote-" + filename + ".png").appendTo("body");

        a[0].click();

        a.remove();

        $('#download').attr('href', strDataURI).attr('target', '_blank');
        $('#download').trigger('click');
    });
}

function adjustFontSize(size) {
    var fontSize = size.toString() + '%';
    $('.poster blockquote p').css('font-size', fontSize);
    if ($fontSize.val() !== size){
        $fontSize.val(size);
    };
}

function getSelectionCharOffsetsWithin(element) {
    var start = 0, end = 0;
    var sel, range, priorRange;
    if (typeof window.getSelection != "undefined") {
        range = window.getSelection().getRangeAt(0);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        end = start + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
            (sel = document.selection).type != "Control") {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        end = start + range.text.length;
    }
    return {
        start: start,
        end: end
    };
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function autoFontSize() {
    var max = $fontSize.attr('max');
    var min = $fontSize.attr('min');
    adjustFontSize($fontSize.val());
    if ( isTextTooLong() ) {
        while ( isTextTooLong() ) {
            var newSize = $fontSize.val() - 1;
            if ( newSize < min ) break;
            adjustFontSize(newSize);
        }
    } else {
        while ( !isTextTooLong() ) {
            var newSize = $fontSize.val() + 1;
            if ( newSize > max ) break;
            adjustFontSize();
        }
        if ( isTextTooLong() )
            adjustFontSize($fontSize.val() - 1);
    }
}

$(function() {
    $text = $('.poster blockquote p, .source');
    $save = $('#save');
    $poster = $('.poster');
    $themeButtons = $('#theme .btn');
    $aspectRatioButtons = $('#aspect-ratio .btn');
    $fontSize = $('#fontsize');
    $show = $('#show');
    $source = $('.source');
    $showCredit = $('.show-credit');
    $quote = $('#quote');
    $logoWrapper = $('.logo-wrapper');
    $highlightButtons = $('#highlight .btn');
    $resetHighlight = $('#reset-highlight');
    var quoteArray = [],
        attributionArray = [],
        spanArray = quoteArray;

    var quote = quotes[Math.floor(Math.random()*quotes.length)];
    $('blockquote p').text(quote.quote);
    console.log(quote.source);
    $source.html(quote.source);
    processText();

    $save.on('click', saveImage);

    $themeButtons.on('click', function() {
        $themeButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster
            .removeClass('poster-theme1 poster-theme2 poster-theme3 poster-theme4')
            .addClass('poster-' + $(this).attr('id'));
    });

    $aspectRatioButtons.on('click', function() {
        $aspectRatioButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster
            .removeClass('square eight-by-ten sixteen-by-nine facebook-ratio two-by-one')
            .addClass($(this).attr('id'));
        adjustFontSize(100)
    });

    $quote.on('click', function() {
        $(this).find('button').toggleClass('active');
        $poster.toggleClass('quote');
    });

    var highlight = "highlight-off";
    $highlightButtons.on('click', function() {
        $highlightButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        highlight = $(this).attr('id');
        if ( highlight === 'highlight-on' ) {
            $('body').addClass('highlight-cursor');
        } else {
            $('body').removeClass('highlight-cursor');
        }
    });

    $fontSize.on('input', function() {
        adjustFontSize($(this).val());
    });

    $show.on('keyup', function() {
        var inputText = $(this).val();
        $showCredit.text(inputText);
    });

    // // This event is interfering with the medium editor in some browsers
    // $('blockquote').on('keyup', function(){

    //     console.log($(this)[0].selectionStart);
    //     process_text();
    // });
    var selectedDiv;
    $('.poster blockquote p').on('mousedown', function(){
        selectedDiv = this;
        spanArray = quoteArray;
    });

    $('.poster .source').on('mousedown', function(){
        selectedDiv = this;
        spanArray = attributionArray;
    });

    $($poster).on('mouseup', function(){
        if(getSelectionText().length > 0 && highlight === 'highlight-on'){
            spanArray.push(getSelectionCharOffsetsWithin(selectedDiv));
            spanArray = _.sortBy(spanArray, 'start');
            if(spanArray.length > 1){
                $.each(spanArray, function(i, d){
                    if(i+1 < spanArray.length){
                        if(d.end >= spanArray[i+1].start){
                            spanArray[i+1].start = d.start;
                            spanArray.splice(i, 1);
                        }
                    }
                });
            }

            var selectedText = getSelectionText(),
                text = $(selectedDiv).text(),
                textArray = text.split('');

            var count = 0;
            $.each(spanArray, function(i, d){
                textArray.splice(d.start+count, 0, '<span>');
                count += 1;
                textArray.splice(d.end+count, 0, '</span>');
                count += 1;
            });

            $(selectedDiv).html(textArray.join(''));
            $(selectedDiv).blur();
        }
    });

    $($poster).on('keyup', function(event){
        var tempArray = [];
        var spans = [];
        $.each($(selectedDiv).find('span'), function(i, d){
            spans.push($(d).html());
        });
        var array = $(selectedDiv).html().replace(/&nbsp;/g, ' ').split(/(<span>.*?<\/span>)/g);

        var count = 0;
        $.each(array, function(i, d){
            if(d.match(/(<span>.*?<\/span>)/g)){
                var item =  {
                    start: count,
                    end: 0,
                    text: d.replace(/<span>/, '').replace(/<\/span>/, '')
                };
                var text = d.replace(/<span>/, '').replace(/<\/span>/, '');
                count += text.length;
                item.end = count;
                tempArray.push(item);
            } else {
                count += d.length;
            }
        });

        if(spanArray === quoteArray){
            quoteArray = tempArray;
            spanArray = quoteArray;
        } else {
            attributionArray = tempArray;
            spanArray = attributionArray;
        }
    });

    $resetHighlight.on('click', function(){
        $('.poster blockquote p').each(function(i, d) {
            $(d).html($(d).text());
        })
        quoteArray = [];
        attributionArray = [];
    });


    var quoteEl = document.querySelectorAll('.poster blockquote');
    var sourceEl = document.querySelectorAll('.source');

    var quoteEditor = new MediumEditor(quoteEl, {
        disableToolbar: true,
        placeholder: 'Type your quote here'
    });

    var sourceEditor = new MediumEditor(sourceEl, {
        disableToolbar: true,
        placeholder: 'Type your quote source here'
    });
});

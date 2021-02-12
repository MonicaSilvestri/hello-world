const fs = require('fs'); //file checker

var url = 'C:/fakepath/error.pdf'; //The URL  - will change before exec.
let
    pdfDoc = null,
    pNum = 1, //viewing current page
    isRendering = false,
    isPending = null;
var scale = 1;
const
    canvas = document.querySelector('#pdfrender'),
    ctx = canvas.getContext('2d');

//previous session autofill
if (typeof (localStorage.getItem('last_filepath')) != 'undefined') {
    document.querySelector('#path').value = localStorage.getItem('last_filepath');
}

//hide second page
document.querySelector('#fchoose').style = 'display: block';
document.querySelector('#fshow').style = 'display: none';

//Try to open the file (handle errors)
function openFile() {
    //Check to see if the path works
    var trypath = document.querySelector('#path').value;
    if (trypath === '') {
        localStorage.removeItem('last_filepath');
        alert('Recent file autofill cleared.');
        return;
    }
    if (fs.existsSync(trypath)) {
        var testpath = trypath.split('/');
        testpath = testpath[testpath.length - 1];
        testpath = testpath.split('.')[1];
        if (testpath != 'pdf' && testpath != 'PDF') {
            alert('\'' + testpath.toUpperCase() + '\' documents cannot be read. Please select only PDFs.')
            return;
        }
    } else {
        alert('This file does not exist (check for unnecesary spaces in your entry). Specify the full path, including filetype.')
        return;
    };
    //If this point is reached, the file is valid
    localStorage.setItem('last_filepath', trypath);
    url = trypath;
    beginRender();

    //go to second page
    document.querySelector('#fchoose').style = 'display: none';
    document.querySelector('#fshow').style = 'display: block';
}

/*** Begin PDF Reading Code ***/

function renderPage(num) {
    isRendering = true;
    pdfDoc.getPage(num).then(page => {
        //Set canvas scaling
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        //render
        const renderCtx = {
            canvasContext: ctx,
            viewport
        }
        page.render(renderCtx).promise.then(() => {
            isRendering = false;
            if (isPending !== null) {
                renderPage(isPending);
                isPending = null;
            }
        });
    });
    document.querySelector('#cpage').value = pNum; //display current page
}

//check for pages rendering
const queueRenderPage = num => {
    if (isRendering) {
        isPending = num;
    } else {
        renderPage(num);
    }
}

//Show prev
function showPrevPage() {
    if (pNum <= 1) {
        return;
    }
    pNum--;
    queueRenderPage(pNum);
}

//show next
function showNextPage() {
    if (pNum >= pdfDoc.numPages) {
        return;
    }
    pNum++;
    queueRenderPage(pNum);
}

//Change scale
function changeScale(newScale) {
    scale = newScale;
    queueRenderPage(pNum);
}

//show page with text input
function setPage(pg) {
    if (isNaN(pg) || (pg === '')) {
        document.querySelector('#cpage').value = pNum;
    } else if (((pg < 1)) || (pg > pdfDoc.numPages)) {
        alert('Page ' + pg + ' does not exist. Please enter a number between 1 and ' + pdfDoc.numPages + '.');
        document.querySelector('#cpage').value = pNum;
    } else {
        pNum = pg * 1;
        queueRenderPage(pNum);
    }
}

function beginRender() {
    pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        renderPage(pNum);
        document.querySelector('#npages').innerHTML = pdfDoc.numPages; //display max pages
    });
}
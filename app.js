const fileInput = document.getElementById('pdfFile');
const canvas = document.getElementById('pdfViewer');
const ctx = canvas.getContext('2d');

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const page_num = document.getElementById("page_num");
const page_count = document.getElementById("page_count");

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderContext);

    pageRendering = false;
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  });

  page_num.textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrev() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNext() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

function onZoomIn() {
  scale += 0.5;
  renderPage(pageNum);
}

function onZoomOut() {
  scale -= 0.5;
  if (scale < 0.5) scale = 0.5;
  renderPage(pageNum);
}

fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file && file.type === 'application/pdf') {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      pdfjsLib.getDocument(fileReader.result).promise.then(pdf => {
        pdfDoc = pdf;
        page_count.textContent = pdfDoc.numPages;
        renderPage(pageNum);
      });
    };
    fileReader.readAsArrayBuffer(file);
  } else {
    alert("Please upload a valid PDF file.");
  }
});

prevBtn.addEventListener("click", onPrev);
nextBtn.addEventListener("click", onNext);
zoomInBtn.addEventListener("click", onZoomIn);
zoomOutBtn.addEventListener("click", onZoomOut);

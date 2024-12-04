// if user is on mobile resolution
if (window.matchMedia("(max-width: 500px)").matches) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var picture_canvas = document.getElementById("picture_canvas");
    picture_canvas.width = width;
    picture_canvas.height = height;
} else {
    var width = 640;
    var height = 480;
}
var hasbeencalled = false;
var color_choices = [
    "#C7FC00",
    "#FF00FF",
    "#8622FF",
    "#FE0056",
    "#00FFCE",
    "#FF8000",
    "#00B7EB",
    "#FFFF00",
    "#0E7AFE",
    "#FFABAB",
    "#0000FF",
    "#CCCCCC",
];

const API_KEY = "rf_U7AD2Mxh39N7jQ3B6cP8xAyufLH3";
const DETECT_API_KEY = "4l5zOVomQmkAqlTJPVKN";
const CAMERA_ACCESS_URL = "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd1de273045d359cf9a_camera-access2.png";
const LOADING_URL = "https://uploads-ssl.webflow.com/5f6bc60e665f54545a1e52a5/63d40cd2210b56e0e33593c7_loading-camera2.gif";
var webcamLoop = false;
window.addEventListener("scroll", function() {
    if (window.scrollY > 100) {
        webcamLoop = false;
    }
    if (window.scrollY < 100) {
        webcamLoop = true;
    }
});

async function apiRequest (image) {
    var version = "1";
    //yaha chai change garnu paryo for each API
    var name = "waste-classification-uwqfy";
    var url = "https://detect.roboflow.com/" + name + "/" + version + "?api_key=" + DETECT_API_KEY;
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: image,
        redirect: "follow",
    }).then((response) => response.json()
    ).then(resJson => { return resJson["predictions"] });
}

async function getModel() {
    var model = await roboflow
    .auth({
        publishable_key: "rf_AHsT7MdbDJb0p3sMoNOggNZJDrz2",
    })
    return model;
}

var model = null;
document.getElementById("video").setAttribute("playsinline", "");
document.getElementById("video").play();

document.getElementById("video").addEventListener(
    "ended",
    function () {
    this.currentTime = 0;
    this.play();
    },
    false
);

document
    .getElementById("webcam-predict")
    .addEventListener("click", function () {
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    webcamInference();
    });

var bounding_box_colors = {};

function setImageState(src, canvas = "picture_canvas") {
    var canvas = document.getElementById(canvas);
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.style.width = width + "px";
    img.style.height = height + "px";
    img.height = height;
    img.width = width;
    img.onload = function () {
    ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
    };
}

function drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, fromDetectAPI = false) {
    if(predictions.length==0)
        return;

    for (var i = 0; i < predictions.length; i++) {
        console.log(predictions[i]);
    var confidence = predictions[i].confidence;
    ctx.scale(1, 1);

    if (predictions[i].class in bounding_box_colors) {
        ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
        // random color
        var color = color_choices[Math.floor(Math.random() * color_choices.length)];
        ctx.strokeStyle = color;
        // color lai choice bata remove
        color_choices.splice(color_choices.indexOf(color), 1);

        bounding_box_colors[predictions[i].class] = color;
    }

    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    if (!fromDetectAPI) {
        x -= sx;
        y -= sy;

        x *= scalingRatio;
        y *= scalingRatio;
        width *= scalingRatio;
        height *= scalingRatio;
    }
    //mero boxa frame bata bahira na jaaos
    if (x < 0) {
        width += x;
        x = 0;
    }

    if (y < 0) {
        height += y;
        y = 0;
    }
    //yaha dekhi korne boxa ko outline
    ctx.rect(x, y, width, width);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    // aigu yo chai hernai paryo lekhna ta garo garo
    var text = ctx.measureText(
        prediction.class + " " + Math.round(confidence * 100) + "%"
    );
    if (y < 20) {
        y = 30
    }

    
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x - 2, y - 30, text.width + 4, 30);
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    //formula imp
    ctx.fillText(
        prediction.class + " " + Math.round(confidence * 100) + "%",
        x,
        y - 10
    );
    let c =prediction.class;
    result(c.toLowerCase());
    
    }
}
//for displaying and for audio
function result(c){
    if(c=="plastic")
        {
            document.getElementById("typeofwaste").innerHTML ="This object is: " + c + " This is Non-Hazardous waste(General Waste). This belongs to red bin";
            let audio = new Audio("redf.m4a");
            audio.play();
        }  
      else if(c=="drycell")
            {
                document.getElementById("typeofwaste").innerHTML ="This object is: " + c + " This is Hazardous waste. This belongs to green bin";
                let audio = new Audio("greenf.m4a");
                audio.play();
            }
    else if(c=="biodegradable"||c=="paper")
        {
            document.getElementById("typeofwaste").innerHTML = "This object is: " + c +" This is Non Hazardous waste(Degradable Waste). This belongs to black bin";
            let audio = new Audio("blackf.m4a");
            audio.play();
        } 
       
    else if(c=="adalat - 60mg"||c=="adalat-30"||c=="catapres - 150mcg")
        {
            document.getElementById("typeofwaste").innerHTML = "This object is: " + c +" This is Pharmaceutical waste. This belongs to blue bin";
            let audio = new Audio("bluef.m4a");
            audio.play();
        } 
    else
    {
        document.getElementById("typeofwaste").innerHTML = "Unknown";
        let audio = new Audio("yellowf.m4a");
        audio.play();
    }
        
}

function drawBoundingBoxesCam(predictions, canvas, ctx, scalingRatio, sx, sy, fromDetectAPI = false) {
    if(predictions.length==0)
        return;

    for (var i = 0; i < predictions.length; i++) {
        console.log(predictions[i]);
    var confidence = predictions[i].confidence;
    ctx.scale(1, 1);

    if (predictions[i].class in bounding_box_colors) {
        ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
        // random color
        var color = color_choices[Math.floor(Math.random() * color_choices.length)];
        ctx.strokeStyle = color;
        // color lai hataune from choice
        color_choices.splice(color_choices.indexOf(color), 1);

        bounding_box_colors[predictions[i].class] = color;
    }

    var prediction = predictions[i];
    var x = prediction.x - prediction.width / 2;
    var y = prediction.y - prediction.height / 2;
    var width = prediction.width;
    var height = prediction.height;

    if (!fromDetectAPI) {
        x -= sx;
        y -= sy;

        x *= scalingRatio;
        y *= scalingRatio;
        width *= scalingRatio;
        height *= scalingRatio;
    }

   
    if (x < 0) {
        width += x;
        x = 0;
    }

    if (y < 0) {
        height += y;
        y = 0;
    }

  

    ctx.rect(x, y, width, width);

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    

    
    var text = ctx.measureText(
        prediction.class + " " + Math.round(confidence * 100) + "%"
    );
   
    if (y < 20) {
        y = 30
    }

    //text lekhne 
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x - 2, y - 30, text.width + 4, 30);
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";

    ctx.fillText(
        prediction.class + " " + Math.round(confidence * 100) + "%",
        x,
        y - 10
    );
    
    let c =prediction.class;
    if(hasbeencalled==false)
        result(c.toLowerCase());
    hasbeencalled = true;
    }
}
async function webcamInference() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        videoElement.play();
        videoElement.addEventListener('play', async () => {
            const canvas = document.getElementById('video_canvas');
            const ctx = canvas.getContext('2d');
            const model = await getModel();
            setInterval(async () => {
                if (webcamLoop) {
                    ctx.drawImage(videoElement, 0, 0, width, height);
                    const image = canvas.toDataURL('image/jpeg');
                    const predictions = await apiRequest(image);
                    drawBoundingBoxesCam(predictions, canvas, ctx, 1, 0, 0, true);
                }
            }, 100); // Adjust the interval as needed
        });
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
    setImageState(
        LOADING_URL,
        "video_canvas"
    );
    webcamLoop = true;
    document.getElementById("prechosen_images_parent").style.display = "none";
    document.getElementById("picture").style.display = "none";
    document.getElementById("picture_canvas").style.display = "none";
    document.getElementById("video_canvas").style.display = "block";

    if (model == null) {
        model = getModel();
    }

    if (
    document.getElementById("video") &&
    document.getElementById("video").style
    ) {
    document.getElementById("video").style.display = "block";
    } else {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (stream) {
        var video = document.createElement("video");
        video.srcObject = stream;
        video.id = "video";
        video.setAttribute("playsinline", "");
        video.play();

        video.height = height;
        video.style.height = height + "px";
        video.width = width;
        video.style.width = width + "px";

        var canvas = document.getElementById("video_canvas");
        var ctx = canvas.getContext("2d");

        ctx.scale(1, 1);

        video.addEventListener(
            "loadeddata",
            function () {
            var loopID = setInterval(function () {
        
                var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
                getCoordinates(video);
                var base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                apiRequest(base64).then(function (predictions) {
                    ctx.beginPath();
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                    var predictions = predictions.map(function (prediction) {
                        return {
                            bbox: { x: prediction.x, y: -prediction.y, width: prediction.width, height: prediction.height},
                            class: prediction.class,
                            confidence: prediction.confidence,
                    }});

                    drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, true);
                    if (!webcamLoop) {
                            clearInterval(loopID);
                            
                        }
                });
            }, 1000 / 30);},
            false
        );
        })
        .catch(function (err) {
        setImageState(
            CAMERA_ACCESS_URL
        );
        });
    }
}

function getCoordinates(img) {
    var dx = 0;
    var dy = 0;
    var dWidth = 640;
    var dHeight = 480;

    var sy;
    var sx;
    var sWidth = 0;
    var sHeight = 0;

    var imageWidth = img.width;
    var imageHeight = img.height;

    const canvasRatio = dWidth / dHeight;
    const imageRatio = imageWidth / imageHeight;

    // scenario 1 - image is more vertical than canvas
    if (canvasRatio >= imageRatio) {
        var sx = 0;
        var sWidth = imageWidth;
        var sHeight = sWidth / canvasRatio;
        var sy = (imageHeight - sHeight) / 2;
    } else {
    // scenario 2 - image is more horizontal than canvas
        var sy = 0;
        var sHeight = imageHeight;
        var sWidth = sHeight * canvasRatio;
        var sx = (imageWidth - sWidth) / 2;
    }

    var scalingRatio = dWidth / sWidth;

    if (scalingRatio == Infinity) {
        scalingRatio = 1;
    }

    return [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio];
}

function getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL;
}

function imageInference(e) {
    // replace canvas with image
    document.getElementById("picture").style.display = "none";
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video_canvas").style.display = "none";

    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
     
    var img = new Image();
    img.src = e.src;
    img.crossOrigin = "anonymous";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img.onload = function () {
        setImageState(
            LOADING_URL,
            "picture_canvas"
        );
    var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
        getCoordinates(img);

    var base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    apiRequest(base64).then(function (predictions) {
        ctx.beginPath();
        // draw image to canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        
        var predictions = predictions.map(function (prediction) {
            return {
                bbox: { x: prediction.x, y: prediction.y, width: prediction.width, height: prediction.height},
                class: prediction.class,
                confidence: prediction.confidence,
        }});
        

        drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, true);
    });
    };
}
let inferencemodel =  getModel();

function processDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    // hide #picture
    document.getElementById("picture").style.display = "none";
    document.getElementById("picture_canvas").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video_canvas").style.display = "none";

    // clear canvas if necessary
    if (document.getElementById("picture_canvas").getContext) {
    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    var canvas = document.getElementById("picture_canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var file = e.dataTransfer.files[0];
    var reader = new FileReader();

    reader.readAsDataURL(file);

    // only allow png, jpeg, jpg
    if (
    file.type == "image/png" ||
    file.type == "image/jpeg" ||
    file.type == "image/jpg"
    ) {
    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        
        img.onload = function () {
        var [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, scalingRatio] =
            getCoordinates(img);
            setImageState(
                LOADING_URL,
                "picture_canvas"
            );
            var base64 = getBase64Image(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    apiRequest(base64).then(function (predictions) {
        ctx.beginPath();
        // draw image to canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        var predictions = predictions.map(function (prediction) {
            return {
                bbox: { x: prediction.x, y: prediction.y, width: prediction.width, height: prediction.height},
                class: prediction.class,
                confidence: prediction.confidence,
        }});
        // Assuming predictions contain the list of predictions for the images
        

        drawBoundingBoxes(predictions, canvas, ctx, scalingRatio, sx, sy, true);
    });
        };
        
        document
        .getElementById("picture_canvas")
        .addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
        document
        .getElementById("picture_canvas")
        .addEventListener("drop", processDrop);
    };
    }
}
// click on image-predict, show image inference
document.getElementById("image-predict").addEventListener("click", function () {
    // show prechosen_images_parent
    document.getElementById("prechosen_images_parent").style.display = "block";
    document.getElementById("picture_canvas").style.display = "none";
    document.getElementById("picture").style.display = "block";
    document.getElementById("example_demo").style.display = "none";
    document.getElementById("video").style.display = "none";
    document.getElementById("video_canvas").style.display = "none";

    // terminate webcam loop if running
    if (webcamLoop) {
        webcamLoop = false;
    }

    // set event handler on image
    document.getElementById("picture").addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    });
    document.getElementById("picture").addEventListener("drop", processDrop);
});
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        webcamLoop = false;
    }
    if (window.scrollY < 100) {
        webcamLoop = true;
    }
});





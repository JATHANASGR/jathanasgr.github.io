const knob = document.getElementById('knob');
knob.addEventListener("mousedown", Mouse_Click);

document.addEventListener("mouseup", Mouse_Up);
document.addEventListener("mousemove", Mouse_Moved);


let is_clicked = false;
function Mouse_Up()
{
    is_clicked = false;
}
function Mouse_Click(e)
{
    y_click = e.clientY;
    is_clicked = true;
    angle_click_g = angle_calc_g;
}

let y_click = 0;
let angle_calc_g = 0;
let angle_click_g = 0;
let sound_current = 0;
let sound_changed = 0;

var snd = new Audio("rotary_08.wav"); // 8 OR 9 (MAYBE 8 QUALITY)
function Mouse_Moved(e)
{
    if(is_clicked)
    {
        angle_calc_g = angle_click_g + (Math.round((y_click-e.clientY)/15))*15;
        knob.style.transform = "rotate(" + angle_calc_g + "deg)";
        
        if(sound_changed != angle_calc_g)
        {
            if(sound_changed > angle_calc_g) global_offset -= 0.2;
            else if(sound_changed < angle_calc_g) global_offset += 0.2;
            let test = ':CH1:OFFSet ' + global_offset;
            let test_byte = utf8Encode.encode(test);
            device.transferOut(0x01, test_byte);

            snd.play();

            sound_changed = angle_calc_g;

        }
    }
}

//////////////////////////////////////////////////
// BUTTON EVENTS
//////////////////////////////////////////////////
const connectButton = document.getElementById('connectButton');
const channel1ON = document.getElementById('channel1ON');
const channel1OFF = document.getElementById('channel1OFF');
const getModel = document.getElementById('getModel');
const offset1Plus = document.getElementById('offset1Plus');
const offset1Minus = document.getElementById('offset1Minus');
const getData1 = document.getElementById('getData1');

//////////////////////////////////////////////////
// CANVAS INIT
//////////////////////////////////////////////////
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
canvas.height = 200;
canvas.width = 599;

// canvas.addEventListener('mousemove', logKey);

// let rect = canvas.getBoundingClientRect();
// let line_x = 0;
// function logKey(e)
// {
//     line_x = e.screenX-rect.left;
//     // console.log(line_x);
// }

//////////////////////////////////////////////////
// ENCODER
//////////////////////////////////////////////////
let utf8Encode = new TextEncoder();
let utf8Decode = new TextDecoder();

//////////////////////////////////////////////////
// USB DEVICE OPTIONS
//////////////////////////////////////////////////
const options = { filters: [{vendorId: 0x5345}] };

let device;
connectButton.onclick = async function()
{
    device = await navigator.usb.requestDevice(options);
    await device.open();
    await device.claimInterface(0);
    await console.log(device);
}
channel1ON.onclick = async function()
{
    let test = ':CH1:DISPlay ON'
    let test_byte = utf8Encode.encode(test);
    await device.transferOut(0x01, test_byte);
}
channel1OFF.onclick = async function()
{
    let test = ':CH1:DISPlay OFF'
    let test_byte = utf8Encode.encode(test);
    await device.transferOut(0x01, test_byte);
}
global_offset = 0;
offset1Plus.onclick = async function()
{
    global_offset += 0.2;
    let test = ':CH1:OFFSet ' + global_offset;
    let test_byte = utf8Encode.encode(test);
    await device.transferOut(0x01, test_byte);
}
offset1Minus.onclick = async function()
{
    global_offset -= 0.2;
    let test = ':CH1:OFFSet ' + global_offset;
    let test_byte = utf8Encode.encode(test);
    await device.transferOut(0x01, test_byte);
}
getModel.onclick = async function()
{
    let test = '*IDN?'
    let test_byte = utf8Encode.encode(test);
    const resultA = await device.transferOut(0x01, test_byte);
    const resultB = await device.transferIn(0x01, 64);
    await console.log(utf8Decode.decode(resultB.data));
}
getData1.onclick = async function()
{
    let test = ':DATa:WAVe:SCReen:CH1?'
    let test_byte = utf8Encode.encode(test);
    const resultA = await device.transferOut(0x01, test_byte);
    const resultB = await device.transferIn(0x01, 1000); //604

    // await console.log("LENGTH = ", resultB.data.byteLength);
    // for (let i=0; i<resultB.data.byteLength; i++)
    // {
        // await console.log(resultB.data.getInt8(i));
    // }

    //////////////////////////////////////////////////
    // CLEAR
    //////////////////////////////////////////////////
    let ms_start = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //////////////////////////////////////////////////
    // GRID
    //////////////////////////////////////////////////
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(0.5, 100.5);
    ctx.lineTo(599.5, 100.5);
    ctx.strokeStyle = "#888888";
    ctx.stroke();
    
    ctx.beginPath();
    ctx.setLineDash([2,4]);
    for(let i=1; i<=3; i++)
    {
        ctx.moveTo(0.5, 100.5+i*25);
        ctx.lineTo(599.5, 100.5+i*25);
    }
    
    for(let i=1; i<=3; i++)
    {
        ctx.moveTo(0.5, 100.5-i*25);
        ctx.lineTo(599.5, 100.5-i*25);
    }
    ctx.strokeStyle = "#888888";
    ctx.stroke();

    //////////////////////////////////////////////////
    // graph
    //////////////////////////////////////////////////
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(0, 100-resultB.data.getInt8(4));
    for(let i=5; i<604; i++)
    {
        ctx.lineTo(i-4, 100-resultB.data.getInt8(i));
    }
    ctx.strokeStyle = "#0000BB";
    ctx.stroke();
    
    // ctx.beginPath();
    // ctx.setLineDash([]);
    // ctx.strokeStyle = "#888888";
    // ctx.moveTo(100, 0);
    // ctx.lineTo(100, 200);
    // ctx.stroke();
    
    let ms_end = performance.now();

    // console.log(ms_end-ms_start);
    // console.log(ctx);
}


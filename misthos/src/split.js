//////////////////////////////////////////////////
//SPLIT GLOBALS TO CHANGE
//////////////////////////////////////////////////
let splitMin = 200;
let splitMax = 1200;
let splitWidth = 10;

//////////////////////////////////////////////////
//SPLIT
//////////////////////////////////////////////////
const splitContainerHandle = document.querySelector(".split_container");
const splitMiddleHandle = document.querySelector(".split_middle");
splitMiddleHandle.style.width = splitWidth+"px";
const splitLeftHandle = document.querySelector(".split_left");
splitLeftHandle.style.width = splitMin+"px";

let isDown = false;

function mDown(e)
{
    if(e.target.classList.contains("split_middle"))
    {
        isDown = true;
    }
}
function mUp(e)
{
    isDown = false;
}
function mMove(e)
{
    if(isDown)
    {
        let str = splitLeftHandle.style.width;
        let num = Number(str.substring(0, str.length - 2));
        splitLeftHandle.style.width = Clamp(e.clientX-(splitMiddleHandle.clientWidth/2)-splitContainerHandle.offsetLeft, splitMin, splitMax)+"px";
    }
}
function Clamp(inNum, inMin, inMax)
{
    return Math.min(Math.max(inNum, inMin), inMax);
}

//EVENT LISTENERS
window.addEventListener("mousedown", mDown);
window.addEventListener("mouseup", mUp);
window.addEventListener("mousemove", mMove);



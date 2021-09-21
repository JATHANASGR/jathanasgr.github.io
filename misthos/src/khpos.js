////////////////////////////////////////////////////////////////////////////////////////////////////
//TAB ELEMENT - GLOBAL CONTAINER (ADDED BEFORE FINISH)
////////////////////////////////////////////////////////////////////////////////////////////////////
let g_currentTabNum = 0;
let g_tab_container = 
[
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
    "auto",
];

let handlerHands = document.querySelectorAll(".hand_pointer");
let handlerHandsSelect = document.querySelectorAll(".hand_pointer_select");
let g_hand_toggle = true;

//////////////////////////////////////////////////
//DEOS COMMUNICATION - INIT
//////////////////////////////////////////////////
const broadcastDeosHandle = new BroadcastChannel("deos");               //Create the channel.
broadcastDeosHandle.addEventListener("message", BroadcastDeosReceived); //Event listener for incoming messages.

//////////////////////////////////////////////////
//DEOS COMMUNICATION - CLICK
//////////////////////////////////////////////////
document.addEventListener("click", BroadcastDeosClick);

function BroadcastDeosClick(inEvent)
{
    if(inEvent.target.classList.contains("custom_btn_simple"))
    {
        let packetRequest =
        {
            "deosid": inEvent.target.dataset.comname
            //Can add more data...
        };

        broadcastDeosHandle.postMessage(packetRequest);
    }
}

//////////////////////////////////////////////////
//DEOS COMMUNICATION - RECEIVE ON INTERVAL (Deos triggered)
//////////////////////////////////////////////////
const g_broadcastDeosContainer = {};

function BroadcastDeosReceived(packetReceived)
{
    debug_deos_container_mhxanostasio&&console.log(g_broadcastDeosContainer);

    //UPDATE CONTAINER WITH RECEIVED KEY VALUE PAIR (Single)
    for(const inKey in packetReceived.data)
    {
        if(inKey.substring(0,2) === "k_")
        {
            g_broadcastDeosContainer[inKey] = packetReceived.data[inKey];
        }
    }
}

//////////////////////////////////////////////////
//DEOS COMMUNICATION - SEND ON INTERVAL (Local triggered)
//////////////////////////////////////////////////
const customSelectHandler = document.querySelectorAll(".custom_select_hoa");
const customImageOnOffHandler = document.querySelectorAll(".custom_image_onoff");
const customValueDisplayHandler = document.querySelectorAll(".custom_value_display");

//////////////////////////////////////////////////
//KATHE INTERVAL
//////////////////////////////////////////////////
//Steile ta SELECT
//Ananewse ta ICONS
//Ananewse ta VALUES
setInterval(BroadcastDeosIntervalSendAndRefresh, 1000);
function BroadcastDeosIntervalSendAndRefresh()
{
    //////////////////////////////////////////////////
    // INTERVAL SENDS TO DEOS COMMUNICATION
    //////////////////////////////////////////////////

    //INTERVAL SEND - CUSTOM SELECT HOA
    let packetRequest = {deosid: "DeosComInterval"};

    for(let i=0; i<customSelectHandler.length; i++)
    {
        packetRequest[customSelectHandler[i].dataset.comname] = customSelectHandler[i].value;
    }

    broadcastDeosHandle.postMessage(packetRequest);

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //INTERVAL SEND - TRANSISTOR STATE (ADDED BEFORE FINISH)
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    for(let i=0; i<g_tab_container.length; i++)
    {
        let addedChar = "";
        if(i<9) addedChar = "0";

        if(g_tab_container[i] === "hand")
        {
            packetRequest["k_transistor_"+addedChar+(i+1)] = true;
        }
        else
        {
            packetRequest["k_transistor_"+addedChar+(i+1)] = false;
        }
    }
    broadcastDeosHandle.postMessage(packetRequest);

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //HANDS HANDLING (ADDED BEFORE FINISH)
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    for(let i=0; i<g_tab_container.length; i++)
    {
        if(g_tab_container[i] === "auto")
        {
            handlerHands[i].classList.add("tab_not_display");
        }
        else
        {
            if(g_hand_toggle)
            {
                handlerHands[i].classList.remove("tab_not_display");
            }
            else
            {
                handlerHands[i].classList.add("tab_not_display");
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //HANDS SELECT HANDLING (ADDED BEFORE FINISH)
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    for(let i=0; i<customSelectHandler.length; i++)
    {
        if(customSelectHandler[i].value === "auto")
        {
            handlerHandsSelect[i].classList.add("tab_not_display");
        }
        else
        {
            if(g_hand_toggle)
            {
                handlerHandsSelect[i].classList.remove("tab_not_display");
            }
            else
            {
                handlerHandsSelect[i].classList.add("tab_not_display");
            }
        }
    }
    g_hand_toggle = !g_hand_toggle;

    //////////////////////////////////////////////////
    // INTERVAL REFRESHES - (Based on deos communication container)
    //////////////////////////////////////////////////

    //INTERVAL REFRESH HIDDEN STATE - "custom_image_onoff" (Update icons based on received in container)
    for(let i=0; i<customImageOnOffHandler.length; i++)
    {
        try
        {
            let state = g_broadcastDeosContainer[customImageOnOffHandler[i].dataset.comname];

            if(state === true)
            {
                customImageOnOffHandler[i].children[0].classList.add("custom_hidden");
                customImageOnOffHandler[i].children[1].classList.remove("custom_hidden");
            }
            else if(state === false)
            {
                customImageOnOffHandler[i].children[0].classList.remove("custom_hidden");
                customImageOnOffHandler[i].children[1].classList.add("custom_hidden");
            }
        }
        catch(e)
        {
            debug_deos_container_try_mhxanostasio&&console.log(e);
        }
    }

    //INTERVAL REFRESH DISPLAY VALUE - "custom_value_display" (Based on received container)
    for(let i=0; i<customValueDisplayHandler.length; i++)
    {
        try
        {
            customValueDisplayHandler[i].innerHTML = g_broadcastDeosContainer[customValueDisplayHandler[i].dataset.comname].toFixed(1); //Can add +"oC".
        }
        catch(e)
        {
            debug_deos_container_try_mhxanostasio&&console.log(e);
        }
    }
}

//////////////////////////////////////////////////
//PROP INCOMMING
//////////////////////////////////////////////////
const customPropIncommingHandler = document.querySelector(".custom_prop_incomming");

setInterval(PropDisplay, 1000);
function PropDisplay()
{
    const t0 = performance.now();

    let propStr = JSON.stringify(g_broadcastDeosContainer);
    propStr = propStr.replace("{", "");
    propStr = propStr.replace("}", "");
    propStr = propStr.replaceAll('"', '');
    propArray = propStr.split(",");


    //Create new array of arrays
    let newPropArray = [];
    for(let i=0; i<propArray.length; i++)
    {
        let innerArray = propArray[i].split(":");
        newPropArray.push([innerArray[0],innerArray[1]]);
    }

    //Sort array until no sort happens
    let sortHappened;
    do
    {
        sortHappened = false;

        for(let i=0; i<newPropArray.length-1; i++)
        {
            if(newPropArray[i][0]>newPropArray[i+1][0])
            {
                let tempNam = newPropArray[i][0];
                let tempVal = newPropArray[i][1];

                newPropArray[i][0] = newPropArray[i+1][0];
                newPropArray[i][1] = newPropArray[i+1][1];

                newPropArray[i+1][0] = tempNam;
                newPropArray[i+1][1] = tempVal;
                
                sortHappened = true;
            }
        }
    }while(sortHappened);

    let constructStr = "";
    for(let i=0; i<newPropArray.length; i++)
    {
        constructStr += `<div><span>${newPropArray[i][0]} = </span><span style="color:green">${newPropArray[i][1]}</span></div>`;
    }
    customPropIncommingHandler.innerHTML = constructStr;

    const t1 = performance.now();
    performance_prop_incomming&&console.log(`Icomming properties took ${t1 - t0} milliseconds.`);
}

//////////////////////////////////////////////////
//PROP BUTTON
//////////////////////////////////////////////////
const btnPropHandle = document.querySelector("#btn_prop");
btnPropHandle.addEventListener("click", TogglePropMenu);

function TogglePropMenu()
{
    customPropIncommingHandler.classList.toggle("custom_disable");
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//TAB ELEMENT - DRAG CODE (ADDED BEFORE FINISH)
////////////////////////////////////////////////////////////////////////////////////////////////////
dragElement(document.getElementById("mydiv")); // Make the DIV element draggable:

function dragElement(elmnt)
{
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "drag"))
    {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "drag").onmousedown = dragMouseDown;
    }
    else
    {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e)
    {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e)
    {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement()
    {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//TAB ELEMENT - OPEN CLOSE CODE (ADDED BEFORE FINISH)
////////////////////////////////////////////////////////////////////////////////////////////////////

//CLOSE TAB
let closeBtn = document.getElementById("mydivclose");
closeBtn.addEventListener("click", CloseTab);

function CloseTab(inEvent)
{
    // console.log(inEvent.target.parentElement);
    
    inEvent.target.parentElement.classList.add("tab_not_display");
}

//OPEN TAB
document.addEventListener("click", CheckOpenTab);

let btnHandHandle = document.getElementById("btn_hand");
let btnOffHandle = document.getElementById("btn_off");
let btnAutoHandle = document.getElementById("btn_auto");

function CheckOpenTab(inEvent)
{
    if(inEvent.target.classList.contains("tab_btn_simple"))
    {
        ShowTabButton(inEvent.target.dataset.comnum);
        g_currentTabNum = inEvent.target.dataset.comnum;

        closeBtn.parentElement.classList.remove("tab_not_display");

        closeBtn.parentElement.children[0].innerHTML = "clock timer - "+inEvent.target.innerHTML;
    }

    if(inEvent.target.id === "btn_hand_container")
    {
        btnHandHandle.classList.remove("tab_not_display");
        btnOffHandle.classList.add("tab_not_display");
        btnAutoHandle.classList.add("tab_not_display");

        g_tab_container[g_currentTabNum] = "hand";
    }
    if(inEvent.target.id === "btn_off_container")
    {
        btnHandHandle.classList.add("tab_not_display");
        btnOffHandle.classList.remove("tab_not_display");
        btnAutoHandle.classList.add("tab_not_display");

        g_tab_container[g_currentTabNum] = "off";
    }
    if(inEvent.target.id === "btn_auto_container")
    {
        btnHandHandle.classList.add("tab_not_display");
        btnOffHandle.classList.add("tab_not_display");
        btnAutoHandle.classList.remove("tab_not_display");

        g_tab_container[g_currentTabNum] = "auto";
    }
}

function ShowTabButton(inNum)
{
    if(g_tab_container[inNum] === "hand")
    {
        btnHandHandle.classList.remove("tab_not_display");
        btnOffHandle.classList.add("tab_not_display");
        btnAutoHandle.classList.add("tab_not_display");
    }
    else if(g_tab_container[inNum] === "off")
    {
        btnHandHandle.classList.add("tab_not_display");
        btnOffHandle.classList.remove("tab_not_display");
        btnAutoHandle.classList.add("tab_not_display");
    }
    else if(g_tab_container[inNum] === "auto")
    {
        btnHandHandle.classList.add("tab_not_display");
        btnOffHandle.classList.add("tab_not_display");
        btnAutoHandle.classList.remove("tab_not_display");
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//AFTER FINISHED ALL PROJECT
////////////////////////////////////////////////////////////////////////////////////////////////////
let g_nameShow = false;

document.addEventListener("keypress", DebugNameKey);
function DebugNameKey(e)
{
    if(e.key === "n" || e.key === "N")
    {
        g_nameShow = !g_nameShow;
    }
}

document.addEventListener("click", ShowName);
function ShowName(e)
{
    if(g_nameShow)
    {
        if(e.target.classList.contains("tab_btn_simple"))
        {
            let addedChar = "";
            if(g_currentTabNum<9) addedChar = "0";

            alert("k_transistor_"+addedChar+(Number(g_currentTabNum)+1));
        }

        if(e.target.dataset.comname != undefined)
        {
            alert(e.target.dataset.comname);
        }
        else if(e.target.parentElement != null)
        {
            if(e.target.parentElement.dataset.comname != undefined)
            {
                alert(e.target.parentElement.dataset.comname);
            }
        }
    }
}

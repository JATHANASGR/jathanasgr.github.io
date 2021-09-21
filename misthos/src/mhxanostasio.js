////////////////////////////////////////////////////////////////////////////////////////////////////
//TAB ELEMENT - GLOBAL CONTAINER (ADDED BEFORE FINISH)
////////////////////////////////////////////////////////////////////////////////////////////////////
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
        if(inKey.substring(0,2) === "m_")
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
    // INTERVAL SENDS TO DEOS COMMUNICATION
    //////////////////////////////////////////////////

    //INTERVAL SEND - CUSTOM SELECT HOA
    let packetRequest = {deosid: "DeosComInterval"};

    for(let i=0; i<customSelectHandler.length; i++)
    {
        packetRequest[customSelectHandler[i].dataset.comname] = customSelectHandler[i].value;
    }

    broadcastDeosHandle.postMessage(packetRequest);

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

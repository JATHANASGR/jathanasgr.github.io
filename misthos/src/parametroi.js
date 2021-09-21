//////////////////////////////////////////////////
//DEOS COMMUNICATION - INIT
//////////////////////////////////////////////////
const broadcastDeosHandle = new BroadcastChannel("deos"); //Create the channel.
broadcastDeosHandle.addEventListener("message", BroadcastDeosReceived); //Event listener for incoming messages.

//GET ALL THE "custom_input" ELEMENTS
const inputArray = document.querySelectorAll(".custom_value_send");

setInterval(SendAll, g_PropertiesSendInterval);
function SendAll()
{
    let packetRequest = {deosid: "DeosComInterval"};

    for(let i=0; i<inputArray.length; i++)
    {
        
        if(inputArray[i] !== document.activeElement) //Don't send value that in focus thus under change.
        {
            inputArray[i].value = Number(inputArray[i].value).toFixed(1);

            let sKey = inputArray[i].dataset.comname;
            let sVal = inputArray[i].value;
            packetRequest[sKey] = sVal;
        }
    }

    broadcastDeosHandle.postMessage(packetRequest);
}

//ADD CHANGE EVENT LISTENERS TO INPUTS (In case you type+enter the new value)
for(let i=0; i<inputArray.length; i++)
{
    inputArray[i].addEventListener("change", SendChanged);
}

function SendChanged(e)
{
    e.target.value = Number(e.target.value).toFixed(1);

    let sKey = e.target.dataset.comname;
    let sVal = e.target.value;

    let packetRequest = {deosid: "DeosComInterval"};
    packetRequest[sKey] = sVal;
    
    broadcastDeosHandle.postMessage(packetRequest);
}

//////////////////////////////////////////////////
//DEOS COMMUNICATION - RECEIVE ON INTERVAL (Deos triggered)
//////////////////////////////////////////////////
const g_broadcastDeosContainer = {};

function BroadcastDeosReceived(packetReceived)
{
    debug_deos_container_properties&&console.log(g_broadcastDeosContainer);

    //UPDATE CONTAINER WITH RECEIVED KEY VALUE PAIR (Single)
    for(const inKey in packetReceived.data)
    {
        if(inKey.substring(0,2) === "p_")
        {
            g_broadcastDeosContainer[inKey] = packetReceived.data[inKey];
        }
        if(inKey.substring(0,2) === "a_")
        {
            let alertNum = Number(inKey.slice(-1))*20+Number(packetReceived.data[inKey]);
            AlertAdd(alertNum);
        }
    }

}

//////////////////////////////////////////////////
//DEOS COMMUNICATION - SEND ON INTERVAL (Local triggered)
//////////////////////////////////////////////////
const customValueDisplayHandler = document.querySelectorAll(".custom_value_display");

//////////////////////////////////////////////////
//KATHE INTERVAL
//////////////////////////////////////////////////
//Ananewse ta VALUES
setInterval(BroadcastDeosIntervalRefreshDisplays, 1000);
function BroadcastDeosIntervalRefreshDisplays()
{
    //INTERVAL REFRESH DISPLAY VALUE - "custom_value_display" (Based on received container)
    for(let i=0; i<customValueDisplayHandler.length; i++)
    {
        try
        {
            customValueDisplayHandler[i].value = g_broadcastDeosContainer[customValueDisplayHandler[i].dataset.comname].toFixed(1); //Can add +"oC".
        }
        catch(e)
        {
            debug_deos_container_try_properties&&console.log(e);
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//THE CODE BELOW IS ADDED CLOSE TO THE END OF THE PROJECT
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//THE CODE BELOW IS ADDED CLOSE AFTER THE END OF THE PROJECT (FOR ALERTS)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
//ALERTS
//////////////////////////////////////////////////
let g_alertState = false;
let alertsHandle = document.querySelectorAll(".alert_class")

function AlertAdd(inAlertNum)
{
    alertsHandle[inAlertNum].dataset.alerttime = 3;
}

setInterval(AlertShow, 1000);
function AlertShow()
{
    g_alertState = !g_alertState;

    for(let i=0; i<alertsHandle.length; i++)
    {
        if(Number(alertsHandle[i].dataset.alerttime) > 0)
        {
            alertsHandle[i].dataset.alerttime = Number(alertsHandle[i].dataset.alerttime) - 1;
            if(g_alertState)
            {
                alertsHandle[i].classList.add("alert_enable");
            }
            else
            {
                alertsHandle[i].classList.remove("alert_enable");
            }
        }
        else
        {
            alertsHandle[i].dataset.alerttime = 0;
            alertsHandle[i].classList.remove("alert_enable");
        }
    }
}

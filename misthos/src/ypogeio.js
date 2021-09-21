//////////////////////////////////////////////////
// BODY OVERFLOW
//////////////////////////////////////////////////
let bodyHandle = document.querySelector("body");

//////////////////////////////////////////////////
// INDICATOR CREATE KEYBOARD AND MOUSE (ALSO REFREASH IMAGES)
//////////////////////////////////////////////////
let createDesign = false;
let createCamera = false;

if(g_AddDesigns) document.addEventListener("keypress", logKey);
function logKey(e)
{
    //KEYBOARD COMMANDS TO AUTO PLACE DESIGNS OR CAMERAS
    switch (e.code)
    {
        case "KeyO":
            createDesign = true;
            createCamera = false;
            break;
        case "KeyK":
            createDesign = false;
            createCamera = true;
            break;
        case "KeyM":
            createDesign = false;
            createCamera = false;

            enteredFirst = false;
            break;
    }
}

let sX, sY, bX, bY;
let enteredFirst = false;
let g_cameraCounter = 0;
let g_CamSource = "";

document.addEventListener("click", MouseClick);
function MouseClick(e)
{
    //KEYBOARD COMMANDS TO AUTO PLACE DESIGNS OR CAMERAS
    if(createDesign || createCamera)
    {
        if(!enteredFirst)
        {
            //Get first coord for small corcle.
            sX = e.layerX;
            sY = e.layerY;
            
            enteredFirst = true;
        }
        else
        {
            //Get second coord for big corcle.
            bX = e.layerX;
            bY = e.layerY;
            
            enteredFirst = false;

            if(createDesign) g_indicator_container.push([sX,sY,bX,bY,"design"]);
            if(createCamera) g_indicator_container.push([sX,sY,bX,bY,g_camera_url_array[g_cameraCounter++]]);
            
            CreateIndicators();
        }
    }

    if(e.target.classList.contains("camera_small"))
    {
        let cameraBigHandle = document.querySelector(".camera_big");
        cameraBigHandle.src = "";
        
        g_CamSource = e.target.src

        //SHOW FULL SCREEN CAMERA
        g_cameraSmall = false;
        fullScreenContainerHandle.classList.remove("hidden");
        bodyHandle.classList.add("overflow_body"); //Hide the overflows in body.
    }
    else if(e.target.classList.contains("full_screen_container"))
    {
        //HIDE FULL SCREEN CAMERA
        g_cameraSmall = true;
        fullScreenContainerHandle.classList.add("hidden");
        bodyHandle.classList.remove("overflow_body"); //Show the overflows in body.
    }
}

//////////////////////////////////////////////////
// INDICATOR TEXT AUTO DRAW
//////////////////////////////////////////////////
let g_circle_colored_small_radius  = 12;
let g_circle_light_radius   = 44;
let g_circle_colored_radius = 40;
let g_starting_line_length  = 24; //6 3 6 3 6 DASHED LINE
let line_gap = g_circle_colored_radius-8;

//SMALL XY, BIG XY.
// let g_indicator_container = [];
let gx = -20;
let gy = 20;
let y = -12;
let z = -40;
let d = 20;
let g_indicator_container = 
[
    [474+gx, 324+gy, 340+gx, 302+gy, "design"],
    [547+gx, 324+gy, 569+gx, 186+gy, "design"],
    [758+gx, 346+gy, 920+gx, 324+gy, "design"],
    [797+gx, 441+y+gy, 920+gx, 463+y+gy, "design"],
    [797+gx, 496+z+gy, 797+gx, 576+z+d+gy, "https://webcamb1.watching-grass-grow.com/current.jpg"],
    [758+gx, 266+gy, 758+gx, 186+gy, "https://image.shutterstock.com/image-illustration/number-two-polished-golden-object-260nw-371522539.jpg"]
];
let g_camera_url_array = 
[
    "https://webcamb1.watching-grass-grow.com/current.jpg",
    "https://www.zermatt.ch/html/bergbahnen/webcams/bahnhof.jpg",
    "https://image.shutterstock.com/image-illustration/number-two-polished-golden-object-260nw-371522539.jpg",
    "https://image.shutterstock.com/image-illustration/3d-illustration-number-three-polished-260nw-1062245048.jpg",
    "https://st.depositphotos.com/1001311/3411/i/950/depositphotos_34119703-stock-photo-3d-golden-number-collection-4.jpg",
    "https://st.depositphotos.com/1001311/3411/i/950/depositphotos_34119713-stock-photo-3d-golden-number-collection-5.jpg"
];

let indicatorDesignContainerHandle = document.querySelector(".indicator_design_container"); //CONTAINER FOR DESIGNS
let indicatorCameraContainerHandle = document.querySelector(".indicator_camera_container"); //CONTAINER FOR CAMERA IMAGES
let indicatorTextContainerHandle = document.querySelector(".indicator_text_container");     //CONTAINER FOR TEMPS AND HUMIDS

let handleGroup = undefined;
function CreateIndicators()
{
    let counterIndicators = 0;
    let cameraIndicators = 0;

    //Mhdenizoume ta dyo container.
    indicatorDesignContainerHandle.innerHTML = "";
    indicatorTextContainerHandle.innerHTML = "";

    //Mhdenizoume ta dyo container strings.
    let strDesign = "";
    let strCamera = "";
    let strText   = "";

    for(let i=0; i<g_indicator_container.length; i++)
    {
        //Is the current indicator a design?
        let isDesign = false;
        if(g_indicator_container[i][4] === "design") isDesign = true;
        
        if(isDesign) counterIndicators++;

        //DRAW DASHED LINES
        let smallX = g_indicator_container[i][0];
        let smallY = g_indicator_container[i][1];
        let bigX   = g_indicator_container[i][2];
        let bigY   = g_indicator_container[i][3];

        let dX = smallX-bigX;
        let dY = smallY-bigY;

        let distX = Math.abs(dX);
        let distY = Math.abs(dY);
        
        let off_class = "";
        let group_num = " group_num"+i;
        if(isDesign)
        {
            off_class = " indicator_line_dashed_off group"+group_num;
        }

        if(distX>distY) //HORIZONTAL LINE
        {
            if(smallX>bigX) //RIGHT PANW KAI KATW
            {
                p1y = bigY;
                p1x = bigX+g_circle_light_radius+g_starting_line_length;
                p2y = smallY;
                p2x = p1x+distY;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${bigX+g_circle_light_radius}" y1="${bigY}" x2="${p1x}" y2="${p1y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${smallX-g_circle_colored_small_radius}" y1="${smallY}" x2="${p2x}" y2="${p2y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"/>`;
            }
            else //LEFT PANW KAI KATW
            {
                p1y = bigY;
                p1x = bigX-g_circle_light_radius-g_starting_line_length;
                p2y = smallY;
                p2x = p1x-distY;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${bigX-g_circle_light_radius}" y1="${bigY}" x2="${p1x}" y2="${p1y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${smallX+g_circle_colored_small_radius}" y1="${smallY}" x2="${p2x}" y2="${p2y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"/>`;
            }
        }
        else //VERTICAL LINE
        {
            if(smallY>bigY) //DOWN DEKSIA & ARISTERA
            {
                p1x = bigX;
                p1y = bigY+g_circle_light_radius+g_starting_line_length;
                p2x = smallX;
                p2y = p1y+distX;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${bigX}" y1="${bigY+g_circle_light_radius}" x2="${p1x}" y2="${p1y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${smallX}" y1="${smallY-g_circle_colored_small_radius}" x2="${p2x}" y2="${p2y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"/>`;
            }
            else //UP DEKSIA & ARISTERA
            {
                p1x = bigX;
                p1y = bigY-g_circle_light_radius-g_starting_line_length;
                p2x = smallX;
                p2y = p1y-distX;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${bigX}" y1="${bigY-g_circle_light_radius}" x2="${p1x}" y2="${p1y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${smallX}" y1="${smallY+g_circle_colored_small_radius}" x2="${p2x}" y2="${p2y}"/>`;
                strDesign += `<line class="indicator_line_dashed${off_class}" x1="${p1x}" y1="${p1y}" x2="${p2x}" y2="${p2y}"/>`;
            }
        }

        //DRAW KYKLOUS
        
        if(isDesign)
        {
            strDesign += `<circle class="indicator_circle_colored indicator_circle_colored_off group${group_num}" cx="${g_indicator_container[i][0]}" cy="${g_indicator_container[i][1]}" r="${g_circle_colored_small_radius}"/>`;
            strDesign += `<circle class="indicator_circle_light indicator_circle_light_off group${group_num}" cx="${g_indicator_container[i][2]}" cy="${g_indicator_container[i][3]}" r="${g_circle_light_radius}"/>`;
            
            strDesign += `<circle class="indicator_circle_colored indicator_circle_colored_off group${group_num}" cx="${g_indicator_container[i][2]}" cy="${g_indicator_container[i][3]}" r="${g_circle_colored_radius}"/>`;
            strDesign += `<line class="indicator_line_continuous" x1="${g_indicator_container[i][2]-line_gap}" y1="${g_indicator_container[i][3]}.5" x2="${g_indicator_container[i][2]+line_gap}" y2="${g_indicator_container[i][3]}.5"/>`
        }
        else
        {
            strDesign += `<circle class="indicator_circle_colored" cx="${g_indicator_container[i][0]}" cy="${g_indicator_container[i][1]}" r="${g_circle_colored_small_radius}"/>`;
            strDesign += `<circle class="indicator_circle_light" cx="${g_indicator_container[i][2]}" cy="${g_indicator_container[i][3]}" r="${g_circle_light_radius}"/>`;
            
            strCamera += `<div class="indicator_camera_image_container" style="left: ${g_indicator_container[i][2]}px; top: ${g_indicator_container[i][3]}px;"><img class="camera_small" src="${g_camera_url_array[cameraIndicators++]}"></div>`
        }

        //DRAW TEXT
        if(isDesign)
        {
            // VALUE BOXES
            strText += `<div class="indicator_text_temp" style="left:${g_indicator_container[i][2]}px; top:${g_indicator_container[i][3]}px;"></div>`
            strText += `<div class="indicator_text_humi" style="left:${g_indicator_container[i][2]}px; top:${g_indicator_container[i][3]}px;"></div>`
            strText += `<div class="indicator_text_numb" style="left:${g_indicator_container[i][0]}px; top:${g_indicator_container[i][1]}px;">${counterIndicators}</div>`
        }
        else
        {
            strText += `<div class="indicator_text_numb" style="left:${g_indicator_container[i][0]}px; top:${g_indicator_container[i][1]}px;">K</div>`
        }
    }
    indicatorDesignContainerHandle.innerHTML += strDesign;
    indicatorCameraContainerHandle.innerHTML += strCamera;
    indicatorTextContainerHandle.innerHTML += strText;

    if(g_AddDesigns) console.log(g_indicator_container);

    GetGroups();
}
CreateIndicators();

//////////////////////////////////////////////////
// COLOR GROUP HANDLING
//////////////////////////////////////////////////
function GetGroups()
{
    handleGroup = document.querySelectorAll(".group");

    setInterval(GroupUpdate, 1000);
}

function MakeGroupColor(inNum)
{
    for(let j=0; j<handleGroup.length; j++)
    {
        if(handleGroup[j].classList.contains("group_num"+inNum))
        {
            if(handleGroup[j].classList.contains("indicator_circle_light"))
            {
                handleGroup[j].classList.remove("indicator_circle_light_off");
            }
            if(handleGroup[j].classList.contains("indicator_circle_colored"))
            {
                handleGroup[j].classList.remove("indicator_circle_colored_off");
            }
            if(handleGroup[j].classList.contains("indicator_line_dashed"))
            {
                handleGroup[j].classList.remove("indicator_line_dashed_off");
            }
        }
    }
}

function MakeGroupGrey(inNum)
{
    for(let j=0; j<handleGroup.length; j++)
    {
        if(handleGroup[j].classList.contains("group_num"+inNum))
        {
            if(handleGroup[j].classList.contains("indicator_circle_light"))
            {
                handleGroup[j].classList.add("indicator_circle_light_off");
            }
            if(handleGroup[j].classList.contains("indicator_circle_colored"))
            {
                handleGroup[j].classList.add("indicator_circle_colored_off");
            }
            if(handleGroup[j].classList.contains("indicator_line_dashed"))
            {
                handleGroup[j].classList.add("indicator_line_dashed_off");
            }
        }
    }
}

//////////////////////////////////////////////////
// INDICATOR CAMERA
//////////////////////////////////////////////////
let fullScreenContainerHandle = document.querySelector(".full_screen_container");
let g_cameraSmall = true;

setInterval(RefreshCamera, 1000);
function RefreshCamera()
{
    
    if(g_cameraSmall)
    {
        //Refresh all small cameras
        let cameraSmallHandle = document.querySelectorAll(".camera_small");
        
        for(let i=0; i<cameraSmallHandle.length; i++)
        {
            reload = new Date();
            reload = reload.getTime();

            cameraSmallHandle.src = g_camera_url_array[i]+ "?nocache=" + reload;
        }
    }
    else
    {
        //Refresh big camera
        let cameraBigHandle = document.querySelector(".camera_big");

        reload = new Date();
        reload = reload.getTime();

        cameraBigHandle.src = g_CamSource+"?nocache="+reload;
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// FUNCTIONALITY APO MHXANOSTASIO
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

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
        if(inKey.substring(0,2) === "y_")
        {
            g_broadcastDeosContainer[inKey] = packetReceived.data[inKey];

            //IMMEDIATE UPDATE CALL FOR BUTTON DISPLAY RETURN
            if(inKey.substring(0,5) === "y_ypn" || inKey.substring(0,5) === "y_gra" || inKey.substring(0,5) === "y_kou")
            {
                ImmediateDisplay(inKey, packetReceived.data[inKey]);
            }
        }
    }
}

function ImmediateDisplay(inKeyVal, inVal)
{
    //IMMEDIATE REFRESH DISPLAY VALUE - "custom_value_display" (Based on received container)
    for(let i=0; i<customValueDisplayHandler.length; i++)
    {
        try
        {
            if(customValueDisplayHandler[i].dataset.comname === inKeyVal)
            {
                customValueDisplayHandler[i].innerHTML = inVal.toFixed(1);
            }
        }
        catch(e)
        {
            debug_deos_container_try_mhxanostasio&&console.log(e);
        }
    }
}

//////////////////////////////////////////////////
//DEOS COMMUNICATION - SEND ON INTERVAL (Local triggered)
//////////////////////////////////////////////////
const customImageOnOffHandler = document.querySelectorAll(".custom_image_onoff");
const customValueDisplayHandler = document.querySelectorAll(".custom_value_display");

//////////////////////////////////////////////////
//KATHE INTERVAL
//////////////////////////////////////////////////
//Ananewse ta ICONS
//Ananewse ta VALUES
setInterval(BroadcastDeosIntervalSendAndRefresh, 1000);
function BroadcastDeosIntervalSendAndRefresh()
{
    //////////////////////////////////////////////////
    // INTERVAL SENDS TO DEOS COMMUNICATION
    //////////////////////////////////////////////////
    
    //...none

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

let handleIconsYpn = document.querySelector("#icons_ypn");
let handleIconsGra = document.querySelector("#icons_gra");
let handleIconsKou = document.querySelector("#icons_kou");

//////////////////////////////////////////////////
//NEA YLOPOIHSH GROUP (OXI PROCEDURAL)
//////////////////////////////////////////////////
function GroupUpdate()
{
    //ICON ROLOI
    if(g_broadcastDeosContainer["y_ypn_isWorking"])
    {
        handleIconsYpn.children[0].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsYpn.children[0].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_gra_isWorking"])
    {
        handleIconsGra.children[0].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsGra.children[0].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_kou_isWorking"])
    {
        handleIconsKou.children[0].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsKou.children[0].classList.add("oval_icon_off");
    }

    //ICON FAN
    if(g_broadcastDeosContainer["y_ypn_isFanOn"])
    {
        handleIconsYpn.children[1].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsYpn.children[1].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_gra_isFanOn"])
    {
        handleIconsGra.children[1].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsGra.children[1].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_kou_isFanOn"])
    {
        handleIconsKou.children[1].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsKou.children[1].classList.add("oval_icon_off");
    }

    //ICON ENDOD
    if(g_broadcastDeosContainer["y_ypn_isEndodOn"])
    {
        handleIconsYpn.children[2].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsYpn.children[2].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_gra_isEndodOn"])
    {
        handleIconsGra.children[2].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsGra.children[2].classList.add("oval_icon_off");
    }

    if(g_broadcastDeosContainer["y_kou_isEndodOn"])
    {
        handleIconsKou.children[2].classList.remove("oval_icon_off");
    }
    else
    {
        handleIconsKou.children[2].classList.add("oval_icon_off");
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

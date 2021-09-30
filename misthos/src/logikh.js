//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//DEOS COMMUNICATION
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//INIT
//////////////////////////////////////////////////
const broadcastDeosHandle = new BroadcastChannel("deos");               //Create the channel.
broadcastDeosHandle.addEventListener("message", BroadcastDeosReceived); //Event listener for incoming messages.

//////////////////////////////////////////////////
//GLOBAL CONTAINER
//
// Contains 2 types of things.
// 1) ComNames -> FunctionInstances
// 2) ComName -> Values
//
// g_broadcastDeosContainer = 
// {
//     instant_prop_name : prop_function_pointer (Instant function call)
//     ...
//     interval_prop_name : prop_value (Update prop value)
//     ...
// }
//////////////////////////////////////////////////
let g_broadcastDeosContainer = 
{
    g_isCool_bool: "false"
};

//////////////////////////////////////////////////
//RECEIVED
//////////////////////////////////////////////////
function BroadcastDeosReceived(packetReceived)
{
    debug_deos_communication&&console.log("Elaba Deos.");
    debug_deos_communication&&console.log(packetReceived.data);

    if(packetReceived.data.deosid === "DeosComInterval") //SAVE TO LIBRARY
    {
        //RECEIVED PACKET
        //{
        //    deosid: "DeosComInterval"
        //    comname : value
        //    ... (can have more)
        //}

        //REMOVE "deosid" KEY VALUE
        delete packetReceived.data["deosid"];

        //ADD K/V PAIRS OR REFRESH GLOBAL OBJECT CONTAINER
        for(const inKey in packetReceived.data)
        {
            g_broadcastDeosContainer[inKey] = packetReceived.data[inKey];
        }
    }
    else //FUNCTION CALL
    {
        //RECEIVED PACKET
        //{
        //    deosid: comname
        //    ... (can have more)
        //}

        //IMMEDIATE CALL OF NODE FUNCTION (Based on node id)
        g_broadcastDeosContainer[packetReceived.data.deosid].onReceive(packetReceived.data); //Amesh klhsh synarthshs node.
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//MODBUS COMMUNICATION
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//INIT
//////////////////////////////////////////////////
const broadcastModbusHandle = new BroadcastChannel("modbus");               //Create the channel.
broadcastModbusHandle.addEventListener("message", BroadcastModbusReceived); //Event listener for incoming messages.

//////////////////////////////////////////////////
//GLOBAL CONTAINER
//////////////////////////////////////////////////
let g_broadcastModbusContainer = {};

//////////////////////////////////////////////////
//RECEIVED
//////////////////////////////////////////////////
function BroadcastModbusReceived(packetReceived)
{
    debug_modbus_communication&&console.log("Elaba Modbus.");
    debug_modbus_communication&&console.log(packetReceived.data);

    //PROBLEM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! (Undefined) (Underway)
    g_broadcastModbusContainer[packetReceived.data.masterid].onReceive(packetReceived.data);
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// SIDEBAR REGISTERS
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// INDICATOR HANDLING
//////////////////////////////////////////////////
const indicatorHandle = document.querySelector(".module_indicator");
indicatorHandle.addEventListener("animationend", RemoveAnim, false); //On animation end then remove to be able to restart.

function RemoveAnim()
{
    indicatorHandle.style.animationName = "";
}

//////////////////////////////////////////////////
// SIDEBAR CREATE AND HANDLE
//////////////////////////////////////////////////
document.addEventListener("mousedown", InputFocusHandler);
function InputFocusHandler(e)
{
    if(e.target.classList.contains("register_input"))
    {
        e.target.focus();
    }
}

class Sidebar
{
    constructor(inComHandle, inComContainer)
    {
        this.c_masterid = generateId(16);

        this.c_comHandle = inComHandle;
        inComContainer[this.c_masterid] = this; //Master Id and Instance storing in container.

        this.c_slavesAdded = false;

        this.c_htmlContainer = document.querySelector("#id_module_container");
        this.c_inputsArray = [];

        this.notImportantFirstDone = false;

        setInterval(this.sendPacket, g_SidebarInterval, this);
    }

    inputChanged(e)
    {
        //Update the indicator.
        const preTitle = e.target.previousElementSibling.parentElement.previousElementSibling.innerHTML.substring(0,5);

        indicatorHandle.style.animationName = "example";
        indicatorHandle.innerHTML = `CHANGED : ${preTitle}... ${e.target.previousElementSibling.innerHTML} = ${e.target.value}`

        //Write to the register.
        let slaveRegStr =  e.target.dataset.regkey;
        let arrayStr = slaveRegStr.split(":");
        let slaveStr = arrayStr[0].substring(1, 10);
        let regStr = arrayStr[1].substring(1, 10);

        //CREATE PACKET
        let packetRequest =
        {
            "masterid": this.c_masterid,
            "slave": slaveStr,
            "action": "ws",
            "register": regStr,
            "value": e.target.value
        }

        //SEND PACKET
        this.c_comHandle.postMessage(packetRequest);
    }

    sendPacket(inThis)
    {
        //CREATE PACKET
        let packetRequest =
        {
            "masterid": inThis.c_masterid,
            "action": "ra"
        }

        //SEND PACKET
        inThis.c_comHandle.postMessage(packetRequest);
    }
    
    onReceive(inReceive)
    {
        const t0 = performance.now();

        let inputCounter = 0;

        if(!this.c_slavesAdded)
        {
            for (const inSlave in inReceive.register) //For all slaves in packet.
            {
                let htmlStringPack = "";

                let classStr = "";
                if(!this.notImportantFirstDone)
                {
                    classStr = " first"
                    this.notImportantFirstDone = true;
                }

                htmlStringPack += `<div class="module_title${classStr}">${g_Titles[inSlave]}</div>`;
                htmlStringPack += `<div class="module_content module_disable">`;
                for (const inReg in inReceive.register[inSlave])
                {
                    htmlStringPack += `<div class="register_title">R${inReg}</div>`;
                    htmlStringPack += `<input data-regkey=S${inSlave}:R${inReg} class="register_input" type="number" value="${inReceive.register[inSlave][inReg][0]}" min="${inReceive.register[inSlave][inReg][1]}" max="${inReceive.register[inSlave][inReg][2]}" step="${inReceive.register[inSlave][inReg][3]}">`;
                    htmlStringPack += `<div class="register_description">${inReceive.register[inSlave][inReg][5]}</div>`;
                }
                htmlStringPack += `</div>`;

                this.c_htmlContainer.insertAdjacentHTML("beforeend", htmlStringPack);
            }
            this.c_slavesAdded = true;

            this.c_inputsArray = document.querySelectorAll(".register_input"); // On every slave/inputs addition get all the inputs.
            for(let i=0; i<this.c_inputsArray.length; i++)
            {
                this.c_inputsArray[i].addEventListener("change", this.inputChanged.bind(this)); // Add "change" event listeners during initialization of registers.
            }
        }
        else
        {
            for (const inSlave in inReceive.register) //For all slaves in packet.
            {
                for (const inReg in inReceive.register[inSlave])
                {
                    if(this.c_inputsArray[inputCounter] !== document.activeElement)
                    {
                        this.c_inputsArray[inputCounter].value = inReceive.register[inSlave][inReg][0];
                    }
                    inputCounter++;
                }
            }
        }
        
        const t1 = performance.now();
        debug_sidebar&&console.log(`sidebar took ${t1 - t0} milliseconds for ${inputCounter} items.`);
    }
}
let sidebarInst = new Sidebar(broadcastModbusHandle, g_broadcastModbusContainer);

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// LITEGRAPH RESIZING
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
const canvasHandle = document.querySelector(".canvas_class");
const graphContainerHandle = document.querySelector(".graph_container");

g_canvasWidth = 0;
g_canvasHeight = 0;
function ChangeResolution()
{
    const measureWidth = graphContainerHandle.clientWidth;
    const measureHeight = graphContainerHandle.clientHeight;
    
    if(g_canvasWidth != measureWidth || g_canvasHeight != measureHeight)
    {
        canvasHandle.width = measureWidth;
        canvasHandle.height = measureHeight;
        
        g_canvasWidth = measureWidth;
        g_canvasHeight = measureHeight;
        
        //console.log(`ALLAKSA MEGETHOS SE W: ${measureWidth}, H: ${measureHeight}`);
    }

    setTimeout(ChangeResolution, 1000);
}
ChangeResolution();

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// LITEGRAPH INIT
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
let graph = new LGraph();
let canvas = new LGraphCanvas(".canvas_class", graph);

canvas.allow_searchbox = false;         //DON'T CHANGE
canvas.render_canvas_border = false;    //DON'T CHANGE
canvas.zoom_modify_alpha = false;       //DON'T CHANGE
canvas.clear_background = false;        //DON'T CHANGE

canvas.ds.min_scale = g_min_scale; //DON'T CHANGE
canvas.ds.max_scale = g_max_scale; //DON'T CHANGE

canvas.ds.scale = g_scale; //zoom

canvas.ds.offset[0] = g_offsetX; //x
canvas.ds.offset[1] = g_offsetY; //y

graph.start(g_LitegraphInterval); //SOS INTERVAL 1000ms FROM GLOBAL

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// LITEGRAPH CREATION TEST (AFTER INIT)
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region DATABASE (Should be first!)
//////////////////////////////////////////////////
const databasePosition = {x:50, y:50};

let database_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
database_ConstNumber00.pos = [databasePosition.x-170,databasePosition.y];
database_ConstNumber00.init(g_DeosDatabaseInterval);
graph.add(database_ConstNumber00);

let database_TimerTRG00 = LiteGraph.createNode("DeosTrigger/TimerTRG");
database_TimerTRG00.pos = [databasePosition.x,databasePosition.y];
graph.add(database_TimerTRG00);

let database_BusReadAllTRG00 = LiteGraph.createNode("DeosTrigger/BusReadAllTRG");
database_BusReadAllTRG00.pos = [databasePosition.x+200,databasePosition.y];
database_BusReadAllTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer);
graph.add(database_BusReadAllTRG00);

database_ConstNumber00.connect(0, database_TimerTRG00, 0);
database_TimerTRG00.connect(0, database_BusReadAllTRG00, 0);

let anak_PropDatabase00 = LiteGraph.createNode("Deos/PropIncoming");
anak_PropDatabase00.pos = [databasePosition.x+400,databasePosition.y];
anak_PropDatabase00.init(g_broadcastDeosContainer);
graph.add(anak_PropDatabase00);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const anakPosition = {x:750, y:-1780};
//////////////////////////////////////////////////
//#region ANAKYKLOFORIA
//////////////////////////////////////////////////
let anak_Title00 = LiteGraph.createNode("Deos/Title");
anak_Title00.pos = [anakPosition.x,anakPosition.y-220];
anak_Title00.init("ΛΟΓΙΚΗ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ - Με <Setpoint Xflow> και <Διαφορικό>.", 1000);
graph.add(anak_Title00);

let anak_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
anak_LocalReadReg00.pos = [anakPosition.x,anakPosition.y];
anak_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R105");
graph.add(anak_LocalReadReg00);

let anak_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
anak_ConstNumber00.pos = [anakPosition.x,anakPosition.y+100];
anak_ConstNumber00.init(10);
graph.add(anak_ConstNumber00);

let anak_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
anak_DivideNumber00.pos = [anakPosition.x+200,anakPosition.y];
graph.add(anak_DivideNumber00);

let anak_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
anak_PropReadNumber00.pos = [anakPosition.x+200,anakPosition.y+100];
anak_PropReadNumber00.init(g_broadcastDeosContainer, "p_anak_SP");
graph.add(anak_PropReadNumber00);

let anak_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
anak_PropReadNumber01.pos = [anakPosition.x+200,anakPosition.y+200];
anak_PropReadNumber01.init(g_broadcastDeosContainer, "p_anak_DT");
graph.add(anak_PropReadNumber01);

let anak_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
anak_PropSendNumber00.pos = [anakPosition.x+400,anakPosition.y-70];
anak_PropSendNumber00.init(broadcastDeosHandle, "m_anak_temp");
graph.add(anak_PropSendNumber00);

let zzz_PropSaveNumber00T03 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T03.pos = [anakPosition.x+400,anakPosition.y-140];
zzz_PropSaveNumber00T03.init(g_broadcastDeosContainer, "g_alert_T03");
graph.add(zzz_PropSaveNumber00T03);
anak_DivideNumber00.connect(0, zzz_PropSaveNumber00T03, 0);

let anak_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
anak_CompareHeat00.pos = [anakPosition.x+400,anakPosition.y];
graph.add(anak_CompareHeat00);

let anak_PropSelectHOA00 = LiteGraph.createNode("Deos/PropSelectHOA");
anak_PropSelectHOA00.pos = [anakPosition.x+600,anakPosition.y];
anak_PropSelectHOA00.init(g_broadcastDeosContainer, "m_anak_select");
graph.add(anak_PropSelectHOA00);

let anak_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
anak_PropSendBoolean00.pos = [anakPosition.x+600,anakPosition.y+100];
anak_PropSendBoolean00.init(broadcastDeosHandle, "m_anak_demand_led");
graph.add(anak_PropSendBoolean00);

let anak_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
anak_PropSendBoolean01.pos = [anakPosition.x+800,anakPosition.y];
anak_PropSendBoolean01.init(broadcastDeosHandle, "m_anak_circ");
graph.add(anak_PropSendBoolean01);

let anak_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
anak_PropSaveBoolean00.pos = [anakPosition.x+800,anakPosition.y+70];
anak_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_anak_circ");
graph.add(anak_PropSaveBoolean00);

anak_LocalReadReg00.connect(0, anak_DivideNumber00, 0);
anak_ConstNumber00.connect(0, anak_DivideNumber00, 1);
anak_DivideNumber00.connect(0, anak_CompareHeat00, 0);
anak_DivideNumber00.connect(0, anak_PropSendNumber00, 0);
anak_PropReadNumber00.connect(0, anak_CompareHeat00, 1);
anak_PropReadNumber01.connect(0, anak_CompareHeat00, 2);
anak_CompareHeat00.connect(0, anak_PropSelectHOA00, 0);
anak_CompareHeat00.connect(0, anak_PropSendBoolean00, 0);
anak_PropSelectHOA00.connect(0, anak_PropSendBoolean01, 0);
anak_PropSelectHOA00.connect(0, anak_PropSaveBoolean00, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const antirPosition = {x:750, y:-1210};
//////////////////////////////////////////////////
//#region ANTIRROH
//////////////////////////////////////////////////
let antir_Title00 = LiteGraph.createNode("Deos/Title");
antir_Title00.pos = [antirPosition.x,antirPosition.y-220];
antir_Title00.init("ΛΟΓΙΚΗ ΑΝΤΙΡΡΟΗΣ - Με <Setpoint Θ2> και <Διαφορικό>.", 1000);
graph.add(antir_Title00);

let antir_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
antir_LocalReadReg00.pos = [antirPosition.x,antirPosition.y];
antir_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R104");
graph.add(antir_LocalReadReg00);

let antir_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
antir_ConstNumber00.pos = [antirPosition.x,antirPosition.y+100];
antir_ConstNumber00.init(10);
graph.add(antir_ConstNumber00);

let antir_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
antir_DivideNumber00.pos = [antirPosition.x+200,antirPosition.y];
graph.add(antir_DivideNumber00);

let antir_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
antir_PropReadNumber00.pos = [antirPosition.x+200,antirPosition.y+100];
antir_PropReadNumber00.init(g_broadcastDeosContainer, "p_antir_SP");
graph.add(antir_PropReadNumber00);

let antir_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
antir_PropReadNumber01.pos = [antirPosition.x+200,antirPosition.y+200];
antir_PropReadNumber01.init(g_broadcastDeosContainer, "p_antir_DT");
graph.add(antir_PropReadNumber01);

let antir_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
antir_PropSendNumber00.pos = [antirPosition.x+400,antirPosition.y-70];
antir_PropSendNumber00.init(broadcastDeosHandle, "m_antir_temp");
graph.add(antir_PropSendNumber00);

let zzz_PropSaveNumber00T02 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T02.pos = [antirPosition.x+400,antirPosition.y-140];
zzz_PropSaveNumber00T02.init(g_broadcastDeosContainer, "g_alert_T02");
graph.add(zzz_PropSaveNumber00T02);
antir_DivideNumber00.connect(0, zzz_PropSaveNumber00T02, 0);

let antir_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
antir_CompareHeat00.pos = [antirPosition.x+400,antirPosition.y];
graph.add(antir_CompareHeat00);

let antir_PropSelectHOA00 = LiteGraph.createNode("Deos/PropSelectHOA");
antir_PropSelectHOA00.pos = [antirPosition.x+600,antirPosition.y];
antir_PropSelectHOA00.init(g_broadcastDeosContainer, "m_antir_select");
graph.add(antir_PropSelectHOA00);

let antir_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
antir_PropSendBoolean00.pos = [antirPosition.x+600,antirPosition.y+100];
antir_PropSendBoolean00.init(broadcastDeosHandle, "m_antir_demand_led");
graph.add(antir_PropSendBoolean00);

let antir_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
antir_PropSendBoolean01.pos = [antirPosition.x+800,antirPosition.y];
antir_PropSendBoolean01.init(broadcastDeosHandle, "m_antir_circ");
graph.add(antir_PropSendBoolean01);

let antir_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
antir_PropSaveBoolean00.pos = [antirPosition.x+800,antirPosition.y+70];
antir_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_antir_circ");
graph.add(antir_PropSaveBoolean00);

antir_LocalReadReg00.connect(0, antir_DivideNumber00, 0);
antir_ConstNumber00.connect(0, antir_DivideNumber00, 1);
antir_DivideNumber00.connect(0, antir_CompareHeat00, 0);
antir_DivideNumber00.connect(0, antir_PropSendNumber00, 0);
antir_PropReadNumber00.connect(0, antir_CompareHeat00, 1);
antir_PropReadNumber01.connect(0, antir_CompareHeat00, 2);
antir_CompareHeat00.connect(0, antir_PropSelectHOA00, 0);
antir_CompareHeat00.connect(0, antir_PropSendBoolean00, 0);
antir_PropSelectHOA00.connect(0, antir_PropSendBoolean01, 0);
antir_PropSelectHOA00.connect(0, antir_PropSaveBoolean00, 0);
//////////////////////////////////////////////////
//#endregion ANTIRROH
//////////////////////////////////////////////////

const antisPosition = {x:750, y:-640};
//////////////////////////////////////////////////
//#region ANTISTASH
//////////////////////////////////////////////////
let antis_Title00 = LiteGraph.createNode("Deos/Title");
antis_Title00.pos = [antisPosition.x,antisPosition.y-220];
antis_Title00.init("ΛΟΓΙΚΗ ΑΝΤΙΣΤΑΣΗΣ - Με <Setpoint Θ1> και <Διαφορικό>.", 1000);
graph.add(antis_Title00);

let antis_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
antis_LocalReadReg00.pos = [antisPosition.x,antisPosition.y+70];
antis_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R103");
graph.add(antis_LocalReadReg00);

let antis_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
antis_ConstNumber00.pos = [antisPosition.x,antisPosition.y+170];
antis_ConstNumber00.init(10);
graph.add(antis_ConstNumber00);

let antis_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
antis_DivideNumber00.pos = [antisPosition.x+200,antisPosition.y+70];
graph.add(antis_DivideNumber00);

let antis_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
antis_PropReadNumber00.pos = [antisPosition.x+200,antisPosition.y+170];
antis_PropReadNumber00.init(g_broadcastDeosContainer, "p_antis_SP");
graph.add(antis_PropReadNumber00);

let antis_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
antis_PropReadNumber01.pos = [antisPosition.x+200,antisPosition.y+270];
antis_PropReadNumber01.init(g_broadcastDeosContainer, "p_antis_DT");
graph.add(antis_PropReadNumber01);

let antis_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
antis_PropSendNumber00.pos = [antisPosition.x+400,antisPosition.y];
antis_PropSendNumber00.init(broadcastDeosHandle, "m_antis_temp");
graph.add(antis_PropSendNumber00);

//Y_YPOGEIO
let antis_PropSendNumberY00 = LiteGraph.createNode("Deos/PropSendNumber");
antis_PropSendNumberY00.pos = [antisPosition.x+400,antisPosition.y-70];
antis_PropSendNumberY00.init(broadcastDeosHandle, "y_antis_temp");
graph.add(antis_PropSendNumberY00);
antis_DivideNumber00.connect(0, antis_PropSendNumberY00, 0);

let zzz_PropSaveNumber00T01 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T01.pos = [antisPosition.x+400,antisPosition.y-140];
zzz_PropSaveNumber00T01.init(g_broadcastDeosContainer, "g_alert_T01");
graph.add(zzz_PropSaveNumber00T01);
antis_DivideNumber00.connect(0, zzz_PropSaveNumber00T01, 0);

let antis_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
antis_CompareHeat00.pos = [antisPosition.x+400,antisPosition.y+70];
graph.add(antis_CompareHeat00);

let antis_PropSelectHOA00 = LiteGraph.createNode("Deos/PropSelectHOA");
antis_PropSelectHOA00.pos = [antisPosition.x+600,antisPosition.y+70];
antis_PropSelectHOA00.init(g_broadcastDeosContainer, "m_antis_select");
graph.add(antis_PropSelectHOA00);

let antis_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
antis_PropSendBoolean00.pos = [antisPosition.x+600,antisPosition.y+170];
antis_PropSendBoolean00.init(broadcastDeosHandle, "m_antis_demand_led");
graph.add(antis_PropSendBoolean00);

let antis_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
antis_PropSendBoolean01.pos = [antisPosition.x+800,antisPosition.y+70];
antis_PropSendBoolean01.init(broadcastDeosHandle, "m_isAntisOn");
graph.add(antis_PropSendBoolean01);

let antis_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
antis_PropSaveBoolean00.pos = [antisPosition.x+800,antisPosition.y+140];
antis_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_isAntisOn");
graph.add(antis_PropSaveBoolean00);

antis_LocalReadReg00.connect(0, antis_DivideNumber00, 0);
antis_ConstNumber00.connect(0, antis_DivideNumber00, 1);
antis_DivideNumber00.connect(0, antis_CompareHeat00, 0);
antis_DivideNumber00.connect(0, antis_PropSendNumber00, 0);
antis_PropReadNumber00.connect(0, antis_CompareHeat00, 1);
antis_PropReadNumber01.connect(0, antis_CompareHeat00, 2);
antis_CompareHeat00.connect(0, antis_PropSelectHOA00, 0);
antis_CompareHeat00.connect(0, antis_PropSendBoolean00, 0);
antis_PropSelectHOA00.connect(0, antis_PropSendBoolean01, 0);
antis_PropSelectHOA00.connect(0, antis_PropSaveBoolean00, 0);
//////////////////////////////////////////////////
//#endregion ANTISTASH
//////////////////////////////////////////////////

const hliakPosition = {x:2150, y:-2350};
//////////////////////////////////////////////////
//#region HLIAKA
//////////////////////////////////////////////////
let hliak_Title00 = LiteGraph.createNode("Deos/Title");
hliak_Title00.pos = [hliakPosition.x,hliakPosition.y-330];
hliak_Title00.init("ΛΟΓΙΚΗ ΗΛΙΑΚΩΝ - Με <Ζήτηση Xflow>, <Διαφορικό>, <Ψύξη Ηλιακών>, <Ασφάλεια Xflow>, <Αφάλεια Δικτύου>.", 1000);
graph.add(hliak_Title00);

const hliakPositionS0 = {x:hliakPosition.x+1030,y:hliakPosition.y+260}; //LOCAL REAAD REG

const hliakPositionC0 = {x:hliakPosition.x+180,y:hliakPosition.y-240};  // CHARGE XFLOW COMPARE
const hliakPositionC4 = {x:hliakPosition.x,y:hliakPosition.y+140};      // DELTA SOLAR XFLOW COMPARE

const hliakPositionC1 = {x:hliakPosition.x+180,y:hliakPosition.y+290};  // COOL SOLAR COMPARE

const hliakPositionC2 = {x:hliakPosition.x+180,y:hliakPosition.y+510};  // SAFE XFLOW COMPARE
const hliakPositionC3 = {x:hliakPosition.x+180,y:hliakPosition.y+730};  // SAFE PIPE COMPARE

const hliakPositionH0 = {x:hliakPosition.x+630,y:hliakPosition.y-20};   // FINAL LOGIC

//////////////////////////////////////////////////
// LOCAL REG
//////////////////////////////////////////////////
let hliak_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
hliak_LocalReadReg00.pos = [hliakPositionS0.x,hliakPositionS0.y+100];
hliak_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R102");
graph.add(hliak_LocalReadReg00);

let hliak_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
hliak_LocalReadReg01.pos = [hliakPositionS0.x,hliakPositionS0.y];
hliak_LocalReadReg01.init(database_BusReadAllTRG00, "S40:R107");
graph.add(hliak_LocalReadReg01);

let hliak_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
hliak_ConstNumber00.pos = [hliakPositionS0.x,hliakPositionS0.y+200];
hliak_ConstNumber00.init(10);
graph.add(hliak_ConstNumber00);

let hliak_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
hliak_DivideNumber01.pos = [hliakPositionS0.x+200,hliakPositionS0.y];
graph.add(hliak_DivideNumber01);

let hliak_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
hliak_DivideNumber00.pos = [hliakPositionS0.x+200,hliakPositionS0.y+100];
graph.add(hliak_DivideNumber00);

let hliak_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
hliak_PropSendNumber00.pos = [hliakPositionS0.x+400,hliakPositionS0.y+170];
hliak_PropSendNumber00.init(broadcastDeosHandle, "m_hliak_xflow_katw_temp");
graph.add(hliak_PropSendNumber00);

let hliak_PropSaveNumber01 = LiteGraph.createNode("Deos/PropSaveNumber");
hliak_PropSaveNumber01.pos = [hliakPositionS0.x+400,hliakPositionS0.y+100];
hliak_PropSaveNumber01.init(g_broadcastDeosContainer, "g_hliak_xflow_temp");
graph.add(hliak_PropSaveNumber01);

let hliak_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
hliak_PropSendNumber01.pos = [hliakPositionS0.x+400,hliakPositionS0.y-70];
hliak_PropSendNumber01.init(broadcastDeosHandle, "m_hliak_solar_temp");
graph.add(hliak_PropSendNumber01);

let hliak_PropSaveNumber00 = LiteGraph.createNode("Deos/PropSaveNumber");
hliak_PropSaveNumber00.pos = [hliakPositionS0.x+400,hliakPositionS0.y];
hliak_PropSaveNumber00.init(g_broadcastDeosContainer, "g_hliak_solar_temp");
graph.add(hliak_PropSaveNumber00);

//Y_YPOGEIO
let hliak_PropSendNumberY00 = LiteGraph.createNode("Deos/PropSendNumber");
hliak_PropSendNumberY00.pos = [hliakPositionS0.x+400,hliakPositionS0.y-140];
hliak_PropSendNumberY00.init(broadcastDeosHandle, "y_hliak_solar_temp");
graph.add(hliak_PropSendNumberY00);
hliak_DivideNumber01.connect(0, hliak_PropSendNumberY00, 0);

// hliak_LocalReadReg00 = "S40:R102"
// hliak_DivideNumber00
// hliak_PropSendNumber00 = "m_hliak_xflow_katw_temp"
hliak_LocalReadReg00.connect(0, hliak_DivideNumber00, 0);
hliak_ConstNumber00.connect(0, hliak_DivideNumber00, 1);
hliak_DivideNumber00.connect(0, hliak_PropSendNumber00, 0);
hliak_DivideNumber00.connect(0, hliak_PropSaveNumber01, 0);

// hliak_LocalReadReg01 = "S40:R107"
// hliak_DivideNumber01
// hliak_PropSendNumber01 = "m_hliak_solar_temp"
hliak_LocalReadReg01.connect(0, hliak_DivideNumber01, 0);
hliak_ConstNumber00.connect(0, hliak_DivideNumber01, 1);
hliak_DivideNumber01.connect(0, hliak_PropSendNumber01, 0);
hliak_DivideNumber01.connect(0, hliak_PropSaveNumber00, 0);

//////////////////////////////////////////////////
// SAFE PIPE COMPARE
//////////////////////////////////////////////////
let hliak_PropReadNumber13 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber13.pos = [hliakPositionC3.x,hliakPositionC3.y];
hliak_PropReadNumber13.init(g_broadcastDeosContainer, "g_hliak_solar_temp");
graph.add(hliak_PropReadNumber13);

let hliak_PropReadNumber08 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber08.pos = [hliakPositionC3.x,hliakPositionC3.y+70];
hliak_PropReadNumber08.init(g_broadcastDeosContainer, "p_hliak_safePipeSP");
graph.add(hliak_PropReadNumber08);

let hliak_PropReadNumber09 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber09.pos = [hliakPositionC3.x,hliakPositionC3.y+140];
hliak_PropReadNumber09.init(g_broadcastDeosContainer, "p_hliak_safePipeDT");
graph.add(hliak_PropReadNumber09);

let hliak_CompareHeat03 = LiteGraph.createNode("Deos/CompareHeat");
hliak_CompareHeat03.pos = [hliakPositionC3.x+220,hliakPositionC3.y];
graph.add(hliak_CompareHeat03);

hliak_PropReadNumber13.connect(0, hliak_CompareHeat03, 0);
hliak_PropReadNumber08.connect(0, hliak_CompareHeat03, 1);
hliak_PropReadNumber09.connect(0, hliak_CompareHeat03, 2);

//////////////////////////////////////////////////
// COOL SOLAR COMPARE
//////////////////////////////////////////////////
let hliak_PropReadNumber14 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber14.pos = [hliakPositionC1.x,hliakPositionC1.y];
hliak_PropReadNumber14.init(g_broadcastDeosContainer, "g_hliak_solar_temp");
graph.add(hliak_PropReadNumber14);

let hliak_PropReadNumber04 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber04.pos = [hliakPositionC1.x,hliakPositionC1.y+70];
hliak_PropReadNumber04.init(g_broadcastDeosContainer, "p_hliak_coolSP");
graph.add(hliak_PropReadNumber04);

let hliak_PropReadNumber05 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber05.pos = [hliakPositionC1.x,hliakPositionC1.y+140];
hliak_PropReadNumber05.init(g_broadcastDeosContainer, "p_hliak_coolDT");
graph.add(hliak_PropReadNumber05);

let hliak_CompareHeat01 = LiteGraph.createNode("Deos/CompareHeat");
hliak_CompareHeat01.pos = [hliakPositionC1.x+220,hliakPositionC1.y];
graph.add(hliak_CompareHeat01);

let hliak_Not00 = LiteGraph.createNode("Deos/Not");
hliak_Not00.pos = [hliakPositionC1.x+430,hliakPositionC1.y];
graph.add(hliak_Not00);

hliak_PropReadNumber14.connect(0, hliak_CompareHeat01, 0);
hliak_PropReadNumber04.connect(0, hliak_CompareHeat01, 1);
hliak_PropReadNumber05.connect(0, hliak_CompareHeat01, 2);
hliak_CompareHeat01.connect(0, hliak_Not00, 0);

//////////////////////////////////////////////////
// SAFE XFLOW COMPARE
//////////////////////////////////////////////////
let hliak_PropReadNumber10 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber10.pos = [hliakPositionC2.x,hliakPositionC2.y];
hliak_PropReadNumber10.init(g_broadcastDeosContainer, "g_hliak_xflow_temp");
graph.add(hliak_PropReadNumber10);

let hliak_PropReadNumber06 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber06.pos = [hliakPositionC2.x,hliakPositionC2.y+70];
hliak_PropReadNumber06.init(g_broadcastDeosContainer, "p_hliak_safeXflowSP");
graph.add(hliak_PropReadNumber06);

let hliak_PropReadNumber07 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber07.pos = [hliakPositionC2.x,hliakPositionC2.y+140];
hliak_PropReadNumber07.init(g_broadcastDeosContainer, "p_hliak_safeXflowDT");
graph.add(hliak_PropReadNumber07);

let hliak_CompareHeat02 = LiteGraph.createNode("Deos/CompareHeat");
hliak_CompareHeat02.pos = [hliakPositionC2.x+220,hliakPositionC2.y];
graph.add(hliak_CompareHeat02);

hliak_PropReadNumber10.connect(0, hliak_CompareHeat02, 0);
hliak_PropReadNumber06.connect(0, hliak_CompareHeat02, 1);
hliak_PropReadNumber07.connect(0, hliak_CompareHeat02, 2);

//////////////////////////////////////////////////
// CHARGE XFLOW COMPARE
//////////////////////////////////////////////////
let hliak_PropReadNumber11 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber11.pos = [hliakPositionC0.x,hliakPositionC0.y];
hliak_PropReadNumber11.init(g_broadcastDeosContainer, "g_hliak_xflow_temp");
graph.add(hliak_PropReadNumber11);

let hliak_PropReadNumber02 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber02.pos = [hliakPositionC0.x,hliakPositionC0.y+70];
hliak_PropReadNumber02.init(g_broadcastDeosContainer, "p_hliak_xflowSP");
graph.add(hliak_PropReadNumber02);

let hliak_PropReadNumber03 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber03.pos = [hliakPositionC0.x,hliakPositionC0.y+140];
hliak_PropReadNumber03.init(g_broadcastDeosContainer, "p_hliak_xflowDT");
graph.add(hliak_PropReadNumber03);

let hliak_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
hliak_CompareHeat00.pos = [hliakPositionC0.x+220,hliakPositionC0.y];
graph.add(hliak_CompareHeat00);

let hliak_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
hliak_PropSendBoolean00.pos = [hliakPositionC0.x+450,hliakPositionC0.y];
hliak_PropSendBoolean00.init(broadcastDeosHandle, "m_hliak_demand_led");
graph.add(hliak_PropSendBoolean00);

hliak_PropReadNumber11.connect(0, hliak_CompareHeat00, 0);
hliak_PropReadNumber02.connect(0, hliak_CompareHeat00, 1);
hliak_PropReadNumber03.connect(0, hliak_CompareHeat00, 2);
hliak_CompareHeat00.connect(0, hliak_PropSendBoolean00, 0);

//////////////////////////////////////////////////
// DELTA SOLAR XFLOW COMPARE
//////////////////////////////////////////////////
let hliak_PropReadNumber15 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber15.pos = [hliakPositionC4.x,hliakPositionC4.y-140];
hliak_PropReadNumber15.init(g_broadcastDeosContainer, "g_hliak_solar_temp");
graph.add(hliak_PropReadNumber15);

let hliak_PropReadNumber12 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber12.pos = [hliakPositionC4.x,hliakPositionC4.y-70];
hliak_PropReadNumber12.init(g_broadcastDeosContainer, "g_hliak_xflow_temp");
graph.add(hliak_PropReadNumber12);

let hliak_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber00.pos = [hliakPositionC4.x,hliakPositionC4.y];
hliak_PropReadNumber00.init(g_broadcastDeosContainer, "p_hliak_deltaON");
graph.add(hliak_PropReadNumber00);

let hliak_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
hliak_PropReadNumber01.pos = [hliakPositionC4.x,hliakPositionC4.y+70];
hliak_PropReadNumber01.init(g_broadcastDeosContainer, "p_hliak_deltaOFF");
graph.add(hliak_PropReadNumber01);

let hliak_SubtractNumber01 = LiteGraph.createNode("Deos/SubtractNumber");
hliak_SubtractNumber01.pos = [hliakPositionC4.x+200,hliakPositionC4.y];
graph.add(hliak_SubtractNumber01);

let hliak_SubtractNumber00 = LiteGraph.createNode("Deos/SubtractNumber");
hliak_SubtractNumber00.pos = [hliakPositionC4.x+200,hliakPositionC4.y-140];
graph.add(hliak_SubtractNumber00);

let hliak_CompareCool01 = LiteGraph.createNode("Deos/CompareCool");
hliak_CompareCool01.pos = [hliakPositionC4.x+400,hliakPositionC4.y-140];
graph.add(hliak_CompareCool01);

hliak_PropReadNumber15.connect(0, hliak_SubtractNumber00, 0);
hliak_PropReadNumber12.connect(0, hliak_SubtractNumber00, 1);
hliak_PropReadNumber00.connect(0, hliak_SubtractNumber01, 0);
hliak_PropReadNumber01.connect(0, hliak_SubtractNumber01, 1);
hliak_SubtractNumber00.connect(0, hliak_CompareCool01, 0);
hliak_PropReadNumber01.connect(0, hliak_CompareCool01, 1);
hliak_SubtractNumber01.connect(0, hliak_CompareCool01, 2);

//////////////////////////////////////////////////
// FINAL LOGIC
//////////////////////////////////////////////////

//PROPERTIES
// "p_hliak_deltaON"
// "p_hliak_deltaOFF"
// "p_hliak_xflowSP"
// "p_hliak_xflowDT"
// "p_hliak_coolSP"
// "p_hliak_coolDT"
// "p_hliak_safeXflowSP"
// "p_hliak_safeXflowDT"
// "p_hliak_safePipeSP"
// "p_hliak_safePipeDT"

let hliak_And200 = LiteGraph.createNode("Deos/And2");
hliak_And200.pos = [hliakPositionH0.x,hliakPositionH0.y];
graph.add(hliak_And200);

let hliak_Or200 = LiteGraph.createNode("Deos/Or2");
hliak_Or200.pos = [hliakPositionH0.x+200,hliakPositionH0.y];
graph.add(hliak_Or200);

let hliak_And300 = LiteGraph.createNode("Deos/And3");
hliak_And300.pos = [hliakPositionH0.x+400,hliakPositionH0.y];
graph.add(hliak_And300);

let hliak_PropSelectHOA00 = LiteGraph.createNode("Deos/PropSelectHOA");
hliak_PropSelectHOA00.pos = [hliakPositionH0.x+600,hliakPositionH0.y];
hliak_PropSelectHOA00.init(g_broadcastDeosContainer, "m_hliak_select");
graph.add(hliak_PropSelectHOA00);

let hliak_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
hliak_PropSendBoolean01.pos = [hliakPositionH0.x+800,hliakPositionH0.y];
hliak_PropSendBoolean01.init(broadcastDeosHandle, "m_hliak_circ");
graph.add(hliak_PropSendBoolean01);

let hliak_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
hliak_PropSaveBoolean00.pos = [hliakPositionH0.x+800,hliakPositionH0.y+70];
hliak_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_hliak_circ");
graph.add(hliak_PropSaveBoolean00);

hliak_And200.connect(0, hliak_Or200, 0);
hliak_Not00.connect(0, hliak_Or200, 1);
hliak_CompareHeat00.connect(0, hliak_And200, 0);
hliak_CompareCool01.connect(0, hliak_And200, 1);
hliak_Or200.connect(0, hliak_And300, 0);
hliak_CompareHeat02.connect(0, hliak_And300, 1);
hliak_CompareHeat03.connect(0, hliak_And300, 2);
hliak_And300.connect(0, hliak_PropSelectHOA00, 0);
hliak_PropSelectHOA00.connect(0, hliak_PropSendBoolean01, 0);
hliak_PropSelectHOA00.connect(0, hliak_PropSaveBoolean00, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const relayPosition = {x:750, y:-2350};
//////////////////////////////////////////////////
//#region RELAY OUTPUTS
//////////////////////////////////////////////////
let relay_Title00 = LiteGraph.createNode("Deos/Title");
relay_Title00.pos = [relayPosition.x-40,relayPosition.y-560];
relay_Title00.init("ΛΟΓΙΚΗ ΡΕΛΕ - Χειρισμός εξόδων ρελέ στο S5102 από επιμέρους λογικές. Για την ενεργοποίηση χρησιμοποιείται ενδεικτικά μέθοδος RCW χωρίς να είναι απαραίτητη.", 1000);
graph.add(relay_Title00);

//GLOBAL PROPS AND CHANGE BITS
let relay_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean00.pos = [relayPosition.x-40,relayPosition.y-490];
relay_PropReadBoolean00.init(g_broadcastDeosContainer, "g_hliak_circ");
graph.add(relay_PropReadBoolean00);

let relay_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean01.pos = [relayPosition.x-40,relayPosition.y-420];
relay_PropReadBoolean01.init(g_broadcastDeosContainer, "g_antir_circ");
graph.add(relay_PropReadBoolean01);

let relay_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean02.pos = [relayPosition.x-40,relayPosition.y-350];
relay_PropReadBoolean02.init(g_broadcastDeosContainer, "g_anak_circ");
graph.add(relay_PropReadBoolean02);

let relay_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean03.pos = [relayPosition.x-40,relayPosition.y-280];
relay_PropReadBoolean03.init(g_broadcastDeosContainer, "g_isAntisOn");
graph.add(relay_PropReadBoolean03);

let relay_PropReadBoolean04 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean04.pos = [relayPosition.x-40,relayPosition.y-210];
relay_PropReadBoolean04.init(g_broadcastDeosContainer, "g_endod_kinS30");
graph.add(relay_PropReadBoolean04);

let relay_PropReadBoolean05 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean05.pos = [relayPosition.x-40,relayPosition.y-140];
relay_PropReadBoolean05.init(g_broadcastDeosContainer, "g_endod_kinS31");
graph.add(relay_PropReadBoolean05);

let relay_PropReadBoolean06 = LiteGraph.createNode("Deos/PropReadBoolean");
relay_PropReadBoolean06.pos = [relayPosition.x-40,relayPosition.y-70];
relay_PropReadBoolean06.init(g_broadcastDeosContainer, "g_endod_kinS32");
graph.add(relay_PropReadBoolean06);

let relay_ConstBoolean00 = LiteGraph.createNode("Deos/ConstBoolean");
relay_ConstBoolean00.pos = [relayPosition.x,relayPosition.y];
relay_ConstBoolean00.init("false");
graph.add(relay_ConstBoolean00);

let relay_SetBitAll00 = LiteGraph.createNode("Deos/SetBitAll");
relay_SetBitAll00.pos = [relayPosition.x+250,relayPosition.y-250];
graph.add(relay_SetBitAll00);

//CONNECTIONS
relay_PropReadBoolean00.connect(0, relay_SetBitAll00, 0);
relay_PropReadBoolean01.connect(0, relay_SetBitAll00, 1);
relay_PropReadBoolean02.connect(0, relay_SetBitAll00, 2);
relay_PropReadBoolean03.connect(0, relay_SetBitAll00, 3);
relay_PropReadBoolean04.connect(0, relay_SetBitAll00, 4);
relay_PropReadBoolean05.connect(0, relay_SetBitAll00, 5);
relay_PropReadBoolean06.connect(0, relay_SetBitAll00, 6);
relay_ConstBoolean00.connect(0, relay_SetBitAll00, 7);

//READ CHECK WRITE
let relay_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
relay_TickReceiverTRG00.pos = [relayPosition.x,relayPosition.y+100];
graph.add(relay_TickReceiverTRG00);

let relay_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
relay_BusReadTRG00.pos = [relayPosition.x+220,relayPosition.y+100];
relay_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "109");
graph.add(relay_BusReadTRG00);

let relay_IsNotEqualTRGTRG00 = LiteGraph.createNode("DeosTrigger/IsNotEqualTRG");
relay_IsNotEqualTRGTRG00.pos = [relayPosition.x+440,relayPosition.y+130];
graph.add(relay_IsNotEqualTRGTRG00);

let relay_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
relay_BusWriteTRG00.pos = [relayPosition.x+680,relayPosition.y+100];
relay_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "109");
graph.add(relay_BusWriteTRG00);

relay_TickReceiverTRG00.connect(0, relay_BusReadTRG00, 0);
relay_BusReadTRG00.connect(0, relay_IsNotEqualTRGTRG00, 1);
relay_BusReadTRG00.connect(1, relay_IsNotEqualTRGTRG00, 2);
relay_IsNotEqualTRGTRG00.connect(0, relay_BusWriteTRG00, 1);
relay_SetBitAll00.connect(0, relay_IsNotEqualTRGTRG00, 0);
relay_SetBitAll00.connect(0, relay_BusWriteTRG00, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const triodPosition = {x:-1700, y:80};
//////////////////////////////////////////////////
//#region TRIODH ANAMEIKTIKH
//////////////////////////////////////////////////
let triod_Title00 = LiteGraph.createNode("Deos/Title");
triod_Title00.pos = [triodPosition.x,triodPosition.y-560];
triod_Title00.init("ΤΡΙΟΔΗ ΕΝΔΟΔΑΠΕΔΙΑΣ - Λογική τρίοδης αναμεικτικής ενδοδαπέδιας στο S5102 με <Αντιστάθμιση Νερού/Εξωτερικής θερμοκρασίας> και <Έλεγχο PI>", 1000);
graph.add(triod_Title00);

let triod_TickReceiverTRG01 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
triod_TickReceiverTRG01.pos = [triodPosition.x,triodPosition.y];
graph.add(triod_TickReceiverTRG01);

let triod_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
triod_BusReadTRG01.pos = [triodPosition.x+200,triodPosition.y-150];
triod_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "100");
graph.add(triod_BusReadTRG01);

let triod_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
triod_BusReadTRG00.pos = [triodPosition.x+200,triodPosition.y];
triod_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "106");
graph.add(triod_BusReadTRG00);

let triod_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
triod_LocalReadReg00.pos = [triodPosition.x+200,triodPosition.y+150];
triod_LocalReadReg00.init(database_BusReadAllTRG00, "S42:R102");
graph.add(triod_LocalReadReg00);

let triod_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber00.pos = [triodPosition.x+200,triodPosition.y+220];
triod_ConstNumber00.init(10);
graph.add(triod_ConstNumber00);

////////////////////////////////////////////////// FIX START
let triod_ConstNumber00FIX = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber00FIX.pos = [triodPosition.x+300,triodPosition.y-480];
triod_ConstNumber00FIX.init(8);
graph.add(triod_ConstNumber00FIX);

let triod_ConstNumber01FIX = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber01FIX.pos = [triodPosition.x+500,triodPosition.y-380];
triod_ConstNumber01FIX.init(25);
graph.add(triod_ConstNumber01FIX);

let triod_DivideNumber02FIX = LiteGraph.createNode("Deos/DivideNumber");
triod_DivideNumber02FIX.pos = [triodPosition.x+500,triodPosition.y-480];
graph.add(triod_DivideNumber02FIX);

let triod_SubtractNumber00FIX = LiteGraph.createNode("Deos/SubtractNumber");
triod_SubtractNumber00FIX.pos = [triodPosition.x+700,triodPosition.y-480];
graph.add(triod_SubtractNumber00FIX);

let triod_ConstNumber02FIX = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber02FIX.pos = [triodPosition.x+700,triodPosition.y-380];
triod_ConstNumber02FIX.init(0);
graph.add(triod_ConstNumber02FIX);

let triod_ConstNumber03FIX = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber03FIX.pos = [triodPosition.x+700,triodPosition.y-280];
triod_ConstNumber03FIX.init(100);
graph.add(triod_ConstNumber03FIX);

let triod_ClampMinMax00FIX = LiteGraph.createNode("Deos/ClampMinMax");
triod_ClampMinMax00FIX.pos = [triodPosition.x+900,triodPosition.y-480];
graph.add(triod_ClampMinMax00FIX);
////////////////////////////////////////////////// FIX END

let triod_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
triod_DivideNumber01.pos = [triodPosition.x+450,triodPosition.y];
graph.add(triod_DivideNumber01);

let triod_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
triod_DivideNumber00.pos = [triodPosition.x+450,triodPosition.y+150];
graph.add(triod_DivideNumber00);

let triod_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber00.pos = [triodPosition.x+450,triodPosition.y+240];
triod_PropReadNumber00.init(g_broadcastDeosContainer, "p_triod_periMin");
graph.add(triod_PropReadNumber00);

let triod_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber01.pos = [triodPosition.x+450,triodPosition.y+310];
triod_PropReadNumber01.init(g_broadcastDeosContainer, "p_triod_periMax");
graph.add(triod_PropReadNumber01);

let triod_PropReadNumber02 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber02.pos = [triodPosition.x+450,triodPosition.y+380];
triod_PropReadNumber02.init(g_broadcastDeosContainer, "p_triod_neroMin");
graph.add(triod_PropReadNumber02);

let triod_PropReadNumber03 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber03.pos = [triodPosition.x+450,triodPosition.y+450];
triod_PropReadNumber03.init(g_broadcastDeosContainer, "p_triod_neroMax");
graph.add(triod_PropReadNumber03);

let triod_ConstBoolean03 = LiteGraph.createNode("Deos/ConstBoolean");
triod_ConstBoolean03.pos = [triodPosition.x+490,triodPosition.y+520];
triod_ConstBoolean03.init("false");
graph.add(triod_ConstBoolean03);

let triod_PropSendNumber02 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber02.pos = [triodPosition.x+1100,triodPosition.y-480];
triod_PropSendNumber02.init(broadcastDeosHandle, "m_triod_pmt");
graph.add(triod_PropSendNumber02);

let zzz_PropSaveNumber00T04 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T04.pos = [triodPosition.x+700,triodPosition.y-150];
zzz_PropSaveNumber00T04.init(g_broadcastDeosContainer, "g_alert_T04");
graph.add(zzz_PropSaveNumber00T04);
triod_DivideNumber01.connect(0, zzz_PropSaveNumber00T04, 0);

let triod_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber00.pos = [triodPosition.x+700,triodPosition.y-70];
triod_PropSendNumber00.init(broadcastDeosHandle, "m_triod_mix_temp");
graph.add(triod_PropSendNumber00);

let triod_PropSendNumber03 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber03.pos = [triodPosition.x+700,triodPosition.y];
triod_PropSendNumber03.init(broadcastDeosHandle, "m_outdoor_temp");
graph.add(triod_PropSendNumber03);

let triod_PropSendNumber04 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber04.pos = [triodPosition.x+700,triodPosition.y+70];
triod_PropSendNumber04.init(broadcastDeosHandle, "k_outdoor_temp");
graph.add(triod_PropSendNumber04);

let zzz_PropSaveNumber00T12 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T12.pos = [triodPosition.x+950,triodPosition.y];
zzz_PropSaveNumber00T12.init(g_broadcastDeosContainer, "g_alert_T12");
graph.add(zzz_PropSaveNumber00T12);
triod_DivideNumber00.connect(0, zzz_PropSaveNumber00T12, 0);

//Y_YPOGEIO
let triod_PropSendNumberY04 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumberY04.pos = [triodPosition.x+700,triodPosition.y+140];
triod_PropSendNumberY04.init(broadcastDeosHandle, "y_outdoor_temp");
graph.add(triod_PropSendNumberY04);
triod_DivideNumber00.connect(0, triod_PropSendNumberY04, 0);

let triod_LinearInterpClamp00 = LiteGraph.createNode("Deos/LinearInterpClamp");
triod_LinearInterpClamp00.pos = [triodPosition.x+700,triodPosition.y+230];
graph.add(triod_LinearInterpClamp00);

let triod_PropReadNumber04 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber04.pos = [triodPosition.x+700,triodPosition.y+400];
triod_PropReadNumber04.init(g_broadcastDeosContainer, "p_triod_coefP");
graph.add(triod_PropReadNumber04);

let triod_PropReadNumber05 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber05.pos = [triodPosition.x+700,triodPosition.y+470];
triod_PropReadNumber05.init(g_broadcastDeosContainer, "p_triod_coefI");
graph.add(triod_PropReadNumber05);

let triod_PropReadNumber06 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber06.pos = [triodPosition.x+700,triodPosition.y+540];
triod_PropReadNumber06.init(g_broadcastDeosContainer, "p_triod_coefIT");
graph.add(triod_PropReadNumber06);

let triod_PropReadNumber07 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber07.pos = [triodPosition.x+700,triodPosition.y+610];
triod_PropReadNumber07.init(g_broadcastDeosContainer, "p_triod_ctrlMin");
graph.add(triod_PropReadNumber07);

let triod_PropReadNumber08 = LiteGraph.createNode("Deos/PropReadNumber");
triod_PropReadNumber08.pos = [triodPosition.x+700,triodPosition.y+680];
triod_PropReadNumber08.init(g_broadcastDeosContainer, "p_triod_ctrlMax");
graph.add(triod_PropReadNumber08);

let triod_PropSendNumber99 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber99.pos = [triodPosition.x+950,triodPosition.y+120];
triod_PropSendNumber99.init(broadcastDeosHandle, "m_triod_etht");
graph.add(triod_PropSendNumber99);

let triod_ControlPI00 = LiteGraph.createNode("Deos/ControlPI");
triod_ControlPI00.pos = [triodPosition.x+950,triodPosition.y+200];
graph.add(triod_ControlPI00);

let triod_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
triod_ConstNumber02.pos = [triodPosition.x+1010,triodPosition.y+400];
triod_ConstNumber02.init("100");
graph.add(triod_ConstNumber02);

let triod_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
triod_PropSendNumber01.pos = [triodPosition.x+1200,triodPosition.y+200];
triod_PropSendNumber01.init(broadcastDeosHandle, "m_triod_emt");
graph.add(triod_PropSendNumber01);

let triod_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
triod_MultiplyNumber00.pos = [triodPosition.x+1200,triodPosition.y+300];
graph.add(triod_MultiplyNumber00);

let triod_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
triod_TickReceiverTRG00.pos = [triodPosition.x+1200,triodPosition.y+390];
graph.add(triod_TickReceiverTRG00);

let triod_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
triod_BusWriteTRG00.pos = [triodPosition.x+1400,triodPosition.y+300];
triod_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "110");
graph.add(triod_BusWriteTRG00);

triod_LocalReadReg00.connect(0, triod_DivideNumber00, 0);
triod_ConstNumber00.connect(0, triod_DivideNumber00, 1);
triod_PropReadNumber04.connect(0, triod_ControlPI00, 2);
triod_PropReadNumber05.connect(0, triod_ControlPI00, 3);
triod_PropReadNumber06.connect(0, triod_ControlPI00, 4);
triod_PropReadNumber07.connect(0, triod_ControlPI00, 5);
triod_PropReadNumber08.connect(0, triod_ControlPI00, 6);
triod_TickReceiverTRG01.connect(0, triod_BusReadTRG00, 0);
triod_DivideNumber01.connect(0, triod_PropSendNumber00, 0);
triod_BusReadTRG00.connect(0, triod_DivideNumber01, 0);
triod_ConstNumber00.connect(0, triod_DivideNumber01, 1);
triod_DivideNumber01.connect(0, triod_ControlPI00, 0);
triod_ControlPI00.connect(0, triod_PropSendNumber01, 0);
triod_LinearInterpClamp00.connect(0, triod_ControlPI00, 1);
triod_ControlPI00.connect(0, triod_MultiplyNumber00, 0);
triod_ConstNumber02.connect(0, triod_MultiplyNumber00, 1);
triod_MultiplyNumber00.connect(0, triod_BusWriteTRG00, 0);
triod_TickReceiverTRG00.connect(0, triod_BusWriteTRG00, 1);
triod_TickReceiverTRG01.connect(0, triod_BusReadTRG01, 0);

////////////////////////////////////////////////// FIX START
triod_BusReadTRG01.connect(0, triod_DivideNumber02FIX, 0);
triod_ConstNumber00FIX.connect(0, triod_DivideNumber02FIX, 1);

triod_DivideNumber02FIX.connect(0, triod_SubtractNumber00FIX, 0);
triod_ConstNumber01FIX.connect(0, triod_SubtractNumber00FIX, 1);

triod_SubtractNumber00FIX.connect(0, triod_ClampMinMax00FIX, 0);
triod_ConstNumber02FIX.connect(0, triod_ClampMinMax00FIX, 1);
triod_ConstNumber03FIX.connect(0, triod_ClampMinMax00FIX, 2);

triod_ClampMinMax00FIX.connect(0, triod_PropSendNumber02, 0);
////////////////////////////////////////////////// FIX END

triod_DivideNumber00.connect(0, triod_LinearInterpClamp00, 0);
triod_DivideNumber00.connect(0, triod_PropSendNumber03, 0);
triod_DivideNumber00.connect(0, triod_PropSendNumber04, 0);
triod_PropReadNumber00.connect(0, triod_LinearInterpClamp00, 1);
triod_PropReadNumber01.connect(0, triod_LinearInterpClamp00, 2);
triod_PropReadNumber02.connect(0, triod_LinearInterpClamp00, 3);
triod_PropReadNumber03.connect(0, triod_LinearInterpClamp00, 4);
triod_ConstBoolean03.connect(0, triod_LinearInterpClamp00, 5);
triod_LinearInterpClamp00.connect(0, triod_PropSendNumber99, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const regelchPosition = {x:750, y:50};
//////////////////////////////////////////////////
//#region REGELCOOLHEAT
//////////////////////////////////////////////////
let regelch_Title00 = LiteGraph.createNode("Deos/Title");
regelch_Title00.pos = [regelchPosition.x,regelchPosition.y-200];
regelch_Title00.init("GLOBAL MODE SETTING - Toggling <g_isCool> από κουμπί <Home θερμοστατών> καθώς και <Μηχανοστασίου> και <Υπογείου> και απεικόνιση υπολοίπου χρόνου.", 1000);
graph.add(regelch_Title00);

//FIRST THERMOSTAT

let regelch_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
regelch_LocalReadReg00.pos = [regelchPosition.x,regelchPosition.y];
regelch_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R2");
graph.add(regelch_LocalReadReg00);

let regelch_CheckBitState00 = LiteGraph.createNode("Deos/CheckBitState");
regelch_CheckBitState00.pos = [regelchPosition.x+200,regelchPosition.y];
regelch_CheckBitState00.init("7", "true");
graph.add(regelch_CheckBitState00);

let regelch_TimerWithActivation00 = LiteGraph.createNode("Deos/TimerWithActivation");
regelch_TimerWithActivation00.pos = [regelchPosition.x+400,regelchPosition.y];
regelch_TimerWithActivation00.init("1000");
graph.add(regelch_TimerWithActivation00);

let regelch_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
regelch_ConstNumber00.pos = [regelchPosition.x+440,regelchPosition.y-100];
regelch_ConstNumber00.init(128);
graph.add(regelch_ConstNumber00);

let regelch_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelch_BusWriteTRG00.pos = [regelchPosition.x+730,regelchPosition.y];
regelch_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "2");
graph.add(regelch_BusWriteTRG00);

regelch_LocalReadReg00.connect(0, regelch_CheckBitState00, 0);
regelch_CheckBitState00.connect(0, regelch_TimerWithActivation00, 0);
regelch_ConstNumber00.connect(0, regelch_BusWriteTRG00, 0);
regelch_TimerWithActivation00.connect(0, regelch_BusWriteTRG00, 1);

//SECOND THERMOSTAT

let regelch_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
regelch_LocalReadReg01.pos = [regelchPosition.x,regelchPosition.y+150];
regelch_LocalReadReg01.init(database_BusReadAllTRG00, "S31:R2");
graph.add(regelch_LocalReadReg01);

let regelch_CheckBitState01 = LiteGraph.createNode("Deos/CheckBitState");
regelch_CheckBitState01.pos = [regelchPosition.x+200,regelchPosition.y+150];
regelch_CheckBitState01.init("7", "true");
graph.add(regelch_CheckBitState01);

let regelch_TimerWithActivation01 = LiteGraph.createNode("Deos/TimerWithActivation");
regelch_TimerWithActivation01.pos = [regelchPosition.x+400,regelchPosition.y+150];
regelch_TimerWithActivation01.init("1000");
graph.add(regelch_TimerWithActivation01);

let regelch_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelch_BusWriteTRG01.pos = [regelchPosition.x+730,regelchPosition.y+150];
regelch_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "2");
graph.add(regelch_BusWriteTRG01);

regelch_LocalReadReg01.connect(0, regelch_CheckBitState01, 0);
regelch_CheckBitState01.connect(0, regelch_TimerWithActivation01, 0);
regelch_ConstNumber00.connect(0, regelch_BusWriteTRG01, 0);
regelch_TimerWithActivation01.connect(0, regelch_BusWriteTRG01, 1);

//THIRD THERMOSTAT

let regelch_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
regelch_LocalReadReg02.pos = [regelchPosition.x,regelchPosition.y+300];
regelch_LocalReadReg02.init(database_BusReadAllTRG00, "S32:R2");
graph.add(regelch_LocalReadReg02);

let regelch_CheckBitState02 = LiteGraph.createNode("Deos/CheckBitState");
regelch_CheckBitState02.pos = [regelchPosition.x+200,regelchPosition.y+300];
regelch_CheckBitState02.init("7", "true");
graph.add(regelch_CheckBitState02);

let regelch_TimerWithActivation02 = LiteGraph.createNode("Deos/TimerWithActivation");
regelch_TimerWithActivation02.pos = [regelchPosition.x+400,regelchPosition.y+300];
regelch_TimerWithActivation02.init("1000");
graph.add(regelch_TimerWithActivation02);

let regelch_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelch_BusWriteTRG02.pos = [regelchPosition.x+730,regelchPosition.y+300];
regelch_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "2");
graph.add(regelch_BusWriteTRG02);

regelch_LocalReadReg02.connect(0, regelch_CheckBitState02, 0);
regelch_CheckBitState02.connect(0, regelch_TimerWithActivation02, 0);
regelch_ConstNumber00.connect(0, regelch_BusWriteTRG02, 0);
regelch_TimerWithActivation02.connect(0, regelch_BusWriteTRG02, 1);

//ALL THERMOSTATS

let regelch_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
regelch_ButtonTRG00.pos = [regelchPosition.x+400,regelchPosition.y+400];
regelch_ButtonTRG00.init(g_broadcastDeosContainer, "m_klim_toggle");
graph.add(regelch_ButtonTRG00);

let regelch_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
regelch_ButtonTRG01.pos = [regelchPosition.x+400,regelchPosition.y+500];
regelch_ButtonTRG01.init(g_broadcastDeosContainer, "y_klim_toggle");
graph.add(regelch_ButtonTRG01);

let regelch_OrTrigger5TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger5TRG");
regelch_OrTrigger5TRG00.pos = [regelchPosition.x+730,regelchPosition.y+450];
graph.add(regelch_OrTrigger5TRG00);

let regelch_PulsePassOffDelayTRG00 = LiteGraph.createNode("DeosTrigger/PulsePassOffDelayTRG");
regelch_PulsePassOffDelayTRG00.pos = [regelchPosition.x+920,regelchPosition.y+450];
regelch_PulsePassOffDelayTRG00.init("60");
graph.add(regelch_PulsePassOffDelayTRG00);

let regelch_PropToggleBoolTRG00 = LiteGraph.createNode("Deos/PropToggleBoolTRG");
regelch_PropToggleBoolTRG00.pos = [regelchPosition.x+1150,regelchPosition.y+360];
regelch_PropToggleBoolTRG00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(regelch_PropToggleBoolTRG00);

let regelch_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
regelch_PropSendNumber00.pos = [regelchPosition.x+1150,regelchPosition.y+460];
regelch_PropSendNumber00.init(broadcastDeosHandle, "m_regelch_remain");
graph.add(regelch_PropSendNumber00);

let regelch_PropSendNumber99 = LiteGraph.createNode("Deos/PropSendNumber");
regelch_PropSendNumber99.pos = [regelchPosition.x+1150,regelchPosition.y+530];
regelch_PropSendNumber99.init(broadcastDeosHandle, "y_regelch_remain");
graph.add(regelch_PropSendNumber99);

regelch_TimerWithActivation00.connect(0, regelch_OrTrigger5TRG00, 0);
regelch_TimerWithActivation01.connect(0, regelch_OrTrigger5TRG00, 1);
regelch_TimerWithActivation02.connect(0, regelch_OrTrigger5TRG00, 2);
regelch_ButtonTRG00.connect(0, regelch_OrTrigger5TRG00, 3);
regelch_ButtonTRG01.connect(0, regelch_OrTrigger5TRG00, 4);
regelch_OrTrigger5TRG00.connect(0, regelch_PulsePassOffDelayTRG00, 0);
regelch_PulsePassOffDelayTRG00.connect(0, regelch_PropToggleBoolTRG00, 0);
regelch_PulsePassOffDelayTRG00.connect(1, regelch_PropSendNumber00, 0);
regelch_PulsePassOffDelayTRG00.connect(1, regelch_PropSendNumber99, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const regelchregPosition = {x:2200, y:70};
//////////////////////////////////////////////////
//#region REGELCOOLHEATREG
//////////////////////////////////////////////////
let regelchreg_Title00 = LiteGraph.createNode("Deos/Title");
regelchreg_Title00.pos = [regelchregPosition.x,regelchregPosition.y-220];
regelchreg_Title00.init("GLOBAL MODE ΑΠΕΙΚΟΝΙΣΗ - Απεικόνιση του <g_isCool> σε <Θερμοστάτες>, <Μηχανοστάσιο> και <Υπόγειο>.", 800);
graph.add(regelchreg_Title00);

let regelchreg_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
regelchreg_PropReadBoolean00.pos = [regelchregPosition.x,regelchregPosition.y];
regelchreg_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(regelchreg_PropReadBoolean00);

let regelchreg_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
regelchreg_PropSendBoolean00.pos = [regelchregPosition.x+220,regelchregPosition.y-70];
regelchreg_PropSendBoolean00.init(broadcastDeosHandle, "m_isCool_bool");
graph.add(regelchreg_PropSendBoolean00);

let regelchreg_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
regelchreg_PropSendBoolean01.pos = [regelchregPosition.x+220,regelchregPosition.y-140];
regelchreg_PropSendBoolean01.init(broadcastDeosHandle, "y_isCool_bool");
graph.add(regelchreg_PropSendBoolean01);

regelchreg_PropReadBoolean00.connect(0, regelchreg_PropSendBoolean00, 0);
regelchreg_PropReadBoolean00.connect(0, regelchreg_PropSendBoolean01, 0);

let regelchreg_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
regelchreg_ConstNumber00.pos = [regelchregPosition.x+40,regelchregPosition.y+70];
regelchreg_ConstNumber00.init(4);
graph.add(regelchreg_ConstNumber00);

let regelchreg_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
regelchreg_ConstNumber01.pos = [regelchregPosition.x+40,regelchregPosition.y+170];
regelchreg_ConstNumber01.init(1);
graph.add(regelchreg_ConstNumber01);

let regelchreg_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
regelchreg_Multiplexer200.pos = [regelchregPosition.x+220,regelchregPosition.y];
graph.add(regelchreg_Multiplexer200);

regelchreg_PropReadBoolean00.connect(0, regelchreg_Multiplexer200, 0);
regelchreg_ConstNumber00.connect(0, regelchreg_Multiplexer200, 1);
regelchreg_ConstNumber01.connect(0, regelchreg_Multiplexer200, 2);

let regelchreg_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
regelchreg_TickReceiverTRG00.pos = [regelchregPosition.x+240,regelchregPosition.y+120];
graph.add(regelchreg_TickReceiverTRG00);

let regelchreg_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelchreg_BusWriteTRG00.pos = [regelchregPosition.x+460,regelchregPosition.y];
regelchreg_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "98");
graph.add(regelchreg_BusWriteTRG00);

let regelchreg_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelchreg_BusWriteTRG01.pos = [regelchregPosition.x+460,regelchregPosition.y+140];
regelchreg_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "98");
graph.add(regelchreg_BusWriteTRG01);

let regelchreg_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
regelchreg_BusWriteTRG02.pos = [regelchregPosition.x+460,regelchregPosition.y+280];
regelchreg_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "98");
graph.add(regelchreg_BusWriteTRG02);

regelchreg_Multiplexer200.connect(0, regelchreg_BusWriteTRG00, 0);
regelchreg_Multiplexer200.connect(0, regelchreg_BusWriteTRG01, 0);
regelchreg_Multiplexer200.connect(0, regelchreg_BusWriteTRG02, 0);
regelchreg_TickReceiverTRG00.connect(0, regelchreg_BusWriteTRG00, 1);
regelchreg_TickReceiverTRG00.connect(0, regelchreg_BusWriteTRG01, 1);
regelchreg_TickReceiverTRG00.connect(0, regelchreg_BusWriteTRG02, 1);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

let yOffsetRoloi = 600;
let RoloiPosGlobal = {x:750, y:2420};
//////////////////////////////////////////////////
//#region ROLOI S30
//////////////////////////////////////////////////
const roloiS30Position = {x:0+RoloiPosGlobal.x, y:0+RoloiPosGlobal.y};

//////////////////////////////////////////////////
//COMPARE HEAT/COOL S30 THERMOSTAT
//////////////////////////////////////////////////
let roloiS30_Title00 = LiteGraph.createNode("Deos/Title");
roloiS30_Title00.pos = [roloiS30Position.x,roloiS30Position.y-150];
roloiS30_Title00.init("ΘΕΡΜΟΣΤΑΤΗΣ ΖΗΤΗΣΗ ΛΕΙΤΟΥΡΓΙΑΣ HEAT/COOL - Δημιουργία <Global Μεταβλητών Ζήτησης Heat/Cool Θερμοστάτη> βάσει της <Room Temperature Θερμοστάτη>, του <Setpoint Θερμοστάτη> και του <Global Mode>.", 1400);
graph.add(roloiS30_Title00);

let roloiS30_Title01 = LiteGraph.createNode("Deos/Title");
roloiS30_Title01.pos = [roloiS30Position.x,roloiS30Position.y+450];
roloiS30_Title01.init("ΘΕΡΜΟΣΤΑΤΗΣ ΡΟΛΟΙ ΛΕΙΤΟΥΡΓΙΑ - Απεικόνιση του <Ρολογιού Θερμοστάτη> βάσει των <Global Μεταβλητών ζήτησης Heat/Cool> και των ζητήσεων των IDU <g_S30,31,32_demand_idu> και ENDOD <g_S30,31,32_demand_endod> του θερμοστάτη.", 1400);
graph.add(roloiS30_Title01);

let roloiS30_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS30_LocalReadReg00.pos = [roloiS30Position.x,roloiS30Position.y];
roloiS30_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R48");
graph.add(roloiS30_LocalReadReg00);

let roloiS30_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS30_LocalReadReg01.pos = [roloiS30Position.x,roloiS30Position.y+100];
roloiS30_LocalReadReg01.init(database_BusReadAllTRG00, "S30:R384");
graph.add(roloiS30_LocalReadReg01);

let roloiS30_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
roloiS30_ConstNumber00.pos = [roloiS30Position.x,roloiS30Position.y+200];
roloiS30_ConstNumber00.init(10);
graph.add(roloiS30_ConstNumber00);

let roloiS30_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
roloiS30_DivideNumber00.pos = [roloiS30Position.x+200,roloiS30Position.y];
graph.add(roloiS30_DivideNumber00);

let roloiS30_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
roloiS30_DivideNumber01.pos = [roloiS30Position.x+200,roloiS30Position.y+100];
graph.add(roloiS30_DivideNumber01);

//Y_YPOGEIO
let ypogeio_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
ypogeio_PropSendNumber00.pos = [roloiS30Position.x+420,roloiS30Position.y-70];
ypogeio_PropSendNumber00.init(broadcastDeosHandle, "y_ypn_room_temp");
graph.add(ypogeio_PropSendNumber00);
roloiS30_DivideNumber00.connect(0, ypogeio_PropSendNumber00, 0);

let roloiS30_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
roloiS30_ConstNumber01.pos = [roloiS30Position.x+220,roloiS30Position.y+200];
roloiS30_ConstNumber01.init(1);
graph.add(roloiS30_ConstNumber01);

let roloiS30_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
roloiS30_CompareHeat00.pos = [roloiS30Position.x+420,roloiS30Position.y];
graph.add(roloiS30_CompareHeat00);

let roloiS30_CompareCool00 = LiteGraph.createNode("Deos/CompareCool");
roloiS30_CompareCool00.pos = [roloiS30Position.x+420,roloiS30Position.y+100];
graph.add(roloiS30_CompareCool00);

roloiS30_LocalReadReg00.connect(0, roloiS30_DivideNumber00, 0);
roloiS30_LocalReadReg01.connect(0, roloiS30_DivideNumber01, 0);
roloiS30_ConstNumber00.connect(0, roloiS30_DivideNumber00, 1);
roloiS30_ConstNumber00.connect(0, roloiS30_DivideNumber01, 1);
roloiS30_DivideNumber00.connect(0, roloiS30_CompareHeat00, 0);
roloiS30_DivideNumber00.connect(0, roloiS30_CompareCool00, 0);
roloiS30_DivideNumber01.connect(0, roloiS30_CompareHeat00, 1);
roloiS30_DivideNumber01.connect(0, roloiS30_CompareCool00, 1);
roloiS30_ConstNumber01.connect(0, roloiS30_CompareHeat00, 2);
roloiS30_ConstNumber01.connect(0, roloiS30_CompareCool00, 2);

let roloiS30_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
roloiS30_PropReadBoolean00.pos = [roloiS30Position.x+200,roloiS30Position.y+300];
roloiS30_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(roloiS30_PropReadBoolean00);

let roloiS30_Not00 = LiteGraph.createNode("Deos/Not");
roloiS30_Not00.pos = [roloiS30Position.x+500,roloiS30Position.y+300];
graph.add(roloiS30_Not00);

let roloiS30_And00 = LiteGraph.createNode("Deos/And2");
roloiS30_And00.pos = [roloiS30Position.x+700,roloiS30Position.y];
graph.add(roloiS30_And00);

let roloiS30_And01 = LiteGraph.createNode("Deos/And2");
roloiS30_And01.pos = [roloiS30Position.x+700,roloiS30Position.y+100];
graph.add(roloiS30_And01);

let roloiS30_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS30_PropSaveBoolean00.pos = [roloiS30Position.x+900,roloiS30Position.y];
roloiS30_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S30_demand_heat");
graph.add(roloiS30_PropSaveBoolean00);

let roloiS30_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS30_PropSaveBoolean01.pos = [roloiS30Position.x+900,roloiS30Position.y+100];
roloiS30_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S30_demand_cool");
graph.add(roloiS30_PropSaveBoolean01);

roloiS30_CompareHeat00.connect(0, roloiS30_And00, 0);
roloiS30_CompareCool00.connect(0, roloiS30_And01, 0);
roloiS30_PropReadBoolean00.connect(0, roloiS30_And01, 1);
roloiS30_PropReadBoolean00.connect(0, roloiS30_Not00, 0);
roloiS30_Not00.connect(0, roloiS30_And00, 1);
roloiS30_And00.connect(0, roloiS30_PropSaveBoolean00, 0);
roloiS30_And01.connect(0, roloiS30_PropSaveBoolean01, 0);

//////////////////////////////////////////////////
//MULTIPLEXER S30 THERMOSTAT
//////////////////////////////////////////////////
const demuS30Position = {x:0+RoloiPosGlobal.x+400, y:0+RoloiPosGlobal.y+yOffsetRoloi};

let demuS30_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS30_PropReadBoolean00.pos = [demuS30Position.x-200,demuS30Position.y];
demuS30_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S30_demand_heat");
graph.add(demuS30_PropReadBoolean00);

let demuS30_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS30_PropReadBoolean02.pos = [demuS30Position.x-400,demuS30Position.y+70];
demuS30_PropReadBoolean02.init(g_broadcastDeosContainer, "g_S30_demand_endod");
graph.add(demuS30_PropReadBoolean02);

let demuS30_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS30_PropReadBoolean03.pos = [demuS30Position.x-400,demuS30Position.y+140];
demuS30_PropReadBoolean03.init(g_broadcastDeosContainer, "g_S30_demand_idu");
graph.add(demuS30_PropReadBoolean03);

let demuS30_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS30_PropReadBoolean01.pos = [demuS30Position.x-200,demuS30Position.y+210];
demuS30_PropReadBoolean01.init(g_broadcastDeosContainer, "g_S30_demand_cool");
graph.add(demuS30_PropReadBoolean01);

let demuS30_Or201 = LiteGraph.createNode("Deos/Or2");
demuS30_Or201.pos = [demuS30Position.x-200,demuS30Position.y+70];
graph.add(demuS30_Or201);

let demuS30_And200 = LiteGraph.createNode("Deos/And2");
demuS30_And200.pos = [demuS30Position.x,demuS30Position.y];
graph.add(demuS30_And200);

let demuS30_And201 = LiteGraph.createNode("Deos/And2");
demuS30_And201.pos = [demuS30Position.x,demuS30Position.y+140];
graph.add(demuS30_And201);

let demuS30_Or200 = LiteGraph.createNode("Deos/Or2");
demuS30_Or200.pos = [demuS30Position.x+200,demuS30Position.y];
graph.add(demuS30_Or200);

//Y_YPOGEIO
let ypogeio_PropSendBooleanA00 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanA00.pos = [demuS30Position.x+400,demuS30Position.y-70];
ypogeio_PropSendBooleanA00.init(broadcastDeosHandle, "y_ypn_isWorking");
graph.add(ypogeio_PropSendBooleanA00);
demuS30_Or200.connect(0, ypogeio_PropSendBooleanA00, 0);

demuS30_PropReadBoolean02.connect(0, demuS30_Or201, 0);
demuS30_PropReadBoolean03.connect(0, demuS30_Or201, 1);
demuS30_PropReadBoolean00.connect(0, demuS30_And200, 0);
demuS30_Or201.connect(0, demuS30_And200, 1);
demuS30_PropReadBoolean03.connect(0, demuS30_And201, 0);
demuS30_PropReadBoolean01.connect(0, demuS30_And201, 1);
demuS30_And200.connect(0, demuS30_Or200, 0);
demuS30_And201.connect(0, demuS30_Or200, 1);

let demuS30_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
demuS30_ConstNumber00.pos = [demuS30Position.x+200,demuS30Position.y+90];
demuS30_ConstNumber00.init(0);
graph.add(demuS30_ConstNumber00);

let demuS30_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
demuS30_ConstNumber01.pos = [demuS30Position.x+200,demuS30Position.y+190];
demuS30_ConstNumber01.init(16384);
graph.add(demuS30_ConstNumber01);

let demuS30_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
demuS30_Multiplexer200.pos = [demuS30Position.x+400,demuS30Position.y];
graph.add(demuS30_Multiplexer200);

let demuS30_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
demuS30_TickReceiverTRG00.pos = [demuS30Position.x+420,demuS30Position.y+120];
graph.add(demuS30_TickReceiverTRG00);

let demuS30_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
demuS30_BusWriteTRG00.pos = [demuS30Position.x+600,demuS30Position.y];
demuS30_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "97");
graph.add(demuS30_BusWriteTRG00);

demuS30_Or200.connect(0, demuS30_Multiplexer200, 0);
demuS30_ConstNumber00.connect(0, demuS30_Multiplexer200, 1);
demuS30_ConstNumber01.connect(0, demuS30_Multiplexer200, 2);
demuS30_Multiplexer200.connect(0, demuS30_BusWriteTRG00, 0);
demuS30_TickReceiverTRG00.connect(0, demuS30_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region ROLOI S31
//////////////////////////////////////////////////
const roloiS31Position = {x:1300+RoloiPosGlobal.x, y:0+RoloiPosGlobal.y};

//////////////////////////////////////////////////
//COMPARE HEAT/COOL S31 THERMOSTAT
//////////////////////////////////////////////////
let roloiS31_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS31_LocalReadReg00.pos = [roloiS31Position.x,roloiS31Position.y];
roloiS31_LocalReadReg00.init(database_BusReadAllTRG00, "S31:R48");
graph.add(roloiS31_LocalReadReg00);

let roloiS31_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS31_LocalReadReg01.pos = [roloiS31Position.x,roloiS31Position.y+100];
roloiS31_LocalReadReg01.init(database_BusReadAllTRG00, "S31:R384");
graph.add(roloiS31_LocalReadReg01);

let roloiS31_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
roloiS31_ConstNumber00.pos = [roloiS31Position.x,roloiS31Position.y+200];
roloiS31_ConstNumber00.init(10);
graph.add(roloiS31_ConstNumber00);

let roloiS31_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
roloiS31_DivideNumber00.pos = [roloiS31Position.x+200,roloiS31Position.y];
graph.add(roloiS31_DivideNumber00);

let roloiS31_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
roloiS31_DivideNumber01.pos = [roloiS31Position.x+200,roloiS31Position.y+100];
graph.add(roloiS31_DivideNumber01);

//Y_YPOGEIO
let ypogeio_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
ypogeio_PropSendNumber01.pos = [roloiS31Position.x+420,roloiS31Position.y-70];
ypogeio_PropSendNumber01.init(broadcastDeosHandle, "y_gra_room_temp");
graph.add(ypogeio_PropSendNumber01);
roloiS31_DivideNumber00.connect(0, ypogeio_PropSendNumber01, 0);

let roloiS31_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
roloiS31_ConstNumber01.pos = [roloiS31Position.x+220,roloiS31Position.y+200];
roloiS31_ConstNumber01.init(1);
graph.add(roloiS31_ConstNumber01);

let roloiS31_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
roloiS31_CompareHeat00.pos = [roloiS31Position.x+420,roloiS31Position.y];
graph.add(roloiS31_CompareHeat00);

let roloiS31_CompareCool00 = LiteGraph.createNode("Deos/CompareCool");
roloiS31_CompareCool00.pos = [roloiS31Position.x+420,roloiS31Position.y+100];
graph.add(roloiS31_CompareCool00);

roloiS31_LocalReadReg00.connect(0, roloiS31_DivideNumber00, 0);
roloiS31_LocalReadReg01.connect(0, roloiS31_DivideNumber01, 0);
roloiS31_ConstNumber00.connect(0, roloiS31_DivideNumber00, 1);
roloiS31_ConstNumber00.connect(0, roloiS31_DivideNumber01, 1);
roloiS31_DivideNumber00.connect(0, roloiS31_CompareHeat00, 0);
roloiS31_DivideNumber00.connect(0, roloiS31_CompareCool00, 0);
roloiS31_DivideNumber01.connect(0, roloiS31_CompareHeat00, 1);
roloiS31_DivideNumber01.connect(0, roloiS31_CompareCool00, 1);
roloiS31_ConstNumber01.connect(0, roloiS31_CompareHeat00, 2);
roloiS31_ConstNumber01.connect(0, roloiS31_CompareCool00, 2);

let roloiS31_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
roloiS31_PropReadBoolean00.pos = [roloiS31Position.x+200,roloiS31Position.y+300];
roloiS31_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(roloiS31_PropReadBoolean00);

let roloiS31_Not00 = LiteGraph.createNode("Deos/Not");
roloiS31_Not00.pos = [roloiS31Position.x+500,roloiS31Position.y+300];
graph.add(roloiS31_Not00);

let roloiS31_And00 = LiteGraph.createNode("Deos/And2");
roloiS31_And00.pos = [roloiS31Position.x+700,roloiS31Position.y];
graph.add(roloiS31_And00);

let roloiS31_And01 = LiteGraph.createNode("Deos/And2");
roloiS31_And01.pos = [roloiS31Position.x+700,roloiS31Position.y+100];
graph.add(roloiS31_And01);

let roloiS31_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS31_PropSaveBoolean00.pos = [roloiS31Position.x+900,roloiS31Position.y];
roloiS31_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S31_demand_heat");
graph.add(roloiS31_PropSaveBoolean00);

let roloiS31_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS31_PropSaveBoolean01.pos = [roloiS31Position.x+900,roloiS31Position.y+100];
roloiS31_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S31_demand_cool");
graph.add(roloiS31_PropSaveBoolean01);

roloiS31_CompareHeat00.connect(0, roloiS31_And00, 0);
roloiS31_CompareCool00.connect(0, roloiS31_And01, 0);
roloiS31_PropReadBoolean00.connect(0, roloiS31_And01, 1);
roloiS31_PropReadBoolean00.connect(0, roloiS31_Not00, 0);
roloiS31_Not00.connect(0, roloiS31_And00, 1);
roloiS31_And00.connect(0, roloiS31_PropSaveBoolean00, 0);
roloiS31_And01.connect(0, roloiS31_PropSaveBoolean01, 0);

//////////////////////////////////////////////////
//MULTIPLEXER S31 THERMOSTAT
//////////////////////////////////////////////////
const demuS31Position = {x:1700+RoloiPosGlobal.x, y:0+RoloiPosGlobal.y+yOffsetRoloi};

let demuS31_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS31_PropReadBoolean00.pos = [demuS31Position.x-200,demuS31Position.y];
demuS31_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S31_demand_heat");
graph.add(demuS31_PropReadBoolean00);

let demuS31_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS31_PropReadBoolean02.pos = [demuS31Position.x-400,demuS31Position.y+70];
demuS31_PropReadBoolean02.init(g_broadcastDeosContainer, "g_S31_demand_endod");
graph.add(demuS31_PropReadBoolean02);

let demuS31_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS31_PropReadBoolean03.pos = [demuS31Position.x-400,demuS31Position.y+140];
demuS31_PropReadBoolean03.init(g_broadcastDeosContainer, "g_S31_demand_idu");
graph.add(demuS31_PropReadBoolean03);

let demuS31_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS31_PropReadBoolean01.pos = [demuS31Position.x-200,demuS31Position.y+210];
demuS31_PropReadBoolean01.init(g_broadcastDeosContainer, "g_S31_demand_cool");
graph.add(demuS31_PropReadBoolean01);

let demuS31_Or201 = LiteGraph.createNode("Deos/Or2");
demuS31_Or201.pos = [demuS31Position.x-200,demuS31Position.y+70];
graph.add(demuS31_Or201);

let demuS31_And200 = LiteGraph.createNode("Deos/And2");
demuS31_And200.pos = [demuS31Position.x,demuS31Position.y];
graph.add(demuS31_And200);

let demuS31_And201 = LiteGraph.createNode("Deos/And2");
demuS31_And201.pos = [demuS31Position.x,demuS31Position.y+140];
graph.add(demuS31_And201);

let demuS31_Or200 = LiteGraph.createNode("Deos/Or2");
demuS31_Or200.pos = [demuS31Position.x+200,demuS31Position.y];
graph.add(demuS31_Or200);

//Y_YPOGEIO
let ypogeio_PropSendBooleanA01 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanA01.pos = [demuS31Position.x+400,demuS31Position.y-70];
ypogeio_PropSendBooleanA01.init(broadcastDeosHandle, "y_gra_isWorking");
graph.add(ypogeio_PropSendBooleanA01);
demuS31_Or200.connect(0, ypogeio_PropSendBooleanA01, 0);

demuS31_PropReadBoolean02.connect(0, demuS31_Or201, 0);
demuS31_PropReadBoolean03.connect(0, demuS31_Or201, 1);
demuS31_PropReadBoolean00.connect(0, demuS31_And200, 0);
demuS31_Or201.connect(0, demuS31_And200, 1);
demuS31_PropReadBoolean03.connect(0, demuS31_And201, 0);
demuS31_PropReadBoolean01.connect(0, demuS31_And201, 1);
demuS31_And200.connect(0, demuS31_Or200, 0);
demuS31_And201.connect(0, demuS31_Or200, 1);

let demuS31_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
demuS31_ConstNumber00.pos = [demuS31Position.x+200,demuS31Position.y+90];
demuS31_ConstNumber00.init(0);
graph.add(demuS31_ConstNumber00);

let demuS31_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
demuS31_ConstNumber01.pos = [demuS31Position.x+200,demuS31Position.y+190];
demuS31_ConstNumber01.init(16384);
graph.add(demuS31_ConstNumber01);

let demuS31_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
demuS31_Multiplexer200.pos = [demuS31Position.x+400,demuS31Position.y];
graph.add(demuS31_Multiplexer200);

let demuS31_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
demuS31_TickReceiverTRG00.pos = [demuS31Position.x+420,demuS31Position.y+120];
graph.add(demuS31_TickReceiverTRG00);

let demuS31_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
demuS31_BusWriteTRG00.pos = [demuS31Position.x+600,demuS31Position.y];
demuS31_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "97");
graph.add(demuS31_BusWriteTRG00);

demuS31_Or200.connect(0, demuS31_Multiplexer200, 0);
demuS31_ConstNumber00.connect(0, demuS31_Multiplexer200, 1);
demuS31_ConstNumber01.connect(0, demuS31_Multiplexer200, 2);
demuS31_Multiplexer200.connect(0, demuS31_BusWriteTRG00, 0);
demuS31_TickReceiverTRG00.connect(0, demuS31_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region ROLOI S32
//////////////////////////////////////////////////
const roloiS32Position = {x:2600+RoloiPosGlobal.x, y:0+RoloiPosGlobal.y};

//////////////////////////////////////////////////
//COMPARE HEAT/COOL S32 THERMOSTAT
//////////////////////////////////////////////////
let roloiS32_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS32_LocalReadReg00.pos = [roloiS32Position.x,roloiS32Position.y];
roloiS32_LocalReadReg00.init(database_BusReadAllTRG00, "S32:R48");
graph.add(roloiS32_LocalReadReg00);

let roloiS32_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
roloiS32_LocalReadReg01.pos = [roloiS32Position.x,roloiS32Position.y+100];
roloiS32_LocalReadReg01.init(database_BusReadAllTRG00, "S32:R384");
graph.add(roloiS32_LocalReadReg01);

let roloiS32_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
roloiS32_ConstNumber00.pos = [roloiS32Position.x,roloiS32Position.y+200];
roloiS32_ConstNumber00.init(10);
graph.add(roloiS32_ConstNumber00);

let roloiS32_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
roloiS32_DivideNumber00.pos = [roloiS32Position.x+200,roloiS32Position.y];
graph.add(roloiS32_DivideNumber00);

let roloiS32_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
roloiS32_DivideNumber01.pos = [roloiS32Position.x+200,roloiS32Position.y+100];
graph.add(roloiS32_DivideNumber01);

//Y_YPOGEIO
let ypogeio_PropSendNumber02 = LiteGraph.createNode("Deos/PropSendNumber");
ypogeio_PropSendNumber02.pos = [roloiS32Position.x+420,roloiS32Position.y-70];
ypogeio_PropSendNumber02.init(broadcastDeosHandle, "y_kou_room_temp");
graph.add(ypogeio_PropSendNumber02);
roloiS32_DivideNumber00.connect(0, ypogeio_PropSendNumber02, 0);

let roloiS32_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
roloiS32_ConstNumber01.pos = [roloiS32Position.x+220,roloiS32Position.y+200];
roloiS32_ConstNumber01.init(1);
graph.add(roloiS32_ConstNumber01);

let roloiS32_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
roloiS32_CompareHeat00.pos = [roloiS32Position.x+420,roloiS32Position.y];
graph.add(roloiS32_CompareHeat00);

let roloiS32_CompareCool00 = LiteGraph.createNode("Deos/CompareCool");
roloiS32_CompareCool00.pos = [roloiS32Position.x+420,roloiS32Position.y+100];
graph.add(roloiS32_CompareCool00);

roloiS32_LocalReadReg00.connect(0, roloiS32_DivideNumber00, 0);
roloiS32_LocalReadReg01.connect(0, roloiS32_DivideNumber01, 0);
roloiS32_ConstNumber00.connect(0, roloiS32_DivideNumber00, 1);
roloiS32_ConstNumber00.connect(0, roloiS32_DivideNumber01, 1);
roloiS32_DivideNumber00.connect(0, roloiS32_CompareHeat00, 0);
roloiS32_DivideNumber00.connect(0, roloiS32_CompareCool00, 0);
roloiS32_DivideNumber01.connect(0, roloiS32_CompareHeat00, 1);
roloiS32_DivideNumber01.connect(0, roloiS32_CompareCool00, 1);
roloiS32_ConstNumber01.connect(0, roloiS32_CompareHeat00, 2);
roloiS32_ConstNumber01.connect(0, roloiS32_CompareCool00, 2);

let roloiS32_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
roloiS32_PropReadBoolean00.pos = [roloiS32Position.x+200,roloiS32Position.y+300];
roloiS32_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(roloiS32_PropReadBoolean00);

let roloiS32_Not00 = LiteGraph.createNode("Deos/Not");
roloiS32_Not00.pos = [roloiS32Position.x+500,roloiS32Position.y+300];
graph.add(roloiS32_Not00);

let roloiS32_And00 = LiteGraph.createNode("Deos/And2");
roloiS32_And00.pos = [roloiS32Position.x+700,roloiS32Position.y];
graph.add(roloiS32_And00);

let roloiS32_And01 = LiteGraph.createNode("Deos/And2");
roloiS32_And01.pos = [roloiS32Position.x+700,roloiS32Position.y+100];
graph.add(roloiS32_And01);

let roloiS32_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS32_PropSaveBoolean00.pos = [roloiS32Position.x+900,roloiS32Position.y];
roloiS32_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S32_demand_heat");
graph.add(roloiS32_PropSaveBoolean00);

let roloiS32_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
roloiS32_PropSaveBoolean01.pos = [roloiS32Position.x+900,roloiS32Position.y+100];
roloiS32_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S32_demand_cool");
graph.add(roloiS32_PropSaveBoolean01);

roloiS32_CompareHeat00.connect(0, roloiS32_And00, 0);
roloiS32_CompareCool00.connect(0, roloiS32_And01, 0);
roloiS32_PropReadBoolean00.connect(0, roloiS32_And01, 1);
roloiS32_PropReadBoolean00.connect(0, roloiS32_Not00, 0);
roloiS32_Not00.connect(0, roloiS32_And00, 1);
roloiS32_And00.connect(0, roloiS32_PropSaveBoolean00, 0);
roloiS32_And01.connect(0, roloiS32_PropSaveBoolean01, 0);

//////////////////////////////////////////////////
//MULTIPLEXER S32 THERMOSTAT
//////////////////////////////////////////////////
const demuS32Position = {x:3000+RoloiPosGlobal.x, y:0+RoloiPosGlobal.y+yOffsetRoloi};

let demuS32_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS32_PropReadBoolean00.pos = [demuS32Position.x-200,demuS32Position.y];
demuS32_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S32_demand_heat");
graph.add(demuS32_PropReadBoolean00);

let demuS32_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS32_PropReadBoolean02.pos = [demuS32Position.x-400,demuS32Position.y+70];
demuS32_PropReadBoolean02.init(g_broadcastDeosContainer, "g_S32_demand_endod");
graph.add(demuS32_PropReadBoolean02);

let demuS32_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS32_PropReadBoolean03.pos = [demuS32Position.x-400,demuS32Position.y+140];
demuS32_PropReadBoolean03.init(g_broadcastDeosContainer, "g_S32_demand_idu");
graph.add(demuS32_PropReadBoolean03);

let demuS32_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
demuS32_PropReadBoolean01.pos = [demuS32Position.x-200,demuS32Position.y+210];
demuS32_PropReadBoolean01.init(g_broadcastDeosContainer, "g_S32_demand_cool");
graph.add(demuS32_PropReadBoolean01);

let demuS32_Or201 = LiteGraph.createNode("Deos/Or2");
demuS32_Or201.pos = [demuS32Position.x-200,demuS32Position.y+70];
graph.add(demuS32_Or201);

let demuS32_And200 = LiteGraph.createNode("Deos/And2");
demuS32_And200.pos = [demuS32Position.x,demuS32Position.y];
graph.add(demuS32_And200);

let demuS32_And201 = LiteGraph.createNode("Deos/And2");
demuS32_And201.pos = [demuS32Position.x,demuS32Position.y+140];
graph.add(demuS32_And201);

let demuS32_Or200 = LiteGraph.createNode("Deos/Or2");
demuS32_Or200.pos = [demuS32Position.x+200,demuS32Position.y];
graph.add(demuS32_Or200);

//Y_YPOGEIO
let ypogeio_PropSendBooleanA02 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanA02.pos = [demuS32Position.x+400,demuS32Position.y-70];
ypogeio_PropSendBooleanA02.init(broadcastDeosHandle, "y_kou_isWorking");
graph.add(ypogeio_PropSendBooleanA02);
demuS32_Or200.connect(0, ypogeio_PropSendBooleanA02, 0);

demuS32_PropReadBoolean02.connect(0, demuS32_Or201, 0);
demuS32_PropReadBoolean03.connect(0, demuS32_Or201, 1);
demuS32_PropReadBoolean00.connect(0, demuS32_And200, 0);
demuS32_Or201.connect(0, demuS32_And200, 1);
demuS32_PropReadBoolean03.connect(0, demuS32_And201, 0);
demuS32_PropReadBoolean01.connect(0, demuS32_And201, 1);
demuS32_And200.connect(0, demuS32_Or200, 0);
demuS32_And201.connect(0, demuS32_Or200, 1);

let demuS32_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
demuS32_ConstNumber00.pos = [demuS32Position.x+200,demuS32Position.y+90];
demuS32_ConstNumber00.init(0);
graph.add(demuS32_ConstNumber00);

let demuS32_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
demuS32_ConstNumber01.pos = [demuS32Position.x+200,demuS32Position.y+190];
demuS32_ConstNumber01.init(16384);
graph.add(demuS32_ConstNumber01);

let demuS32_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
demuS32_Multiplexer200.pos = [demuS32Position.x+400,demuS32Position.y];
graph.add(demuS32_Multiplexer200);

let demuS32_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
demuS32_TickReceiverTRG00.pos = [demuS32Position.x+420,demuS32Position.y+120];
graph.add(demuS32_TickReceiverTRG00);

let demuS32_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
demuS32_BusWriteTRG00.pos = [demuS32Position.x+600,demuS32Position.y];
demuS32_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "97");
graph.add(demuS32_BusWriteTRG00);

demuS32_Or200.connect(0, demuS32_Multiplexer200, 0);
demuS32_ConstNumber00.connect(0, demuS32_Multiplexer200, 1);
demuS32_ConstNumber01.connect(0, demuS32_Multiplexer200, 2);
demuS32_Multiplexer200.connect(0, demuS32_BusWriteTRG00, 0);
demuS32_TickReceiverTRG00.connect(0, demuS32_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

const modeS0Position = {x:3550, y:1400};
//////////////////////////////////////////////////
//#region MODE S0
//////////////////////////////////////////////////
let modeS0_Title00 = LiteGraph.createNode("Deos/Title");
modeS0_Title00.pos = [modeS0Position.x,modeS0Position.y-80];
modeS0_Title00.init("IDU MODE - Ρύθμιση <Mode IDU> βάσει του <g_isCool>.", 800);
graph.add(modeS0_Title00);

let modeS0_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
modeS0_PropReadBoolean00.pos = [modeS0Position.x,modeS0Position.y];
modeS0_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(modeS0_PropReadBoolean00);

let modeS0_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
modeS0_ConstNumber01.pos = [modeS0Position.x,modeS0Position.y+100];
modeS0_ConstNumber01.init(4);
graph.add(modeS0_ConstNumber01);

let modeS0_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
modeS0_ConstNumber02.pos = [modeS0Position.x,modeS0Position.y+200];
modeS0_ConstNumber02.init(0);
graph.add(modeS0_ConstNumber02);

let modeS0_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
modeS0_Multiplexer200.pos = [modeS0Position.x+200,modeS0Position.y];
graph.add(modeS0_Multiplexer200);

let modeS0_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
modeS0_TickReceiverTRG00.pos = [modeS0Position.x+220,modeS0Position.y+120];
graph.add(modeS0_TickReceiverTRG00);

let modeS0_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
modeS0_BusWriteTRG00.pos = [modeS0Position.x+400,modeS0Position.y];
modeS0_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "1", "40001");
graph.add(modeS0_BusWriteTRG00);

modeS0_PropReadBoolean00.connect(0, modeS0_Multiplexer200, 0);
modeS0_ConstNumber01.connect(0, modeS0_Multiplexer200, 1);
modeS0_ConstNumber02.connect(0, modeS0_Multiplexer200, 2);
modeS0_Multiplexer200.connect(0, modeS0_BusWriteTRG00, 0);
modeS0_TickReceiverTRG00.connect(0, modeS0_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion MODE S0
//////////////////////////////////////////////////

let OperPosGlobal = {x:750, y:950};
//////////////////////////////////////////////////
//#region OPERATE S0
//////////////////////////////////////////////////
const operS30Position = {x:0+OperPosGlobal.x, y:0+OperPosGlobal.y};

let operS30_Title00 = LiteGraph.createNode("Deos/Title");
operS30_Title00.pos = [operS30Position.x,operS30Position.y-220];
operS30_Title00.init("IDU OPERATION - Ρύθμιση <Operation IDU> βάσει του <Fan Speed >0 Θερμοστάτη> και καθορισμός <g_S30,31,32_demand_idu>.", 1000);
graph.add(operS30_Title00);

let operS30_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
operS30_LocalReadReg00.pos = [operS30Position.x,operS30Position.y];
operS30_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R385");
graph.add(operS30_LocalReadReg00);

let operS30_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
operS30_ConstNumber00.pos = [operS30Position.x,operS30Position.y+100];
operS30_ConstNumber00.init(0);
graph.add(operS30_ConstNumber00);

let operS30_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
operS30_GreatThan00.pos = [operS30Position.x+200,operS30Position.y];
graph.add(operS30_GreatThan00);

let operS30_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
operS30_ConstNumber01.pos = [operS30Position.x+200,operS30Position.y+100];
operS30_ConstNumber01.init(0);
graph.add(operS30_ConstNumber01);

let operS30_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
operS30_ConstNumber02.pos = [operS30Position.x+200,operS30Position.y+200];
operS30_ConstNumber02.init(1);
graph.add(operS30_ConstNumber02);

let operS30_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
operS30_Multiplexer200.pos = [operS30Position.x+400,operS30Position.y];
graph.add(operS30_Multiplexer200);

let operS30_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
operS30_TickReceiverTRG00.pos = [operS30Position.x+420,operS30Position.y+120];
graph.add(operS30_TickReceiverTRG00);

let operS30_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
operS30_BusWriteTRG00.pos = [operS30Position.x+600,operS30Position.y];
operS30_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "1", "1");
graph.add(operS30_BusWriteTRG00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanN00 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanN00.pos = [operS30Position.x+400,operS30Position.y-140];
ypogeio_PropSendBooleanN00.init(broadcastDeosHandle, "y_ypn_isFanOn");
graph.add(ypogeio_PropSendBooleanN00);
operS30_GreatThan00.connect(0, ypogeio_PropSendBooleanN00, 0);

let operS30_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
operS30_PropSaveBoolean00.pos = [operS30Position.x+400,operS30Position.y-70];
operS30_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S30_demand_idu");
graph.add(operS30_PropSaveBoolean00);

operS30_GreatThan00.connect(0, operS30_PropSaveBoolean00, 0);

operS30_LocalReadReg00.connect(0, operS30_GreatThan00, 0);
operS30_ConstNumber00.connect(0, operS30_GreatThan00, 1);
operS30_GreatThan00.connect(0, operS30_Multiplexer200, 0);
operS30_ConstNumber01.connect(0, operS30_Multiplexer200, 1);
operS30_ConstNumber02.connect(0, operS30_Multiplexer200, 2);
operS30_Multiplexer200.connect(0, operS30_BusWriteTRG00, 0);
operS30_TickReceiverTRG00.connect(0, operS30_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion OPERATE S0
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region OPERATE S1
//////////////////////////////////////////////////
const operS31Position = {x:900+OperPosGlobal.x, y:0+OperPosGlobal.y};

let operS31_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
operS31_LocalReadReg00.pos = [operS31Position.x,operS31Position.y];
operS31_LocalReadReg00.init(database_BusReadAllTRG00, "S31:R385");
graph.add(operS31_LocalReadReg00);

let operS31_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
operS31_ConstNumber00.pos = [operS31Position.x,operS31Position.y+100];
operS31_ConstNumber00.init(0);
graph.add(operS31_ConstNumber00);

let operS31_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
operS31_GreatThan00.pos = [operS31Position.x+200,operS31Position.y];
graph.add(operS31_GreatThan00);

let operS31_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
operS31_ConstNumber01.pos = [operS31Position.x+200,operS31Position.y+100];
operS31_ConstNumber01.init(0);
graph.add(operS31_ConstNumber01);

let operS31_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
operS31_ConstNumber02.pos = [operS31Position.x+200,operS31Position.y+200];
operS31_ConstNumber02.init(1);
graph.add(operS31_ConstNumber02);

let operS31_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
operS31_Multiplexer200.pos = [operS31Position.x+400,operS31Position.y];
graph.add(operS31_Multiplexer200);

let operS31_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
operS31_TickReceiverTRG00.pos = [operS31Position.x+420,operS31Position.y+120];
graph.add(operS31_TickReceiverTRG00);

let operS31_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
operS31_BusWriteTRG00.pos = [operS31Position.x+600,operS31Position.y];
operS31_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "2", "1");
graph.add(operS31_BusWriteTRG00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanN01 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanN01.pos = [operS31Position.x+400,operS31Position.y-140];
ypogeio_PropSendBooleanN01.init(broadcastDeosHandle, "y_gra_isFanOn");
graph.add(ypogeio_PropSendBooleanN01);
operS31_GreatThan00.connect(0, ypogeio_PropSendBooleanN01, 0);

let operS31_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
operS31_PropSaveBoolean00.pos = [operS31Position.x+400,operS31Position.y-70];
operS31_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S31_demand_idu");
graph.add(operS31_PropSaveBoolean00);

operS31_GreatThan00.connect(0, operS31_PropSaveBoolean00, 0);

operS31_LocalReadReg00.connect(0, operS31_GreatThan00, 0);
operS31_ConstNumber00.connect(0, operS31_GreatThan00, 1);
operS31_GreatThan00.connect(0, operS31_Multiplexer200, 0);
operS31_ConstNumber01.connect(0, operS31_Multiplexer200, 1);
operS31_ConstNumber02.connect(0, operS31_Multiplexer200, 2);
operS31_Multiplexer200.connect(0, operS31_BusWriteTRG00, 0);
operS31_TickReceiverTRG00.connect(0, operS31_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion OPERATE S1
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region OPERATE S2
//////////////////////////////////////////////////
const operS32Position = {x:1800+OperPosGlobal.x, y:0+OperPosGlobal.y};

let operS32_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
operS32_LocalReadReg00.pos = [operS32Position.x,operS32Position.y];
operS32_LocalReadReg00.init(database_BusReadAllTRG00, "S32:R385");
graph.add(operS32_LocalReadReg00);

let operS32_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
operS32_ConstNumber00.pos = [operS32Position.x,operS32Position.y+100];
operS32_ConstNumber00.init(0);
graph.add(operS32_ConstNumber00);

let operS32_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
operS32_GreatThan00.pos = [operS32Position.x+200,operS32Position.y];
graph.add(operS32_GreatThan00);

let operS32_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
operS32_ConstNumber01.pos = [operS32Position.x+200,operS32Position.y+100];
operS32_ConstNumber01.init(0);
graph.add(operS32_ConstNumber01);

let operS32_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
operS32_ConstNumber02.pos = [operS32Position.x+200,operS32Position.y+200];
operS32_ConstNumber02.init(1);
graph.add(operS32_ConstNumber02);

let operS32_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
operS32_Multiplexer200.pos = [operS32Position.x+400,operS32Position.y];
graph.add(operS32_Multiplexer200);

let operS32_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
operS32_TickReceiverTRG00.pos = [operS32Position.x+420,operS32Position.y+120];
graph.add(operS32_TickReceiverTRG00);

let operS32_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
operS32_BusWriteTRG00.pos = [operS32Position.x+600,operS32Position.y];
operS32_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "3", "1");
graph.add(operS32_BusWriteTRG00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanN02 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanN02.pos = [operS32Position.x+400,operS32Position.y-140];
ypogeio_PropSendBooleanN02.init(broadcastDeosHandle, "y_kou_isFanOn");
graph.add(ypogeio_PropSendBooleanN02);
operS32_GreatThan00.connect(0, ypogeio_PropSendBooleanN02, 0);

let operS32_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
operS32_PropSaveBoolean00.pos = [operS32Position.x+400,operS32Position.y-70];
operS32_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_S32_demand_idu");
graph.add(operS32_PropSaveBoolean00);

operS32_GreatThan00.connect(0, operS32_PropSaveBoolean00, 0);

operS32_LocalReadReg00.connect(0, operS32_GreatThan00, 0);
operS32_ConstNumber00.connect(0, operS32_GreatThan00, 1);
operS32_GreatThan00.connect(0, operS32_Multiplexer200, 0);
operS32_ConstNumber01.connect(0, operS32_Multiplexer200, 1);
operS32_ConstNumber02.connect(0, operS32_Multiplexer200, 2);
operS32_Multiplexer200.connect(0, operS32_BusWriteTRG00, 0);
operS32_TickReceiverTRG00.connect(0, operS32_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion OPERATE S2
//////////////////////////////////////////////////

let SpeedPosGlobal = {x:750, y:1400};
//////////////////////////////////////////////////
//#region SPEED S0
//////////////////////////////////////////////////
const speedS30Position = {x:0+SpeedPosGlobal.x, y:0+SpeedPosGlobal.y};

let speedS30_Title00 = LiteGraph.createNode("Deos/Title");
speedS30_Title00.pos = [speedS30Position.x,speedS30Position.y-80];
speedS30_Title00.init("IDU FAN SPEED - Ρύθμιση <Fan Speed IDU> βάσει του <Fan Speed Θερμοστάτη>.", 1000);
graph.add(speedS30_Title00);

let speedS30_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
speedS30_LocalReadReg00.pos = [speedS30Position.x,speedS30Position.y];
speedS30_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R385");
graph.add(speedS30_LocalReadReg00);

let speedS30_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
speedS30_ConstNumber00.pos = [speedS30Position.x,speedS30Position.y+100];
speedS30_ConstNumber00.init(1);
graph.add(speedS30_ConstNumber00);

let speedS30_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
speedS30_ConstNumber01.pos = [speedS30Position.x,speedS30Position.y+200];
speedS30_ConstNumber01.init(3);
graph.add(speedS30_ConstNumber01);

let speedS30_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
speedS30_ClampMinMax00.pos = [speedS30Position.x+200,speedS30Position.y];
graph.add(speedS30_ClampMinMax00);

let speedS30_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
speedS30_TickReceiverTRG00.pos = [speedS30Position.x+220,speedS30Position.y+120];
graph.add(speedS30_TickReceiverTRG00);

let speedS30_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
speedS30_BusWriteTRG00.pos = [speedS30Position.x+400,speedS30Position.y];
speedS30_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "1", "40002");
graph.add(speedS30_BusWriteTRG00);

speedS30_LocalReadReg00.connect(0, speedS30_ClampMinMax00, 0);
speedS30_ConstNumber00.connect(0, speedS30_ClampMinMax00, 1);
speedS30_ConstNumber01.connect(0, speedS30_ClampMinMax00, 2);
speedS30_ClampMinMax00.connect(0, speedS30_BusWriteTRG00, 0);
speedS30_TickReceiverTRG00.connect(0, speedS30_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SPEED S0
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region SPEED S1
//////////////////////////////////////////////////
const speedS31Position = {x:900+SpeedPosGlobal.x, y:0+SpeedPosGlobal.y};

let speedS31_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
speedS31_LocalReadReg00.pos = [speedS31Position.x,speedS31Position.y];
speedS31_LocalReadReg00.init(database_BusReadAllTRG00, "S31:R385");
graph.add(speedS31_LocalReadReg00);

let speedS31_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
speedS31_ConstNumber00.pos = [speedS31Position.x,speedS31Position.y+100];
speedS31_ConstNumber00.init(1);
graph.add(speedS31_ConstNumber00);

let speedS31_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
speedS31_ConstNumber01.pos = [speedS31Position.x,speedS31Position.y+200];
speedS31_ConstNumber01.init(3);
graph.add(speedS31_ConstNumber01);

let speedS31_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
speedS31_ClampMinMax00.pos = [speedS31Position.x+200,speedS31Position.y];
graph.add(speedS31_ClampMinMax00);

let speedS31_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
speedS31_TickReceiverTRG00.pos = [speedS31Position.x+220,speedS31Position.y+120];
graph.add(speedS31_TickReceiverTRG00);

let speedS31_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
speedS31_BusWriteTRG00.pos = [speedS31Position.x+400,speedS31Position.y];
speedS31_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "2", "40002");
graph.add(speedS31_BusWriteTRG00);

speedS31_LocalReadReg00.connect(0, speedS31_ClampMinMax00, 0);
speedS31_ConstNumber00.connect(0, speedS31_ClampMinMax00, 1);
speedS31_ConstNumber01.connect(0, speedS31_ClampMinMax00, 2);
speedS31_ClampMinMax00.connect(0, speedS31_BusWriteTRG00, 0);
speedS31_TickReceiverTRG00.connect(0, speedS31_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SPEED S1
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region SPEED S2
//////////////////////////////////////////////////
const speedS32Position = {x:1800+SpeedPosGlobal.x, y:0+SpeedPosGlobal.y};

let speedS32_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
speedS32_LocalReadReg00.pos = [speedS32Position.x,speedS32Position.y];
speedS32_LocalReadReg00.init(database_BusReadAllTRG00, "S32:R385");
graph.add(speedS32_LocalReadReg00);

let speedS32_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
speedS32_ConstNumber00.pos = [speedS32Position.x,speedS32Position.y+100];
speedS32_ConstNumber00.init(1);
graph.add(speedS32_ConstNumber00);

let speedS32_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
speedS32_ConstNumber01.pos = [speedS32Position.x,speedS32Position.y+200];
speedS32_ConstNumber01.init(3);
graph.add(speedS32_ConstNumber01);

let speedS32_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
speedS32_ClampMinMax00.pos = [speedS32Position.x+200,speedS32Position.y];
graph.add(speedS32_ClampMinMax00);

let speedS32_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
speedS32_TickReceiverTRG00.pos = [speedS32Position.x+220,speedS32Position.y+120];
graph.add(speedS32_TickReceiverTRG00);

let speedS32_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
speedS32_BusWriteTRG00.pos = [speedS32Position.x+400,speedS32Position.y];
speedS32_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "3", "40002");
graph.add(speedS32_BusWriteTRG00);

speedS32_LocalReadReg00.connect(0, speedS32_ClampMinMax00, 0);
speedS32_ConstNumber00.connect(0, speedS32_ClampMinMax00, 1);
speedS32_ConstNumber01.connect(0, speedS32_ClampMinMax00, 2);
speedS32_ClampMinMax00.connect(0, speedS32_BusWriteTRG00, 0);
speedS32_TickReceiverTRG00.connect(0, speedS32_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SPEED S2
//////////////////////////////////////////////////

let SpPosGlobal = {x:750, y:1850};
//////////////////////////////////////////////////
//#region SETPOINT S0
//////////////////////////////////////////////////
const setpointS0Position = {x:240+SpPosGlobal.x, y:0+SpPosGlobal.y};

let setpointS0_Title00 = LiteGraph.createNode("Deos/Title");
setpointS0_Title00.pos = [setpointS0Position.x-240,setpointS0Position.y-80];
setpointS0_Title00.init("IDU SETPOINT - Ρύθμιση <Setpoint IDU> βάσει του <Setpoint Θερμοστάτη>, των <+dT Θερμανσης> ή <-dT Ψύξης> από properties και του <Global Mode>.", 1000);
graph.add(setpointS0_Title00);

let setpointS0_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
setpointS0_LocalReadReg00.pos = [setpointS0Position.x,setpointS0Position.y];
setpointS0_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R384");
graph.add(setpointS0_LocalReadReg00);

let setpointS0_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS0_PropReadNumber00.pos = [setpointS0Position.x-240,setpointS0Position.y+70];
setpointS0_PropReadNumber00.init(g_broadcastDeosContainer, "p_idu_dtH");
graph.add(setpointS0_PropReadNumber00);

let setpointS0_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS0_PropReadNumber01.pos = [setpointS0Position.x-240,setpointS0Position.y+150];
setpointS0_PropReadNumber01.init(g_broadcastDeosContainer, "p_idu_dtC");
graph.add(setpointS0_PropReadNumber01);

let setpointS0_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
setpointS0_ConstNumber00.pos = [setpointS0Position.x-200,setpointS0Position.y+230];
setpointS0_ConstNumber00.init(10);
graph.add(setpointS0_ConstNumber00);

let setpointS0_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS0_MultiplyNumber00.pos = [setpointS0Position.x,setpointS0Position.y+70];
graph.add(setpointS0_MultiplyNumber00);

let setpointS0_MultiplyNumber01 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS0_MultiplyNumber01.pos = [setpointS0Position.x,setpointS0Position.y+160];
graph.add(setpointS0_MultiplyNumber01);

let setpointS0_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
setpointS0_PropReadBoolean00.pos = [setpointS0Position.x+200,setpointS0Position.y];
setpointS0_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(setpointS0_PropReadBoolean00);

let setpointS0_AddNumber00 = LiteGraph.createNode("Deos/AddNumber");
setpointS0_AddNumber00.pos = [setpointS0Position.x+200,setpointS0Position.y+70];
graph.add(setpointS0_AddNumber00);

let setpointS0_SubtractNumber00 = LiteGraph.createNode("Deos/SubtractNumber");
setpointS0_SubtractNumber00.pos = [setpointS0Position.x+200,setpointS0Position.y+160];
graph.add(setpointS0_SubtractNumber00);

let setpointS0_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
setpointS0_Multiplexer200.pos = [setpointS0Position.x+400,setpointS0Position.y];
graph.add(setpointS0_Multiplexer200);

let setpointS0_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
setpointS0_ConstNumber01.pos = [setpointS0Position.x+400,setpointS0Position.y+110];
setpointS0_ConstNumber01.init(180);
graph.add(setpointS0_ConstNumber01);

let setpointS0_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
setpointS0_ConstNumber02.pos = [setpointS0Position.x+400,setpointS0Position.y+210];
setpointS0_ConstNumber02.init(300);
graph.add(setpointS0_ConstNumber02);

let setpointS0_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
setpointS0_ClampMinMax00.pos = [setpointS0Position.x+600,setpointS0Position.y];
graph.add(setpointS0_ClampMinMax00);

let setpointS0_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
setpointS0_TickReceiverTRG00.pos = [setpointS0Position.x+620,setpointS0Position.y+120];
graph.add(setpointS0_TickReceiverTRG00);

let setpointS0_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
setpointS0_BusWriteTRG00.pos = [setpointS0Position.x+800,setpointS0Position.y];
setpointS0_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "1", "40003");
graph.add(setpointS0_BusWriteTRG00);

setpointS0_PropReadNumber00.connect(0, setpointS0_MultiplyNumber00, 0);
setpointS0_ConstNumber00.connect(0, setpointS0_MultiplyNumber00, 1);
setpointS0_PropReadNumber01.connect(0, setpointS0_MultiplyNumber01, 0);
setpointS0_ConstNumber00.connect(0, setpointS0_MultiplyNumber01, 1);
setpointS0_LocalReadReg00.connect(0, setpointS0_AddNumber00, 0);
setpointS0_MultiplyNumber00.connect(0, setpointS0_AddNumber00, 1);
setpointS0_LocalReadReg00.connect(0, setpointS0_SubtractNumber00, 0);
setpointS0_MultiplyNumber01.connect(0, setpointS0_SubtractNumber00, 1);
setpointS0_PropReadBoolean00.connect(0, setpointS0_Multiplexer200, 0);
setpointS0_AddNumber00.connect(0, setpointS0_Multiplexer200, 1);
setpointS0_SubtractNumber00.connect(0, setpointS0_Multiplexer200, 2);
setpointS0_Multiplexer200.connect(0, setpointS0_ClampMinMax00, 0);
setpointS0_ConstNumber01.connect(0, setpointS0_ClampMinMax00, 1);
setpointS0_ConstNumber02.connect(0, setpointS0_ClampMinMax00, 2);
setpointS0_ClampMinMax00.connect(0, setpointS0_BusWriteTRG00, 0);
setpointS0_TickReceiverTRG00.connect(0, setpointS0_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SETPOINT S0
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region SETPOINT S1
//////////////////////////////////////////////////
const setpointS1Position = {x:1540+SpPosGlobal.x, y:0+SpPosGlobal.y};

let setpointS1_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
setpointS1_LocalReadReg00.pos = [setpointS1Position.x,setpointS1Position.y];
setpointS1_LocalReadReg00.init(database_BusReadAllTRG00, "S31:R384");
graph.add(setpointS1_LocalReadReg00);

let setpointS1_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS1_PropReadNumber00.pos = [setpointS1Position.x-240,setpointS1Position.y+70];
setpointS1_PropReadNumber00.init(g_broadcastDeosContainer, "p_idu_dtH");
graph.add(setpointS1_PropReadNumber00);

let setpointS1_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS1_PropReadNumber01.pos = [setpointS1Position.x-240,setpointS1Position.y+150];
setpointS1_PropReadNumber01.init(g_broadcastDeosContainer, "p_idu_dtC");
graph.add(setpointS1_PropReadNumber01);

let setpointS1_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
setpointS1_ConstNumber00.pos = [setpointS1Position.x-200,setpointS1Position.y+230];
setpointS1_ConstNumber00.init(10);
graph.add(setpointS1_ConstNumber00);

let setpointS1_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS1_MultiplyNumber00.pos = [setpointS1Position.x,setpointS1Position.y+70];
graph.add(setpointS1_MultiplyNumber00);

let setpointS1_MultiplyNumber01 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS1_MultiplyNumber01.pos = [setpointS1Position.x,setpointS1Position.y+160];
graph.add(setpointS1_MultiplyNumber01);

let setpointS1_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
setpointS1_PropReadBoolean00.pos = [setpointS1Position.x+200,setpointS1Position.y];
setpointS1_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(setpointS1_PropReadBoolean00);

let setpointS1_AddNumber00 = LiteGraph.createNode("Deos/AddNumber");
setpointS1_AddNumber00.pos = [setpointS1Position.x+200,setpointS1Position.y+70];
graph.add(setpointS1_AddNumber00);

let setpointS1_SubtractNumber00 = LiteGraph.createNode("Deos/SubtractNumber");
setpointS1_SubtractNumber00.pos = [setpointS1Position.x+200,setpointS1Position.y+160];
graph.add(setpointS1_SubtractNumber00);

let setpointS1_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
setpointS1_Multiplexer200.pos = [setpointS1Position.x+400,setpointS1Position.y];
graph.add(setpointS1_Multiplexer200);

let setpointS1_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
setpointS1_ConstNumber01.pos = [setpointS1Position.x+400,setpointS1Position.y+110];
setpointS1_ConstNumber01.init(180);
graph.add(setpointS1_ConstNumber01);

let setpointS1_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
setpointS1_ConstNumber02.pos = [setpointS1Position.x+400,setpointS1Position.y+210];
setpointS1_ConstNumber02.init(300);
graph.add(setpointS1_ConstNumber02);

let setpointS1_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
setpointS1_ClampMinMax00.pos = [setpointS1Position.x+600,setpointS1Position.y];
graph.add(setpointS1_ClampMinMax00);

let setpointS1_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
setpointS1_TickReceiverTRG00.pos = [setpointS1Position.x+620,setpointS1Position.y+120];
graph.add(setpointS1_TickReceiverTRG00);

let setpointS1_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
setpointS1_BusWriteTRG00.pos = [setpointS1Position.x+800,setpointS1Position.y];
setpointS1_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "2", "40003");
graph.add(setpointS1_BusWriteTRG00);

setpointS1_PropReadNumber00.connect(0, setpointS1_MultiplyNumber00, 0);
setpointS1_ConstNumber00.connect(0, setpointS1_MultiplyNumber00, 1);
setpointS1_PropReadNumber01.connect(0, setpointS1_MultiplyNumber01, 0);
setpointS1_ConstNumber00.connect(0, setpointS1_MultiplyNumber01, 1);
setpointS1_LocalReadReg00.connect(0, setpointS1_AddNumber00, 0);
setpointS1_MultiplyNumber00.connect(0, setpointS1_AddNumber00, 1);
setpointS1_LocalReadReg00.connect(0, setpointS1_SubtractNumber00, 0);
setpointS1_MultiplyNumber01.connect(0, setpointS1_SubtractNumber00, 1);
setpointS1_PropReadBoolean00.connect(0, setpointS1_Multiplexer200, 0);
setpointS1_AddNumber00.connect(0, setpointS1_Multiplexer200, 1);
setpointS1_SubtractNumber00.connect(0, setpointS1_Multiplexer200, 2);
setpointS1_Multiplexer200.connect(0, setpointS1_ClampMinMax00, 0);
setpointS1_ConstNumber01.connect(0, setpointS1_ClampMinMax00, 1);
setpointS1_ConstNumber02.connect(0, setpointS1_ClampMinMax00, 2);
setpointS1_ClampMinMax00.connect(0, setpointS1_BusWriteTRG00, 0);
setpointS1_TickReceiverTRG00.connect(0, setpointS1_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SETPOINT S1
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region SETPOINT S2
//////////////////////////////////////////////////
const setpointS2Position = {x:2840+SpPosGlobal.x, y:0+SpPosGlobal.y};

let setpointS2_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
setpointS2_LocalReadReg00.pos = [setpointS2Position.x,setpointS2Position.y];
setpointS2_LocalReadReg00.init(database_BusReadAllTRG00, "S32:R384");
graph.add(setpointS2_LocalReadReg00);

let setpointS2_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS2_PropReadNumber00.pos = [setpointS2Position.x-240,setpointS2Position.y+70];
setpointS2_PropReadNumber00.init(g_broadcastDeosContainer, "p_idu_dtH");
graph.add(setpointS2_PropReadNumber00);

let setpointS2_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
setpointS2_PropReadNumber01.pos = [setpointS2Position.x-240,setpointS2Position.y+150];
setpointS2_PropReadNumber01.init(g_broadcastDeosContainer, "p_idu_dtC");
graph.add(setpointS2_PropReadNumber01);

let setpointS2_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
setpointS2_ConstNumber00.pos = [setpointS2Position.x-200,setpointS2Position.y+230];
setpointS2_ConstNumber00.init(10);
graph.add(setpointS2_ConstNumber00);

let setpointS2_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS2_MultiplyNumber00.pos = [setpointS2Position.x,setpointS2Position.y+70];
graph.add(setpointS2_MultiplyNumber00);

let setpointS2_MultiplyNumber01 = LiteGraph.createNode("Deos/MultiplyNumber");
setpointS2_MultiplyNumber01.pos = [setpointS2Position.x,setpointS2Position.y+160];
graph.add(setpointS2_MultiplyNumber01);

let setpointS2_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
setpointS2_PropReadBoolean00.pos = [setpointS2Position.x+200,setpointS2Position.y];
setpointS2_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(setpointS2_PropReadBoolean00);

let setpointS2_AddNumber00 = LiteGraph.createNode("Deos/AddNumber");
setpointS2_AddNumber00.pos = [setpointS2Position.x+200,setpointS2Position.y+70];
graph.add(setpointS2_AddNumber00);

let setpointS2_SubtractNumber00 = LiteGraph.createNode("Deos/SubtractNumber");
setpointS2_SubtractNumber00.pos = [setpointS2Position.x+200,setpointS2Position.y+160];
graph.add(setpointS2_SubtractNumber00);

let setpointS2_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
setpointS2_Multiplexer200.pos = [setpointS2Position.x+400,setpointS2Position.y];
graph.add(setpointS2_Multiplexer200);

let setpointS2_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
setpointS2_ConstNumber01.pos = [setpointS2Position.x+400,setpointS2Position.y+110];
setpointS2_ConstNumber01.init(180);
graph.add(setpointS2_ConstNumber01);

let setpointS2_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
setpointS2_ConstNumber02.pos = [setpointS2Position.x+400,setpointS2Position.y+210];
setpointS2_ConstNumber02.init(300);
graph.add(setpointS2_ConstNumber02);

let setpointS2_ClampMinMax00 = LiteGraph.createNode("Deos/ClampMinMax");
setpointS2_ClampMinMax00.pos = [setpointS2Position.x+600,setpointS2Position.y];
graph.add(setpointS2_ClampMinMax00);

let setpointS2_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
setpointS2_TickReceiverTRG00.pos = [setpointS2Position.x+620,setpointS2Position.y+120];
graph.add(setpointS2_TickReceiverTRG00);

let setpointS2_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
setpointS2_BusWriteTRG00.pos = [setpointS2Position.x+800,setpointS2Position.y];
setpointS2_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "3", "40003");
graph.add(setpointS2_BusWriteTRG00);

setpointS2_PropReadNumber00.connect(0, setpointS2_MultiplyNumber00, 0);
setpointS2_ConstNumber00.connect(0, setpointS2_MultiplyNumber00, 1);
setpointS2_PropReadNumber01.connect(0, setpointS2_MultiplyNumber01, 0);
setpointS2_ConstNumber00.connect(0, setpointS2_MultiplyNumber01, 1);
setpointS2_LocalReadReg00.connect(0, setpointS2_AddNumber00, 0);
setpointS2_MultiplyNumber00.connect(0, setpointS2_AddNumber00, 1);
setpointS2_LocalReadReg00.connect(0, setpointS2_SubtractNumber00, 0);
setpointS2_MultiplyNumber01.connect(0, setpointS2_SubtractNumber00, 1);
setpointS2_PropReadBoolean00.connect(0, setpointS2_Multiplexer200, 0);
setpointS2_AddNumber00.connect(0, setpointS2_Multiplexer200, 1);
setpointS2_SubtractNumber00.connect(0, setpointS2_Multiplexer200, 2);
setpointS2_Multiplexer200.connect(0, setpointS2_ClampMinMax00, 0);
setpointS2_ConstNumber01.connect(0, setpointS2_ClampMinMax00, 1);
setpointS2_ConstNumber02.connect(0, setpointS2_ClampMinMax00, 2);
setpointS2_ClampMinMax00.connect(0, setpointS2_BusWriteTRG00, 0);
setpointS2_TickReceiverTRG00.connect(0, setpointS2_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion SETPOINT S2
//////////////////////////////////////////////////

let LgPropPosGlobal = {x:4750, y:850};
//////////////////////////////////////////////////
//#region LGPROPERTIES 01
//////////////////////////////////////////////////
const lgProp01Position = {x:0+LgPropPosGlobal.x, y:0+LgPropPosGlobal.y};

let lgProp01_Title00 = LiteGraph.createNode("Deos/Title");
lgProp01_Title00.pos = [lgProp01Position.x,lgProp01Position.y-80];
lgProp01_Title00.init("IDU STATS IN PROPERTIES - Απεικόνιση στα <Properties> των <IDU Room Temp>, <IDU Refr Inlet>, <IDU Refr Outlet>.", 800);
graph.add(lgProp01_Title00);

//GET LOCAL REG
let lgProp01_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp01_LocalReadReg00.pos = [lgProp01Position.x,lgProp01Position.y];
lgProp01_LocalReadReg00.init(database_BusReadAllTRG00, "S1:R30002");
graph.add(lgProp01_LocalReadReg00);

let lgProp01_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp01_LocalReadReg01.pos = [lgProp01Position.x,lgProp01Position.y+100];
lgProp01_LocalReadReg01.init(database_BusReadAllTRG00, "S1:R30003");
graph.add(lgProp01_LocalReadReg01);

let lgProp01_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp01_LocalReadReg02.pos = [lgProp01Position.x,lgProp01Position.y+200];
lgProp01_LocalReadReg02.init(database_BusReadAllTRG00, "S1:R30004");
graph.add(lgProp01_LocalReadReg02);

//DIVIDE
let lgProp01_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
lgProp01_DivideNumber00.pos = [lgProp01Position.x+250,lgProp01Position.y];
graph.add(lgProp01_DivideNumber00);

let lgProp01_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
lgProp01_DivideNumber01.pos = [lgProp01Position.x+250,lgProp01Position.y+100];
graph.add(lgProp01_DivideNumber01);

let lgProp01_DivideNumber02 = LiteGraph.createNode("Deos/DivideNumber");
lgProp01_DivideNumber02.pos = [lgProp01Position.x+250,lgProp01Position.y+200];
graph.add(lgProp01_DivideNumber02);

//SEND PROPERTY
let lgProp01_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp01_PropSendNumber00.pos = [lgProp01Position.x+450,lgProp01Position.y];
lgProp01_PropSendNumber00.init(broadcastDeosHandle, "p_idu1_room_temp");
graph.add(lgProp01_PropSendNumber00);

let lgProp01_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp01_PropSendNumber01.pos = [lgProp01Position.x+450,lgProp01Position.y+100];
lgProp01_PropSendNumber01.init(broadcastDeosHandle, "p_idu1_refr_inlet");
graph.add(lgProp01_PropSendNumber01);

let lgProp01_PropSendNumber02 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp01_PropSendNumber02.pos = [lgProp01Position.x+450,lgProp01Position.y+200];
lgProp01_PropSendNumber02.init(broadcastDeosHandle, "p_idu1_refr_outlet");
graph.add(lgProp01_PropSendNumber02);

//CONST 10
let lgProp01_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
lgProp01_ConstNumber00.pos = [lgProp01Position.x+20,lgProp01Position.y+300];
lgProp01_ConstNumber00.init(10);
graph.add(lgProp01_ConstNumber00);

lgProp01_LocalReadReg00.connect(0, lgProp01_DivideNumber00, 0);
lgProp01_LocalReadReg01.connect(0, lgProp01_DivideNumber01, 0);
lgProp01_LocalReadReg02.connect(0, lgProp01_DivideNumber02, 0);
lgProp01_ConstNumber00.connect(0, lgProp01_DivideNumber00, 1);
lgProp01_ConstNumber00.connect(0, lgProp01_DivideNumber01, 1);
lgProp01_ConstNumber00.connect(0, lgProp01_DivideNumber02, 1);
lgProp01_DivideNumber00.connect(0, lgProp01_PropSendNumber00, 0);
lgProp01_DivideNumber01.connect(0, lgProp01_PropSendNumber01, 0);
lgProp01_DivideNumber02.connect(0, lgProp01_PropSendNumber02, 0);
//////////////////////////////////////////////////
//#endregion LGPROPERTIES 01
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region LGPROPERTIES 02
//////////////////////////////////////////////////
const lgProp02Position = {x:0+LgPropPosGlobal.x, y:500+LgPropPosGlobal.y};

//GET LOCAL REG
let lgProp02_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp02_LocalReadReg00.pos = [lgProp02Position.x,lgProp02Position.y];
lgProp02_LocalReadReg00.init(database_BusReadAllTRG00, "S2:R30002");
graph.add(lgProp02_LocalReadReg00);

let lgProp02_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp02_LocalReadReg01.pos = [lgProp02Position.x,lgProp02Position.y+100];
lgProp02_LocalReadReg01.init(database_BusReadAllTRG00, "S2:R30003");
graph.add(lgProp02_LocalReadReg01);

let lgProp02_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp02_LocalReadReg02.pos = [lgProp02Position.x,lgProp02Position.y+200];
lgProp02_LocalReadReg02.init(database_BusReadAllTRG00, "S2:R30004");
graph.add(lgProp02_LocalReadReg02);

//DIVIDE
let lgProp02_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
lgProp02_DivideNumber00.pos = [lgProp02Position.x+250,lgProp02Position.y];
graph.add(lgProp02_DivideNumber00);

let lgProp02_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
lgProp02_DivideNumber01.pos = [lgProp02Position.x+250,lgProp02Position.y+100];
graph.add(lgProp02_DivideNumber01);

let lgProp02_DivideNumber02 = LiteGraph.createNode("Deos/DivideNumber");
lgProp02_DivideNumber02.pos = [lgProp02Position.x+250,lgProp02Position.y+200];
graph.add(lgProp02_DivideNumber02);

//SEND PROPERTY
let lgProp02_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp02_PropSendNumber00.pos = [lgProp02Position.x+450,lgProp02Position.y];
lgProp02_PropSendNumber00.init(broadcastDeosHandle, "p_idu2_room_temp");
graph.add(lgProp02_PropSendNumber00);

let lgProp02_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp02_PropSendNumber01.pos = [lgProp02Position.x+450,lgProp02Position.y+100];
lgProp02_PropSendNumber01.init(broadcastDeosHandle, "p_idu2_refr_inlet");
graph.add(lgProp02_PropSendNumber01);

let lgProp02_PropSendNumber02 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp02_PropSendNumber02.pos = [lgProp02Position.x+450,lgProp02Position.y+200];
lgProp02_PropSendNumber02.init(broadcastDeosHandle, "p_idu2_refr_outlet");
graph.add(lgProp02_PropSendNumber02);

//CONST 10
let lgProp02_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
lgProp02_ConstNumber00.pos = [lgProp02Position.x+20,lgProp02Position.y+300];
lgProp02_ConstNumber00.init(10);
graph.add(lgProp02_ConstNumber00);

lgProp02_LocalReadReg00.connect(0, lgProp02_DivideNumber00, 0);
lgProp02_LocalReadReg01.connect(0, lgProp02_DivideNumber01, 0);
lgProp02_LocalReadReg02.connect(0, lgProp02_DivideNumber02, 0);
lgProp02_ConstNumber00.connect(0, lgProp02_DivideNumber00, 1);
lgProp02_ConstNumber00.connect(0, lgProp02_DivideNumber01, 1);
lgProp02_ConstNumber00.connect(0, lgProp02_DivideNumber02, 1);
lgProp02_DivideNumber00.connect(0, lgProp02_PropSendNumber00, 0);
lgProp02_DivideNumber01.connect(0, lgProp02_PropSendNumber01, 0);
lgProp02_DivideNumber02.connect(0, lgProp02_PropSendNumber02, 0);
//////////////////////////////////////////////////
//#endregion LGPROPERTIES 02
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region LGPROPERTIES 03
//////////////////////////////////////////////////
const lgProp03Position = {x:0+LgPropPosGlobal.x, y:1000+LgPropPosGlobal.y};

//GET LOCAL REG
let lgProp03_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp03_LocalReadReg00.pos = [lgProp03Position.x,lgProp03Position.y];
lgProp03_LocalReadReg00.init(database_BusReadAllTRG00, "S3:R30002");
graph.add(lgProp03_LocalReadReg00);

let lgProp03_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp03_LocalReadReg01.pos = [lgProp03Position.x,lgProp03Position.y+100];
lgProp03_LocalReadReg01.init(database_BusReadAllTRG00, "S3:R30003");
graph.add(lgProp03_LocalReadReg01);

let lgProp03_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
lgProp03_LocalReadReg02.pos = [lgProp03Position.x,lgProp03Position.y+200];
lgProp03_LocalReadReg02.init(database_BusReadAllTRG00, "S3:R30004");
graph.add(lgProp03_LocalReadReg02);

//DIVIDE
let lgProp03_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
lgProp03_DivideNumber00.pos = [lgProp03Position.x+250,lgProp03Position.y];
graph.add(lgProp03_DivideNumber00);

let lgProp03_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
lgProp03_DivideNumber01.pos = [lgProp03Position.x+250,lgProp03Position.y+100];
graph.add(lgProp03_DivideNumber01);

let lgProp03_DivideNumber02 = LiteGraph.createNode("Deos/DivideNumber");
lgProp03_DivideNumber02.pos = [lgProp03Position.x+250,lgProp03Position.y+200];
graph.add(lgProp03_DivideNumber02);

//SEND PROPERTY
let lgProp03_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp03_PropSendNumber00.pos = [lgProp03Position.x+450,lgProp03Position.y];
lgProp03_PropSendNumber00.init(broadcastDeosHandle, "p_idu3_room_temp");
graph.add(lgProp03_PropSendNumber00);

let lgProp03_PropSendNumber01 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp03_PropSendNumber01.pos = [lgProp03Position.x+450,lgProp03Position.y+100];
lgProp03_PropSendNumber01.init(broadcastDeosHandle, "p_idu3_refr_inlet");
graph.add(lgProp03_PropSendNumber01);

let lgProp03_PropSendNumber02 = LiteGraph.createNode("Deos/PropSendNumber");
lgProp03_PropSendNumber02.pos = [lgProp03Position.x+450,lgProp03Position.y+200];
lgProp03_PropSendNumber02.init(broadcastDeosHandle, "p_idu3_refr_outlet");
graph.add(lgProp03_PropSendNumber02);

//CONST 10
let lgProp03_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
lgProp03_ConstNumber00.pos = [lgProp03Position.x+20,lgProp03Position.y+300];
lgProp03_ConstNumber00.init(10);
graph.add(lgProp03_ConstNumber00);

lgProp03_LocalReadReg00.connect(0, lgProp03_DivideNumber00, 0);
lgProp03_LocalReadReg01.connect(0, lgProp03_DivideNumber01, 0);
lgProp03_LocalReadReg02.connect(0, lgProp03_DivideNumber02, 0);
lgProp03_ConstNumber00.connect(0, lgProp03_DivideNumber00, 1);
lgProp03_ConstNumber00.connect(0, lgProp03_DivideNumber01, 1);
lgProp03_ConstNumber00.connect(0, lgProp03_DivideNumber02, 1);
lgProp03_DivideNumber00.connect(0, lgProp03_PropSendNumber00, 0);
lgProp03_DivideNumber01.connect(0, lgProp03_PropSendNumber01, 0);
lgProp03_DivideNumber02.connect(0, lgProp03_PropSendNumber02, 0);
//////////////////////////////////////////////////
//#endregion LGPROPERTIES 03
//////////////////////////////////////////////////

let YpogBtnPosGlobal = {x:-1700, y:1000};
//////////////////////////////////////////////////
//#region YPOGEIO YPNODWMATIO TEMP BTN
//////////////////////////////////////////////////
let ypogYpTempPosition = {x:0+YpogBtnPosGlobal.x, y:0+YpogBtnPosGlobal.y};

let ypogYpTemp_Title00 = LiteGraph.createNode("Deos/Title");
ypogYpTemp_Title00.pos = [ypogYpTempPosition.x,ypogYpTempPosition.y-80];
ypogYpTemp_Title00.init("ΚΟΥΜΠΙΑ ΟΘΟΝΗΣ ΥΠΟΓΕΙΟΥ - Χειρισμός κουμπιών με μέθοδο RCW δήλαδή READ CHANGE CLAMP WRITE και ξανά READ για άμεση ανανέωση.", 1000);
graph.add(ypogYpTemp_Title00);

let ypogYpTemp_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpTemp_ButtonTRG00.pos = [ypogYpTempPosition.x,ypogYpTempPosition.y];
ypogYpTemp_ButtonTRG00.init(g_broadcastDeosContainer, "y_ypn_btn_temp_minus"); //CHANGE
graph.add(ypogYpTemp_ButtonTRG00);

let ypogYpTemp_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpTemp_ButtonTRG01.pos = [ypogYpTempPosition.x,ypogYpTempPosition.y+150];
ypogYpTemp_ButtonTRG01.init(g_broadcastDeosContainer, "y_ypn_btn_temp_plus"); //CHANGE
graph.add(ypogYpTemp_ButtonTRG01);

let ypogYpTemp_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpTemp_BusReadTRG00.pos = [ypogYpTempPosition.x+200,ypogYpTempPosition.y];
ypogYpTemp_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "384"); //CHANGE
graph.add(ypogYpTemp_BusReadTRG00);

let ypogYpTemp_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpTemp_BusReadTRG01.pos = [ypogYpTempPosition.x+200,ypogYpTempPosition.y+150];
ypogYpTemp_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "384"); //CHANGE
graph.add(ypogYpTemp_BusReadTRG01);

let ypogYpTemp_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpTemp_ConstNumber00.pos = [ypogYpTempPosition.x+220,ypogYpTempPosition.y+300];
ypogYpTemp_ConstNumber00.init(5); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpTemp_ConstNumber00);

let ypogYpTemp_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogYpTemp_SubNumberTRG00.pos = [ypogYpTempPosition.x+400,ypogYpTempPosition.y];
graph.add(ypogYpTemp_SubNumberTRG00);

let ypogYpTemp_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogYpTemp_AddNumberTRG00.pos = [ypogYpTempPosition.x+400,ypogYpTempPosition.y+150];
graph.add(ypogYpTemp_AddNumberTRG00);

let ypogYpTemp_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpTemp_ConstNumber01.pos = [ypogYpTempPosition.x+400,ypogYpTempPosition.y+270];
ypogYpTemp_ConstNumber01.init(180); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpTemp_ConstNumber01);

let ypogYpTemp_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpTemp_ConstNumber02.pos = [ypogYpTempPosition.x+400,ypogYpTempPosition.y+370];
ypogYpTemp_ConstNumber02.init(300); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpTemp_ConstNumber02);

let ypogYpTemp_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpTemp_ClampMinMaxTRG00.pos = [ypogYpTempPosition.x+650,ypogYpTempPosition.y];
graph.add(ypogYpTemp_ClampMinMaxTRG00);

let ypogYpTemp_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpTemp_ClampMinMaxTRG01.pos = [ypogYpTempPosition.x+650,ypogYpTempPosition.y+150];
graph.add(ypogYpTemp_ClampMinMaxTRG01);

let ypogYpTemp_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpTemp_BusWriteTRG00.pos = [ypogYpTempPosition.x+850,ypogYpTempPosition.y];
ypogYpTemp_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "384"); //CHANGE
graph.add(ypogYpTemp_BusWriteTRG00);

let ypogYpTemp_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpTemp_BusWriteTRG01.pos = [ypogYpTempPosition.x+850,ypogYpTempPosition.y+150];
ypogYpTemp_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "384"); //CHANGE
graph.add(ypogYpTemp_BusWriteTRG01);

let ypogYpTemp_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogYpTemp_TickReceiverTRG00.pos = [ypogYpTempPosition.x+870,ypogYpTempPosition.y+300];
graph.add(ypogYpTemp_TickReceiverTRG00);

let ypogYpTemp_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogYpTemp_OrTrigger3TRG00.pos = [ypogYpTempPosition.x+1050,ypogYpTempPosition.y];
graph.add(ypogYpTemp_OrTrigger3TRG00);

let ypogYpTemp_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpTemp_BusReadTRG02.pos = [ypogYpTempPosition.x+1250,ypogYpTempPosition.y];
ypogYpTemp_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "384"); //CHANGE
graph.add(ypogYpTemp_BusReadTRG02);

let ypogYpTemp_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpTemp_ConstNumber03.pos = [ypogYpTempPosition.x+1250,ypogYpTempPosition.y+150];
ypogYpTemp_ConstNumber03.init(10);
graph.add(ypogYpTemp_ConstNumber03);

let ypogYpTemp_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogYpTemp_DivNumberTRG00.pos = [ypogYpTempPosition.x+1450,ypogYpTempPosition.y];
graph.add(ypogYpTemp_DivNumberTRG00);

let ypogYpTemp_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogYpTemp_PropSendNumberTRG00.pos = [ypogYpTempPosition.x+1650,ypogYpTempPosition.y];
ypogYpTemp_PropSendNumberTRG00.init(broadcastDeosHandle, "y_ypn_temp_display"); //CHANGE
graph.add(ypogYpTemp_PropSendNumberTRG00);

ypogYpTemp_ButtonTRG00.connect(0, ypogYpTemp_BusReadTRG00, 0);
ypogYpTemp_ButtonTRG01.connect(0, ypogYpTemp_BusReadTRG01, 0);

ypogYpTemp_BusReadTRG00.connect(0, ypogYpTemp_SubNumberTRG00, 0);
ypogYpTemp_ConstNumber00.connect(0, ypogYpTemp_SubNumberTRG00, 1);
ypogYpTemp_BusReadTRG00.connect(1, ypogYpTemp_SubNumberTRG00, 2);

ypogYpTemp_BusReadTRG01.connect(0, ypogYpTemp_AddNumberTRG00, 0);
ypogYpTemp_ConstNumber00.connect(0, ypogYpTemp_AddNumberTRG00, 1);
ypogYpTemp_BusReadTRG01.connect(1, ypogYpTemp_AddNumberTRG00, 2);

ypogYpTemp_SubNumberTRG00.connect(0, ypogYpTemp_ClampMinMaxTRG00, 0);
ypogYpTemp_ConstNumber01.connect(0, ypogYpTemp_ClampMinMaxTRG00, 1);
ypogYpTemp_ConstNumber02.connect(0, ypogYpTemp_ClampMinMaxTRG00, 2);
ypogYpTemp_SubNumberTRG00.connect(1, ypogYpTemp_ClampMinMaxTRG00, 3);

ypogYpTemp_AddNumberTRG00.connect(0, ypogYpTemp_ClampMinMaxTRG01, 0);
ypogYpTemp_ConstNumber01.connect(0, ypogYpTemp_ClampMinMaxTRG01, 1);
ypogYpTemp_ConstNumber02.connect(0, ypogYpTemp_ClampMinMaxTRG01, 2);
ypogYpTemp_AddNumberTRG00.connect(1, ypogYpTemp_ClampMinMaxTRG01, 3);

ypogYpTemp_ClampMinMaxTRG00.connect(0, ypogYpTemp_BusWriteTRG00, 0);
ypogYpTemp_ClampMinMaxTRG00.connect(1, ypogYpTemp_BusWriteTRG00, 1);

ypogYpTemp_ClampMinMaxTRG01.connect(0, ypogYpTemp_BusWriteTRG01, 0);
ypogYpTemp_ClampMinMaxTRG01.connect(1, ypogYpTemp_BusWriteTRG01, 1);

ypogYpTemp_BusWriteTRG00.connect(0, ypogYpTemp_OrTrigger3TRG00, 0);
ypogYpTemp_BusWriteTRG01.connect(0, ypogYpTemp_OrTrigger3TRG00, 1);
ypogYpTemp_TickReceiverTRG00.connect(0, ypogYpTemp_OrTrigger3TRG00, 2);
ypogYpTemp_OrTrigger3TRG00.connect(0, ypogYpTemp_BusReadTRG02, 0);

ypogYpTemp_BusReadTRG02.connect(0, ypogYpTemp_DivNumberTRG00, 0);
ypogYpTemp_ConstNumber03.connect(0, ypogYpTemp_DivNumberTRG00, 1);
ypogYpTemp_BusReadTRG02.connect(1, ypogYpTemp_DivNumberTRG00, 2);
ypogYpTemp_DivNumberTRG00.connect(0, ypogYpTemp_PropSendNumberTRG00, 0);
ypogYpTemp_DivNumberTRG00.connect(1, ypogYpTemp_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO YPNODWMATIO TEMP BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO YPNODWMATIO FAN BTN
//////////////////////////////////////////////////
let ypogYpFanPosition = {x:0+YpogBtnPosGlobal.x, y:500+YpogBtnPosGlobal.y};

let ypogYpFan_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpFan_ButtonTRG00.pos = [ypogYpFanPosition.x,ypogYpFanPosition.y];
ypogYpFan_ButtonTRG00.init(g_broadcastDeosContainer, "y_ypn_btn_fan_minus"); //CHANGE
graph.add(ypogYpFan_ButtonTRG00);

let ypogYpFan_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpFan_ButtonTRG01.pos = [ypogYpFanPosition.x,ypogYpFanPosition.y+150];
ypogYpFan_ButtonTRG01.init(g_broadcastDeosContainer, "y_ypn_btn_fan_plus"); //CHANGE
graph.add(ypogYpFan_ButtonTRG01);

let ypogYpFan_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpFan_BusReadTRG00.pos = [ypogYpFanPosition.x+200,ypogYpFanPosition.y];
ypogYpFan_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "385"); //CHANGE
graph.add(ypogYpFan_BusReadTRG00);

let ypogYpFan_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpFan_BusReadTRG01.pos = [ypogYpFanPosition.x+200,ypogYpFanPosition.y+150];
ypogYpFan_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "385"); //CHANGE
graph.add(ypogYpFan_BusReadTRG01);

let ypogYpFan_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpFan_ConstNumber00.pos = [ypogYpFanPosition.x+220,ypogYpFanPosition.y+300];
ypogYpFan_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpFan_ConstNumber00);

let ypogYpFan_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogYpFan_SubNumberTRG00.pos = [ypogYpFanPosition.x+400,ypogYpFanPosition.y];
graph.add(ypogYpFan_SubNumberTRG00);

let ypogYpFan_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogYpFan_AddNumberTRG00.pos = [ypogYpFanPosition.x+400,ypogYpFanPosition.y+150];
graph.add(ypogYpFan_AddNumberTRG00);

let ypogYpFan_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpFan_ConstNumber01.pos = [ypogYpFanPosition.x+400,ypogYpFanPosition.y+270];
ypogYpFan_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpFan_ConstNumber01);

let ypogYpFan_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpFan_ConstNumber02.pos = [ypogYpFanPosition.x+400,ypogYpFanPosition.y+370];
ypogYpFan_ConstNumber02.init(3); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpFan_ConstNumber02);

let ypogYpFan_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpFan_ClampMinMaxTRG00.pos = [ypogYpFanPosition.x+650,ypogYpFanPosition.y];
graph.add(ypogYpFan_ClampMinMaxTRG00);

let ypogYpFan_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpFan_ClampMinMaxTRG01.pos = [ypogYpFanPosition.x+650,ypogYpFanPosition.y+150];
graph.add(ypogYpFan_ClampMinMaxTRG01);

let ypogYpFan_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpFan_BusWriteTRG00.pos = [ypogYpFanPosition.x+850,ypogYpFanPosition.y];
ypogYpFan_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "385"); //CHANGE
graph.add(ypogYpFan_BusWriteTRG00);

let ypogYpFan_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpFan_BusWriteTRG01.pos = [ypogYpFanPosition.x+850,ypogYpFanPosition.y+150];
ypogYpFan_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "385"); //CHANGE
graph.add(ypogYpFan_BusWriteTRG01);

let ypogYpFan_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogYpFan_TickReceiverTRG00.pos = [ypogYpFanPosition.x+870,ypogYpFanPosition.y+300];
graph.add(ypogYpFan_TickReceiverTRG00);

let ypogYpFan_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogYpFan_OrTrigger3TRG00.pos = [ypogYpFanPosition.x+1050,ypogYpFanPosition.y];
graph.add(ypogYpFan_OrTrigger3TRG00);

let ypogYpFan_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpFan_BusReadTRG02.pos = [ypogYpFanPosition.x+1250,ypogYpFanPosition.y];
ypogYpFan_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "385"); //CHANGE
graph.add(ypogYpFan_BusReadTRG02);

let ypogYpFan_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpFan_ConstNumber03.pos = [ypogYpFanPosition.x+1250,ypogYpFanPosition.y+150];
ypogYpFan_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpFan_ConstNumber03);

let ypogYpFan_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogYpFan_DivNumberTRG00.pos = [ypogYpFanPosition.x+1450,ypogYpFanPosition.y];
graph.add(ypogYpFan_DivNumberTRG00);

let ypogYpFan_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogYpFan_PropSendNumberTRG00.pos = [ypogYpFanPosition.x+1650,ypogYpFanPosition.y];
ypogYpFan_PropSendNumberTRG00.init(broadcastDeosHandle, "y_ypn_fan_display"); //CHANGE
graph.add(ypogYpFan_PropSendNumberTRG00);

ypogYpFan_ButtonTRG00.connect(0, ypogYpFan_BusReadTRG00, 0);
ypogYpFan_ButtonTRG01.connect(0, ypogYpFan_BusReadTRG01, 0);

ypogYpFan_BusReadTRG00.connect(0, ypogYpFan_SubNumberTRG00, 0);
ypogYpFan_ConstNumber00.connect(0, ypogYpFan_SubNumberTRG00, 1);
ypogYpFan_BusReadTRG00.connect(1, ypogYpFan_SubNumberTRG00, 2);

ypogYpFan_BusReadTRG01.connect(0, ypogYpFan_AddNumberTRG00, 0);
ypogYpFan_ConstNumber00.connect(0, ypogYpFan_AddNumberTRG00, 1);
ypogYpFan_BusReadTRG01.connect(1, ypogYpFan_AddNumberTRG00, 2);

ypogYpFan_SubNumberTRG00.connect(0, ypogYpFan_ClampMinMaxTRG00, 0);
ypogYpFan_ConstNumber01.connect(0, ypogYpFan_ClampMinMaxTRG00, 1);
ypogYpFan_ConstNumber02.connect(0, ypogYpFan_ClampMinMaxTRG00, 2);
ypogYpFan_SubNumberTRG00.connect(1, ypogYpFan_ClampMinMaxTRG00, 3);

ypogYpFan_AddNumberTRG00.connect(0, ypogYpFan_ClampMinMaxTRG01, 0);
ypogYpFan_ConstNumber01.connect(0, ypogYpFan_ClampMinMaxTRG01, 1);
ypogYpFan_ConstNumber02.connect(0, ypogYpFan_ClampMinMaxTRG01, 2);
ypogYpFan_AddNumberTRG00.connect(1, ypogYpFan_ClampMinMaxTRG01, 3);

ypogYpFan_ClampMinMaxTRG00.connect(0, ypogYpFan_BusWriteTRG00, 0);
ypogYpFan_ClampMinMaxTRG00.connect(1, ypogYpFan_BusWriteTRG00, 1);

ypogYpFan_ClampMinMaxTRG01.connect(0, ypogYpFan_BusWriteTRG01, 0);
ypogYpFan_ClampMinMaxTRG01.connect(1, ypogYpFan_BusWriteTRG01, 1);

ypogYpFan_BusWriteTRG00.connect(0, ypogYpFan_OrTrigger3TRG00, 0);
ypogYpFan_BusWriteTRG01.connect(0, ypogYpFan_OrTrigger3TRG00, 1);
ypogYpFan_TickReceiverTRG00.connect(0, ypogYpFan_OrTrigger3TRG00, 2);
ypogYpFan_OrTrigger3TRG00.connect(0, ypogYpFan_BusReadTRG02, 0);

ypogYpFan_BusReadTRG02.connect(0, ypogYpFan_DivNumberTRG00, 0);
ypogYpFan_ConstNumber03.connect(0, ypogYpFan_DivNumberTRG00, 1);
ypogYpFan_BusReadTRG02.connect(1, ypogYpFan_DivNumberTRG00, 2);
ypogYpFan_DivNumberTRG00.connect(0, ypogYpFan_PropSendNumberTRG00, 0);
ypogYpFan_DivNumberTRG00.connect(1, ypogYpFan_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO YPNODWMATIO FAN BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO YPNODWMATIO END BTN
//////////////////////////////////////////////////
let ypogYpEndPosition = {x:0+YpogBtnPosGlobal.x, y:1000+YpogBtnPosGlobal.y};

let ypogYpEnd_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpEnd_ButtonTRG00.pos = [ypogYpEndPosition.x,ypogYpEndPosition.y];
ypogYpEnd_ButtonTRG00.init(g_broadcastDeosContainer, "y_ypn_btn_end_minus"); //CHANGE
graph.add(ypogYpEnd_ButtonTRG00);

let ypogYpEnd_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogYpEnd_ButtonTRG01.pos = [ypogYpEndPosition.x,ypogYpEndPosition.y+150];
ypogYpEnd_ButtonTRG01.init(g_broadcastDeosContainer, "y_ypn_btn_end_plus"); //CHANGE
graph.add(ypogYpEnd_ButtonTRG01);

let ypogYpEnd_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpEnd_BusReadTRG00.pos = [ypogYpEndPosition.x+200,ypogYpEndPosition.y];
ypogYpEnd_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "386"); //CHANGE
graph.add(ypogYpEnd_BusReadTRG00);

let ypogYpEnd_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpEnd_BusReadTRG01.pos = [ypogYpEndPosition.x+200,ypogYpEndPosition.y+150];
ypogYpEnd_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "386"); //CHANGE
graph.add(ypogYpEnd_BusReadTRG01);

let ypogYpEnd_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpEnd_ConstNumber00.pos = [ypogYpEndPosition.x+220,ypogYpEndPosition.y+300];
ypogYpEnd_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpEnd_ConstNumber00);

let ypogYpEnd_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogYpEnd_SubNumberTRG00.pos = [ypogYpEndPosition.x+400,ypogYpEndPosition.y];
graph.add(ypogYpEnd_SubNumberTRG00);

let ypogYpEnd_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogYpEnd_AddNumberTRG00.pos = [ypogYpEndPosition.x+400,ypogYpEndPosition.y+150];
graph.add(ypogYpEnd_AddNumberTRG00);

let ypogYpEnd_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpEnd_ConstNumber01.pos = [ypogYpEndPosition.x+400,ypogYpEndPosition.y+270];
ypogYpEnd_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpEnd_ConstNumber01);

let ypogYpEnd_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpEnd_ConstNumber02.pos = [ypogYpEndPosition.x+400,ypogYpEndPosition.y+370];
ypogYpEnd_ConstNumber02.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpEnd_ConstNumber02);

let ypogYpEnd_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpEnd_ClampMinMaxTRG00.pos = [ypogYpEndPosition.x+650,ypogYpEndPosition.y];
graph.add(ypogYpEnd_ClampMinMaxTRG00);

let ypogYpEnd_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogYpEnd_ClampMinMaxTRG01.pos = [ypogYpEndPosition.x+650,ypogYpEndPosition.y+150];
graph.add(ypogYpEnd_ClampMinMaxTRG01);

let ypogYpEnd_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpEnd_BusWriteTRG00.pos = [ypogYpEndPosition.x+850,ypogYpEndPosition.y];
ypogYpEnd_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "386"); //CHANGE
graph.add(ypogYpEnd_BusWriteTRG00);

let ypogYpEnd_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogYpEnd_BusWriteTRG01.pos = [ypogYpEndPosition.x+850,ypogYpEndPosition.y+150];
ypogYpEnd_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "386"); //CHANGE
graph.add(ypogYpEnd_BusWriteTRG01);

let ypogYpEnd_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogYpEnd_TickReceiverTRG00.pos = [ypogYpEndPosition.x+870,ypogYpEndPosition.y+300];
graph.add(ypogYpEnd_TickReceiverTRG00);

let ypogYpEnd_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogYpEnd_OrTrigger3TRG00.pos = [ypogYpEndPosition.x+1050,ypogYpEndPosition.y];
graph.add(ypogYpEnd_OrTrigger3TRG00);

let ypogYpEnd_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogYpEnd_BusReadTRG02.pos = [ypogYpEndPosition.x+1250,ypogYpEndPosition.y];
ypogYpEnd_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "386"); //CHANGE
graph.add(ypogYpEnd_BusReadTRG02);

let ypogYpEnd_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogYpEnd_ConstNumber03.pos = [ypogYpEndPosition.x+1250,ypogYpEndPosition.y+150];
ypogYpEnd_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogYpEnd_ConstNumber03);

let ypogYpEnd_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogYpEnd_DivNumberTRG00.pos = [ypogYpEndPosition.x+1450,ypogYpEndPosition.y];
graph.add(ypogYpEnd_DivNumberTRG00);

let ypogYpEnd_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogYpEnd_PropSendNumberTRG00.pos = [ypogYpEndPosition.x+1650,ypogYpEndPosition.y];
ypogYpEnd_PropSendNumberTRG00.init(broadcastDeosHandle, "y_ypn_end_display"); //CHANGE
graph.add(ypogYpEnd_PropSendNumberTRG00);

ypogYpEnd_ButtonTRG00.connect(0, ypogYpEnd_BusReadTRG00, 0);
ypogYpEnd_ButtonTRG01.connect(0, ypogYpEnd_BusReadTRG01, 0);

ypogYpEnd_BusReadTRG00.connect(0, ypogYpEnd_SubNumberTRG00, 0);
ypogYpEnd_ConstNumber00.connect(0, ypogYpEnd_SubNumberTRG00, 1);
ypogYpEnd_BusReadTRG00.connect(1, ypogYpEnd_SubNumberTRG00, 2);

ypogYpEnd_BusReadTRG01.connect(0, ypogYpEnd_AddNumberTRG00, 0);
ypogYpEnd_ConstNumber00.connect(0, ypogYpEnd_AddNumberTRG00, 1);
ypogYpEnd_BusReadTRG01.connect(1, ypogYpEnd_AddNumberTRG00, 2);

ypogYpEnd_SubNumberTRG00.connect(0, ypogYpEnd_ClampMinMaxTRG00, 0);
ypogYpEnd_ConstNumber01.connect(0, ypogYpEnd_ClampMinMaxTRG00, 1);
ypogYpEnd_ConstNumber02.connect(0, ypogYpEnd_ClampMinMaxTRG00, 2);
ypogYpEnd_SubNumberTRG00.connect(1, ypogYpEnd_ClampMinMaxTRG00, 3);

ypogYpEnd_AddNumberTRG00.connect(0, ypogYpEnd_ClampMinMaxTRG01, 0);
ypogYpEnd_ConstNumber01.connect(0, ypogYpEnd_ClampMinMaxTRG01, 1);
ypogYpEnd_ConstNumber02.connect(0, ypogYpEnd_ClampMinMaxTRG01, 2);
ypogYpEnd_AddNumberTRG00.connect(1, ypogYpEnd_ClampMinMaxTRG01, 3);

ypogYpEnd_ClampMinMaxTRG00.connect(0, ypogYpEnd_BusWriteTRG00, 0);
ypogYpEnd_ClampMinMaxTRG00.connect(1, ypogYpEnd_BusWriteTRG00, 1);

ypogYpEnd_ClampMinMaxTRG01.connect(0, ypogYpEnd_BusWriteTRG01, 0);
ypogYpEnd_ClampMinMaxTRG01.connect(1, ypogYpEnd_BusWriteTRG01, 1);

ypogYpEnd_BusWriteTRG00.connect(0, ypogYpEnd_OrTrigger3TRG00, 0);
ypogYpEnd_BusWriteTRG01.connect(0, ypogYpEnd_OrTrigger3TRG00, 1);
ypogYpEnd_TickReceiverTRG00.connect(0, ypogYpEnd_OrTrigger3TRG00, 2);
ypogYpEnd_OrTrigger3TRG00.connect(0, ypogYpEnd_BusReadTRG02, 0);

ypogYpEnd_BusReadTRG02.connect(0, ypogYpEnd_DivNumberTRG00, 0);
ypogYpEnd_ConstNumber03.connect(0, ypogYpEnd_DivNumberTRG00, 1);
ypogYpEnd_BusReadTRG02.connect(1, ypogYpEnd_DivNumberTRG00, 2);
ypogYpEnd_DivNumberTRG00.connect(0, ypogYpEnd_PropSendNumberTRG00, 0);
ypogYpEnd_DivNumberTRG00.connect(1, ypogYpEnd_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO YPNODWMATIO END BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO GRAFEIO TEMP BTN
//////////////////////////////////////////////////
let ypogGrTempPosition = {x:0+YpogBtnPosGlobal.x, y:1500+YpogBtnPosGlobal.y};

let ypogGrTemp_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrTemp_ButtonTRG00.pos = [ypogGrTempPosition.x,ypogGrTempPosition.y];
ypogGrTemp_ButtonTRG00.init(g_broadcastDeosContainer, "y_gra_btn_temp_minus"); //CHANGE
graph.add(ypogGrTemp_ButtonTRG00);

let ypogGrTemp_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrTemp_ButtonTRG01.pos = [ypogGrTempPosition.x,ypogGrTempPosition.y+150];
ypogGrTemp_ButtonTRG01.init(g_broadcastDeosContainer, "y_gra_btn_temp_plus"); //CHANGE
graph.add(ypogGrTemp_ButtonTRG01);

let ypogGrTemp_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrTemp_BusReadTRG00.pos = [ypogGrTempPosition.x+200,ypogGrTempPosition.y];
ypogGrTemp_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "384"); //CHANGE
graph.add(ypogGrTemp_BusReadTRG00);

let ypogGrTemp_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrTemp_BusReadTRG01.pos = [ypogGrTempPosition.x+200,ypogGrTempPosition.y+150];
ypogGrTemp_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "384"); //CHANGE
graph.add(ypogGrTemp_BusReadTRG01);

let ypogGrTemp_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrTemp_ConstNumber00.pos = [ypogGrTempPosition.x+220,ypogGrTempPosition.y+300];
ypogGrTemp_ConstNumber00.init(5); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrTemp_ConstNumber00);

let ypogGrTemp_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogGrTemp_SubNumberTRG00.pos = [ypogGrTempPosition.x+400,ypogGrTempPosition.y];
graph.add(ypogGrTemp_SubNumberTRG00);

let ypogGrTemp_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogGrTemp_AddNumberTRG00.pos = [ypogGrTempPosition.x+400,ypogGrTempPosition.y+150];
graph.add(ypogGrTemp_AddNumberTRG00);

let ypogGrTemp_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrTemp_ConstNumber01.pos = [ypogGrTempPosition.x+400,ypogGrTempPosition.y+270];
ypogGrTemp_ConstNumber01.init(180); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrTemp_ConstNumber01);

let ypogGrTemp_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrTemp_ConstNumber02.pos = [ypogGrTempPosition.x+400,ypogGrTempPosition.y+370];
ypogGrTemp_ConstNumber02.init(300); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrTemp_ConstNumber02);

let ypogGrTemp_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrTemp_ClampMinMaxTRG00.pos = [ypogGrTempPosition.x+650,ypogGrTempPosition.y];
graph.add(ypogGrTemp_ClampMinMaxTRG00);

let ypogGrTemp_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrTemp_ClampMinMaxTRG01.pos = [ypogGrTempPosition.x+650,ypogGrTempPosition.y+150];
graph.add(ypogGrTemp_ClampMinMaxTRG01);

let ypogGrTemp_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrTemp_BusWriteTRG00.pos = [ypogGrTempPosition.x+850,ypogGrTempPosition.y];
ypogGrTemp_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "384"); //CHANGE
graph.add(ypogGrTemp_BusWriteTRG00);

let ypogGrTemp_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrTemp_BusWriteTRG01.pos = [ypogGrTempPosition.x+850,ypogGrTempPosition.y+150];
ypogGrTemp_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "384"); //CHANGE
graph.add(ypogGrTemp_BusWriteTRG01);

let ypogGrTemp_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogGrTemp_TickReceiverTRG00.pos = [ypogGrTempPosition.x+870,ypogGrTempPosition.y+300];
graph.add(ypogGrTemp_TickReceiverTRG00);

let ypogGrTemp_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogGrTemp_OrTrigger3TRG00.pos = [ypogGrTempPosition.x+1050,ypogGrTempPosition.y];
graph.add(ypogGrTemp_OrTrigger3TRG00);

let ypogGrTemp_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrTemp_BusReadTRG02.pos = [ypogGrTempPosition.x+1250,ypogGrTempPosition.y];
ypogGrTemp_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "384"); //CHANGE
graph.add(ypogGrTemp_BusReadTRG02);

let ypogGrTemp_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrTemp_ConstNumber03.pos = [ypogGrTempPosition.x+1250,ypogGrTempPosition.y+150];
ypogGrTemp_ConstNumber03.init(10);
graph.add(ypogGrTemp_ConstNumber03);

let ypogGrTemp_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogGrTemp_DivNumberTRG00.pos = [ypogGrTempPosition.x+1450,ypogGrTempPosition.y];
graph.add(ypogGrTemp_DivNumberTRG00);

let ypogGrTemp_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogGrTemp_PropSendNumberTRG00.pos = [ypogGrTempPosition.x+1650,ypogGrTempPosition.y];
ypogGrTemp_PropSendNumberTRG00.init(broadcastDeosHandle, "y_gra_temp_display"); //CHANGE
graph.add(ypogGrTemp_PropSendNumberTRG00);

ypogGrTemp_ButtonTRG00.connect(0, ypogGrTemp_BusReadTRG00, 0);
ypogGrTemp_ButtonTRG01.connect(0, ypogGrTemp_BusReadTRG01, 0);

ypogGrTemp_BusReadTRG00.connect(0, ypogGrTemp_SubNumberTRG00, 0);
ypogGrTemp_ConstNumber00.connect(0, ypogGrTemp_SubNumberTRG00, 1);
ypogGrTemp_BusReadTRG00.connect(1, ypogGrTemp_SubNumberTRG00, 2);

ypogGrTemp_BusReadTRG01.connect(0, ypogGrTemp_AddNumberTRG00, 0);
ypogGrTemp_ConstNumber00.connect(0, ypogGrTemp_AddNumberTRG00, 1);
ypogGrTemp_BusReadTRG01.connect(1, ypogGrTemp_AddNumberTRG00, 2);

ypogGrTemp_SubNumberTRG00.connect(0, ypogGrTemp_ClampMinMaxTRG00, 0);
ypogGrTemp_ConstNumber01.connect(0, ypogGrTemp_ClampMinMaxTRG00, 1);
ypogGrTemp_ConstNumber02.connect(0, ypogGrTemp_ClampMinMaxTRG00, 2);
ypogGrTemp_SubNumberTRG00.connect(1, ypogGrTemp_ClampMinMaxTRG00, 3);

ypogGrTemp_AddNumberTRG00.connect(0, ypogGrTemp_ClampMinMaxTRG01, 0);
ypogGrTemp_ConstNumber01.connect(0, ypogGrTemp_ClampMinMaxTRG01, 1);
ypogGrTemp_ConstNumber02.connect(0, ypogGrTemp_ClampMinMaxTRG01, 2);
ypogGrTemp_AddNumberTRG00.connect(1, ypogGrTemp_ClampMinMaxTRG01, 3);

ypogGrTemp_ClampMinMaxTRG00.connect(0, ypogGrTemp_BusWriteTRG00, 0);
ypogGrTemp_ClampMinMaxTRG00.connect(1, ypogGrTemp_BusWriteTRG00, 1);

ypogGrTemp_ClampMinMaxTRG01.connect(0, ypogGrTemp_BusWriteTRG01, 0);
ypogGrTemp_ClampMinMaxTRG01.connect(1, ypogGrTemp_BusWriteTRG01, 1);

ypogGrTemp_BusWriteTRG00.connect(0, ypogGrTemp_OrTrigger3TRG00, 0);
ypogGrTemp_BusWriteTRG01.connect(0, ypogGrTemp_OrTrigger3TRG00, 1);
ypogGrTemp_TickReceiverTRG00.connect(0, ypogGrTemp_OrTrigger3TRG00, 2);
ypogGrTemp_OrTrigger3TRG00.connect(0, ypogGrTemp_BusReadTRG02, 0);

ypogGrTemp_BusReadTRG02.connect(0, ypogGrTemp_DivNumberTRG00, 0);
ypogGrTemp_ConstNumber03.connect(0, ypogGrTemp_DivNumberTRG00, 1);
ypogGrTemp_BusReadTRG02.connect(1, ypogGrTemp_DivNumberTRG00, 2);
ypogGrTemp_DivNumberTRG00.connect(0, ypogGrTemp_PropSendNumberTRG00, 0);
ypogGrTemp_DivNumberTRG00.connect(1, ypogGrTemp_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO GRAFEIO TEMP BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO GRAFEIO FAN BTN
//////////////////////////////////////////////////
let ypogGrFanPosition = {x:0+YpogBtnPosGlobal.x, y:2000+YpogBtnPosGlobal.y};

let ypogGrFan_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrFan_ButtonTRG00.pos = [ypogGrFanPosition.x,ypogGrFanPosition.y];
ypogGrFan_ButtonTRG00.init(g_broadcastDeosContainer, "y_gra_btn_fan_minus"); //CHANGE
graph.add(ypogGrFan_ButtonTRG00);

let ypogGrFan_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrFan_ButtonTRG01.pos = [ypogGrFanPosition.x,ypogGrFanPosition.y+150];
ypogGrFan_ButtonTRG01.init(g_broadcastDeosContainer, "y_gra_btn_fan_plus"); //CHANGE
graph.add(ypogGrFan_ButtonTRG01);

let ypogGrFan_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrFan_BusReadTRG00.pos = [ypogGrFanPosition.x+200,ypogGrFanPosition.y];
ypogGrFan_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "385"); //CHANGE
graph.add(ypogGrFan_BusReadTRG00);

let ypogGrFan_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrFan_BusReadTRG01.pos = [ypogGrFanPosition.x+200,ypogGrFanPosition.y+150];
ypogGrFan_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "385"); //CHANGE
graph.add(ypogGrFan_BusReadTRG01);

let ypogGrFan_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrFan_ConstNumber00.pos = [ypogGrFanPosition.x+220,ypogGrFanPosition.y+300];
ypogGrFan_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrFan_ConstNumber00);

let ypogGrFan_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogGrFan_SubNumberTRG00.pos = [ypogGrFanPosition.x+400,ypogGrFanPosition.y];
graph.add(ypogGrFan_SubNumberTRG00);

let ypogGrFan_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogGrFan_AddNumberTRG00.pos = [ypogGrFanPosition.x+400,ypogGrFanPosition.y+150];
graph.add(ypogGrFan_AddNumberTRG00);

let ypogGrFan_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrFan_ConstNumber01.pos = [ypogGrFanPosition.x+400,ypogGrFanPosition.y+270];
ypogGrFan_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrFan_ConstNumber01);

let ypogGrFan_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrFan_ConstNumber02.pos = [ypogGrFanPosition.x+400,ypogGrFanPosition.y+370];
ypogGrFan_ConstNumber02.init(3); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrFan_ConstNumber02);

let ypogGrFan_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrFan_ClampMinMaxTRG00.pos = [ypogGrFanPosition.x+650,ypogGrFanPosition.y];
graph.add(ypogGrFan_ClampMinMaxTRG00);

let ypogGrFan_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrFan_ClampMinMaxTRG01.pos = [ypogGrFanPosition.x+650,ypogGrFanPosition.y+150];
graph.add(ypogGrFan_ClampMinMaxTRG01);

let ypogGrFan_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrFan_BusWriteTRG00.pos = [ypogGrFanPosition.x+850,ypogGrFanPosition.y];
ypogGrFan_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "385"); //CHANGE
graph.add(ypogGrFan_BusWriteTRG00);

let ypogGrFan_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrFan_BusWriteTRG01.pos = [ypogGrFanPosition.x+850,ypogGrFanPosition.y+150];
ypogGrFan_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "385"); //CHANGE
graph.add(ypogGrFan_BusWriteTRG01);

let ypogGrFan_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogGrFan_TickReceiverTRG00.pos = [ypogGrFanPosition.x+870,ypogGrFanPosition.y+300];
graph.add(ypogGrFan_TickReceiverTRG00);

let ypogGrFan_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogGrFan_OrTrigger3TRG00.pos = [ypogGrFanPosition.x+1050,ypogGrFanPosition.y];
graph.add(ypogGrFan_OrTrigger3TRG00);

let ypogGrFan_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrFan_BusReadTRG02.pos = [ypogGrFanPosition.x+1250,ypogGrFanPosition.y];
ypogGrFan_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "385"); //CHANGE
graph.add(ypogGrFan_BusReadTRG02);

let ypogGrFan_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrFan_ConstNumber03.pos = [ypogGrFanPosition.x+1250,ypogGrFanPosition.y+150];
ypogGrFan_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrFan_ConstNumber03);

let ypogGrFan_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogGrFan_DivNumberTRG00.pos = [ypogGrFanPosition.x+1450,ypogGrFanPosition.y];
graph.add(ypogGrFan_DivNumberTRG00);

let ypogGrFan_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogGrFan_PropSendNumberTRG00.pos = [ypogGrFanPosition.x+1650,ypogGrFanPosition.y];
ypogGrFan_PropSendNumberTRG00.init(broadcastDeosHandle, "y_gra_fan_display"); //CHANGE
graph.add(ypogGrFan_PropSendNumberTRG00);

ypogGrFan_ButtonTRG00.connect(0, ypogGrFan_BusReadTRG00, 0);
ypogGrFan_ButtonTRG01.connect(0, ypogGrFan_BusReadTRG01, 0);

ypogGrFan_BusReadTRG00.connect(0, ypogGrFan_SubNumberTRG00, 0);
ypogGrFan_ConstNumber00.connect(0, ypogGrFan_SubNumberTRG00, 1);
ypogGrFan_BusReadTRG00.connect(1, ypogGrFan_SubNumberTRG00, 2);

ypogGrFan_BusReadTRG01.connect(0, ypogGrFan_AddNumberTRG00, 0);
ypogGrFan_ConstNumber00.connect(0, ypogGrFan_AddNumberTRG00, 1);
ypogGrFan_BusReadTRG01.connect(1, ypogGrFan_AddNumberTRG00, 2);

ypogGrFan_SubNumberTRG00.connect(0, ypogGrFan_ClampMinMaxTRG00, 0);
ypogGrFan_ConstNumber01.connect(0, ypogGrFan_ClampMinMaxTRG00, 1);
ypogGrFan_ConstNumber02.connect(0, ypogGrFan_ClampMinMaxTRG00, 2);
ypogGrFan_SubNumberTRG00.connect(1, ypogGrFan_ClampMinMaxTRG00, 3);

ypogGrFan_AddNumberTRG00.connect(0, ypogGrFan_ClampMinMaxTRG01, 0);
ypogGrFan_ConstNumber01.connect(0, ypogGrFan_ClampMinMaxTRG01, 1);
ypogGrFan_ConstNumber02.connect(0, ypogGrFan_ClampMinMaxTRG01, 2);
ypogGrFan_AddNumberTRG00.connect(1, ypogGrFan_ClampMinMaxTRG01, 3);

ypogGrFan_ClampMinMaxTRG00.connect(0, ypogGrFan_BusWriteTRG00, 0);
ypogGrFan_ClampMinMaxTRG00.connect(1, ypogGrFan_BusWriteTRG00, 1);

ypogGrFan_ClampMinMaxTRG01.connect(0, ypogGrFan_BusWriteTRG01, 0);
ypogGrFan_ClampMinMaxTRG01.connect(1, ypogGrFan_BusWriteTRG01, 1);

ypogGrFan_BusWriteTRG00.connect(0, ypogGrFan_OrTrigger3TRG00, 0);
ypogGrFan_BusWriteTRG01.connect(0, ypogGrFan_OrTrigger3TRG00, 1);
ypogGrFan_TickReceiverTRG00.connect(0, ypogGrFan_OrTrigger3TRG00, 2);
ypogGrFan_OrTrigger3TRG00.connect(0, ypogGrFan_BusReadTRG02, 0);

ypogGrFan_BusReadTRG02.connect(0, ypogGrFan_DivNumberTRG00, 0);
ypogGrFan_ConstNumber03.connect(0, ypogGrFan_DivNumberTRG00, 1);
ypogGrFan_BusReadTRG02.connect(1, ypogGrFan_DivNumberTRG00, 2);
ypogGrFan_DivNumberTRG00.connect(0, ypogGrFan_PropSendNumberTRG00, 0);
ypogGrFan_DivNumberTRG00.connect(1, ypogGrFan_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO GRAFEIO FAN BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO GRAFEIO END BTN
//////////////////////////////////////////////////
let ypogGrEndPosition = {x:0+YpogBtnPosGlobal.x, y:2500+YpogBtnPosGlobal.y};

let ypogGrEnd_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrEnd_ButtonTRG00.pos = [ypogGrEndPosition.x,ypogGrEndPosition.y];
ypogGrEnd_ButtonTRG00.init(g_broadcastDeosContainer, "y_gra_btn_end_minus"); //CHANGE
graph.add(ypogGrEnd_ButtonTRG00);

let ypogGrEnd_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogGrEnd_ButtonTRG01.pos = [ypogGrEndPosition.x,ypogGrEndPosition.y+150];
ypogGrEnd_ButtonTRG01.init(g_broadcastDeosContainer, "y_gra_btn_end_plus"); //CHANGE
graph.add(ypogGrEnd_ButtonTRG01);

let ypogGrEnd_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrEnd_BusReadTRG00.pos = [ypogGrEndPosition.x+200,ypogGrEndPosition.y];
ypogGrEnd_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "386"); //CHANGE
graph.add(ypogGrEnd_BusReadTRG00);

let ypogGrEnd_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrEnd_BusReadTRG01.pos = [ypogGrEndPosition.x+200,ypogGrEndPosition.y+150];
ypogGrEnd_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "386"); //CHANGE
graph.add(ypogGrEnd_BusReadTRG01);

let ypogGrEnd_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrEnd_ConstNumber00.pos = [ypogGrEndPosition.x+220,ypogGrEndPosition.y+300];
ypogGrEnd_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrEnd_ConstNumber00);

let ypogGrEnd_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogGrEnd_SubNumberTRG00.pos = [ypogGrEndPosition.x+400,ypogGrEndPosition.y];
graph.add(ypogGrEnd_SubNumberTRG00);

let ypogGrEnd_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogGrEnd_AddNumberTRG00.pos = [ypogGrEndPosition.x+400,ypogGrEndPosition.y+150];
graph.add(ypogGrEnd_AddNumberTRG00);

let ypogGrEnd_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrEnd_ConstNumber01.pos = [ypogGrEndPosition.x+400,ypogGrEndPosition.y+270];
ypogGrEnd_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrEnd_ConstNumber01);

let ypogGrEnd_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrEnd_ConstNumber02.pos = [ypogGrEndPosition.x+400,ypogGrEndPosition.y+370];
ypogGrEnd_ConstNumber02.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrEnd_ConstNumber02);

let ypogGrEnd_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrEnd_ClampMinMaxTRG00.pos = [ypogGrEndPosition.x+650,ypogGrEndPosition.y];
graph.add(ypogGrEnd_ClampMinMaxTRG00);

let ypogGrEnd_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogGrEnd_ClampMinMaxTRG01.pos = [ypogGrEndPosition.x+650,ypogGrEndPosition.y+150];
graph.add(ypogGrEnd_ClampMinMaxTRG01);

let ypogGrEnd_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrEnd_BusWriteTRG00.pos = [ypogGrEndPosition.x+850,ypogGrEndPosition.y];
ypogGrEnd_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "386"); //CHANGE
graph.add(ypogGrEnd_BusWriteTRG00);

let ypogGrEnd_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogGrEnd_BusWriteTRG01.pos = [ypogGrEndPosition.x+850,ypogGrEndPosition.y+150];
ypogGrEnd_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "386"); //CHANGE
graph.add(ypogGrEnd_BusWriteTRG01);

let ypogGrEnd_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogGrEnd_TickReceiverTRG00.pos = [ypogGrEndPosition.x+870,ypogGrEndPosition.y+300];
graph.add(ypogGrEnd_TickReceiverTRG00);

let ypogGrEnd_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogGrEnd_OrTrigger3TRG00.pos = [ypogGrEndPosition.x+1050,ypogGrEndPosition.y];
graph.add(ypogGrEnd_OrTrigger3TRG00);

let ypogGrEnd_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogGrEnd_BusReadTRG02.pos = [ypogGrEndPosition.x+1250,ypogGrEndPosition.y];
ypogGrEnd_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "386"); //CHANGE
graph.add(ypogGrEnd_BusReadTRG02);

let ypogGrEnd_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogGrEnd_ConstNumber03.pos = [ypogGrEndPosition.x+1250,ypogGrEndPosition.y+150];
ypogGrEnd_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogGrEnd_ConstNumber03);

let ypogGrEnd_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogGrEnd_DivNumberTRG00.pos = [ypogGrEndPosition.x+1450,ypogGrEndPosition.y];
graph.add(ypogGrEnd_DivNumberTRG00);

let ypogGrEnd_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogGrEnd_PropSendNumberTRG00.pos = [ypogGrEndPosition.x+1650,ypogGrEndPosition.y];
ypogGrEnd_PropSendNumberTRG00.init(broadcastDeosHandle, "y_gra_end_display"); //CHANGE
graph.add(ypogGrEnd_PropSendNumberTRG00);

ypogGrEnd_ButtonTRG00.connect(0, ypogGrEnd_BusReadTRG00, 0);
ypogGrEnd_ButtonTRG01.connect(0, ypogGrEnd_BusReadTRG01, 0);

ypogGrEnd_BusReadTRG00.connect(0, ypogGrEnd_SubNumberTRG00, 0);
ypogGrEnd_ConstNumber00.connect(0, ypogGrEnd_SubNumberTRG00, 1);
ypogGrEnd_BusReadTRG00.connect(1, ypogGrEnd_SubNumberTRG00, 2);

ypogGrEnd_BusReadTRG01.connect(0, ypogGrEnd_AddNumberTRG00, 0);
ypogGrEnd_ConstNumber00.connect(0, ypogGrEnd_AddNumberTRG00, 1);
ypogGrEnd_BusReadTRG01.connect(1, ypogGrEnd_AddNumberTRG00, 2);

ypogGrEnd_SubNumberTRG00.connect(0, ypogGrEnd_ClampMinMaxTRG00, 0);
ypogGrEnd_ConstNumber01.connect(0, ypogGrEnd_ClampMinMaxTRG00, 1);
ypogGrEnd_ConstNumber02.connect(0, ypogGrEnd_ClampMinMaxTRG00, 2);
ypogGrEnd_SubNumberTRG00.connect(1, ypogGrEnd_ClampMinMaxTRG00, 3);

ypogGrEnd_AddNumberTRG00.connect(0, ypogGrEnd_ClampMinMaxTRG01, 0);
ypogGrEnd_ConstNumber01.connect(0, ypogGrEnd_ClampMinMaxTRG01, 1);
ypogGrEnd_ConstNumber02.connect(0, ypogGrEnd_ClampMinMaxTRG01, 2);
ypogGrEnd_AddNumberTRG00.connect(1, ypogGrEnd_ClampMinMaxTRG01, 3);

ypogGrEnd_ClampMinMaxTRG00.connect(0, ypogGrEnd_BusWriteTRG00, 0);
ypogGrEnd_ClampMinMaxTRG00.connect(1, ypogGrEnd_BusWriteTRG00, 1);

ypogGrEnd_ClampMinMaxTRG01.connect(0, ypogGrEnd_BusWriteTRG01, 0);
ypogGrEnd_ClampMinMaxTRG01.connect(1, ypogGrEnd_BusWriteTRG01, 1);

ypogGrEnd_BusWriteTRG00.connect(0, ypogGrEnd_OrTrigger3TRG00, 0);
ypogGrEnd_BusWriteTRG01.connect(0, ypogGrEnd_OrTrigger3TRG00, 1);
ypogGrEnd_TickReceiverTRG00.connect(0, ypogGrEnd_OrTrigger3TRG00, 2);
ypogGrEnd_OrTrigger3TRG00.connect(0, ypogGrEnd_BusReadTRG02, 0);

ypogGrEnd_BusReadTRG02.connect(0, ypogGrEnd_DivNumberTRG00, 0);
ypogGrEnd_ConstNumber03.connect(0, ypogGrEnd_DivNumberTRG00, 1);
ypogGrEnd_BusReadTRG02.connect(1, ypogGrEnd_DivNumberTRG00, 2);
ypogGrEnd_DivNumberTRG00.connect(0, ypogGrEnd_PropSendNumberTRG00, 0);
ypogGrEnd_DivNumberTRG00.connect(1, ypogGrEnd_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO GRAFEIO END BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO KOUZINA TEMP BTN
//////////////////////////////////////////////////
let ypogKoTempPosition = {x:0+YpogBtnPosGlobal.x, y:3000+YpogBtnPosGlobal.y};

let ypogKoTemp_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoTemp_ButtonTRG00.pos = [ypogKoTempPosition.x,ypogKoTempPosition.y];
ypogKoTemp_ButtonTRG00.init(g_broadcastDeosContainer, "y_kou_btn_temp_minus"); //CHANGE
graph.add(ypogKoTemp_ButtonTRG00);

let ypogKoTemp_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoTemp_ButtonTRG01.pos = [ypogKoTempPosition.x,ypogKoTempPosition.y+150];
ypogKoTemp_ButtonTRG01.init(g_broadcastDeosContainer, "y_kou_btn_temp_plus"); //CHANGE
graph.add(ypogKoTemp_ButtonTRG01);

let ypogKoTemp_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoTemp_BusReadTRG00.pos = [ypogKoTempPosition.x+200,ypogKoTempPosition.y];
ypogKoTemp_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "384"); //CHANGE
graph.add(ypogKoTemp_BusReadTRG00);

let ypogKoTemp_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoTemp_BusReadTRG01.pos = [ypogKoTempPosition.x+200,ypogKoTempPosition.y+150];
ypogKoTemp_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "384"); //CHANGE
graph.add(ypogKoTemp_BusReadTRG01);

let ypogKoTemp_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoTemp_ConstNumber00.pos = [ypogKoTempPosition.x+220,ypogKoTempPosition.y+300];
ypogKoTemp_ConstNumber00.init(5); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoTemp_ConstNumber00);

let ypogKoTemp_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogKoTemp_SubNumberTRG00.pos = [ypogKoTempPosition.x+400,ypogKoTempPosition.y];
graph.add(ypogKoTemp_SubNumberTRG00);

let ypogKoTemp_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogKoTemp_AddNumberTRG00.pos = [ypogKoTempPosition.x+400,ypogKoTempPosition.y+150];
graph.add(ypogKoTemp_AddNumberTRG00);

let ypogKoTemp_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoTemp_ConstNumber01.pos = [ypogKoTempPosition.x+400,ypogKoTempPosition.y+270];
ypogKoTemp_ConstNumber01.init(180); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoTemp_ConstNumber01);

let ypogKoTemp_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoTemp_ConstNumber02.pos = [ypogKoTempPosition.x+400,ypogKoTempPosition.y+370];
ypogKoTemp_ConstNumber02.init(300); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoTemp_ConstNumber02);

let ypogKoTemp_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoTemp_ClampMinMaxTRG00.pos = [ypogKoTempPosition.x+650,ypogKoTempPosition.y];
graph.add(ypogKoTemp_ClampMinMaxTRG00);

let ypogKoTemp_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoTemp_ClampMinMaxTRG01.pos = [ypogKoTempPosition.x+650,ypogKoTempPosition.y+150];
graph.add(ypogKoTemp_ClampMinMaxTRG01);

let ypogKoTemp_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoTemp_BusWriteTRG00.pos = [ypogKoTempPosition.x+850,ypogKoTempPosition.y];
ypogKoTemp_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "384"); //CHANGE
graph.add(ypogKoTemp_BusWriteTRG00);

let ypogKoTemp_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoTemp_BusWriteTRG01.pos = [ypogKoTempPosition.x+850,ypogKoTempPosition.y+150];
ypogKoTemp_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "384"); //CHANGE
graph.add(ypogKoTemp_BusWriteTRG01);

let ypogKoTemp_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogKoTemp_TickReceiverTRG00.pos = [ypogKoTempPosition.x+870,ypogKoTempPosition.y+300];
graph.add(ypogKoTemp_TickReceiverTRG00);

let ypogKoTemp_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogKoTemp_OrTrigger3TRG00.pos = [ypogKoTempPosition.x+1050,ypogKoTempPosition.y];
graph.add(ypogKoTemp_OrTrigger3TRG00);

let ypogKoTemp_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoTemp_BusReadTRG02.pos = [ypogKoTempPosition.x+1250,ypogKoTempPosition.y];
ypogKoTemp_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "384"); //CHANGE
graph.add(ypogKoTemp_BusReadTRG02);

let ypogKoTemp_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoTemp_ConstNumber03.pos = [ypogKoTempPosition.x+1250,ypogKoTempPosition.y+150];
ypogKoTemp_ConstNumber03.init(10);
graph.add(ypogKoTemp_ConstNumber03);

let ypogKoTemp_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogKoTemp_DivNumberTRG00.pos = [ypogKoTempPosition.x+1450,ypogKoTempPosition.y];
graph.add(ypogKoTemp_DivNumberTRG00);

let ypogKoTemp_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogKoTemp_PropSendNumberTRG00.pos = [ypogKoTempPosition.x+1650,ypogKoTempPosition.y];
ypogKoTemp_PropSendNumberTRG00.init(broadcastDeosHandle, "y_kou_temp_display"); //CHANGE
graph.add(ypogKoTemp_PropSendNumberTRG00);

ypogKoTemp_ButtonTRG00.connect(0, ypogKoTemp_BusReadTRG00, 0);
ypogKoTemp_ButtonTRG01.connect(0, ypogKoTemp_BusReadTRG01, 0);

ypogKoTemp_BusReadTRG00.connect(0, ypogKoTemp_SubNumberTRG00, 0);
ypogKoTemp_ConstNumber00.connect(0, ypogKoTemp_SubNumberTRG00, 1);
ypogKoTemp_BusReadTRG00.connect(1, ypogKoTemp_SubNumberTRG00, 2);

ypogKoTemp_BusReadTRG01.connect(0, ypogKoTemp_AddNumberTRG00, 0);
ypogKoTemp_ConstNumber00.connect(0, ypogKoTemp_AddNumberTRG00, 1);
ypogKoTemp_BusReadTRG01.connect(1, ypogKoTemp_AddNumberTRG00, 2);

ypogKoTemp_SubNumberTRG00.connect(0, ypogKoTemp_ClampMinMaxTRG00, 0);
ypogKoTemp_ConstNumber01.connect(0, ypogKoTemp_ClampMinMaxTRG00, 1);
ypogKoTemp_ConstNumber02.connect(0, ypogKoTemp_ClampMinMaxTRG00, 2);
ypogKoTemp_SubNumberTRG00.connect(1, ypogKoTemp_ClampMinMaxTRG00, 3);

ypogKoTemp_AddNumberTRG00.connect(0, ypogKoTemp_ClampMinMaxTRG01, 0);
ypogKoTemp_ConstNumber01.connect(0, ypogKoTemp_ClampMinMaxTRG01, 1);
ypogKoTemp_ConstNumber02.connect(0, ypogKoTemp_ClampMinMaxTRG01, 2);
ypogKoTemp_AddNumberTRG00.connect(1, ypogKoTemp_ClampMinMaxTRG01, 3);

ypogKoTemp_ClampMinMaxTRG00.connect(0, ypogKoTemp_BusWriteTRG00, 0);
ypogKoTemp_ClampMinMaxTRG00.connect(1, ypogKoTemp_BusWriteTRG00, 1);

ypogKoTemp_ClampMinMaxTRG01.connect(0, ypogKoTemp_BusWriteTRG01, 0);
ypogKoTemp_ClampMinMaxTRG01.connect(1, ypogKoTemp_BusWriteTRG01, 1);

ypogKoTemp_BusWriteTRG00.connect(0, ypogKoTemp_OrTrigger3TRG00, 0);
ypogKoTemp_BusWriteTRG01.connect(0, ypogKoTemp_OrTrigger3TRG00, 1);
ypogKoTemp_TickReceiverTRG00.connect(0, ypogKoTemp_OrTrigger3TRG00, 2);
ypogKoTemp_OrTrigger3TRG00.connect(0, ypogKoTemp_BusReadTRG02, 0);

ypogKoTemp_BusReadTRG02.connect(0, ypogKoTemp_DivNumberTRG00, 0);
ypogKoTemp_ConstNumber03.connect(0, ypogKoTemp_DivNumberTRG00, 1);
ypogKoTemp_BusReadTRG02.connect(1, ypogKoTemp_DivNumberTRG00, 2);
ypogKoTemp_DivNumberTRG00.connect(0, ypogKoTemp_PropSendNumberTRG00, 0);
ypogKoTemp_DivNumberTRG00.connect(1, ypogKoTemp_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO KOUZINA TEMP BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO KOUZINA FAN BTN
//////////////////////////////////////////////////
let ypogKoFanPosition = {x:0+YpogBtnPosGlobal.x, y:3500+YpogBtnPosGlobal.y};

let ypogKoFan_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoFan_ButtonTRG00.pos = [ypogKoFanPosition.x,ypogKoFanPosition.y];
ypogKoFan_ButtonTRG00.init(g_broadcastDeosContainer, "y_kou_btn_fan_minus"); //CHANGE
graph.add(ypogKoFan_ButtonTRG00);

let ypogKoFan_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoFan_ButtonTRG01.pos = [ypogKoFanPosition.x,ypogKoFanPosition.y+150];
ypogKoFan_ButtonTRG01.init(g_broadcastDeosContainer, "y_kou_btn_fan_plus"); //CHANGE
graph.add(ypogKoFan_ButtonTRG01);

let ypogKoFan_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoFan_BusReadTRG00.pos = [ypogKoFanPosition.x+200,ypogKoFanPosition.y];
ypogKoFan_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "385"); //CHANGE
graph.add(ypogKoFan_BusReadTRG00);

let ypogKoFan_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoFan_BusReadTRG01.pos = [ypogKoFanPosition.x+200,ypogKoFanPosition.y+150];
ypogKoFan_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "385"); //CHANGE
graph.add(ypogKoFan_BusReadTRG01);

let ypogKoFan_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoFan_ConstNumber00.pos = [ypogKoFanPosition.x+220,ypogKoFanPosition.y+300];
ypogKoFan_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoFan_ConstNumber00);

let ypogKoFan_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogKoFan_SubNumberTRG00.pos = [ypogKoFanPosition.x+400,ypogKoFanPosition.y];
graph.add(ypogKoFan_SubNumberTRG00);

let ypogKoFan_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogKoFan_AddNumberTRG00.pos = [ypogKoFanPosition.x+400,ypogKoFanPosition.y+150];
graph.add(ypogKoFan_AddNumberTRG00);

let ypogKoFan_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoFan_ConstNumber01.pos = [ypogKoFanPosition.x+400,ypogKoFanPosition.y+270];
ypogKoFan_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoFan_ConstNumber01);

let ypogKoFan_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoFan_ConstNumber02.pos = [ypogKoFanPosition.x+400,ypogKoFanPosition.y+370];
ypogKoFan_ConstNumber02.init(3); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoFan_ConstNumber02);

let ypogKoFan_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoFan_ClampMinMaxTRG00.pos = [ypogKoFanPosition.x+650,ypogKoFanPosition.y];
graph.add(ypogKoFan_ClampMinMaxTRG00);

let ypogKoFan_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoFan_ClampMinMaxTRG01.pos = [ypogKoFanPosition.x+650,ypogKoFanPosition.y+150];
graph.add(ypogKoFan_ClampMinMaxTRG01);

let ypogKoFan_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoFan_BusWriteTRG00.pos = [ypogKoFanPosition.x+850,ypogKoFanPosition.y];
ypogKoFan_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "385"); //CHANGE
graph.add(ypogKoFan_BusWriteTRG00);

let ypogKoFan_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoFan_BusWriteTRG01.pos = [ypogKoFanPosition.x+850,ypogKoFanPosition.y+150];
ypogKoFan_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "385"); //CHANGE
graph.add(ypogKoFan_BusWriteTRG01);

let ypogKoFan_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogKoFan_TickReceiverTRG00.pos = [ypogKoFanPosition.x+870,ypogKoFanPosition.y+300];
graph.add(ypogKoFan_TickReceiverTRG00);

let ypogKoFan_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogKoFan_OrTrigger3TRG00.pos = [ypogKoFanPosition.x+1050,ypogKoFanPosition.y];
graph.add(ypogKoFan_OrTrigger3TRG00);

let ypogKoFan_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoFan_BusReadTRG02.pos = [ypogKoFanPosition.x+1250,ypogKoFanPosition.y];
ypogKoFan_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "385"); //CHANGE
graph.add(ypogKoFan_BusReadTRG02);

let ypogKoFan_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoFan_ConstNumber03.pos = [ypogKoFanPosition.x+1250,ypogKoFanPosition.y+150];
ypogKoFan_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoFan_ConstNumber03);

let ypogKoFan_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogKoFan_DivNumberTRG00.pos = [ypogKoFanPosition.x+1450,ypogKoFanPosition.y];
graph.add(ypogKoFan_DivNumberTRG00);

let ypogKoFan_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogKoFan_PropSendNumberTRG00.pos = [ypogKoFanPosition.x+1650,ypogKoFanPosition.y];
ypogKoFan_PropSendNumberTRG00.init(broadcastDeosHandle, "y_kou_fan_display"); //CHANGE
graph.add(ypogKoFan_PropSendNumberTRG00);

ypogKoFan_ButtonTRG00.connect(0, ypogKoFan_BusReadTRG00, 0);
ypogKoFan_ButtonTRG01.connect(0, ypogKoFan_BusReadTRG01, 0);

ypogKoFan_BusReadTRG00.connect(0, ypogKoFan_SubNumberTRG00, 0);
ypogKoFan_ConstNumber00.connect(0, ypogKoFan_SubNumberTRG00, 1);
ypogKoFan_BusReadTRG00.connect(1, ypogKoFan_SubNumberTRG00, 2);

ypogKoFan_BusReadTRG01.connect(0, ypogKoFan_AddNumberTRG00, 0);
ypogKoFan_ConstNumber00.connect(0, ypogKoFan_AddNumberTRG00, 1);
ypogKoFan_BusReadTRG01.connect(1, ypogKoFan_AddNumberTRG00, 2);

ypogKoFan_SubNumberTRG00.connect(0, ypogKoFan_ClampMinMaxTRG00, 0);
ypogKoFan_ConstNumber01.connect(0, ypogKoFan_ClampMinMaxTRG00, 1);
ypogKoFan_ConstNumber02.connect(0, ypogKoFan_ClampMinMaxTRG00, 2);
ypogKoFan_SubNumberTRG00.connect(1, ypogKoFan_ClampMinMaxTRG00, 3);

ypogKoFan_AddNumberTRG00.connect(0, ypogKoFan_ClampMinMaxTRG01, 0);
ypogKoFan_ConstNumber01.connect(0, ypogKoFan_ClampMinMaxTRG01, 1);
ypogKoFan_ConstNumber02.connect(0, ypogKoFan_ClampMinMaxTRG01, 2);
ypogKoFan_AddNumberTRG00.connect(1, ypogKoFan_ClampMinMaxTRG01, 3);

ypogKoFan_ClampMinMaxTRG00.connect(0, ypogKoFan_BusWriteTRG00, 0);
ypogKoFan_ClampMinMaxTRG00.connect(1, ypogKoFan_BusWriteTRG00, 1);

ypogKoFan_ClampMinMaxTRG01.connect(0, ypogKoFan_BusWriteTRG01, 0);
ypogKoFan_ClampMinMaxTRG01.connect(1, ypogKoFan_BusWriteTRG01, 1);

ypogKoFan_BusWriteTRG00.connect(0, ypogKoFan_OrTrigger3TRG00, 0);
ypogKoFan_BusWriteTRG01.connect(0, ypogKoFan_OrTrigger3TRG00, 1);
ypogKoFan_TickReceiverTRG00.connect(0, ypogKoFan_OrTrigger3TRG00, 2);
ypogKoFan_OrTrigger3TRG00.connect(0, ypogKoFan_BusReadTRG02, 0);

ypogKoFan_BusReadTRG02.connect(0, ypogKoFan_DivNumberTRG00, 0);
ypogKoFan_ConstNumber03.connect(0, ypogKoFan_DivNumberTRG00, 1);
ypogKoFan_BusReadTRG02.connect(1, ypogKoFan_DivNumberTRG00, 2);
ypogKoFan_DivNumberTRG00.connect(0, ypogKoFan_PropSendNumberTRG00, 0);
ypogKoFan_DivNumberTRG00.connect(1, ypogKoFan_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO KOUZINA FAN BTN
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region YPOGEIO KOUZINA END BTN
//////////////////////////////////////////////////
let ypogKoEndPosition = {x:0+YpogBtnPosGlobal.x, y:4000+YpogBtnPosGlobal.y};

let ypogKoEnd_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoEnd_ButtonTRG00.pos = [ypogKoEndPosition.x,ypogKoEndPosition.y];
ypogKoEnd_ButtonTRG00.init(g_broadcastDeosContainer, "y_kou_btn_end_minus"); //CHANGE
graph.add(ypogKoEnd_ButtonTRG00);

let ypogKoEnd_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
ypogKoEnd_ButtonTRG01.pos = [ypogKoEndPosition.x,ypogKoEndPosition.y+150];
ypogKoEnd_ButtonTRG01.init(g_broadcastDeosContainer, "y_kou_btn_end_plus"); //CHANGE
graph.add(ypogKoEnd_ButtonTRG01);

let ypogKoEnd_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoEnd_BusReadTRG00.pos = [ypogKoEndPosition.x+200,ypogKoEndPosition.y];
ypogKoEnd_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "386"); //CHANGE
graph.add(ypogKoEnd_BusReadTRG00);

let ypogKoEnd_BusReadTRG01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoEnd_BusReadTRG01.pos = [ypogKoEndPosition.x+200,ypogKoEndPosition.y+150];
ypogKoEnd_BusReadTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "386"); //CHANGE
graph.add(ypogKoEnd_BusReadTRG01);

let ypogKoEnd_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoEnd_ConstNumber00.pos = [ypogKoEndPosition.x+220,ypogKoEndPosition.y+300];
ypogKoEnd_ConstNumber00.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoEnd_ConstNumber00);

let ypogKoEnd_SubNumberTRG00 = LiteGraph.createNode("DeosTrigger/SubNumberTRG");
ypogKoEnd_SubNumberTRG00.pos = [ypogKoEndPosition.x+400,ypogKoEndPosition.y];
graph.add(ypogKoEnd_SubNumberTRG00);

let ypogKoEnd_AddNumberTRG00 = LiteGraph.createNode("DeosTrigger/AddNumberTRG");
ypogKoEnd_AddNumberTRG00.pos = [ypogKoEndPosition.x+400,ypogKoEndPosition.y+150];
graph.add(ypogKoEnd_AddNumberTRG00);

let ypogKoEnd_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoEnd_ConstNumber01.pos = [ypogKoEndPosition.x+400,ypogKoEndPosition.y+270];
ypogKoEnd_ConstNumber01.init(0); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoEnd_ConstNumber01);

let ypogKoEnd_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoEnd_ConstNumber02.pos = [ypogKoEndPosition.x+400,ypogKoEndPosition.y+370];
ypogKoEnd_ConstNumber02.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoEnd_ConstNumber02);

let ypogKoEnd_ClampMinMaxTRG00 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoEnd_ClampMinMaxTRG00.pos = [ypogKoEndPosition.x+650,ypogKoEndPosition.y];
graph.add(ypogKoEnd_ClampMinMaxTRG00);

let ypogKoEnd_ClampMinMaxTRG01 = LiteGraph.createNode("DeosTrigger/ClampMinMaxTRG");
ypogKoEnd_ClampMinMaxTRG01.pos = [ypogKoEndPosition.x+650,ypogKoEndPosition.y+150];
graph.add(ypogKoEnd_ClampMinMaxTRG01);

let ypogKoEnd_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoEnd_BusWriteTRG00.pos = [ypogKoEndPosition.x+850,ypogKoEndPosition.y];
ypogKoEnd_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "386"); //CHANGE
graph.add(ypogKoEnd_BusWriteTRG00);

let ypogKoEnd_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
ypogKoEnd_BusWriteTRG01.pos = [ypogKoEndPosition.x+850,ypogKoEndPosition.y+150];
ypogKoEnd_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "386"); //CHANGE
graph.add(ypogKoEnd_BusWriteTRG01);

let ypogKoEnd_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
ypogKoEnd_TickReceiverTRG00.pos = [ypogKoEndPosition.x+870,ypogKoEndPosition.y+300];
graph.add(ypogKoEnd_TickReceiverTRG00);

let ypogKoEnd_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
ypogKoEnd_OrTrigger3TRG00.pos = [ypogKoEndPosition.x+1050,ypogKoEndPosition.y];
graph.add(ypogKoEnd_OrTrigger3TRG00);

let ypogKoEnd_BusReadTRG02 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
ypogKoEnd_BusReadTRG02.pos = [ypogKoEndPosition.x+1250,ypogKoEndPosition.y];
ypogKoEnd_BusReadTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "386"); //CHANGE
graph.add(ypogKoEnd_BusReadTRG02);

let ypogKoEnd_ConstNumber03 = LiteGraph.createNode("Deos/ConstNumber");
ypogKoEnd_ConstNumber03.pos = [ypogKoEndPosition.x+1250,ypogKoEndPosition.y+150];
ypogKoEnd_ConstNumber03.init(1); //CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
graph.add(ypogKoEnd_ConstNumber03);

let ypogKoEnd_DivNumberTRG00 = LiteGraph.createNode("DeosTrigger/DivNumberTRG");
ypogKoEnd_DivNumberTRG00.pos = [ypogKoEndPosition.x+1450,ypogKoEndPosition.y];
graph.add(ypogKoEnd_DivNumberTRG00);

let ypogKoEnd_PropSendNumberTRG00 = LiteGraph.createNode("DeosTrigger/PropSendNumberTRG");
ypogKoEnd_PropSendNumberTRG00.pos = [ypogKoEndPosition.x+1650,ypogKoEndPosition.y];
ypogKoEnd_PropSendNumberTRG00.init(broadcastDeosHandle, "y_kou_end_display"); //CHANGE
graph.add(ypogKoEnd_PropSendNumberTRG00);

ypogKoEnd_ButtonTRG00.connect(0, ypogKoEnd_BusReadTRG00, 0);
ypogKoEnd_ButtonTRG01.connect(0, ypogKoEnd_BusReadTRG01, 0);

ypogKoEnd_BusReadTRG00.connect(0, ypogKoEnd_SubNumberTRG00, 0);
ypogKoEnd_ConstNumber00.connect(0, ypogKoEnd_SubNumberTRG00, 1);
ypogKoEnd_BusReadTRG00.connect(1, ypogKoEnd_SubNumberTRG00, 2);

ypogKoEnd_BusReadTRG01.connect(0, ypogKoEnd_AddNumberTRG00, 0);
ypogKoEnd_ConstNumber00.connect(0, ypogKoEnd_AddNumberTRG00, 1);
ypogKoEnd_BusReadTRG01.connect(1, ypogKoEnd_AddNumberTRG00, 2);

ypogKoEnd_SubNumberTRG00.connect(0, ypogKoEnd_ClampMinMaxTRG00, 0);
ypogKoEnd_ConstNumber01.connect(0, ypogKoEnd_ClampMinMaxTRG00, 1);
ypogKoEnd_ConstNumber02.connect(0, ypogKoEnd_ClampMinMaxTRG00, 2);
ypogKoEnd_SubNumberTRG00.connect(1, ypogKoEnd_ClampMinMaxTRG00, 3);

ypogKoEnd_AddNumberTRG00.connect(0, ypogKoEnd_ClampMinMaxTRG01, 0);
ypogKoEnd_ConstNumber01.connect(0, ypogKoEnd_ClampMinMaxTRG01, 1);
ypogKoEnd_ConstNumber02.connect(0, ypogKoEnd_ClampMinMaxTRG01, 2);
ypogKoEnd_AddNumberTRG00.connect(1, ypogKoEnd_ClampMinMaxTRG01, 3);

ypogKoEnd_ClampMinMaxTRG00.connect(0, ypogKoEnd_BusWriteTRG00, 0);
ypogKoEnd_ClampMinMaxTRG00.connect(1, ypogKoEnd_BusWriteTRG00, 1);

ypogKoEnd_ClampMinMaxTRG01.connect(0, ypogKoEnd_BusWriteTRG01, 0);
ypogKoEnd_ClampMinMaxTRG01.connect(1, ypogKoEnd_BusWriteTRG01, 1);

ypogKoEnd_BusWriteTRG00.connect(0, ypogKoEnd_OrTrigger3TRG00, 0);
ypogKoEnd_BusWriteTRG01.connect(0, ypogKoEnd_OrTrigger3TRG00, 1);
ypogKoEnd_TickReceiverTRG00.connect(0, ypogKoEnd_OrTrigger3TRG00, 2);
ypogKoEnd_OrTrigger3TRG00.connect(0, ypogKoEnd_BusReadTRG02, 0);

ypogKoEnd_BusReadTRG02.connect(0, ypogKoEnd_DivNumberTRG00, 0);
ypogKoEnd_ConstNumber03.connect(0, ypogKoEnd_DivNumberTRG00, 1);
ypogKoEnd_BusReadTRG02.connect(1, ypogKoEnd_DivNumberTRG00, 2);
ypogKoEnd_DivNumberTRG00.connect(0, ypogKoEnd_PropSendNumberTRG00, 0);
ypogKoEnd_DivNumberTRG00.connect(1, ypogKoEnd_PropSendNumberTRG00, 1);
//////////////////////////////////////////////////
//#endregion YPOGEIO KOUZINA END BTN
//////////////////////////////////////////////////

let endodPosition = {x:3250, y:50};
//////////////////////////////////////////////////
//#region ENDODAPEDIA
//////////////////////////////////////////////////
let endodS30Position = {x:endodPosition.x+0, y:endodPosition.y+20};
let endodS31Position = {x:endodPosition.x+0, y:endodPosition.y+340};
let endodS32Position = {x:endodPosition.x+0, y:endodPosition.y+660};
let endodGapX = 0;

let endodGlobalPosition = {x:endodPosition.x+1350, y:endodPosition.y-120};

let endodHydPosition = {x:endodPosition.x+2150, y:endodPosition.y-120};
let endodKykPosition = {x:endodPosition.x+1650, y:endodPosition.y+300};

let endodS30_Title00 = LiteGraph.createNode("Deos/Title");
endodS30_Title00.pos = [endodS30Position.x,endodS30Position.y-290];
endodS30_Title00.init("GLOBALS DEMAND_ENDOD ΑΝΑ ΘΕΡΜΟΣΤΑΤΗ ΚΑΙ ΚΙΝΗΤΗΡΑΚΙΑ - Έλεγχος <Bars Endod Θερμοστάτη> και <g_S30,31,32_demand_heat> για καθορισμό <g_S30,31,32_demand_endod> και <g_endod_kinS30,31,32>.", 1300);
graph.add(endodS30_Title00);

//ENDOD S30

let endodS30_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
endodS30_LocalReadReg00.pos = [endodS30Position.x,endodS30Position.y];
endodS30_LocalReadReg00.init(database_BusReadAllTRG00, "S30:R386");
graph.add(endodS30_LocalReadReg00);

let endodS30_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
endodS30_ConstNumber00.pos = [endodS30Position.x,endodS30Position.y+70];
endodS30_ConstNumber00.init(0);
graph.add(endodS30_ConstNumber00);

let endodS30_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
endodS30_GreatThan00.pos = [endodS30Position.x+200,endodS30Position.y];
graph.add(endodS30_GreatThan00);

let endodS30_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodS30_PropReadBoolean00.pos = [endodS30Position.x+200,endodS30Position.y+100];
endodS30_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S30_demand_heat");
graph.add(endodS30_PropReadBoolean00);

let endodS30_And200 = LiteGraph.createNode("Deos/And2");
endodS30_And200.pos = [endodS30Position.x+400+endodGapX,endodS30Position.y];
graph.add(endodS30_And200);

let endodS30_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS30_PropSaveBoolean00.pos = [endodS30Position.x+600+endodGapX,endodS30Position.y];
endodS30_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_endod_kinS30");
graph.add(endodS30_PropSaveBoolean00);

let endodS30_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
endodS30_PropSendBoolean00.pos = [endodS30Position.x+600+endodGapX,endodS30Position.y+70];
endodS30_PropSendBoolean00.init(broadcastDeosHandle, "m_endod_kinS30");
graph.add(endodS30_PropSendBoolean00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanE00 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanE00.pos = [endodS30Position.x+400+endodGapX,endodS30Position.y-140];
ypogeio_PropSendBooleanE00.init(broadcastDeosHandle, "y_ypn_isEndodOn");
graph.add(ypogeio_PropSendBooleanE00);
endodS30_GreatThan00.connect(0, ypogeio_PropSendBooleanE00, 0);

let endodS30_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS30_PropSaveBoolean01.pos = [endodS30Position.x+400+endodGapX,endodS30Position.y-70];
endodS30_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S30_demand_endod");
graph.add(endodS30_PropSaveBoolean01);

endodS30_GreatThan00.connect(0, endodS30_PropSaveBoolean01, 0);

endodS30_LocalReadReg00.connect(0, endodS30_GreatThan00, 0);
endodS30_ConstNumber00.connect(0, endodS30_GreatThan00, 1);
endodS30_GreatThan00.connect(0, endodS30_And200, 0);
endodS30_PropReadBoolean00.connect(0, endodS30_And200, 1);
endodS30_And200.connect(0, endodS30_PropSaveBoolean00, 0);
endodS30_And200.connect(0, endodS30_PropSendBoolean00, 0);

//ENDOD S31

let endodS31_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
endodS31_LocalReadReg00.pos = [endodS31Position.x,endodS31Position.y];
endodS31_LocalReadReg00.init(database_BusReadAllTRG00, "S31:R386");
graph.add(endodS31_LocalReadReg00);

let endodS31_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
endodS31_ConstNumber00.pos = [endodS31Position.x,endodS31Position.y+70];
endodS31_ConstNumber00.init(0);
graph.add(endodS31_ConstNumber00);

let endodS31_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
endodS31_GreatThan00.pos = [endodS31Position.x+200,endodS31Position.y];
graph.add(endodS31_GreatThan00);

let endodS31_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodS31_PropReadBoolean00.pos = [endodS31Position.x+200,endodS31Position.y+100];
endodS31_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S31_demand_heat");
graph.add(endodS31_PropReadBoolean00);

let endodS31_And200 = LiteGraph.createNode("Deos/And2");
endodS31_And200.pos = [endodS31Position.x+400+endodGapX,endodS31Position.y];
graph.add(endodS31_And200);

let endodS31_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS31_PropSaveBoolean00.pos = [endodS31Position.x+600+endodGapX,endodS31Position.y];
endodS31_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_endod_kinS31");
graph.add(endodS31_PropSaveBoolean00);

let endodS31_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
endodS31_PropSendBoolean00.pos = [endodS31Position.x+600+endodGapX,endodS31Position.y+70];
endodS31_PropSendBoolean00.init(broadcastDeosHandle, "m_endod_kinS31");
graph.add(endodS31_PropSendBoolean00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanE01 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanE01.pos = [endodS31Position.x+400+endodGapX,endodS31Position.y-140];
ypogeio_PropSendBooleanE01.init(broadcastDeosHandle, "y_gra_isEndodOn");
graph.add(ypogeio_PropSendBooleanE01);
endodS31_GreatThan00.connect(0, ypogeio_PropSendBooleanE01, 0);

let endodS31_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS31_PropSaveBoolean01.pos = [endodS31Position.x+400+endodGapX,endodS31Position.y-70];
endodS31_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S31_demand_endod");
graph.add(endodS31_PropSaveBoolean01);

endodS31_GreatThan00.connect(0, endodS31_PropSaveBoolean01, 0);

endodS31_LocalReadReg00.connect(0, endodS31_GreatThan00, 0);
endodS31_ConstNumber00.connect(0, endodS31_GreatThan00, 1);
endodS31_GreatThan00.connect(0, endodS31_And200, 0);
endodS31_PropReadBoolean00.connect(0, endodS31_And200, 1);
endodS31_And200.connect(0, endodS31_PropSaveBoolean00, 0);
endodS31_And200.connect(0, endodS31_PropSendBoolean00, 0);

//ENDOD S32

let endodS32_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
endodS32_LocalReadReg00.pos = [endodS32Position.x,endodS32Position.y];
endodS32_LocalReadReg00.init(database_BusReadAllTRG00, "S32:R386");
graph.add(endodS32_LocalReadReg00);

let endodS32_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
endodS32_ConstNumber00.pos = [endodS32Position.x,endodS32Position.y+70];
endodS32_ConstNumber00.init(0);
graph.add(endodS32_ConstNumber00);

let endodS32_GreatThan00 = LiteGraph.createNode("Deos/GreatThan");
endodS32_GreatThan00.pos = [endodS32Position.x+200,endodS32Position.y];
graph.add(endodS32_GreatThan00);

let endodS32_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodS32_PropReadBoolean00.pos = [endodS32Position.x+200,endodS32Position.y+100];
endodS32_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S32_demand_heat");
graph.add(endodS32_PropReadBoolean00);

let endodS32_And200 = LiteGraph.createNode("Deos/And2");
endodS32_And200.pos = [endodS32Position.x+400+endodGapX,endodS32Position.y];
graph.add(endodS32_And200);

let endodS32_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS32_PropSaveBoolean00.pos = [endodS32Position.x+600+endodGapX,endodS32Position.y];
endodS32_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_endod_kinS32");
graph.add(endodS32_PropSaveBoolean00);

let endodS32_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
endodS32_PropSendBoolean00.pos = [endodS32Position.x+600+endodGapX,endodS32Position.y+70];
endodS32_PropSendBoolean00.init(broadcastDeosHandle, "m_endod_kinS32");
graph.add(endodS32_PropSendBoolean00);

//Y_YPOGEIO
let ypogeio_PropSendBooleanE02 = LiteGraph.createNode("Deos/PropSendBoolean");
ypogeio_PropSendBooleanE02.pos = [endodS32Position.x+400+endodGapX,endodS32Position.y-140];
ypogeio_PropSendBooleanE02.init(broadcastDeosHandle, "y_kou_isEndodOn");
graph.add(ypogeio_PropSendBooleanE02);
endodS32_GreatThan00.connect(0, ypogeio_PropSendBooleanE02, 0);

let endodS32_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodS32_PropSaveBoolean01.pos = [endodS32Position.x+400+endodGapX,endodS32Position.y-70];
endodS32_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_S32_demand_endod");
graph.add(endodS32_PropSaveBoolean01);

endodS32_GreatThan00.connect(0, endodS32_PropSaveBoolean01, 0);

endodS32_LocalReadReg00.connect(0, endodS32_GreatThan00, 0);
endodS32_ConstNumber00.connect(0, endodS32_GreatThan00, 1);
endodS32_GreatThan00.connect(0, endodS32_And200, 0);
endodS32_PropReadBoolean00.connect(0, endodS32_And200, 1);
endodS32_And200.connect(0, endodS32_PropSaveBoolean00, 0);
endodS32_And200.connect(0, endodS32_PropSendBoolean00, 0);

// GLOBAL METABLHTH ENDODAPEDIA

let endodGlobal_Title00 = LiteGraph.createNode("Deos/Title");
endodGlobal_Title00.pos = [endodGlobalPosition.x,endodGlobalPosition.y-80];
endodGlobal_Title00.init("GLOBAL DEMAND ENDOD - Έλεγχος <g_isEndodOn_bool> βάσει <g_S30,31,32_demand_endod> και global mode <g_isCool_Bool>.", 780);
graph.add(endodGlobal_Title00);

let endodGlobal_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
endodGlobal_PropReadBoolean03.pos = [endodGlobalPosition.x,endodGlobalPosition.y];
endodGlobal_PropReadBoolean03.init(g_broadcastDeosContainer, "g_isCool_bool");
graph.add(endodGlobal_PropReadBoolean03);

let endodGlobal_Not00 = LiteGraph.createNode("Deos/Not");
endodGlobal_Not00.pos = [endodGlobalPosition.x+220,endodGlobalPosition.y];
graph.add(endodGlobal_Not00);

let endodGlobal_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodGlobal_PropReadBoolean00.pos = [endodGlobalPosition.x,endodGlobalPosition.y+70];
endodGlobal_PropReadBoolean00.init(g_broadcastDeosContainer, "g_S30_demand_endod");
graph.add(endodGlobal_PropReadBoolean00);

let endodGlobal_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
endodGlobal_PropReadBoolean01.pos = [endodGlobalPosition.x,endodGlobalPosition.y+140];
endodGlobal_PropReadBoolean01.init(g_broadcastDeosContainer, "g_S31_demand_endod");
graph.add(endodGlobal_PropReadBoolean01);

let endodGlobal_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
endodGlobal_PropReadBoolean02.pos = [endodGlobalPosition.x,endodGlobalPosition.y+210];
endodGlobal_PropReadBoolean02.init(g_broadcastDeosContainer, "g_S32_demand_endod");
graph.add(endodGlobal_PropReadBoolean02);

let endodGlobal_Or300 = LiteGraph.createNode("Deos/Or3");
endodGlobal_Or300.pos = [endodGlobalPosition.x+220,endodGlobalPosition.y+70];
graph.add(endodGlobal_Or300);

let endodGlobal_And200 = LiteGraph.createNode("Deos/And2");
endodGlobal_And200.pos = [endodGlobalPosition.x+400,endodGlobalPosition.y];
graph.add(endodGlobal_And200);

let endodGlobal_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
endodGlobal_PropSaveBoolean00.pos = [endodGlobalPosition.x+580,endodGlobalPosition.y];
endodGlobal_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_isEndodOn_bool");
graph.add(endodGlobal_PropSaveBoolean00);

let endodGlobal_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
endodGlobal_PropSendBoolean00.pos = [endodGlobalPosition.x+580,endodGlobalPosition.y+70];
endodGlobal_PropSendBoolean00.init(broadcastDeosHandle, "m_hydro_demand");
graph.add(endodGlobal_PropSendBoolean00);

endodGlobal_PropReadBoolean03.connect(0, endodGlobal_Not00, 0);
endodGlobal_PropReadBoolean00.connect(0, endodGlobal_Or300, 0);
endodGlobal_PropReadBoolean01.connect(0, endodGlobal_Or300, 1);
endodGlobal_PropReadBoolean02.connect(0, endodGlobal_Or300, 2);
endodGlobal_Not00.connect(0, endodGlobal_And200, 0);
endodGlobal_Or300.connect(0, endodGlobal_And200, 1);
endodGlobal_And200.connect(0, endodGlobal_PropSaveBoolean00, 0);
endodGlobal_And200.connect(0, endodGlobal_PropSendBoolean00, 0);

// HYDRO GIA ENDODAPEDIA

let endodHyd_Title00 = LiteGraph.createNode("Deos/Title");
endodHyd_Title00.pos = [endodHydPosition.x,endodHydPosition.y-80];
endodHyd_Title00.init("HYDRO ON/OFF ΕΝΔΟΔΑΠΕΔΙΑΣ - Βάσει global μεταβλητής <g_isEndodOn_bool> έλεγχος του <HYDRO ON/OFF>.", 700);
graph.add(endodHyd_Title00);

let endodHyd_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodHyd_PropReadBoolean00.pos = [endodHydPosition.x,endodHydPosition.y];
endodHyd_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isEndodOn_bool");
graph.add(endodHyd_PropReadBoolean00);

let endodHyd_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
endodHyd_ConstNumber00.pos = [endodHydPosition.x,endodHydPosition.y+70];
endodHyd_ConstNumber00.init(0);
graph.add(endodHyd_ConstNumber00);

let endodHyd_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
endodHyd_ConstNumber01.pos = [endodHydPosition.x,endodHydPosition.y+170];
endodHyd_ConstNumber01.init(1);
graph.add(endodHyd_ConstNumber01);

let endodHyd_Multiplexer200 = LiteGraph.createNode("Deos/Multiplexer2");
endodHyd_Multiplexer200.pos = [endodHydPosition.x+200,endodHydPosition.y];
graph.add(endodHyd_Multiplexer200);

endodHyd_PropReadBoolean00.connect(0, endodHyd_Multiplexer200, 0);
endodHyd_ConstNumber00.connect(0, endodHyd_Multiplexer200, 1);
endodHyd_ConstNumber01.connect(0, endodHyd_Multiplexer200, 2);

let endodHyd_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
endodHyd_TickReceiverTRG00.pos = [endodHydPosition.x+220,endodHydPosition.y+120];
graph.add(endodHyd_TickReceiverTRG00);

let endodHyd_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodHyd_BusWriteTRG00.pos = [endodHydPosition.x+400,endodHydPosition.y];
endodHyd_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "1"); //CHANGE
graph.add(endodHyd_BusWriteTRG00);

endodHyd_Multiplexer200.connect(0, endodHyd_BusWriteTRG00, 0);
endodHyd_TickReceiverTRG00.connect(0, endodHyd_BusWriteTRG00, 1);

// KYKLOFORHTHS GIA ENDODAPEDIA

let endodKyk_Title00 = LiteGraph.createNode("Deos/Title");
endodKyk_Title00.pos = [endodKykPosition.x-640,endodKykPosition.y-80];
endodKyk_Title00.init("STRATOS ΕΝΔΟΔΑΠΕΔΙΑΣ ON/OFF - Βάσει global μεταβλητής <g_isEndodOn_bool> και <Θερμοκρασίας μίξης S5102> έλεγχος του <STRATOS ON/OFF>.", 900);
graph.add(endodKyk_Title00);

let endodKyk_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
endodKyk_LocalReadReg00.pos = [endodKykPosition.x-640,endodKykPosition.y];
endodKyk_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R106");
graph.add(endodKyk_LocalReadReg00);

let endodKyk_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
endodKyk_ConstNumber02.pos = [endodKykPosition.x-640,endodKykPosition.y+100];
endodKyk_ConstNumber02.init(10);
graph.add(endodKyk_ConstNumber02);

let endodKyk_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
endodKyk_DivideNumber00.pos = [endodKykPosition.x-440,endodKykPosition.y];
graph.add(endodKyk_DivideNumber00);

let endodKyk_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
endodKyk_PropReadNumber00.pos = [endodKykPosition.x-440,endodKykPosition.y+100];
endodKyk_PropReadNumber00.init(g_broadcastDeosContainer, "p_endod_strat_SpSafe");
graph.add(endodKyk_PropReadNumber00);

let endodKyk_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
endodKyk_PropReadNumber01.pos = [endodKykPosition.x-440,endodKykPosition.y+170];
endodKyk_PropReadNumber01.init(g_broadcastDeosContainer, "p_endod_strat_dTSafe");
graph.add(endodKyk_PropReadNumber01);

let endodKyk_CompareHeat00 = LiteGraph.createNode("Deos/CompareHeat");
endodKyk_CompareHeat00.pos = [endodKykPosition.x-220,endodKykPosition.y];
graph.add(endodKyk_CompareHeat00);

let endodKyk_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
endodKyk_PropReadBoolean00.pos = [endodKykPosition.x-220,endodKykPosition.y+120];
endodKyk_PropReadBoolean00.init(g_broadcastDeosContainer, "g_isEndodOn_bool");
graph.add(endodKyk_PropReadBoolean00);

let endodKyk_And200 = LiteGraph.createNode("Deos/And2");
endodKyk_And200.pos = [endodKykPosition.x,endodKykPosition.y];
graph.add(endodKyk_And200);

let endodKyk_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
endodKyk_PropSendBoolean00.pos = [endodKykPosition.x+200,endodKykPosition.y];
endodKyk_PropSendBoolean00.init(broadcastDeosHandle, "m_stratos_circ");
graph.add(endodKyk_PropSendBoolean00);

endodKyk_LocalReadReg00.connect(0, endodKyk_DivideNumber00, 0);
endodKyk_ConstNumber02.connect(0, endodKyk_DivideNumber00, 1);
endodKyk_DivideNumber00.connect(0, endodKyk_CompareHeat00, 0);
endodKyk_PropReadNumber00.connect(0, endodKyk_CompareHeat00, 1);
endodKyk_PropReadNumber01.connect(0, endodKyk_CompareHeat00, 2);
endodKyk_CompareHeat00.connect(0, endodKyk_And200, 0);
endodKyk_PropReadBoolean00.connect(0, endodKyk_And200, 1);
endodKyk_And200.connect(0, endodKyk_PropSendBoolean00, 0);

let endodKyk_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
endodKyk_TickReceiverTRG00.pos = [endodKykPosition.x-180,endodKykPosition.y+190];
graph.add(endodKyk_TickReceiverTRG00);

let endodKyk_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
endodKyk_BusReadTRG00.pos = [endodKykPosition.x,endodKykPosition.y+120];
endodKyk_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "10", "40041");
graph.add(endodKyk_BusReadTRG00);

let endodKyk_SetBitTRG00 = LiteGraph.createNode("DeosTrigger/SetBitTRG");
endodKyk_SetBitTRG00.pos = [endodKykPosition.x+200,endodKykPosition.y+120];
endodKyk_SetBitTRG00.init(0);
graph.add(endodKyk_SetBitTRG00);

let endodKyk_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodKyk_BusWriteTRG00.pos = [endodKykPosition.x+400,endodKykPosition.y+120];
endodKyk_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "10", "40041");
graph.add(endodKyk_BusWriteTRG00);

endodKyk_TickReceiverTRG00.connect(0, endodKyk_BusReadTRG00, 0);
endodKyk_And200.connect(0, endodKyk_SetBitTRG00, 0);
endodKyk_BusReadTRG00.connect(0, endodKyk_SetBitTRG00, 1);
endodKyk_BusReadTRG00.connect(1, endodKyk_SetBitTRG00, 2);
endodKyk_SetBitTRG00.connect(0, endodKyk_BusWriteTRG00, 0);
endodKyk_SetBitTRG00.connect(1, endodKyk_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion ENDODAPEDIA
//////////////////////////////////////////////////

let endodPropPosition = {x:6150, y:-670};
//////////////////////////////////////////////////
//#region ENDODAPEDIA PROPERTIES
//////////////////////////////////////////////////

//SP
//Qmin
//Qmax
//M

let endodProp_Title00 = LiteGraph.createNode("Deos/Title");
endodProp_Title00.pos = [endodPropPosition.x,endodPropPosition.y-80];
endodProp_Title00.init("ΑΠΟ ΤΑ PROPERTIES ΤΗΣ ΕΝΔΟΔΑΠΕΔΙΑΣ ΠΡΟΣ MODBUS HYDRO ΚΑΙ STRATOS.", 800);
graph.add(endodProp_Title00);

let endodProp_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
endodProp_TickReceiverTRG00.pos = [endodPropPosition.x+420,endodPropPosition.y+1280];
graph.add(endodProp_TickReceiverTRG00);

//HYDRO SP
let hydroSpOffsetY = 0;

let endodProp_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
endodProp_PropReadNumber00.pos = [endodPropPosition.x,endodPropPosition.y+hydroSpOffsetY];
endodProp_PropReadNumber00.init(g_broadcastDeosContainer, "p_endod_hydro_SP");
graph.add(endodProp_PropReadNumber00);

let endodProp_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber00.pos = [endodPropPosition.x,endodPropPosition.y+70+hydroSpOffsetY];
endodProp_ConstNumber00.init("10");
graph.add(endodProp_ConstNumber00);

let endodProp_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
endodProp_MultiplyNumber00.pos = [endodPropPosition.x+200,endodPropPosition.y+hydroSpOffsetY];
graph.add(endodProp_MultiplyNumber00);

let endodProp_ConstNumber00sp = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber00sp.pos = [endodPropPosition.x+200,endodPropPosition.y+100+hydroSpOffsetY];
endodProp_ConstNumber00sp.init(300);
graph.add(endodProp_ConstNumber00sp);

let endodProp_ConstNumber01sp = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber01sp.pos = [endodPropPosition.x+200,endodPropPosition.y+200+hydroSpOffsetY];
endodProp_ConstNumber01sp.init(500);
graph.add(endodProp_ConstNumber01sp);

let endodProp_ClampMinMax00sp = LiteGraph.createNode("Deos/ClampMinMax");
endodProp_ClampMinMax00sp.pos = [endodPropPosition.x+400,endodPropPosition.y+hydroSpOffsetY];
graph.add(endodProp_ClampMinMax00sp);

let endodProp_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodProp_BusWriteTRG00.pos = [endodPropPosition.x+750,endodPropPosition.y+hydroSpOffsetY];
endodProp_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "40003");
graph.add(endodProp_BusWriteTRG00);

endodProp_PropReadNumber00.connect(0, endodProp_MultiplyNumber00, 0);
endodProp_ConstNumber00.connect(0, endodProp_MultiplyNumber00, 1);

endodProp_MultiplyNumber00.connect(0, endodProp_ClampMinMax00sp, 0);
endodProp_ConstNumber00sp.connect(0, endodProp_ClampMinMax00sp, 1);
endodProp_ConstNumber01sp.connect(0, endodProp_ClampMinMax00sp, 2);

endodProp_ClampMinMax00sp.connect(0, endodProp_BusWriteTRG00, 0);
endodProp_TickReceiverTRG00.connect(0, endodProp_BusWriteTRG00, 1);

//STRATOS SPH
let stratosSphOffsetY = 150;

let endodProp_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
endodProp_PropReadNumber01.pos = [endodPropPosition.x,endodPropPosition.y+200+stratosSphOffsetY];
endodProp_PropReadNumber01.init(g_broadcastDeosContainer, "p_endod_strat_SpH");
graph.add(endodProp_PropReadNumber01);

let endodProp_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber01.pos = [endodPropPosition.x,endodPropPosition.y+270+stratosSphOffsetY];
endodProp_ConstNumber01.init("20");
graph.add(endodProp_ConstNumber01);

let endodProp_MultiplyNumber01 = LiteGraph.createNode("Deos/MultiplyNumber");
endodProp_MultiplyNumber01.pos = [endodPropPosition.x+200,endodPropPosition.y+200+stratosSphOffsetY];
graph.add(endodProp_MultiplyNumber01);

let endodProp_ConstNumber00sph = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber00sph.pos = [endodPropPosition.x+200,endodPropPosition.y+300+stratosSphOffsetY];
endodProp_ConstNumber00sph.init(0);
graph.add(endodProp_ConstNumber00sph);

let endodProp_ConstNumber01sph = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber01sph.pos = [endodPropPosition.x+200,endodPropPosition.y+400+stratosSphOffsetY];
endodProp_ConstNumber01sph.init(200);
graph.add(endodProp_ConstNumber01sph);

let endodProp_ClampMinMax00sph = LiteGraph.createNode("Deos/ClampMinMax");
endodProp_ClampMinMax00sph.pos = [endodPropPosition.x+400,endodPropPosition.y+200+stratosSphOffsetY];
graph.add(endodProp_ClampMinMax00sph);

let endodProp_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodProp_BusWriteTRG01.pos = [endodPropPosition.x+750,endodPropPosition.y+200+stratosSphOffsetY];
endodProp_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "10", "40002");
graph.add(endodProp_BusWriteTRG01);

endodProp_PropReadNumber01.connect(0, endodProp_MultiplyNumber01, 0);
endodProp_ConstNumber01.connect(0, endodProp_MultiplyNumber01, 1);

endodProp_MultiplyNumber01.connect(0, endodProp_ClampMinMax00sph, 0);
endodProp_ConstNumber00sph.connect(0, endodProp_ClampMinMax00sph, 1);
endodProp_ConstNumber01sph.connect(0, endodProp_ClampMinMax00sph, 2);

endodProp_ClampMinMax00sph.connect(0, endodProp_BusWriteTRG01, 0);
endodProp_TickReceiverTRG00.connect(0, endodProp_BusWriteTRG01, 1);

//STRATOS QMIN
let stratosQminOffsetY = 300;

let endodProp_PropReadNumber02 = LiteGraph.createNode("Deos/PropReadNumber");
endodProp_PropReadNumber02.pos = [endodPropPosition.x,endodPropPosition.y+400+stratosQminOffsetY];
endodProp_PropReadNumber02.init(g_broadcastDeosContainer, "p_endod_strat_Qmin");
graph.add(endodProp_PropReadNumber02);

let endodProp_ConstNumber00qmin = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber00qmin.pos = [endodPropPosition.x+200,endodPropPosition.y+500+stratosQminOffsetY];
endodProp_ConstNumber00qmin.init(0);
graph.add(endodProp_ConstNumber00qmin);

let endodProp_ConstNumber01qmin = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber01qmin.pos = [endodPropPosition.x+200,endodPropPosition.y+600+stratosQminOffsetY];
endodProp_ConstNumber01qmin.init(10);
graph.add(endodProp_ConstNumber01qmin);

let endodProp_ClampMinMax00qmin = LiteGraph.createNode("Deos/ClampMinMax");
endodProp_ClampMinMax00qmin.pos = [endodPropPosition.x+400,endodPropPosition.y+400+stratosQminOffsetY];
graph.add(endodProp_ClampMinMax00qmin);

let endodProp_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodProp_BusWriteTRG02.pos = [endodPropPosition.x+750,endodPropPosition.y+400+stratosQminOffsetY];
endodProp_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "10", "40423");
graph.add(endodProp_BusWriteTRG02);

endodProp_PropReadNumber02.connect(0, endodProp_ClampMinMax00qmin, 0);
endodProp_ConstNumber00qmin.connect(0, endodProp_ClampMinMax00qmin, 1);
endodProp_ConstNumber01qmin.connect(0, endodProp_ClampMinMax00qmin, 2);
endodProp_ClampMinMax00qmin.connect(0, endodProp_BusWriteTRG02, 0);
endodProp_TickReceiverTRG00.connect(0, endodProp_BusWriteTRG02, 1);

//STRATOS QMAX
let stratosQmaxOffsetY = 450;

let endodProp_PropReadNumber03 = LiteGraph.createNode("Deos/PropReadNumber");
endodProp_PropReadNumber03.pos = [endodPropPosition.x,endodPropPosition.y+600+stratosQmaxOffsetY];
endodProp_PropReadNumber03.init(g_broadcastDeosContainer, "p_endod_strat_Qmax");
graph.add(endodProp_PropReadNumber03);

let endodProp_ConstNumber00qmax = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber00qmax.pos = [endodPropPosition.x+200,endodPropPosition.y+700+stratosQmaxOffsetY];
endodProp_ConstNumber00qmax.init(0);
graph.add(endodProp_ConstNumber00qmax);

let endodProp_ConstNumber01qmax = LiteGraph.createNode("Deos/ConstNumber");
endodProp_ConstNumber01qmax.pos = [endodPropPosition.x+200,endodPropPosition.y+800+stratosQmaxOffsetY];
endodProp_ConstNumber01qmax.init(10);
graph.add(endodProp_ConstNumber01qmax);

let endodProp_ClampMinMax00qmax = LiteGraph.createNode("Deos/ClampMinMax");
endodProp_ClampMinMax00qmax.pos = [endodPropPosition.x+400,endodPropPosition.y+600+stratosQmaxOffsetY];
graph.add(endodProp_ClampMinMax00qmax);

let endodProp_BusWriteTRG03 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
endodProp_BusWriteTRG03.pos = [endodPropPosition.x+750,endodPropPosition.y+600+stratosQmaxOffsetY];
endodProp_BusWriteTRG03.init(broadcastModbusHandle, g_broadcastModbusContainer, "10", "40421");
graph.add(endodProp_BusWriteTRG03);

endodProp_PropReadNumber03.connect(0, endodProp_ClampMinMax00qmax, 0);
endodProp_ConstNumber00qmax.connect(0, endodProp_ClampMinMax00qmax, 1);
endodProp_ConstNumber01qmax.connect(0, endodProp_ClampMinMax00qmax, 2);
endodProp_ClampMinMax00qmax.connect(0, endodProp_BusWriteTRG03, 0);
endodProp_TickReceiverTRG00.connect(0, endodProp_BusWriteTRG03, 1);
//////////////////////////////////////////////////
//#endregion ENDODAPEDIA PROPERTIES
//////////////////////////////////////////////////

let idu1ErrorsPosition = {x:5650, y:850};
//////////////////////////////////////////////////
//#region IDU1 ERRORS
//////////////////////////////////////////////////

let idu1Errors_Title00 = LiteGraph.createNode("Deos/Title");
idu1Errors_Title00.pos = [idu1ErrorsPosition.x,idu1ErrorsPosition.y-80];
idu1Errors_Title00.init("ΑΠΕΙΚΟΝΙΣΗ ΕΝΔΕΙΞΕΩΝ ΚΑΙ ΚΩΔΙΚΩΝ ΣΦΑΛΜΑΤΩΝ <CONNECTION, ALARM, ERROR CODE> ΤΩΝ ΜΟΝΑΔΩΝ <IDU 1,2,3,HYDRO> ΣΤΟ ΜΗΧΑΝΟΣΤΑΣΙΟ.", 880);
graph.add(idu1Errors_Title00);

//IDU 1 CONNECTION

let idu1Errors_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
idu1Errors_LocalReadReg00.pos = [idu1ErrorsPosition.x,idu1ErrorsPosition.y];
idu1Errors_LocalReadReg00.init(database_BusReadAllTRG00, "S1:R10001");
graph.add(idu1Errors_LocalReadReg00);

let idu1Errors_Num2Bool00 = LiteGraph.createNode("Deos/Num2Bool");
idu1Errors_Num2Bool00.pos = [idu1ErrorsPosition.x+200,idu1ErrorsPosition.y];
graph.add(idu1Errors_Num2Bool00);

let idu1Errors_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
idu1Errors_PropSendBoolean00.pos = [idu1ErrorsPosition.x+400,idu1ErrorsPosition.y];
idu1Errors_PropSendBoolean00.init(broadcastDeosHandle, "m_idu1_connection");
graph.add(idu1Errors_PropSendBoolean00);

idu1Errors_LocalReadReg00.connect(0, idu1Errors_Num2Bool00, 0);
idu1Errors_Num2Bool00.connect(0, idu1Errors_PropSendBoolean00, 0);

//IDU 1 ALARM

let idu1Errors_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
idu1Errors_LocalReadReg01.pos = [idu1ErrorsPosition.x,idu1ErrorsPosition.y+100];
idu1Errors_LocalReadReg01.init(database_BusReadAllTRG00, "S1:R10002");
graph.add(idu1Errors_LocalReadReg01);

let idu1Errors_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
idu1Errors_Num2Bool01.pos = [idu1ErrorsPosition.x+200,idu1ErrorsPosition.y+100];
graph.add(idu1Errors_Num2Bool01);

let idu1Errors_Not01 = LiteGraph.createNode("Deos/Not");
idu1Errors_Not01.pos = [idu1ErrorsPosition.x+400,idu1ErrorsPosition.y+100];
graph.add(idu1Errors_Not01);

let idu1Errors_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
idu1Errors_PropSendBoolean01.pos = [idu1ErrorsPosition.x+560,idu1ErrorsPosition.y+100];
idu1Errors_PropSendBoolean01.init(broadcastDeosHandle, "m_idu1_notAlarm");
graph.add(idu1Errors_PropSendBoolean01);

idu1Errors_LocalReadReg01.connect(0, idu1Errors_Num2Bool01, 0);
idu1Errors_Num2Bool01.connect(0, idu1Errors_Not01, 0);
idu1Errors_Not01.connect(0, idu1Errors_PropSendBoolean01, 0);

//IDU 1 ERROR CODE

let idu1Errors_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
idu1Errors_LocalReadReg02.pos = [idu1ErrorsPosition.x,idu1ErrorsPosition.y+200];
idu1Errors_LocalReadReg02.init(database_BusReadAllTRG00, "S1:R30001");
graph.add(idu1Errors_LocalReadReg02);

let idu1Errors_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
idu1Errors_PropSendNumber00.pos = [idu1ErrorsPosition.x+200,idu1ErrorsPosition.y+200];
idu1Errors_PropSendNumber00.init(broadcastDeosHandle, "m_idu1_errorCode");
graph.add(idu1Errors_PropSendNumber00);

idu1Errors_LocalReadReg02.connect(0, idu1Errors_PropSendNumber00, 0);
//////////////////////////////////////////////////
//#endregion IDU1 ERRORS
//////////////////////////////////////////////////

let idu2ErrorsPosition = {x:5650, y:1150};
//////////////////////////////////////////////////
//#region IDU2 ERRORS
//////////////////////////////////////////////////

//IDU 2 CONNECTION

let idu2Errors_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
idu2Errors_LocalReadReg00.pos = [idu2ErrorsPosition.x,idu2ErrorsPosition.y];
idu2Errors_LocalReadReg00.init(database_BusReadAllTRG00, "S2:R10001");
graph.add(idu2Errors_LocalReadReg00);

let idu2Errors_Num2Bool00 = LiteGraph.createNode("Deos/Num2Bool");
idu2Errors_Num2Bool00.pos = [idu2ErrorsPosition.x+200,idu2ErrorsPosition.y];
graph.add(idu2Errors_Num2Bool00);

let idu2Errors_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
idu2Errors_PropSendBoolean00.pos = [idu2ErrorsPosition.x+400,idu2ErrorsPosition.y];
idu2Errors_PropSendBoolean00.init(broadcastDeosHandle, "m_idu2_connection");
graph.add(idu2Errors_PropSendBoolean00);

idu2Errors_LocalReadReg00.connect(0, idu2Errors_Num2Bool00, 0);
idu2Errors_Num2Bool00.connect(0, idu2Errors_PropSendBoolean00, 0);

//IDU 2 ALARM

let idu2Errors_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
idu2Errors_LocalReadReg01.pos = [idu2ErrorsPosition.x,idu2ErrorsPosition.y+100];
idu2Errors_LocalReadReg01.init(database_BusReadAllTRG00, "S2:R10002");
graph.add(idu2Errors_LocalReadReg01);

let idu2Errors_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
idu2Errors_Num2Bool01.pos = [idu2ErrorsPosition.x+200,idu2ErrorsPosition.y+100];
graph.add(idu2Errors_Num2Bool01);

let idu2Errors_Not01 = LiteGraph.createNode("Deos/Not");
idu2Errors_Not01.pos = [idu2ErrorsPosition.x+400,idu2ErrorsPosition.y+100];
graph.add(idu2Errors_Not01);

let idu2Errors_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
idu2Errors_PropSendBoolean01.pos = [idu2ErrorsPosition.x+560,idu2ErrorsPosition.y+100];
idu2Errors_PropSendBoolean01.init(broadcastDeosHandle, "m_idu2_notAlarm");
graph.add(idu2Errors_PropSendBoolean01);

idu2Errors_LocalReadReg01.connect(0, idu2Errors_Num2Bool01, 0);
idu2Errors_Num2Bool01.connect(0, idu2Errors_Not01, 0);
idu2Errors_Not01.connect(0, idu2Errors_PropSendBoolean01, 0);

//IDU 2 ERROR CODE

let idu2Errors_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
idu2Errors_LocalReadReg02.pos = [idu2ErrorsPosition.x,idu2ErrorsPosition.y+200];
idu2Errors_LocalReadReg02.init(database_BusReadAllTRG00, "S2:R30001");
graph.add(idu2Errors_LocalReadReg02);

let idu2Errors_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
idu2Errors_PropSendNumber00.pos = [idu2ErrorsPosition.x+200,idu2ErrorsPosition.y+200];
idu2Errors_PropSendNumber00.init(broadcastDeosHandle, "m_idu2_errorCode");
graph.add(idu2Errors_PropSendNumber00);

idu2Errors_LocalReadReg02.connect(0, idu2Errors_PropSendNumber00, 0);
//////////////////////////////////////////////////
//#endregion IDU2 ERRORS
//////////////////////////////////////////////////

let idu3ErrorsPosition = {x:5650, y:1450};
//////////////////////////////////////////////////
//#region IDU3 ERRORS
//////////////////////////////////////////////////

//IDU 3 CONNECTION

let idu3Errors_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
idu3Errors_LocalReadReg00.pos = [idu3ErrorsPosition.x,idu3ErrorsPosition.y];
idu3Errors_LocalReadReg00.init(database_BusReadAllTRG00, "S3:R10001");
graph.add(idu3Errors_LocalReadReg00);

let idu3Errors_Num2Bool00 = LiteGraph.createNode("Deos/Num2Bool");
idu3Errors_Num2Bool00.pos = [idu3ErrorsPosition.x+200,idu3ErrorsPosition.y];
graph.add(idu3Errors_Num2Bool00);

let idu3Errors_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
idu3Errors_PropSendBoolean00.pos = [idu3ErrorsPosition.x+400,idu3ErrorsPosition.y];
idu3Errors_PropSendBoolean00.init(broadcastDeosHandle, "m_idu3_connection");
graph.add(idu3Errors_PropSendBoolean00);

idu3Errors_LocalReadReg00.connect(0, idu3Errors_Num2Bool00, 0);
idu3Errors_Num2Bool00.connect(0, idu3Errors_PropSendBoolean00, 0);

//IDU 3 ALARM

let idu3Errors_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
idu3Errors_LocalReadReg01.pos = [idu3ErrorsPosition.x,idu3ErrorsPosition.y+100];
idu3Errors_LocalReadReg01.init(database_BusReadAllTRG00, "S3:R10002");
graph.add(idu3Errors_LocalReadReg01);

let idu3Errors_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
idu3Errors_Num2Bool01.pos = [idu3ErrorsPosition.x+200,idu3ErrorsPosition.y+100];
graph.add(idu3Errors_Num2Bool01);

let idu3Errors_Not01 = LiteGraph.createNode("Deos/Not");
idu3Errors_Not01.pos = [idu3ErrorsPosition.x+400,idu3ErrorsPosition.y+100];
graph.add(idu3Errors_Not01);

let idu3Errors_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
idu3Errors_PropSendBoolean01.pos = [idu3ErrorsPosition.x+560,idu3ErrorsPosition.y+100];
idu3Errors_PropSendBoolean01.init(broadcastDeosHandle, "m_idu3_notAlarm");
graph.add(idu3Errors_PropSendBoolean01);

idu3Errors_LocalReadReg01.connect(0, idu3Errors_Num2Bool01, 0);
idu3Errors_Num2Bool01.connect(0, idu3Errors_Not01, 0);
idu3Errors_Not01.connect(0, idu3Errors_PropSendBoolean01, 0);

//IDU 3 ERROR CODE

let idu3Errors_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
idu3Errors_LocalReadReg02.pos = [idu3ErrorsPosition.x,idu3ErrorsPosition.y+200];
idu3Errors_LocalReadReg02.init(database_BusReadAllTRG00, "S3:R30001");
graph.add(idu3Errors_LocalReadReg02);

let idu3Errors_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
idu3Errors_PropSendNumber00.pos = [idu3ErrorsPosition.x+200,idu3ErrorsPosition.y+200];
idu3Errors_PropSendNumber00.init(broadcastDeosHandle, "m_idu3_errorCode");
graph.add(idu3Errors_PropSendNumber00);

idu3Errors_LocalReadReg02.connect(0, idu3Errors_PropSendNumber00, 0);
//////////////////////////////////////////////////
//#endregion IDU3 ERRORS
//////////////////////////////////////////////////

let hydroErrorsPosition = {x:5650, y:1750};
//////////////////////////////////////////////////
//#region HYDRO ERRORS
//////////////////////////////////////////////////

//HYDRO CONNECTION

let hydroErrors_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
hydroErrors_LocalReadReg00.pos = [hydroErrorsPosition.x,hydroErrorsPosition.y];
hydroErrors_LocalReadReg00.init(database_BusReadAllTRG00, "S9:R10001");
graph.add(hydroErrors_LocalReadReg00);

let hydroErrors_Num2Bool00 = LiteGraph.createNode("Deos/Num2Bool");
hydroErrors_Num2Bool00.pos = [hydroErrorsPosition.x+200,hydroErrorsPosition.y];
graph.add(hydroErrors_Num2Bool00);

let hydroErrors_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
hydroErrors_PropSendBoolean00.pos = [hydroErrorsPosition.x+400,hydroErrorsPosition.y];
hydroErrors_PropSendBoolean00.init(broadcastDeosHandle, "m_hydro_connection");
graph.add(hydroErrors_PropSendBoolean00);

hydroErrors_LocalReadReg00.connect(0, hydroErrors_Num2Bool00, 0);
hydroErrors_Num2Bool00.connect(0, hydroErrors_PropSendBoolean00, 0);

//HYDRO ALARM

let hydroErrors_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
hydroErrors_LocalReadReg01.pos = [hydroErrorsPosition.x,hydroErrorsPosition.y+100];
hydroErrors_LocalReadReg01.init(database_BusReadAllTRG00, "S9:R10002");
graph.add(hydroErrors_LocalReadReg01);

let hydroErrors_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
hydroErrors_Num2Bool01.pos = [hydroErrorsPosition.x+200,hydroErrorsPosition.y+100];
graph.add(hydroErrors_Num2Bool01);

let hydroErrors_Not01 = LiteGraph.createNode("Deos/Not");
hydroErrors_Not01.pos = [hydroErrorsPosition.x+400,hydroErrorsPosition.y+100];
graph.add(hydroErrors_Not01);

let hydroErrors_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
hydroErrors_PropSendBoolean01.pos = [hydroErrorsPosition.x+560,hydroErrorsPosition.y+100];
hydroErrors_PropSendBoolean01.init(broadcastDeosHandle, "m_hydro_notAlarm");
graph.add(hydroErrors_PropSendBoolean01);

hydroErrors_LocalReadReg01.connect(0, hydroErrors_Num2Bool01, 0);
hydroErrors_Num2Bool01.connect(0, hydroErrors_Not01, 0);
hydroErrors_Not01.connect(0, hydroErrors_PropSendBoolean01, 0);

//HYDRO ERROR CODE

let hydroErrors_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
hydroErrors_LocalReadReg02.pos = [hydroErrorsPosition.x,hydroErrorsPosition.y+200];
hydroErrors_LocalReadReg02.init(database_BusReadAllTRG00, "S9:R30001");
graph.add(hydroErrors_LocalReadReg02);

let hydroErrors_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
hydroErrors_PropSendNumber00.pos = [hydroErrorsPosition.x+200,hydroErrorsPosition.y+200];
hydroErrors_PropSendNumber00.init(broadcastDeosHandle, "m_hydro_errorCode");
graph.add(hydroErrors_PropSendNumber00);

hydroErrors_LocalReadReg02.connect(0, hydroErrors_PropSendNumber00, 0);
//////////////////////////////////////////////////
//#endregion HYDRO ERRORS
//////////////////////////////////////////////////

let stratosErrorsPosition = {x:5650, y:2050};
//////////////////////////////////////////////////
//#region STRATOS ERRORS
//////////////////////////////////////////////////

let stratosErrors_Title00 = LiteGraph.createNode("Deos/Title");
stratosErrors_Title00.pos = [stratosErrorsPosition.x,stratosErrorsPosition.y+20];
stratosErrors_Title00.init("STRATOS ALARM, CODE INDICATION.", 800);
graph.add(stratosErrors_Title00);

//STRATOS ALARM

let stratosErrors_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
stratosErrors_LocalReadReg01.pos = [stratosErrorsPosition.x,stratosErrorsPosition.y+100];
stratosErrors_LocalReadReg01.init(database_BusReadAllTRG00, "S10:R30037");
graph.add(stratosErrors_LocalReadReg01);

let stratosErrors_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
stratosErrors_Num2Bool01.pos = [stratosErrorsPosition.x+200,stratosErrorsPosition.y+100];
graph.add(stratosErrors_Num2Bool01);

let stratosErrors_Not01 = LiteGraph.createNode("Deos/Not");
stratosErrors_Not01.pos = [stratosErrorsPosition.x+400,stratosErrorsPosition.y+100];
graph.add(stratosErrors_Not01);

let stratosErrors_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
stratosErrors_PropSendBoolean01.pos = [stratosErrorsPosition.x+560,stratosErrorsPosition.y+100];
stratosErrors_PropSendBoolean01.init(broadcastDeosHandle, "m_stratos_notAlarm");
graph.add(stratosErrors_PropSendBoolean01);

stratosErrors_LocalReadReg01.connect(0, stratosErrors_Num2Bool01, 0);
stratosErrors_Num2Bool01.connect(0, stratosErrors_Not01, 0);
stratosErrors_Not01.connect(0, stratosErrors_PropSendBoolean01, 0);

//STRATOS ERROR CODE

let stratosErrors_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
stratosErrors_LocalReadReg02.pos = [stratosErrorsPosition.x,stratosErrorsPosition.y+200];
stratosErrors_LocalReadReg02.init(database_BusReadAllTRG00, "S10:R30038");
graph.add(stratosErrors_LocalReadReg02);

let stratosErrors_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
stratosErrors_PropSendNumber00.pos = [stratosErrorsPosition.x+200,stratosErrorsPosition.y+200];
stratosErrors_PropSendNumber00.init(broadcastDeosHandle, "m_stratos_errorCode");
graph.add(stratosErrors_PropSendNumber00);

stratosErrors_LocalReadReg02.connect(0, stratosErrors_PropSendNumber00, 0);
//////////////////////////////////////////////////
//#endregion STRATOS ERRORS
//////////////////////////////////////////////////

let otherValuesPosition = {x:6550, y:850};
//////////////////////////////////////////////////
//#region OTHER VALUES
//////////////////////////////////////////////////
let otherValues_Title00V00 = LiteGraph.createNode("Deos/Title");
otherValues_Title00V00.pos = [otherValuesPosition.x,otherValuesPosition.y-80];
otherValues_Title00V00.init("ΛΟΙΠΕΣ ΤΙΜΕΣ MODBUS ΠΡΟΣ ΜΗΧΑΝΟΣΤΑΣΙΟ.", 800);
graph.add(otherValues_Title00V00);

//MHXANOSTASIO M4 (V00)

let otherValues_LocalReadReg00V00 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V00.pos = [otherValuesPosition.x,otherValuesPosition.y];
otherValues_LocalReadReg00V00.init(database_BusReadAllTRG00, "S10:R30319");
graph.add(otherValues_LocalReadReg00V00);

let otherValues_ConstNumber00V00 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V00.pos = [otherValuesPosition.x,otherValuesPosition.y+70];
otherValues_ConstNumber00V00.init(10);
graph.add(otherValues_ConstNumber00V00);

let otherValues_DivideNumber00V00 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V00.pos = [otherValuesPosition.x+200,otherValuesPosition.y];
graph.add(otherValues_DivideNumber00V00);

let otherValues_PropSendNumber00V00 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V00.pos = [otherValuesPosition.x+400,otherValuesPosition.y];
otherValues_PropSendNumber00V00.init(broadcastDeosHandle, "m_stratos_m4");
graph.add(otherValues_PropSendNumber00V00);

let zzz_PropSaveNumber00M04 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00M04.pos = [otherValuesPosition.x+400,otherValuesPosition.y+70];
zzz_PropSaveNumber00M04.init(g_broadcastDeosContainer, "g_alert_M04");
graph.add(zzz_PropSaveNumber00M04);
otherValues_DivideNumber00V00.connect(0, zzz_PropSaveNumber00M04, 0);

otherValues_LocalReadReg00V00.connect(0, otherValues_DivideNumber00V00, 0);
otherValues_ConstNumber00V00.connect(0, otherValues_DivideNumber00V00, 1);
otherValues_DivideNumber00V00.connect(0, otherValues_PropSendNumber00V00, 0);

//MHXANOSTASIO M0 (V01)
let yOffsetV01 = 200;

let otherValues_LocalReadReg00V01 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V01.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV01];
otherValues_LocalReadReg00V01.init(database_BusReadAllTRG00, "S9:R30005");
graph.add(otherValues_LocalReadReg00V01);

let otherValues_ConstNumber00V01 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V01.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV01];
otherValues_ConstNumber00V01.init(10);
graph.add(otherValues_ConstNumber00V01);

let otherValues_DivideNumber00V01 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V01.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV01];
graph.add(otherValues_DivideNumber00V01);

let otherValues_PropSendNumber00V01 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V01.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV01];
otherValues_PropSendNumber00V01.init(broadcastDeosHandle, "m_hydro_m0");
graph.add(otherValues_PropSendNumber00V01);

let zzz_PropSaveNumber00M00 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00M00.pos = [otherValuesPosition.x+400,otherValuesPosition.y+70+yOffsetV01];
zzz_PropSaveNumber00M00.init(g_broadcastDeosContainer, "g_alert_M00");
graph.add(zzz_PropSaveNumber00M00);
otherValues_DivideNumber00V01.connect(0, zzz_PropSaveNumber00M00, 0);

otherValues_LocalReadReg00V01.connect(0, otherValues_DivideNumber00V01, 0);
otherValues_ConstNumber00V01.connect(0, otherValues_DivideNumber00V01, 1);
otherValues_DivideNumber00V01.connect(0, otherValues_PropSendNumber00V01, 0);

//MHXANOSTASIO M1 (V02)
let yOffsetV02 = 400;

let otherValues_LocalReadReg00V02 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V02.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV02];
otherValues_LocalReadReg00V02.init(database_BusReadAllTRG00, "S9:R30002");
graph.add(otherValues_LocalReadReg00V02);

let otherValues_ConstNumber00V02 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V02.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV02];
otherValues_ConstNumber00V02.init(10);
graph.add(otherValues_ConstNumber00V02);

let otherValues_DivideNumber00V02 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V02.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV02];
graph.add(otherValues_DivideNumber00V02);

//Y_YPOGEIO
let ypogeio_PropSendNumber03 = LiteGraph.createNode("Deos/PropSendNumber");
ypogeio_PropSendNumber03.pos = [otherValuesPosition.x+400,otherValuesPosition.y-70+yOffsetV02];
ypogeio_PropSendNumber03.init(broadcastDeosHandle, "y_mhx_room_temp");
graph.add(ypogeio_PropSendNumber03);
otherValues_DivideNumber00V02.connect(0, ypogeio_PropSendNumber03, 0);

let otherValues_PropSendNumber00V02 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V02.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV02];
otherValues_PropSendNumber00V02.init(broadcastDeosHandle, "m_hydro_m1");
graph.add(otherValues_PropSendNumber00V02);

let zzz_PropSaveNumber00M01 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00M01.pos = [otherValuesPosition.x+400,otherValuesPosition.y+70+yOffsetV02];
zzz_PropSaveNumber00M01.init(g_broadcastDeosContainer, "g_alert_M01");
graph.add(zzz_PropSaveNumber00M01);
otherValues_DivideNumber00V02.connect(0, zzz_PropSaveNumber00M01, 0);

otherValues_LocalReadReg00V02.connect(0, otherValues_DivideNumber00V02, 0);
otherValues_ConstNumber00V02.connect(0, otherValues_DivideNumber00V02, 1);
otherValues_DivideNumber00V02.connect(0, otherValues_PropSendNumber00V02, 0);

//MHXANOSTASIO M2 (V03)
let yOffsetV03 = 600;

let otherValues_LocalReadReg00V03 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V03.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV03];
otherValues_LocalReadReg00V03.init(database_BusReadAllTRG00, "S9:R30003");
graph.add(otherValues_LocalReadReg00V03);

let otherValues_ConstNumber00V03 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V03.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV03];
otherValues_ConstNumber00V03.init(10);
graph.add(otherValues_ConstNumber00V03);

let otherValues_DivideNumber00V03 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V03.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV03];
graph.add(otherValues_DivideNumber00V03);

let otherValues_PropSendNumber00V03 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V03.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV03];
otherValues_PropSendNumber00V03.init(broadcastDeosHandle, "m_hydro_m2");
graph.add(otherValues_PropSendNumber00V03);

let zzz_PropSaveNumber00M02 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00M02.pos = [otherValuesPosition.x+400,otherValuesPosition.y+70+yOffsetV03];
zzz_PropSaveNumber00M02.init(g_broadcastDeosContainer, "g_alert_M02");
graph.add(zzz_PropSaveNumber00M02);
otherValues_DivideNumber00V03.connect(0, zzz_PropSaveNumber00M02, 0);

otherValues_LocalReadReg00V03.connect(0, otherValues_DivideNumber00V03, 0);
otherValues_ConstNumber00V03.connect(0, otherValues_DivideNumber00V03, 1);
otherValues_DivideNumber00V03.connect(0, otherValues_PropSendNumber00V03, 0);

//MHXANOSTASIO M3 (V04)
let yOffsetV04 = 800;

let otherValues_LocalReadReg00V04 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V04.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV04];
otherValues_LocalReadReg00V04.init(database_BusReadAllTRG00, "S9:R30004");
graph.add(otherValues_LocalReadReg00V04);

let otherValues_ConstNumber00V04 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V04.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV04];
otherValues_ConstNumber00V04.init(10);
graph.add(otherValues_ConstNumber00V04);

let otherValues_DivideNumber00V04 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V04.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV04];
graph.add(otherValues_DivideNumber00V04);

let otherValues_PropSendNumber00V04 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V04.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV04];
otherValues_PropSendNumber00V04.init(broadcastDeosHandle, "m_hydro_m3");
graph.add(otherValues_PropSendNumber00V04);

let zzz_PropSaveNumber00M03 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00M03.pos = [otherValuesPosition.x+400,otherValuesPosition.y+70+yOffsetV04];
zzz_PropSaveNumber00M03.init(g_broadcastDeosContainer, "g_alert_M03");
graph.add(zzz_PropSaveNumber00M03);
otherValues_DivideNumber00V04.connect(0, zzz_PropSaveNumber00M03, 0);

otherValues_LocalReadReg00V04.connect(0, otherValues_DivideNumber00V04, 0);
otherValues_ConstNumber00V04.connect(0, otherValues_DivideNumber00V04, 1);
otherValues_DivideNumber00V04.connect(0, otherValues_PropSendNumber00V04, 0);

//HYDRO CIRCULATOR (V05)
let yOffsetV05 = 1000;

let otherValues_LocalReadReg00V05 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V05.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV05];
otherValues_LocalReadReg00V05.init(database_BusReadAllTRG00, "S41:R126");
graph.add(otherValues_LocalReadReg00V05);

let otherValues_Num2Bool00V05 = LiteGraph.createNode("Deos/Num2Bool");
otherValues_Num2Bool00V05.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV05];
graph.add(otherValues_Num2Bool00V05);

let otherValues_Not00V05 = LiteGraph.createNode("Deos/Not");
otherValues_Not00V05.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV05];
graph.add(otherValues_Not00V05);

let otherValues_PropSendBoolean00V05 = LiteGraph.createNode("Deos/PropSendBoolean");
otherValues_PropSendBoolean00V05.pos = [otherValuesPosition.x+560,otherValuesPosition.y+yOffsetV05];
otherValues_PropSendBoolean00V05.init(broadcastDeosHandle, "m_hydro_circ");
graph.add(otherValues_PropSendBoolean00V05);

otherValues_LocalReadReg00V05.connect(0, otherValues_Num2Bool00V05, 0);
otherValues_Num2Bool00V05.connect(0, otherValues_Not00V05, 0);
otherValues_Not00V05.connect(0, otherValues_PropSendBoolean00V05, 0);

//MHXANOSTASIO T6 (V06)
let yOffsetV06 = 1100;

let otherValues_LocalReadReg00V06 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V06.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV06];
otherValues_LocalReadReg00V06.init(database_BusReadAllTRG00, "S41:R100");
graph.add(otherValues_LocalReadReg00V06);

let otherValues_ConstNumber00V06 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V06.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV06];
otherValues_ConstNumber00V06.init(10);
graph.add(otherValues_ConstNumber00V06);

let otherValues_DivideNumber00V06 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V06.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV06];
graph.add(otherValues_DivideNumber00V06);

let otherValues_PropSendNumber00V06 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V06.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV06];
otherValues_PropSendNumber00V06.init(broadcastDeosHandle, "m_temp_sensor_06");
graph.add(otherValues_PropSendNumber00V06);

let zzz_PropSaveNumber00T06 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T06.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV06+70];
zzz_PropSaveNumber00T06.init(g_broadcastDeosContainer, "g_alert_T06");
graph.add(zzz_PropSaveNumber00T06);
otherValues_DivideNumber00V06.connect(0, zzz_PropSaveNumber00T06, 0);

otherValues_LocalReadReg00V06.connect(0, otherValues_DivideNumber00V06, 0);
otherValues_ConstNumber00V06.connect(0, otherValues_DivideNumber00V06, 1);
otherValues_DivideNumber00V06.connect(0, otherValues_PropSendNumber00V06, 0);

//MHXANOSTASIO T7 (V07)
let yOffsetV07 = 1300;

let otherValues_LocalReadReg00V07 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V07.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV07];
otherValues_LocalReadReg00V07.init(database_BusReadAllTRG00, "S41:R101");
graph.add(otherValues_LocalReadReg00V07);

let otherValues_ConstNumber00V07 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V07.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV07];
otherValues_ConstNumber00V07.init(10);
graph.add(otherValues_ConstNumber00V07);

let otherValues_DivideNumber00V07 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V07.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV07];
graph.add(otherValues_DivideNumber00V07);

let otherValues_PropSendNumber00V07 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V07.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV07];
otherValues_PropSendNumber00V07.init(broadcastDeosHandle, "m_temp_sensor_07");
graph.add(otherValues_PropSendNumber00V07);

let zzz_PropSaveNumber00T07 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T07.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV07+70];
zzz_PropSaveNumber00T07.init(g_broadcastDeosContainer, "g_alert_T07");
graph.add(zzz_PropSaveNumber00T07);
otherValues_DivideNumber00V07.connect(0, zzz_PropSaveNumber00T07, 0);

otherValues_LocalReadReg00V07.connect(0, otherValues_DivideNumber00V07, 0);
otherValues_ConstNumber00V07.connect(0, otherValues_DivideNumber00V07, 1);
otherValues_DivideNumber00V07.connect(0, otherValues_PropSendNumber00V07, 0);

//MHXANOSTASIO T8 (V08)
let yOffsetV08 = 1500;

let otherValues_LocalReadReg00V08 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V08.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV08];
otherValues_LocalReadReg00V08.init(database_BusReadAllTRG00, "S41:R102");
graph.add(otherValues_LocalReadReg00V08);

let otherValues_ConstNumber00V08 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V08.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV08];
otherValues_ConstNumber00V08.init(10);
graph.add(otherValues_ConstNumber00V08);

let otherValues_DivideNumber00V08 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V08.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV08];
graph.add(otherValues_DivideNumber00V08);

let otherValues_PropSendNumber00V08 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V08.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV08];
otherValues_PropSendNumber00V08.init(broadcastDeosHandle, "m_temp_sensor_08");
graph.add(otherValues_PropSendNumber00V08);

let zzz_PropSaveNumber00T08 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T08.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV08+70];
zzz_PropSaveNumber00T08.init(g_broadcastDeosContainer, "g_alert_T08");
graph.add(zzz_PropSaveNumber00T08);
otherValues_DivideNumber00V08.connect(0, zzz_PropSaveNumber00T08, 0);

otherValues_LocalReadReg00V08.connect(0, otherValues_DivideNumber00V08, 0);
otherValues_ConstNumber00V08.connect(0, otherValues_DivideNumber00V08, 1);
otherValues_DivideNumber00V08.connect(0, otherValues_PropSendNumber00V08, 0);

//MHXANOSTASIO T9 (V09)
let yOffsetV09 = 1700;

let otherValues_LocalReadReg00V09 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V09.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV09];
otherValues_LocalReadReg00V09.init(database_BusReadAllTRG00, "S41:R103");
graph.add(otherValues_LocalReadReg00V09);

let otherValues_ConstNumber00V09 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V09.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV09];
otherValues_ConstNumber00V09.init(10);
graph.add(otherValues_ConstNumber00V09);

let otherValues_DivideNumber00V09 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V09.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV09];
graph.add(otherValues_DivideNumber00V09);

let otherValues_PropSendNumber00V09 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V09.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV09];
otherValues_PropSendNumber00V09.init(broadcastDeosHandle, "m_temp_sensor_09");
graph.add(otherValues_PropSendNumber00V09);

let zzz_PropSaveNumber00T09 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T09.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV09+70];
zzz_PropSaveNumber00T09.init(g_broadcastDeosContainer, "g_alert_T09");
graph.add(zzz_PropSaveNumber00T09);
otherValues_DivideNumber00V09.connect(0, zzz_PropSaveNumber00T09, 0);

otherValues_LocalReadReg00V09.connect(0, otherValues_DivideNumber00V09, 0);
otherValues_ConstNumber00V09.connect(0, otherValues_DivideNumber00V09, 1);
otherValues_DivideNumber00V09.connect(0, otherValues_PropSendNumber00V09, 0);

//MHXANOSTASIO T10 (V10)
let yOffsetV10 = 1900;

let otherValues_LocalReadReg00V10 = LiteGraph.createNode("Deos/LocalReadReg");
otherValues_LocalReadReg00V10.pos = [otherValuesPosition.x,otherValuesPosition.y+yOffsetV10];
otherValues_LocalReadReg00V10.init(database_BusReadAllTRG00, "S41:R104");
graph.add(otherValues_LocalReadReg00V10);

let otherValues_ConstNumber00V10 = LiteGraph.createNode("Deos/ConstNumber");
otherValues_ConstNumber00V10.pos = [otherValuesPosition.x,otherValuesPosition.y+70+yOffsetV10];
otherValues_ConstNumber00V10.init(10);
graph.add(otherValues_ConstNumber00V10);

let otherValues_DivideNumber00V10 = LiteGraph.createNode("Deos/DivideNumber");
otherValues_DivideNumber00V10.pos = [otherValuesPosition.x+200,otherValuesPosition.y+yOffsetV10];
graph.add(otherValues_DivideNumber00V10);

let otherValues_PropSendNumber00V10 = LiteGraph.createNode("Deos/PropSendNumber");
otherValues_PropSendNumber00V10.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV10];
otherValues_PropSendNumber00V10.init(broadcastDeosHandle, "m_temp_sensor_10");
graph.add(otherValues_PropSendNumber00V10);

let zzz_PropSaveNumber00T10 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T10.pos = [otherValuesPosition.x+400,otherValuesPosition.y+yOffsetV10+70];
zzz_PropSaveNumber00T10.init(g_broadcastDeosContainer, "g_alert_T10");
graph.add(zzz_PropSaveNumber00T10);
otherValues_DivideNumber00V10.connect(0, zzz_PropSaveNumber00T10, 0);

otherValues_LocalReadReg00V10.connect(0, otherValues_DivideNumber00V10, 0);
otherValues_ConstNumber00V10.connect(0, otherValues_DivideNumber00V10, 1);
otherValues_DivideNumber00V10.connect(0, otherValues_PropSendNumber00V10, 0);
//////////////////////////////////////////////////
//#endregion OTHER VALUES
//////////////////////////////////////////////////

let stratosValuesPosition = {x:7450, y:850};
//////////////////////////////////////////////////
//#region STRATOS VALUES
//////////////////////////////////////////////////
let stratosValues_Title00V00 = LiteGraph.createNode("Deos/Title");
stratosValues_Title00V00.pos = [stratosValuesPosition.x,stratosValuesPosition.y-80];
stratosValues_Title00V00.init("STRATOS - ΤΙΜΕΣ MODBUS ΠΡΟΣ ΠΙΝΑΚΑ ΣΤΟ ΜΗΧΑΝΟΣΤΑΣΙΟ.", 800);
graph.add(stratosValues_Title00V00);

//MHXANOSTASIO VOLTS
let offsetY_V00 = 0;

let stratosValues_LocalReadReg00V00 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V00.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V00];
stratosValues_LocalReadReg00V00.init(database_BusReadAllTRG00, "S10:R30321");
graph.add(stratosValues_LocalReadReg00V00);

let stratosValues_ConstNumber00V00 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V00.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V00];
stratosValues_ConstNumber00V00.init(10);
graph.add(stratosValues_ConstNumber00V00);

let stratosValues_DivideNumber00V00 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V00.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V00];
graph.add(stratosValues_DivideNumber00V00);

let stratosValues_PropSendNumber00V00 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V00.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V00];
stratosValues_PropSendNumber00V00.init(broadcastDeosHandle, "m_stratos_volts");
graph.add(stratosValues_PropSendNumber00V00);

stratosValues_LocalReadReg00V00.connect(0, stratosValues_DivideNumber00V00, 0);
stratosValues_ConstNumber00V00.connect(0, stratosValues_DivideNumber00V00, 1);
stratosValues_DivideNumber00V00.connect(0, stratosValues_PropSendNumber00V00, 0);

//MHXANOSTASIO AMPS
let offsetY_V01 = 200;

let stratosValues_LocalReadReg00V01 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V01.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V01];
stratosValues_LocalReadReg00V01.init(database_BusReadAllTRG00, "S10:R30007");
graph.add(stratosValues_LocalReadReg00V01);

let stratosValues_ConstNumber00V01 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V01.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V01];
stratosValues_ConstNumber00V01.init(10);
graph.add(stratosValues_ConstNumber00V01);

let stratosValues_DivideNumber00V01 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V01.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V01];
graph.add(stratosValues_DivideNumber00V01);

let stratosValues_PropSendNumber00V01 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V01.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V01];
stratosValues_PropSendNumber00V01.init(broadcastDeosHandle, "m_stratos_amps");
graph.add(stratosValues_PropSendNumber00V01);

stratosValues_LocalReadReg00V01.connect(0, stratosValues_DivideNumber00V01, 0);
stratosValues_ConstNumber00V01.connect(0, stratosValues_DivideNumber00V01, 1);
stratosValues_DivideNumber00V01.connect(0, stratosValues_PropSendNumber00V01, 0);

//MHXANOSTASIO KW
let offsetY_V02 = 400;

let stratosValues_LocalReadReg00V02 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V02.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V02];
stratosValues_LocalReadReg00V02.init(database_BusReadAllTRG00, "S10:R30301");
graph.add(stratosValues_LocalReadReg00V02);

let stratosValues_ConstNumber00V02 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V02.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V02];
stratosValues_ConstNumber00V02.init(1000);
graph.add(stratosValues_ConstNumber00V02);

let stratosValues_DivideNumber00V02 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V02.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V02];
graph.add(stratosValues_DivideNumber00V02);

let stratosValues_PropSendNumber00V02 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V02.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V02];
stratosValues_PropSendNumber00V02.init(broadcastDeosHandle, "m_stratos_kw");
graph.add(stratosValues_PropSendNumber00V02);

stratosValues_LocalReadReg00V02.connect(0, stratosValues_DivideNumber00V02, 0);
stratosValues_ConstNumber00V02.connect(0, stratosValues_DivideNumber00V02, 1);
stratosValues_DivideNumber00V02.connect(0, stratosValues_PropSendNumber00V02, 0);

//MHXANOSTASIO KWH
let offsetY_V03 = 600;

let stratosValues_LocalReadReg00V03 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V03.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V03];
stratosValues_LocalReadReg00V03.init(database_BusReadAllTRG00, "S10:R30313");
graph.add(stratosValues_LocalReadReg00V03);

let stratosValues_ConstNumber00V03 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V03.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V03];
stratosValues_ConstNumber00V03.init(1);
graph.add(stratosValues_ConstNumber00V03);

let stratosValues_DivideNumber00V03 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V03.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V03];
graph.add(stratosValues_DivideNumber00V03);

let stratosValues_PropSendNumber00V03 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V03.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V03];
stratosValues_PropSendNumber00V03.init(broadcastDeosHandle, "m_stratos_kwh");
graph.add(stratosValues_PropSendNumber00V03);

stratosValues_LocalReadReg00V03.connect(0, stratosValues_DivideNumber00V03, 0);
stratosValues_ConstNumber00V03.connect(0, stratosValues_DivideNumber00V03, 1);
stratosValues_DivideNumber00V03.connect(0, stratosValues_PropSendNumber00V03, 0);

//MHXANOSTASIO M
let offsetY_V04 = 800;

let stratosValues_LocalReadReg00V04 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V04.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V04];
stratosValues_LocalReadReg00V04.init(database_BusReadAllTRG00, "S10:R30002");
graph.add(stratosValues_LocalReadReg00V04);

let stratosValues_ConstNumber00V04 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V04.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V04];
stratosValues_ConstNumber00V04.init(10);
graph.add(stratosValues_ConstNumber00V04);

let stratosValues_DivideNumber00V04 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V04.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V04];
graph.add(stratosValues_DivideNumber00V04);

let stratosValues_PropSendNumber00V04 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V04.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V04];
stratosValues_PropSendNumber00V04.init(broadcastDeosHandle, "m_stratos_m");
graph.add(stratosValues_PropSendNumber00V04);

stratosValues_LocalReadReg00V04.connect(0, stratosValues_DivideNumber00V04, 0);
stratosValues_ConstNumber00V04.connect(0, stratosValues_DivideNumber00V04, 1);
stratosValues_DivideNumber00V04.connect(0, stratosValues_PropSendNumber00V04, 0);

//MHXANOSTASIO M3H
let offsetY_V05 = 1000;

let stratosValues_LocalReadReg00V05 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V05.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V05];
stratosValues_LocalReadReg00V05.init(database_BusReadAllTRG00, "S10:R30003");
graph.add(stratosValues_LocalReadReg00V05);

let stratosValues_ConstNumber00V05 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V05.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V05];
stratosValues_ConstNumber00V05.init(10);
graph.add(stratosValues_ConstNumber00V05);

let stratosValues_DivideNumber00V05 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V05.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V05];
graph.add(stratosValues_DivideNumber00V05);

let stratosValues_PropSendNumber00V05 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V05.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V05];
stratosValues_PropSendNumber00V05.init(broadcastDeosHandle, "m_stratos_m3h");
graph.add(stratosValues_PropSendNumber00V05);

stratosValues_LocalReadReg00V05.connect(0, stratosValues_DivideNumber00V05, 0);
stratosValues_ConstNumber00V05.connect(0, stratosValues_DivideNumber00V05, 1);
stratosValues_DivideNumber00V05.connect(0, stratosValues_PropSendNumber00V05, 0);

//MHXANOSTASIO TEMPFORW
let offsetY_V06 = 1200;

let stratosValues_LocalReadReg00V06 = LiteGraph.createNode("Deos/LocalReadReg");
stratosValues_LocalReadReg00V06.pos = [stratosValuesPosition.x,stratosValuesPosition.y+offsetY_V06];
stratosValues_LocalReadReg00V06.init(database_BusReadAllTRG00, "S10:R30009");
graph.add(stratosValues_LocalReadReg00V06);

let stratosValues_ConstNumber00V06 = LiteGraph.createNode("Deos/ConstNumber");
stratosValues_ConstNumber00V06.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+offsetY_V06];
stratosValues_ConstNumber00V06.init(10);
graph.add(stratosValues_ConstNumber00V06);

let stratosValues_DivideNumber00V06 = LiteGraph.createNode("Deos/DivideNumber");
stratosValues_DivideNumber00V06.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+offsetY_V06];
graph.add(stratosValues_DivideNumber00V06);

let stratosValues_PropSendNumber00V06 = LiteGraph.createNode("Deos/PropSendNumber");
stratosValues_PropSendNumber00V06.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+offsetY_V06];
stratosValues_PropSendNumber00V06.init(broadcastDeosHandle, "m_stratos_tempforw");
graph.add(stratosValues_PropSendNumber00V06);

stratosValues_LocalReadReg00V06.connect(0, stratosValues_DivideNumber00V06, 0);
stratosValues_ConstNumber00V06.connect(0, stratosValues_DivideNumber00V06, 1);
stratosValues_DivideNumber00V06.connect(0, stratosValues_PropSendNumber00V06, 0);







//MHXANOSTASIO M0 (V01)

// let stratosValues_LocalReadReg00V01 = LiteGraph.createNode("Deos/LocalReadReg");
// stratosValues_LocalReadReg00V01.pos = [stratosValuesPosition.x,stratosValuesPosition.y+yOffsetV01];
// stratosValues_LocalReadReg00V01.init(database_BusReadAllTRG00, "S9:R30005");
// graph.add(stratosValues_LocalReadReg00V01);

// let stratosValues_ConstNumber00V01 = LiteGraph.createNode("Deos/ConstNumber");
// stratosValues_ConstNumber00V01.pos = [stratosValuesPosition.x,stratosValuesPosition.y+70+yOffsetV01];
// stratosValues_ConstNumber00V01.init(10);
// graph.add(stratosValues_ConstNumber00V01);

// let stratosValues_DivideNumber00V01 = LiteGraph.createNode("Deos/DivideNumber");
// stratosValues_DivideNumber00V01.pos = [stratosValuesPosition.x+200,stratosValuesPosition.y+yOffsetV01];
// graph.add(stratosValues_DivideNumber00V01);

// let stratosValues_PropSendNumber00V01 = LiteGraph.createNode("Deos/PropSendNumber");
// stratosValues_PropSendNumber00V01.pos = [stratosValuesPosition.x+400,stratosValuesPosition.y+yOffsetV01];
// stratosValues_PropSendNumber00V01.init(broadcastDeosHandle, "m_hydro_m0");
// graph.add(stratosValues_PropSendNumber00V01);

// stratosValues_LocalReadReg00V01.connect(0, stratosValues_DivideNumber00V01, 0);
// stratosValues_ConstNumber00V01.connect(0, stratosValues_DivideNumber00V01, 1);
// stratosValues_DivideNumber00V01.connect(0, stratosValues_PropSendNumber00V01, 0);




//////////////////////////////////////////////////
//#endregion STRATOS VALUES
//////////////////////////////////////////////////

let humidPosition = {x:7450, y:2350};
//////////////////////////////////////////////////
//#region HUMIDITY YPOGEIO VALUES
//////////////////////////////////////////////////
let humid_Title00V00 = LiteGraph.createNode("Deos/Title");
humid_Title00V00.pos = [humidPosition.x,humidPosition.y-80];
humid_Title00V00.init("REGELTECHNIK - ΤΙΜΕΣ ΥΓΡΑΣΙΑΣ ΠΡΟΣ ΠΙΝΑΚΑΚΙ ΚΑΙ ΣΤΡΟΓΓΥΛΑ ΣΤΟ ΥΠΟΓΕΙΟ.", 800);
graph.add(humid_Title00V00);

//HUMID V00
let humid_OffsetY_V00 = 0;

let humid_LocalReadReg00V00 = LiteGraph.createNode("Deos/LocalReadReg");
humid_LocalReadReg00V00.pos = [humidPosition.x,humidPosition.y+humid_OffsetY_V00];
humid_LocalReadReg00V00.init(database_BusReadAllTRG00, "S30:R50");
graph.add(humid_LocalReadReg00V00);

let humid_ConstNumber00V00 = LiteGraph.createNode("Deos/ConstNumber");
humid_ConstNumber00V00.pos = [humidPosition.x,humidPosition.y+70+humid_OffsetY_V00];
humid_ConstNumber00V00.init(200);
graph.add(humid_ConstNumber00V00);

let humid_DivideNumber00V00 = LiteGraph.createNode("Deos/DivideNumber");
humid_DivideNumber00V00.pos = [humidPosition.x+200,humidPosition.y+humid_OffsetY_V00];
graph.add(humid_DivideNumber00V00);

let humid_PropSendNumber00V00 = LiteGraph.createNode("Deos/PropSendNumber");
humid_PropSendNumber00V00.pos = [humidPosition.x+400,humidPosition.y+humid_OffsetY_V00];
humid_PropSendNumber00V00.init(broadcastDeosHandle, "y_ypn_humid");
graph.add(humid_PropSendNumber00V00);

humid_LocalReadReg00V00.connect(0, humid_DivideNumber00V00, 0);
humid_ConstNumber00V00.connect(0, humid_DivideNumber00V00, 1);
humid_DivideNumber00V00.connect(0, humid_PropSendNumber00V00, 0);

//HUMID V01
let humid_OffsetY_V01 = 200;

let humid_LocalReadReg00V01 = LiteGraph.createNode("Deos/LocalReadReg");
humid_LocalReadReg00V01.pos = [humidPosition.x,humidPosition.y+humid_OffsetY_V01];
humid_LocalReadReg00V01.init(database_BusReadAllTRG00, "S31:R50");
graph.add(humid_LocalReadReg00V01);

let humid_ConstNumber00V01 = LiteGraph.createNode("Deos/ConstNumber");
humid_ConstNumber00V01.pos = [humidPosition.x,humidPosition.y+70+humid_OffsetY_V01];
humid_ConstNumber00V01.init(200);
graph.add(humid_ConstNumber00V01);

let humid_DivideNumber00V01 = LiteGraph.createNode("Deos/DivideNumber");
humid_DivideNumber00V01.pos = [humidPosition.x+200,humidPosition.y+humid_OffsetY_V01];
graph.add(humid_DivideNumber00V01);

let humid_PropSendNumber00V01 = LiteGraph.createNode("Deos/PropSendNumber");
humid_PropSendNumber00V01.pos = [humidPosition.x+400,humidPosition.y+humid_OffsetY_V01];
humid_PropSendNumber00V01.init(broadcastDeosHandle, "y_gra_humid");
graph.add(humid_PropSendNumber00V01);

humid_LocalReadReg00V01.connect(0, humid_DivideNumber00V01, 0);
humid_ConstNumber00V01.connect(0, humid_DivideNumber00V01, 1);
humid_DivideNumber00V01.connect(0, humid_PropSendNumber00V01, 0);

//HUMID V02
let humid_OffsetY_V02 = 400;

let humid_LocalReadReg00V02 = LiteGraph.createNode("Deos/LocalReadReg");
humid_LocalReadReg00V02.pos = [humidPosition.x,humidPosition.y+humid_OffsetY_V02];
humid_LocalReadReg00V02.init(database_BusReadAllTRG00, "S32:R50");
graph.add(humid_LocalReadReg00V02);

let humid_ConstNumber00V02 = LiteGraph.createNode("Deos/ConstNumber");
humid_ConstNumber00V02.pos = [humidPosition.x,humidPosition.y+70+humid_OffsetY_V02];
humid_ConstNumber00V02.init(200);
graph.add(humid_ConstNumber00V02);

let humid_DivideNumber00V02 = LiteGraph.createNode("Deos/DivideNumber");
humid_DivideNumber00V02.pos = [humidPosition.x+200,humidPosition.y+humid_OffsetY_V02];
graph.add(humid_DivideNumber00V02);

let humid_PropSendNumber00V02 = LiteGraph.createNode("Deos/PropSendNumber");
humid_PropSendNumber00V02.pos = [humidPosition.x+400,humidPosition.y+humid_OffsetY_V02];
humid_PropSendNumber00V02.init(broadcastDeosHandle, "y_kou_humid");
graph.add(humid_PropSendNumber00V02);

humid_LocalReadReg00V02.connect(0, humid_DivideNumber00V02, 0);
humid_ConstNumber00V02.connect(0, humid_DivideNumber00V02, 1);
humid_DivideNumber00V02.connect(0, humid_PropSendNumber00V02, 0);
//////////////////////////////////////////////////
//#endregion HUMIDITY YPOGEIO VALUES
//////////////////////////////////////////////////

let dhwPosition = {x:7150, y:-110};
let dhwPropPosition = {x:7150, y:400};
//////////////////////////////////////////////////
//#region DHW AND PROPERTIES
//////////////////////////////////////////////////
let dhw_Title00 = LiteGraph.createNode("Deos/Title");
dhw_Title00.pos = [dhwPosition.x,dhwPosition.y-160];
dhw_Title00.init("DHW MHXANOSTASIO BUTTON FOR ON/OFF. <m_dhw_btn_enable> to BUS WRITE 1, <m_dhw_btn_disable> to BUS WRITE 0 AND INSTANT OR INTERVAL READ", 1200);
graph.add(dhw_Title00);

// FIRST BUTTON

let dhw_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
dhw_ConstNumber00.pos = [dhwPosition.x,dhwPosition.y];
dhw_ConstNumber00.init(1);
graph.add(dhw_ConstNumber00);

let dhw_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
dhw_ButtonTRG00.pos = [dhwPosition.x,dhwPosition.y+100];
dhw_ButtonTRG00.init(g_broadcastDeosContainer, "m_dhw_btn_enable");
graph.add(dhw_ButtonTRG00);

let dhw_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
dhw_BusWriteTRG00.pos = [dhwPosition.x+200,dhwPosition.y];
dhw_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "2");
graph.add(dhw_BusWriteTRG00);

dhw_ConstNumber00.connect(0, dhw_BusWriteTRG00, 0);
dhw_ButtonTRG00.connect(0, dhw_BusWriteTRG00, 1);

let dhw_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
dhw_ConstNumber01.pos = [dhwPosition.x,dhwPosition.y+200];
dhw_ConstNumber01.init(0);
graph.add(dhw_ConstNumber01);

let dhw_ButtonTRG01 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
dhw_ButtonTRG01.pos = [dhwPosition.x,dhwPosition.y+300];
dhw_ButtonTRG01.init(g_broadcastDeosContainer, "m_dhw_btn_disable");
graph.add(dhw_ButtonTRG01);

let dhw_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
dhw_BusWriteTRG01.pos = [dhwPosition.x+200,dhwPosition.y+200];
dhw_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "2");
graph.add(dhw_BusWriteTRG01);

dhw_ConstNumber01.connect(0, dhw_BusWriteTRG01, 0);
dhw_ButtonTRG01.connect(0, dhw_BusWriteTRG01, 1);

let dhw_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
dhw_TickReceiverTRG00.pos = [dhwPosition.x+220,dhwPosition.y-80];
graph.add(dhw_TickReceiverTRG00);

let dhw_OrTrigger3TRG00 = LiteGraph.createNode("DeosTrigger/OrTrigger3TRG");
dhw_OrTrigger3TRG00.pos = [dhwPosition.x+400,dhwPosition.y];
graph.add(dhw_OrTrigger3TRG00);

let dhw_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
dhw_BusReadTRG00.pos = [dhwPosition.x+600,dhwPosition.y];
dhw_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "2");
graph.add(dhw_BusReadTRG00);

let dhw_Num2BoolTRG00 = LiteGraph.createNode("DeosTrigger/Num2BoolTRG");
dhw_Num2BoolTRG00.pos = [dhwPosition.x+800,dhwPosition.y];
graph.add(dhw_Num2BoolTRG00);

let dhw_PropSendBooleanTRG00 = LiteGraph.createNode("DeosTrigger/PropSendBooleanTRG");
dhw_PropSendBooleanTRG00.pos = [dhwPosition.x+1000,dhwPosition.y];
dhw_PropSendBooleanTRG00.init(broadcastDeosHandle, "m_dhwOn_bool"); //CHANGE
graph.add(dhw_PropSendBooleanTRG00);

dhw_TickReceiverTRG00.connect(0, dhw_OrTrigger3TRG00, 0);
dhw_BusWriteTRG00.connect(0, dhw_OrTrigger3TRG00, 1);
dhw_BusWriteTRG01.connect(0, dhw_OrTrigger3TRG00, 2);

dhw_OrTrigger3TRG00.connect(0, dhw_BusReadTRG00, 0);
dhw_BusReadTRG00.connect(0, dhw_Num2BoolTRG00, 0);
dhw_BusReadTRG00.connect(1, dhw_Num2BoolTRG00, 1);
dhw_Num2BoolTRG00.connect(0, dhw_PropSendBooleanTRG00, 0);
dhw_Num2BoolTRG00.connect(1, dhw_PropSendBooleanTRG00, 1);

// DHW SETPOINT ΑΠΟΣΤΟΛΗ ΣΕ HYDRO ΑΠΟ PROPERTIES

let dhwProp_Title00 = LiteGraph.createNode("Deos/Title");
dhwProp_Title00.pos = [dhwPropPosition.x,dhwPropPosition.y-80];
dhwProp_Title00.init("DHW SETPOINT TO HYDRO - Interval write DHW setpoint (p_dhw_hydro_SP) from properties to HYDRO <40002>.", 800);
graph.add(dhwProp_Title00);

let dhwProp_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
dhwProp_TickReceiverTRG00.pos = [dhwPropPosition.x+420,dhwPropPosition.y+120];
graph.add(dhwProp_TickReceiverTRG00);

let dhwProp_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
dhwProp_PropReadNumber00.pos = [dhwPropPosition.x,dhwPropPosition.y];
dhwProp_PropReadNumber00.init(g_broadcastDeosContainer, "p_dhw_hydro_SP");
graph.add(dhwProp_PropReadNumber00);

let dhwProp_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
dhwProp_ConstNumber00.pos = [dhwPropPosition.x,dhwPropPosition.y+70];
dhwProp_ConstNumber00.init("10");
graph.add(dhwProp_ConstNumber00);

let dhwProp_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
dhwProp_MultiplyNumber00.pos = [dhwPropPosition.x+200,dhwPropPosition.y];
graph.add(dhwProp_MultiplyNumber00);

let dhwProp_ConstNumber00sp = LiteGraph.createNode("Deos/ConstNumber");
dhwProp_ConstNumber00sp.pos = [dhwPropPosition.x+200,dhwPropPosition.y+100];
dhwProp_ConstNumber00sp.init(300);
graph.add(dhwProp_ConstNumber00sp);

let dhwProp_ConstNumber01sp = LiteGraph.createNode("Deos/ConstNumber");
dhwProp_ConstNumber01sp.pos = [dhwPropPosition.x+200,dhwPropPosition.y+200];
dhwProp_ConstNumber01sp.init(500);
graph.add(dhwProp_ConstNumber01sp);

let dhwProp_ClampMinMax00sp = LiteGraph.createNode("Deos/ClampMinMax");
dhwProp_ClampMinMax00sp.pos = [dhwPropPosition.x+400,dhwPropPosition.y];
graph.add(dhwProp_ClampMinMax00sp);

let dhwProp_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
dhwProp_BusWriteTRG00.pos = [dhwPropPosition.x+600,dhwPropPosition.y];
dhwProp_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "9", "40002");
graph.add(dhwProp_BusWriteTRG00);

dhwProp_PropReadNumber00.connect(0, dhwProp_MultiplyNumber00, 0);
dhwProp_ConstNumber00.connect(0, dhwProp_MultiplyNumber00, 1);

dhwProp_MultiplyNumber00.connect(0, dhwProp_ClampMinMax00sp, 0);
dhwProp_ConstNumber00sp.connect(0, dhwProp_ClampMinMax00sp, 1);
dhwProp_ConstNumber01sp.connect(0, dhwProp_ClampMinMax00sp, 2);

dhwProp_ClampMinMax00sp.connect(0, dhwProp_BusWriteTRG00, 0);
dhwProp_TickReceiverTRG00.connect(0, dhwProp_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion DHW AND PROPERTIES
//////////////////////////////////////////////////

let pinakesPosition = {x:8550, y:-750};
//////////////////////////////////////////////////
//#region MHXANOSTASIO PINAKES
//////////////////////////////////////////////////
let pinakes_Title00V00 = LiteGraph.createNode("Deos/Title");
pinakes_Title00V00.pos = [pinakesPosition.x,pinakesPosition.y-80];
pinakes_Title00V00.init("ΕΠΑΦΕΣ MODBUS ΠΡΟΣ ΠΙΝΑΚΕΣ 1,2,3 ΜΗΧΑΝΟΣΤΑΣΙΟΥ.", 800);
graph.add(pinakes_Title00V00);

//////////////////////////////////////////////////
//PINAKAS 1
//////////////////////////////////////////////////
let pinakas01Y = 0;

// PINAKAS VI5
let pinakes_yOffsetVI5 = 0;

let pinakes_LocalReadReg00VI5 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI5.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI5+pinakas01Y];
pinakes_LocalReadReg00VI5.init(database_BusReadAllTRG00, "S41:R108");
graph.add(pinakes_LocalReadReg00VI5);

let pinakes_Num2Bool00VI5 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI5.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI5+pinakas01Y];
graph.add(pinakes_Num2Bool00VI5);

let pinakes_Not00VI5 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI5.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI5+pinakas01Y];
graph.add(pinakes_Not00VI5);

let pinakes_PropSendBoolean00VI5 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI5.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI5+pinakas01Y];
pinakes_PropSendBoolean00VI5.init(broadcastDeosHandle, "m_pinak_i5");
graph.add(pinakes_PropSendBoolean00VI5);

pinakes_LocalReadReg00VI5.connect(0, pinakes_Num2Bool00VI5, 0);
pinakes_Num2Bool00VI5.connect(0, pinakes_Not00VI5, 0);
pinakes_Not00VI5.connect(0, pinakes_PropSendBoolean00VI5, 0);

// PINAKAS VI19
let pinakes_yOffsetVI19 = 100;

let pinakes_LocalReadReg00VI19 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI19.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI19+pinakas01Y];
pinakes_LocalReadReg00VI19.init(database_BusReadAllTRG00, "S41:R122");
graph.add(pinakes_LocalReadReg00VI19);

let pinakes_Num2Bool00VI19 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI19.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI19+pinakas01Y];
graph.add(pinakes_Num2Bool00VI19);

let pinakes_Not00VI19 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI19.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI19+pinakas01Y];
graph.add(pinakes_Not00VI19);

let pinakes_PropSendBoolean00VI19 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI19.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI19+pinakas01Y];
pinakes_PropSendBoolean00VI19.init(broadcastDeosHandle, "m_pinak_i19");
graph.add(pinakes_PropSendBoolean00VI19);

pinakes_LocalReadReg00VI19.connect(0, pinakes_Num2Bool00VI19, 0);
pinakes_Num2Bool00VI19.connect(0, pinakes_Not00VI19, 0);
pinakes_Not00VI19.connect(0, pinakes_PropSendBoolean00VI19, 0);

// PINAKAS VI36
let pinakes_yOffsetVI36 = 200;

let pinakes_LocalReadReg00VI36 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI36.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI36+pinakas01Y];
pinakes_LocalReadReg00VI36.init(database_BusReadAllTRG00, "S40:R108");
graph.add(pinakes_LocalReadReg00VI36);

let pinakes_ExpandBits00VI36 = LiteGraph.createNode("Deos/ExpandBits");
pinakes_ExpandBits00VI36.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI36+pinakas01Y];
graph.add(pinakes_ExpandBits00VI36);

let pinakes_Not00VI36 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI36.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI36+pinakas01Y];
graph.add(pinakes_Not00VI36);

let pinakes_PropSendBoolean00VI36 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI36.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI36+pinakas01Y];
pinakes_PropSendBoolean00VI36.init(broadcastDeosHandle, "m_pinak_i36");
graph.add(pinakes_PropSendBoolean00VI36);

pinakes_LocalReadReg00VI36.connect(0, pinakes_ExpandBits00VI36, 0);

// PINAKAS VI0
let pinakes_yOffsetVI0 = 300;

let pinakes_Not00VI0 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI0.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI0+pinakas01Y];
graph.add(pinakes_Not00VI0);

let pinakes_PropSendBoolean00VI0 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI0.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI0+pinakas01Y];
pinakes_PropSendBoolean00VI0.init(broadcastDeosHandle, "m_pinak_i0");
graph.add(pinakes_PropSendBoolean00VI0);

// PINAKAS VI1
let pinakes_yOffsetVI1 = 400;

let pinakes_Not00VI1 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI1.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI1+pinakas01Y];
graph.add(pinakes_Not00VI1);

let pinakes_PropSendBoolean00VI1 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI1.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI1+pinakas01Y];
pinakes_PropSendBoolean00VI1.init(broadcastDeosHandle, "m_pinak_i1");
graph.add(pinakes_PropSendBoolean00VI1);

// PINAKAS VI2
let pinakes_yOffsetVI2 = 500;

let pinakes_Not00VI2 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI2.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI2+pinakas01Y];
graph.add(pinakes_Not00VI2);

let pinakes_PropSendBoolean00VI2 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI2.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI2+pinakas01Y];
pinakes_PropSendBoolean00VI2.init(broadcastDeosHandle, "m_pinak_i2");
graph.add(pinakes_PropSendBoolean00VI2);

// PINAKAS VI3
let pinakes_yOffsetVI3 = 600;

let pinakes_Not00VI3 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI3.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI3+pinakas01Y];
graph.add(pinakes_Not00VI3);

let pinakes_PropSendBoolean00VI3 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI3.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI3+pinakas01Y];
pinakes_PropSendBoolean00VI3.init(broadcastDeosHandle, "m_pinak_i3");
graph.add(pinakes_PropSendBoolean00VI3);

// PINAKAS VI4
let pinakes_yOffsetVI4 = 700;

let pinakes_Not00VI4 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI4.pos = [pinakesPosition.x+500,pinakesPosition.y+pinakes_yOffsetVI4+pinakas01Y];
graph.add(pinakes_Not00VI4);

let pinakes_PropSendBoolean00VI4 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI4.pos = [pinakesPosition.x+660,pinakesPosition.y+pinakes_yOffsetVI4+pinakas01Y];
pinakes_PropSendBoolean00VI4.init(broadcastDeosHandle, "m_pinak_i4");
graph.add(pinakes_PropSendBoolean00VI4);

pinakes_ExpandBits00VI36.connect(0, pinakes_Not00VI36, 0);
pinakes_ExpandBits00VI36.connect(1, pinakes_Not00VI0, 0);
pinakes_ExpandBits00VI36.connect(2, pinakes_Not00VI1, 0);
pinakes_ExpandBits00VI36.connect(3, pinakes_Not00VI2, 0);
pinakes_ExpandBits00VI36.connect(4, pinakes_Not00VI3, 0);
pinakes_ExpandBits00VI36.connect(5, pinakes_Not00VI4, 0);

pinakes_Not00VI36.connect(0, pinakes_PropSendBoolean00VI36, 0);
pinakes_Not00VI0.connect(0, pinakes_PropSendBoolean00VI0, 0);
pinakes_Not00VI1.connect(0, pinakes_PropSendBoolean00VI1, 0);
pinakes_Not00VI2.connect(0, pinakes_PropSendBoolean00VI2, 0);
pinakes_Not00VI3.connect(0, pinakes_PropSendBoolean00VI3, 0);
pinakes_Not00VI4.connect(0, pinakes_PropSendBoolean00VI4, 0);

// PINAKAS VI14
let pinakes_yOffsetVI14 = 800;

let pinakes_LocalReadReg00VI14 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI14.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI14+pinakas01Y];
pinakes_LocalReadReg00VI14.init(database_BusReadAllTRG00, "S41:R117");
graph.add(pinakes_LocalReadReg00VI14);

let pinakes_Num2Bool00VI14 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI14.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI14+pinakas01Y];
graph.add(pinakes_Num2Bool00VI14);

let pinakes_Not00VI14 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI14.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI14+pinakas01Y];
graph.add(pinakes_Not00VI14);

let pinakes_PropSendBoolean00VI14 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI14.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI14+pinakas01Y];
pinakes_PropSendBoolean00VI14.init(broadcastDeosHandle, "m_pinak_i14");
graph.add(pinakes_PropSendBoolean00VI14);

pinakes_LocalReadReg00VI14.connect(0, pinakes_Num2Bool00VI14, 0);
pinakes_Num2Bool00VI14.connect(0, pinakes_Not00VI14, 0);
pinakes_Not00VI14.connect(0, pinakes_PropSendBoolean00VI14, 0);

// PINAKAS VI17
let pinakes_yOffsetVI17 = 900;

let pinakes_LocalReadReg00VI17 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI17.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI17+pinakas01Y];
pinakes_LocalReadReg00VI17.init(database_BusReadAllTRG00, "S41:R120");
graph.add(pinakes_LocalReadReg00VI17);

let pinakes_Num2Bool00VI17 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI17.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI17+pinakas01Y];
graph.add(pinakes_Num2Bool00VI17);

let pinakes_Not00VI17 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI17.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI17+pinakas01Y];
graph.add(pinakes_Not00VI17);

let pinakes_PropSendBoolean00VI17 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI17.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI17+pinakas01Y];
pinakes_PropSendBoolean00VI17.init(broadcastDeosHandle, "m_pinak_i17");
graph.add(pinakes_PropSendBoolean00VI17);

pinakes_LocalReadReg00VI17.connect(0, pinakes_Num2Bool00VI17, 0);
pinakes_Num2Bool00VI17.connect(0, pinakes_Not00VI17, 0);
pinakes_Not00VI17.connect(0, pinakes_PropSendBoolean00VI17, 0);

// PINAKAS VI18
let pinakes_yOffsetVI18 = 1000;

let pinakes_LocalReadReg00VI18 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI18.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI18+pinakas01Y];
pinakes_LocalReadReg00VI18.init(database_BusReadAllTRG00, "S41:R121");
graph.add(pinakes_LocalReadReg00VI18);

let pinakes_Num2Bool00VI18 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI18.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI18+pinakas01Y];
graph.add(pinakes_Num2Bool00VI18);

let pinakes_Not00VI18 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI18.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI18+pinakas01Y];
graph.add(pinakes_Not00VI18);

let pinakes_PropSendBoolean00VI18 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI18.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI18+pinakas01Y];
pinakes_PropSendBoolean00VI18.init(broadcastDeosHandle, "m_pinak_i18");
graph.add(pinakes_PropSendBoolean00VI18);

pinakes_LocalReadReg00VI18.connect(0, pinakes_Num2Bool00VI18, 0);
pinakes_Num2Bool00VI18.connect(0, pinakes_Not00VI18, 0);
pinakes_Not00VI18.connect(0, pinakes_PropSendBoolean00VI18, 0);

//////////////////////////////////////////////////
//PINAKAS 2
//////////////////////////////////////////////////
let pinakas02Y = 1200;

// PINAKAS VI20
let pinakes_yOffsetVI20 = 0;

let pinakes_LocalReadReg00VI20 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI20.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI20+pinakas02Y];
pinakes_LocalReadReg00VI20.init(database_BusReadAllTRG00, "S41:R123");
graph.add(pinakes_LocalReadReg00VI20);

let pinakes_Num2Bool00VI20 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI20.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI20+pinakas02Y];
graph.add(pinakes_Num2Bool00VI20);

let pinakes_Not00VI20 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI20.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI20+pinakas02Y];
graph.add(pinakes_Not00VI20);

let pinakes_PropSendBoolean00VI20 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI20.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI20+pinakas02Y];
pinakes_PropSendBoolean00VI20.init(broadcastDeosHandle, "m_pinak_i20");
graph.add(pinakes_PropSendBoolean00VI20);

pinakes_LocalReadReg00VI20.connect(0, pinakes_Num2Bool00VI20, 0);
pinakes_Num2Bool00VI20.connect(0, pinakes_Not00VI20, 0);
pinakes_Not00VI20.connect(0, pinakes_PropSendBoolean00VI20, 0);

// PINAKAS VI21
let pinakes_yOffsetVI21 = 100;

let pinakes_LocalReadReg00VI21 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI21.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI21+pinakas02Y];
pinakes_LocalReadReg00VI21.init(database_BusReadAllTRG00, "S41:R124");
graph.add(pinakes_LocalReadReg00VI21);

let pinakes_Num2Bool00VI21 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI21.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI21+pinakas02Y];
graph.add(pinakes_Num2Bool00VI21);

let pinakes_Not00VI21 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI21.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI21+pinakas02Y];
graph.add(pinakes_Not00VI21);

let pinakes_PropSendBoolean00VI21 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI21.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI21+pinakas02Y];
pinakes_PropSendBoolean00VI21.init(broadcastDeosHandle, "m_pinak_i21");
graph.add(pinakes_PropSendBoolean00VI21);

pinakes_LocalReadReg00VI21.connect(0, pinakes_Num2Bool00VI21, 0);
pinakes_Num2Bool00VI21.connect(0, pinakes_Not00VI21, 0);
pinakes_Not00VI21.connect(0, pinakes_PropSendBoolean00VI21, 0);

// PINAKAS VI22
let pinakes_yOffsetVI22 = 200;

let pinakes_LocalReadReg00VI22 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI22.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI22+pinakas02Y];
pinakes_LocalReadReg00VI22.init(database_BusReadAllTRG00, "S41:R125");
graph.add(pinakes_LocalReadReg00VI22);

let pinakes_Num2Bool00VI22 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI22.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI22+pinakas02Y];
graph.add(pinakes_Num2Bool00VI22);

let pinakes_Not00VI22 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI22.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI22+pinakas02Y];
graph.add(pinakes_Not00VI22);

let pinakes_PropSendBoolean00VI22 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI22.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI22+pinakas02Y];
pinakes_PropSendBoolean00VI22.init(broadcastDeosHandle, "m_pinak_i22");
graph.add(pinakes_PropSendBoolean00VI22);

pinakes_LocalReadReg00VI22.connect(0, pinakes_Num2Bool00VI22, 0);
pinakes_Num2Bool00VI22.connect(0, pinakes_Not00VI22, 0);
pinakes_Not00VI22.connect(0, pinakes_PropSendBoolean00VI22, 0);

// PINAKAS VI23
let pinakes_yOffsetVI23 = 300;

let pinakes_LocalReadReg00VI23 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI23.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI23+pinakas02Y];
pinakes_LocalReadReg00VI23.init(database_BusReadAllTRG00, "S41:R126");
graph.add(pinakes_LocalReadReg00VI23);

let pinakes_Num2Bool00VI23 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI23.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI23+pinakas02Y];
graph.add(pinakes_Num2Bool00VI23);

let pinakes_Not00VI23 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI23.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI23+pinakas02Y];
graph.add(pinakes_Not00VI23);

let pinakes_PropSendBoolean00VI23 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI23.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI23+pinakas02Y];
pinakes_PropSendBoolean00VI23.init(broadcastDeosHandle, "m_pinak_i23");
graph.add(pinakes_PropSendBoolean00VI23);

pinakes_LocalReadReg00VI23.connect(0, pinakes_Num2Bool00VI23, 0);
pinakes_Num2Bool00VI23.connect(0, pinakes_Not00VI23, 0);
pinakes_Not00VI23.connect(0, pinakes_PropSendBoolean00VI23, 0);

// PINAKAS VI28
let pinakes_yOffsetVI28 = 400;

let pinakes_LocalReadReg00VI28 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI28.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI28+pinakas02Y];
pinakes_LocalReadReg00VI28.init(database_BusReadAllTRG00, "S41:R131");
graph.add(pinakes_LocalReadReg00VI28);

let pinakes_Num2Bool00VI28 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI28.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI28+pinakas02Y];
graph.add(pinakes_Num2Bool00VI28);

let pinakes_Not00VI28 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI28.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI28+pinakas02Y];
graph.add(pinakes_Not00VI28);

let pinakes_PropSendBoolean00VI28 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI28.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI28+pinakas02Y];
pinakes_PropSendBoolean00VI28.init(broadcastDeosHandle, "m_pinak_i28");
graph.add(pinakes_PropSendBoolean00VI28);

pinakes_LocalReadReg00VI28.connect(0, pinakes_Num2Bool00VI28, 0);
pinakes_Num2Bool00VI28.connect(0, pinakes_Not00VI28, 0);
pinakes_Not00VI28.connect(0, pinakes_PropSendBoolean00VI28, 0);

// PINAKAS VI31
let pinakes_yOffsetVI31 = 500;

let pinakes_LocalReadReg00VI31 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI31.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI31+pinakas02Y];
pinakes_LocalReadReg00VI31.init(database_BusReadAllTRG00, "S41:R134");
graph.add(pinakes_LocalReadReg00VI31);

let pinakes_Num2Bool00VI31 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI31.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI31+pinakas02Y];
graph.add(pinakes_Num2Bool00VI31);

let pinakes_Not00VI31 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI31.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI31+pinakas02Y];
graph.add(pinakes_Not00VI31);

let pinakes_PropSendBoolean00VI31 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI31.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI31+pinakas02Y];
pinakes_PropSendBoolean00VI31.init(broadcastDeosHandle, "m_pinak_i31");
graph.add(pinakes_PropSendBoolean00VI31);

pinakes_LocalReadReg00VI31.connect(0, pinakes_Num2Bool00VI31, 0);
pinakes_Num2Bool00VI31.connect(0, pinakes_Not00VI31, 0);
pinakes_Not00VI31.connect(0, pinakes_PropSendBoolean00VI31, 0);

// PINAKAS VI32
let pinakes_yOffsetVI32 = 600;

let pinakes_LocalReadReg00VI32 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI32.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI32+pinakas02Y];
pinakes_LocalReadReg00VI32.init(database_BusReadAllTRG00, "S41:R135");
graph.add(pinakes_LocalReadReg00VI32);

let pinakes_Num2Bool00VI32 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI32.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI32+pinakas02Y];
graph.add(pinakes_Num2Bool00VI32);

let pinakes_Not00VI32 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI32.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI32+pinakas02Y];
graph.add(pinakes_Not00VI32);

let pinakes_PropSendBoolean00VI32 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI32.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI32+pinakas02Y];
pinakes_PropSendBoolean00VI32.init(broadcastDeosHandle, "m_pinak_i32");
graph.add(pinakes_PropSendBoolean00VI32);

pinakes_LocalReadReg00VI32.connect(0, pinakes_Num2Bool00VI32, 0);
pinakes_Num2Bool00VI32.connect(0, pinakes_Not00VI32, 0);
pinakes_Not00VI32.connect(0, pinakes_PropSendBoolean00VI32, 0);

// PINAKAS VI35
let pinakes_yOffsetVI35 = 700;

let pinakes_LocalReadReg00VI35 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI35.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI35+pinakas02Y];
pinakes_LocalReadReg00VI35.init(database_BusReadAllTRG00, "S41:R138");
graph.add(pinakes_LocalReadReg00VI35);

let pinakes_Num2Bool00VI35 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI35.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI35+pinakas02Y];
graph.add(pinakes_Num2Bool00VI35);

let pinakes_Not00VI35 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI35.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI35+pinakas02Y];
graph.add(pinakes_Not00VI35);

let pinakes_PropSendBoolean00VI35 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI35.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI35+pinakas02Y];
pinakes_PropSendBoolean00VI35.init(broadcastDeosHandle, "m_pinak_i35");
graph.add(pinakes_PropSendBoolean00VI35);

pinakes_LocalReadReg00VI35.connect(0, pinakes_Num2Bool00VI35, 0);
pinakes_Num2Bool00VI35.connect(0, pinakes_Not00VI35, 0);
pinakes_Not00VI35.connect(0, pinakes_PropSendBoolean00VI35, 0);

// PINAKAS VI24
let pinakes_yOffsetVI24 = 800;

let pinakes_LocalReadReg00VI24 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI24.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI24+pinakas02Y];
pinakes_LocalReadReg00VI24.init(database_BusReadAllTRG00, "S41:R127");
graph.add(pinakes_LocalReadReg00VI24);

let pinakes_Num2Bool00VI24 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI24.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI24+pinakas02Y];
graph.add(pinakes_Num2Bool00VI24);

let pinakes_Not00VI24 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI24.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI24+pinakas02Y];
graph.add(pinakes_Not00VI24);

let pinakes_PropSendBoolean00VI24 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI24.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI24+pinakas02Y];
pinakes_PropSendBoolean00VI24.init(broadcastDeosHandle, "m_pinak_i24");
graph.add(pinakes_PropSendBoolean00VI24);

pinakes_LocalReadReg00VI24.connect(0, pinakes_Num2Bool00VI24, 0);
pinakes_Num2Bool00VI24.connect(0, pinakes_Not00VI24, 0);
pinakes_Not00VI24.connect(0, pinakes_PropSendBoolean00VI24, 0);

// PINAKAS VI27
let pinakes_yOffsetVI27 = 900;

let pinakes_LocalReadReg00VI27 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI27.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI27+pinakas02Y];
pinakes_LocalReadReg00VI27.init(database_BusReadAllTRG00, "S41:R130");
graph.add(pinakes_LocalReadReg00VI27);

let pinakes_Num2Bool00VI27 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI27.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI27+pinakas02Y];
graph.add(pinakes_Num2Bool00VI27);

let pinakes_Not00VI27 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI27.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI27+pinakas02Y];
graph.add(pinakes_Not00VI27);

let pinakes_PropSendBoolean00VI27 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI27.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI27+pinakas02Y];
pinakes_PropSendBoolean00VI27.init(broadcastDeosHandle, "m_pinak_i27");
graph.add(pinakes_PropSendBoolean00VI27);

pinakes_LocalReadReg00VI27.connect(0, pinakes_Num2Bool00VI27, 0);
pinakes_Num2Bool00VI27.connect(0, pinakes_Not00VI27, 0);
pinakes_Not00VI27.connect(0, pinakes_PropSendBoolean00VI27, 0);

//////////////////////////////////////////////////
//PINAKAS 3
//////////////////////////////////////////////////
let pinakas03Y = 2300;

// PINAKAS VI6
let pinakes_yOffsetVI6 = 0;

let pinakes_LocalReadReg00VI6 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI6.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI6+pinakas03Y];
pinakes_LocalReadReg00VI6.init(database_BusReadAllTRG00, "S41:R109");
graph.add(pinakes_LocalReadReg00VI6);

let pinakes_Num2Bool00VI6 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI6.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI6+pinakas03Y];
graph.add(pinakes_Num2Bool00VI6);

let pinakes_Not00VI6 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI6.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI6+pinakas03Y];
graph.add(pinakes_Not00VI6);

let pinakes_PropSendBoolean00VI6 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI6.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI6+pinakas03Y];
pinakes_PropSendBoolean00VI6.init(broadcastDeosHandle, "m_pinak_i6");
graph.add(pinakes_PropSendBoolean00VI6);

pinakes_LocalReadReg00VI6.connect(0, pinakes_Num2Bool00VI6, 0);
pinakes_Num2Bool00VI6.connect(0, pinakes_Not00VI6, 0);
pinakes_Not00VI6.connect(0, pinakes_PropSendBoolean00VI6, 0);

// PINAKAS VI7
let pinakes_yOffsetVI7 = 100;

let pinakes_LocalReadReg00VI7 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI7.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI7+pinakas03Y];
pinakes_LocalReadReg00VI7.init(database_BusReadAllTRG00, "S41:R110");
graph.add(pinakes_LocalReadReg00VI7);

let pinakes_Num2Bool00VI7 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI7.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI7+pinakas03Y];
graph.add(pinakes_Num2Bool00VI7);

let pinakes_Not00VI7 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI7.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI7+pinakas03Y];
graph.add(pinakes_Not00VI7);

let pinakes_PropSendBoolean00VI7 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI7.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI7+pinakas03Y];
pinakes_PropSendBoolean00VI7.init(broadcastDeosHandle, "m_pinak_i7");
graph.add(pinakes_PropSendBoolean00VI7);

pinakes_LocalReadReg00VI7.connect(0, pinakes_Num2Bool00VI7, 0);
pinakes_Num2Bool00VI7.connect(0, pinakes_Not00VI7, 0);
pinakes_Not00VI7.connect(0, pinakes_PropSendBoolean00VI7, 0);

// PINAKAS VI8
let pinakes_yOffsetVI8 = 200;

let pinakes_LocalReadReg00VI8 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI8.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI8+pinakas03Y];
pinakes_LocalReadReg00VI8.init(database_BusReadAllTRG00, "S41:R111");
graph.add(pinakes_LocalReadReg00VI8);

let pinakes_Num2Bool00VI8 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI8.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI8+pinakas03Y];
graph.add(pinakes_Num2Bool00VI8);

let pinakes_Not00VI8 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI8.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI8+pinakas03Y];
graph.add(pinakes_Not00VI8);

let pinakes_PropSendBoolean00VI8 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI8.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI8+pinakas03Y];
pinakes_PropSendBoolean00VI8.init(broadcastDeosHandle, "m_pinak_i8");
graph.add(pinakes_PropSendBoolean00VI8);

pinakes_LocalReadReg00VI8.connect(0, pinakes_Num2Bool00VI8, 0);
pinakes_Num2Bool00VI8.connect(0, pinakes_Not00VI8, 0);
pinakes_Not00VI8.connect(0, pinakes_PropSendBoolean00VI8, 0);

// PINAKAS VI9
let pinakes_yOffsetVI9 = 300;

let pinakes_LocalReadReg00VI9 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI9.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI9+pinakas03Y];
pinakes_LocalReadReg00VI9.init(database_BusReadAllTRG00, "S41:R112");
graph.add(pinakes_LocalReadReg00VI9);

let pinakes_Num2Bool00VI9 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI9.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI9+pinakas03Y];
graph.add(pinakes_Num2Bool00VI9);

let pinakes_Not00VI9 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI9.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI9+pinakas03Y];
graph.add(pinakes_Not00VI9);

let pinakes_PropSendBoolean00VI9 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI9.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI9+pinakas03Y];
pinakes_PropSendBoolean00VI9.init(broadcastDeosHandle, "m_pinak_i9");
graph.add(pinakes_PropSendBoolean00VI9);

pinakes_LocalReadReg00VI9.connect(0, pinakes_Num2Bool00VI9, 0);
pinakes_Num2Bool00VI9.connect(0, pinakes_Not00VI9, 0);
pinakes_Not00VI9.connect(0, pinakes_PropSendBoolean00VI9, 0);

// PINAKAS VI10
let pinakes_yOffsetVI10 = 400;

let pinakes_LocalReadReg00VI10 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI10.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI10+pinakas03Y];
pinakes_LocalReadReg00VI10.init(database_BusReadAllTRG00, "S41:R113");
graph.add(pinakes_LocalReadReg00VI10);

let pinakes_Num2Bool00VI10 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI10.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI10+pinakas03Y];
graph.add(pinakes_Num2Bool00VI10);

let pinakes_Not00VI10 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI10.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI10+pinakas03Y];
graph.add(pinakes_Not00VI10);

let pinakes_PropSendBoolean00VI10 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI10.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI10+pinakas03Y];
pinakes_PropSendBoolean00VI10.init(broadcastDeosHandle, "m_pinak_i10");
graph.add(pinakes_PropSendBoolean00VI10);

pinakes_LocalReadReg00VI10.connect(0, pinakes_Num2Bool00VI10, 0);
pinakes_Num2Bool00VI10.connect(0, pinakes_Not00VI10, 0);
pinakes_Not00VI10.connect(0, pinakes_PropSendBoolean00VI10, 0);

// PINAKAS VI11
let pinakes_yOffsetVI11 = 500;

let pinakes_LocalReadReg00VI11 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI11.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI11+pinakas03Y];
pinakes_LocalReadReg00VI11.init(database_BusReadAllTRG00, "S41:R114");
graph.add(pinakes_LocalReadReg00VI11);

let pinakes_Num2Bool00VI11 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI11.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI11+pinakas03Y];
graph.add(pinakes_Num2Bool00VI11);

let pinakes_Not00VI11 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI11.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI11+pinakas03Y];
graph.add(pinakes_Not00VI11);

let pinakes_PropSendBoolean00VI11 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI11.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI11+pinakas03Y];
pinakes_PropSendBoolean00VI11.init(broadcastDeosHandle, "m_pinak_i11");
graph.add(pinakes_PropSendBoolean00VI11);

pinakes_LocalReadReg00VI11.connect(0, pinakes_Num2Bool00VI11, 0);
pinakes_Num2Bool00VI11.connect(0, pinakes_Not00VI11, 0);
pinakes_Not00VI11.connect(0, pinakes_PropSendBoolean00VI11, 0);

// PINAKAS VI12
let pinakes_yOffsetVI12 = 600;

let pinakes_LocalReadReg00VI12 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI12.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI12+pinakas03Y];
pinakes_LocalReadReg00VI12.init(database_BusReadAllTRG00, "S41:R115");
graph.add(pinakes_LocalReadReg00VI12);

let pinakes_Num2Bool00VI12 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI12.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI12+pinakas03Y];
graph.add(pinakes_Num2Bool00VI12);

let pinakes_Not00VI12 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI12.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI12+pinakas03Y];
graph.add(pinakes_Not00VI12);

let pinakes_PropSendBoolean00VI12 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI12.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI12+pinakas03Y];
pinakes_PropSendBoolean00VI12.init(broadcastDeosHandle, "m_pinak_i12");
graph.add(pinakes_PropSendBoolean00VI12);

pinakes_LocalReadReg00VI12.connect(0, pinakes_Num2Bool00VI12, 0);
pinakes_Num2Bool00VI12.connect(0, pinakes_Not00VI12, 0);
pinakes_Not00VI12.connect(0, pinakes_PropSendBoolean00VI12, 0);

// PINAKAS VI13
let pinakes_yOffsetVI13 = 700;

let pinakes_LocalReadReg00VI13 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00VI13.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetVI13+pinakas03Y];
pinakes_LocalReadReg00VI13.init(database_BusReadAllTRG00, "S41:R116");
graph.add(pinakes_LocalReadReg00VI13);

let pinakes_Num2Bool00VI13 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00VI13.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetVI13+pinakas03Y];
graph.add(pinakes_Num2Bool00VI13);

let pinakes_Not00VI13 = LiteGraph.createNode("Deos/Not");
pinakes_Not00VI13.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetVI13+pinakas03Y];
graph.add(pinakes_Not00VI13);

let pinakes_PropSendBoolean00VI13 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00VI13.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetVI13+pinakas03Y];
pinakes_PropSendBoolean00VI13.init(broadcastDeosHandle, "m_pinak_i13");
graph.add(pinakes_PropSendBoolean00VI13);

pinakes_LocalReadReg00VI13.connect(0, pinakes_Num2Bool00VI13, 0);
pinakes_Num2Bool00VI13.connect(0, pinakes_Not00VI13, 0);
pinakes_Not00VI13.connect(0, pinakes_PropSendBoolean00VI13, 0);

// PINAKAS NVI37
let pinakes_yOffsetNVI37 = 800;

let pinakes_LocalReadReg00NVI37 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00NVI37.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetNVI37+pinakas03Y];
pinakes_LocalReadReg00NVI37.init(database_BusReadAllTRG00, "S41:R105");
graph.add(pinakes_LocalReadReg00NVI37);

let pinakes_Num2Bool00NVI37 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00NVI37.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetNVI37+pinakas03Y];
graph.add(pinakes_Num2Bool00NVI37);

let pinakes_Not00NVI37 = LiteGraph.createNode("Deos/Not");
pinakes_Not00NVI37.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetNVI37+pinakas03Y];
graph.add(pinakes_Not00NVI37);

let pinakes_PropSendBoolean00NVI37 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00NVI37.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetNVI37+pinakas03Y];
pinakes_PropSendBoolean00NVI37.init(broadcastDeosHandle, "m_pinak_i37");
graph.add(pinakes_PropSendBoolean00NVI37);

pinakes_LocalReadReg00NVI37.connect(0, pinakes_Num2Bool00NVI37, 0);
pinakes_Num2Bool00NVI37.connect(0, pinakes_Not00NVI37, 0);
pinakes_Not00NVI37.connect(0, pinakes_PropSendBoolean00NVI37, 0);

// PINAKAS NVI38
let pinakes_yOffsetNVI38 = 900;

let pinakes_LocalReadReg00NVI38 = LiteGraph.createNode("Deos/LocalReadReg");
pinakes_LocalReadReg00NVI38.pos = [pinakesPosition.x,pinakesPosition.y+pinakes_yOffsetNVI38+pinakas03Y];
pinakes_LocalReadReg00NVI38.init(database_BusReadAllTRG00, "S41:R106");
graph.add(pinakes_LocalReadReg00NVI38);

let pinakes_Num2Bool00NVI38 = LiteGraph.createNode("Deos/Num2Bool");
pinakes_Num2Bool00NVI38.pos = [pinakesPosition.x+200,pinakesPosition.y+pinakes_yOffsetNVI38+pinakas03Y];
graph.add(pinakes_Num2Bool00NVI38);

let pinakes_Not00NVI38 = LiteGraph.createNode("Deos/Not");
pinakes_Not00NVI38.pos = [pinakesPosition.x+400,pinakesPosition.y+pinakes_yOffsetNVI38+pinakas03Y];
graph.add(pinakes_Not00NVI38);

let pinakes_PropSendBoolean00NVI38 = LiteGraph.createNode("Deos/PropSendBoolean");
pinakes_PropSendBoolean00NVI38.pos = [pinakesPosition.x+560,pinakesPosition.y+pinakes_yOffsetNVI38+pinakas03Y];
pinakes_PropSendBoolean00NVI38.init(broadcastDeosHandle, "m_pinak_i38");
graph.add(pinakes_PropSendBoolean00NVI38);

pinakes_LocalReadReg00NVI38.connect(0, pinakes_Num2Bool00NVI38, 0);
pinakes_Num2Bool00NVI38.connect(0, pinakes_Not00NVI38, 0);
pinakes_Not00NVI38.connect(0, pinakes_PropSendBoolean00NVI38, 0);
//////////////////////////////////////////////////
//#endregion MHXANOSTASIO PINAKES
//////////////////////////////////////////////////

let metagPosition = {x:9550, y:-750};
//////////////////////////////////////////////////
//#region METAGWGIKOI PINAKES
//////////////////////////////////////////////////
let metag_Title00 = LiteGraph.createNode("Deos/Title");
metag_Title00.pos = [metagPosition.x,metagPosition.y-80];
metag_Title00.init("ΕΠΑΦΕΣ ΜΕΤΑΓΩΓΙΚΩΝ MODBUS ΠΡΟΣ ΜΗΧΑΝΟΣΤΑΣΙΟ.", 800);
graph.add(metag_Title00);

////////////////////////////////////////////////////////////////////////// GRAMMH ANTIRROH
let metagGramVI29_offsetY = 0; 

// METAGWGIKOS GRAMMH 0 VI29
let metag_yOffsetVI29 = 0;

let metag_LocalReadReg00VI29 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI29.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI29+metagGramVI29_offsetY];
metag_LocalReadReg00VI29.init(database_BusReadAllTRG00, "S41:R132");
graph.add(metag_LocalReadReg00VI29);

let metag_Num2Bool00VI29 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI29.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI29+metagGramVI29_offsetY];
graph.add(metag_Num2Bool00VI29);

let metag_Not00VI29 = LiteGraph.createNode("Deos/Not");
metag_Not00VI29.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI29+metagGramVI29_offsetY];
graph.add(metag_Not00VI29);

let metag_PropSendBoolean00VI29 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI29.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI29+metagGramVI29_offsetY];
metag_PropSendBoolean00VI29.init(broadcastDeosHandle, "m_pinak_i29");
graph.add(metag_PropSendBoolean00VI29);

metag_LocalReadReg00VI29.connect(0, metag_Num2Bool00VI29, 0);
metag_Num2Bool00VI29.connect(0, metag_Not00VI29, 0);
metag_Not00VI29.connect(0, metag_PropSendBoolean00VI29, 0);

// METAGWGIKOS GRAMMH 0 VI30
let metag_yOffsetVI30 = 200;

let metag_LocalReadReg00VI30 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI30.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI30+metagGramVI29_offsetY];
metag_LocalReadReg00VI30.init(database_BusReadAllTRG00, "S41:R133");
graph.add(metag_LocalReadReg00VI30);

let metag_Num2Bool00VI30 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI30.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI30+metagGramVI29_offsetY];
graph.add(metag_Num2Bool00VI30);

let metag_Not00VI30 = LiteGraph.createNode("Deos/Not");
metag_Not00VI30.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI30+metagGramVI29_offsetY];
graph.add(metag_Not00VI30);

let metag_PropSendBoolean00VI30 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI30.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI30+metagGramVI29_offsetY];
metag_PropSendBoolean00VI30.init(broadcastDeosHandle, "m_pinak_i30");
graph.add(metag_PropSendBoolean00VI30);

metag_LocalReadReg00VI30.connect(0, metag_Num2Bool00VI30, 0);
metag_Num2Bool00VI30.connect(0, metag_Not00VI30, 0);
metag_Not00VI30.connect(0, metag_PropSendBoolean00VI30, 0);

// METAGWGIKOS GRAMMH 0 VI2930
let metag_yOffsetVI2930 = 100;

let metag_Nor200VI2930 = LiteGraph.createNode("Deos/Nor2");
metag_Nor200VI2930.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI2930+metagGramVI29_offsetY];
graph.add(metag_Nor200VI2930);

let metag_PropSendBoolean01VI2930 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean01VI2930.pos = [metagPosition.x+760,metagPosition.y+metag_yOffsetVI2930+metagGramVI29_offsetY];
metag_PropSendBoolean01VI2930.init(broadcastDeosHandle, "m_pinak_i2930");
graph.add(metag_PropSendBoolean01VI2930);

metag_Not00VI29.connect(0, metag_Nor200VI2930, 0);
metag_Not00VI30.connect(0, metag_Nor200VI2930, 1);
metag_Nor200VI2930.connect(0, metag_PropSendBoolean01VI2930, 0);

////////////////////////////////////////////////////////////////////////// GRAMMH ANAKYKLOFORIA
let metagGramVI33_offsetY = 300; 

// METAGWGIKOS GRAMMH 0 VI33
let metag_yOffsetVI33 = 0;

let metag_LocalReadReg00VI33 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI33.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI33+metagGramVI33_offsetY];
metag_LocalReadReg00VI33.init(database_BusReadAllTRG00, "S41:R136");
graph.add(metag_LocalReadReg00VI33);

let metag_Num2Bool00VI33 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI33.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI33+metagGramVI33_offsetY];
graph.add(metag_Num2Bool00VI33);

let metag_Not00VI33 = LiteGraph.createNode("Deos/Not");
metag_Not00VI33.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI33+metagGramVI33_offsetY];
graph.add(metag_Not00VI33);

let metag_PropSendBoolean00VI33 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI33.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI33+metagGramVI33_offsetY];
metag_PropSendBoolean00VI33.init(broadcastDeosHandle, "m_pinak_i33");
graph.add(metag_PropSendBoolean00VI33);

metag_LocalReadReg00VI33.connect(0, metag_Num2Bool00VI33, 0);
metag_Num2Bool00VI33.connect(0, metag_Not00VI33, 0);
metag_Not00VI33.connect(0, metag_PropSendBoolean00VI33, 0);

// METAGWGIKOS GRAMMH 0 VI34
let metag_yOffsetVI34 = 200;

let metag_LocalReadReg00VI34 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI34.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI34+metagGramVI33_offsetY];
metag_LocalReadReg00VI34.init(database_BusReadAllTRG00, "S41:R137");
graph.add(metag_LocalReadReg00VI34);

let metag_Num2Bool00VI34 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI34.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI34+metagGramVI33_offsetY];
graph.add(metag_Num2Bool00VI34);

let metag_Not00VI34 = LiteGraph.createNode("Deos/Not");
metag_Not00VI34.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI34+metagGramVI33_offsetY];
graph.add(metag_Not00VI34);

let metag_PropSendBoolean00VI34 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI34.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI34+metagGramVI33_offsetY];
metag_PropSendBoolean00VI34.init(broadcastDeosHandle, "m_pinak_i34");
graph.add(metag_PropSendBoolean00VI34);

metag_LocalReadReg00VI34.connect(0, metag_Num2Bool00VI34, 0);
metag_Num2Bool00VI34.connect(0, metag_Not00VI34, 0);
metag_Not00VI34.connect(0, metag_PropSendBoolean00VI34, 0);

// METAGWGIKOS GRAMMH 0 VI3334
let metag_yOffsetVI3334 = 100;

let metag_Nor200VI3334 = LiteGraph.createNode("Deos/Nor2");
metag_Nor200VI3334.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI3334+metagGramVI33_offsetY];
graph.add(metag_Nor200VI3334);

let metag_PropSendBoolean01VI3334 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean01VI3334.pos = [metagPosition.x+760,metagPosition.y+metag_yOffsetVI3334+metagGramVI33_offsetY];
metag_PropSendBoolean01VI3334.init(broadcastDeosHandle, "m_pinak_i3334");
graph.add(metag_PropSendBoolean01VI3334);

metag_Not00VI33.connect(0, metag_Nor200VI3334, 0);
metag_Not00VI34.connect(0, metag_Nor200VI3334, 1);
metag_Nor200VI3334.connect(0, metag_PropSendBoolean01VI3334, 0);

////////////////////////////////////////////////////////////////////////// GRAMMH HLIAKWN
let metagGramVI25_offsetY = 600; 

// METAGWGIKOS GRAMMH 0 VI25
let metag_yOffsetVI25 = 0;

let metag_LocalReadReg00VI25 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI25.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI25+metagGramVI25_offsetY];
metag_LocalReadReg00VI25.init(database_BusReadAllTRG00, "S41:R128");
graph.add(metag_LocalReadReg00VI25);

let metag_Num2Bool00VI25 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI25.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI25+metagGramVI25_offsetY];
graph.add(metag_Num2Bool00VI25);

let metag_Not00VI25 = LiteGraph.createNode("Deos/Not");
metag_Not00VI25.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI25+metagGramVI25_offsetY];
graph.add(metag_Not00VI25);

let metag_PropSendBoolean00VI25 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI25.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI25+metagGramVI25_offsetY];
metag_PropSendBoolean00VI25.init(broadcastDeosHandle, "m_pinak_i25");
graph.add(metag_PropSendBoolean00VI25);

metag_LocalReadReg00VI25.connect(0, metag_Num2Bool00VI25, 0);
metag_Num2Bool00VI25.connect(0, metag_Not00VI25, 0);
metag_Not00VI25.connect(0, metag_PropSendBoolean00VI25, 0);

// METAGWGIKOS GRAMMH 0 VI26
let metag_yOffsetVI26 = 200;

let metag_LocalReadReg00VI26 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI26.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI26+metagGramVI25_offsetY];
metag_LocalReadReg00VI26.init(database_BusReadAllTRG00, "S41:R129");
graph.add(metag_LocalReadReg00VI26);

let metag_Num2Bool00VI26 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI26.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI26+metagGramVI25_offsetY];
graph.add(metag_Num2Bool00VI26);

let metag_Not00VI26 = LiteGraph.createNode("Deos/Not");
metag_Not00VI26.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI26+metagGramVI25_offsetY];
graph.add(metag_Not00VI26);

let metag_PropSendBoolean00VI26 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI26.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI26+metagGramVI25_offsetY];
metag_PropSendBoolean00VI26.init(broadcastDeosHandle, "m_pinak_i26");
graph.add(metag_PropSendBoolean00VI26);

metag_LocalReadReg00VI26.connect(0, metag_Num2Bool00VI26, 0);
metag_Num2Bool00VI26.connect(0, metag_Not00VI26, 0);
metag_Not00VI26.connect(0, metag_PropSendBoolean00VI26, 0);

// METAGWGIKOS GRAMMH 0 VI2526
let metag_yOffsetVI2526 = 100;

let metag_Nor200VI2526 = LiteGraph.createNode("Deos/Nor2");
metag_Nor200VI2526.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI2526+metagGramVI25_offsetY];
graph.add(metag_Nor200VI2526);

let metag_PropSendBoolean01VI2526 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean01VI2526.pos = [metagPosition.x+760,metagPosition.y+metag_yOffsetVI2526+metagGramVI25_offsetY];
metag_PropSendBoolean01VI2526.init(broadcastDeosHandle, "m_pinak_i2526");
graph.add(metag_PropSendBoolean01VI2526);

metag_Not00VI25.connect(0, metag_Nor200VI2526, 0);
metag_Not00VI26.connect(0, metag_Nor200VI2526, 1);
metag_Nor200VI2526.connect(0, metag_PropSendBoolean01VI2526, 0);

////////////////////////////////////////////////////////////////////////// GRAMMH ANTISTASHS
let metagGramVI15_offsetY = 900; 

// METAGWGIKOS GRAMMH 0 VI15
let metag_yOffsetVI15 = 0;

let metag_LocalReadReg00VI15 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI15.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI15+metagGramVI15_offsetY];
metag_LocalReadReg00VI15.init(database_BusReadAllTRG00, "S41:R118");
graph.add(metag_LocalReadReg00VI15);

let metag_Num2Bool00VI15 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI15.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI15+metagGramVI15_offsetY];
graph.add(metag_Num2Bool00VI15);

let metag_Not00VI15 = LiteGraph.createNode("Deos/Not");
metag_Not00VI15.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI15+metagGramVI15_offsetY];
graph.add(metag_Not00VI15);

let metag_PropSendBoolean00VI15 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI15.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI15+metagGramVI15_offsetY];
metag_PropSendBoolean00VI15.init(broadcastDeosHandle, "m_pinak_i15");
graph.add(metag_PropSendBoolean00VI15);

metag_LocalReadReg00VI15.connect(0, metag_Num2Bool00VI15, 0);
metag_Num2Bool00VI15.connect(0, metag_Not00VI15, 0);
metag_Not00VI15.connect(0, metag_PropSendBoolean00VI15, 0);

// METAGWGIKOS GRAMMH 0 VI16
let metag_yOffsetVI16 = 200;

let metag_LocalReadReg00VI16 = LiteGraph.createNode("Deos/LocalReadReg");
metag_LocalReadReg00VI16.pos = [metagPosition.x,metagPosition.y+metag_yOffsetVI16+metagGramVI15_offsetY];
metag_LocalReadReg00VI16.init(database_BusReadAllTRG00, "S41:R119");
graph.add(metag_LocalReadReg00VI16);

let metag_Num2Bool00VI16 = LiteGraph.createNode("Deos/Num2Bool");
metag_Num2Bool00VI16.pos = [metagPosition.x+200,metagPosition.y+metag_yOffsetVI16+metagGramVI15_offsetY];
graph.add(metag_Num2Bool00VI16);

let metag_Not00VI16 = LiteGraph.createNode("Deos/Not");
metag_Not00VI16.pos = [metagPosition.x+400,metagPosition.y+metag_yOffsetVI16+metagGramVI15_offsetY];
graph.add(metag_Not00VI16);

let metag_PropSendBoolean00VI16 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean00VI16.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI16+metagGramVI15_offsetY];
metag_PropSendBoolean00VI16.init(broadcastDeosHandle, "m_pinak_i16");
graph.add(metag_PropSendBoolean00VI16);

metag_LocalReadReg00VI16.connect(0, metag_Num2Bool00VI16, 0);
metag_Num2Bool00VI16.connect(0, metag_Not00VI16, 0);
metag_Not00VI16.connect(0, metag_PropSendBoolean00VI16, 0);

// METAGWGIKOS GRAMMH 0 VI1516
let metag_yOffsetVI1516 = 100;

let metag_Nor200VI1516 = LiteGraph.createNode("Deos/Nor2");
metag_Nor200VI1516.pos = [metagPosition.x+560,metagPosition.y+metag_yOffsetVI1516+metagGramVI15_offsetY];
graph.add(metag_Nor200VI1516);

let metag_PropSendBoolean01VI1516 = LiteGraph.createNode("Deos/PropSendBoolean");
metag_PropSendBoolean01VI1516.pos = [metagPosition.x+760,metagPosition.y+metag_yOffsetVI1516+metagGramVI15_offsetY];
metag_PropSendBoolean01VI1516.init(broadcastDeosHandle, "m_pinak_i1516");
graph.add(metag_PropSendBoolean01VI1516);

metag_Not00VI15.connect(0, metag_Nor200VI1516, 0);
metag_Not00VI16.connect(0, metag_Nor200VI1516, 1);
metag_Nor200VI1516.connect(0, metag_PropSendBoolean01VI1516, 0);
//////////////////////////////////////////////////
//#endregion METAGWGIKOI PINAKES
//////////////////////////////////////////////////

let khposPinakPosition = {x:750, y:3450};
//////////////////////////////////////////////////
//#region KHPOS PINAKAS KAI TIMES
//////////////////////////////////////////////////
let khposPinak_Title00 = LiteGraph.createNode("Deos/Title");
khposPinak_Title00.pos = [khposPinakPosition.x,khposPinakPosition.y+20];
khposPinak_Title00.init("ΕΠΑΦΕΣ MODBUS ΠΡΟΣ ΠΙΝΑΚΑ ΚΗΠΟΥ ΚΑΙ ΤΙΜΕΣ.", 800);
graph.add(khposPinak_Title00);

//KHPOS I9
let khposPinak_offsetY_i9 = 1300;

let khposPinak_LocalReadRegN09 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadRegN09.pos = [khposPinakPosition.x,khposPinakPosition.y+100+khposPinak_offsetY_i9];
khposPinak_LocalReadRegN09.init(database_BusReadAllTRG00, "S42:R103");
graph.add(khposPinak_LocalReadRegN09);

let khposPinak_Num2BoolN09 = LiteGraph.createNode("Deos/Num2Bool");
khposPinak_Num2BoolN09.pos = [khposPinakPosition.x+200,khposPinakPosition.y+100+khposPinak_offsetY_i9];
graph.add(khposPinak_Num2BoolN09);

let khposPinak_NotN09 = LiteGraph.createNode("Deos/Not");
khposPinak_NotN09.pos = [khposPinakPosition.x+400,khposPinakPosition.y+100+khposPinak_offsetY_i9];
graph.add(khposPinak_NotN09);

let khposPinak_PropSendBooleanN09 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBooleanN09.pos = [khposPinakPosition.x+560,khposPinakPosition.y+100+khposPinak_offsetY_i9];
khposPinak_PropSendBooleanN09.init(broadcastDeosHandle, "k_pinak_i9");
graph.add(khposPinak_PropSendBooleanN09);

khposPinak_LocalReadRegN09.connect(0, khposPinak_Num2BoolN09, 0);
khposPinak_Num2BoolN09.connect(0, khposPinak_NotN09, 0);
khposPinak_NotN09.connect(0, khposPinak_PropSendBooleanN09, 0);

//KHPOS I10
let khposPinak_offsetY_i10 = 1400;

let khposPinak_LocalReadRegN10 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadRegN10.pos = [khposPinakPosition.x,khposPinakPosition.y+100+khposPinak_offsetY_i10];
khposPinak_LocalReadRegN10.init(database_BusReadAllTRG00, "S42:R104");
graph.add(khposPinak_LocalReadRegN10);

let khposPinak_Num2BoolN10 = LiteGraph.createNode("Deos/Num2Bool");
khposPinak_Num2BoolN10.pos = [khposPinakPosition.x+200,khposPinakPosition.y+100+khposPinak_offsetY_i10];
graph.add(khposPinak_Num2BoolN10);

let khposPinak_NotN10 = LiteGraph.createNode("Deos/Not");
khposPinak_NotN10.pos = [khposPinakPosition.x+400,khposPinakPosition.y+100+khposPinak_offsetY_i10];
graph.add(khposPinak_NotN10);

let khposPinak_PropSendBooleanN10 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBooleanN10.pos = [khposPinakPosition.x+560,khposPinakPosition.y+100+khposPinak_offsetY_i10];
khposPinak_PropSendBooleanN10.init(broadcastDeosHandle, "k_pinak_i10");
graph.add(khposPinak_PropSendBooleanN10);

khposPinak_LocalReadRegN10.connect(0, khposPinak_Num2BoolN10, 0);
khposPinak_Num2BoolN10.connect(0, khposPinak_NotN10, 0);
khposPinak_NotN10.connect(0, khposPinak_PropSendBooleanN10, 0);

//KHPOS I6
let khposPinak_offsetY_i6 = 0;

let khposPinak_LocalReadReg01 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg01.pos = [khposPinakPosition.x,khposPinakPosition.y+100+khposPinak_offsetY_i6];
khposPinak_LocalReadReg01.init(database_BusReadAllTRG00, "S42:R105");
graph.add(khposPinak_LocalReadReg01);

let khposPinak_Num2Bool01 = LiteGraph.createNode("Deos/Num2Bool");
khposPinak_Num2Bool01.pos = [khposPinakPosition.x+200,khposPinakPosition.y+100+khposPinak_offsetY_i6];
graph.add(khposPinak_Num2Bool01);

let khposPinak_Not01 = LiteGraph.createNode("Deos/Not");
khposPinak_Not01.pos = [khposPinakPosition.x+400,khposPinakPosition.y+100+khposPinak_offsetY_i6];
graph.add(khposPinak_Not01);

let khposPinak_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean01.pos = [khposPinakPosition.x+560,khposPinakPosition.y+100+khposPinak_offsetY_i6];
khposPinak_PropSendBoolean01.init(broadcastDeosHandle, "k_pinak_i6");
graph.add(khposPinak_PropSendBoolean01);

khposPinak_LocalReadReg01.connect(0, khposPinak_Num2Bool01, 0);
khposPinak_Num2Bool01.connect(0, khposPinak_Not01, 0);
khposPinak_Not01.connect(0, khposPinak_PropSendBoolean01, 0);

//KHPOS I7
let khposPinak_offsetY_i7 = 100;

let khposPinak_LocalReadReg02 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg02.pos = [khposPinakPosition.x,khposPinakPosition.y+100+khposPinak_offsetY_i7];
khposPinak_LocalReadReg02.init(database_BusReadAllTRG00, "S42:R106");
graph.add(khposPinak_LocalReadReg02);

let khposPinak_Num2Bool02 = LiteGraph.createNode("Deos/Num2Bool");
khposPinak_Num2Bool02.pos = [khposPinakPosition.x+200,khposPinakPosition.y+100+khposPinak_offsetY_i7];
graph.add(khposPinak_Num2Bool02);

let khposPinak_Not02 = LiteGraph.createNode("Deos/Not");
khposPinak_Not02.pos = [khposPinakPosition.x+400,khposPinakPosition.y+100+khposPinak_offsetY_i7];
graph.add(khposPinak_Not02);

let khposPinak_PropSendBoolean02 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean02.pos = [khposPinakPosition.x+560,khposPinakPosition.y+100+khposPinak_offsetY_i7];
khposPinak_PropSendBoolean02.init(broadcastDeosHandle, "k_pinak_i7");
graph.add(khposPinak_PropSendBoolean02);

khposPinak_LocalReadReg02.connect(0, khposPinak_Num2Bool02, 0);
khposPinak_Num2Bool02.connect(0, khposPinak_Not02, 0);
khposPinak_Not02.connect(0, khposPinak_PropSendBoolean02, 0);

//KHPOS I8
let khposPinak_offsetY_i8 = 200;

let khposPinak_LocalReadReg03 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg03.pos = [khposPinakPosition.x,khposPinakPosition.y+100+khposPinak_offsetY_i8];
khposPinak_LocalReadReg03.init(database_BusReadAllTRG00, "S42:R107");
graph.add(khposPinak_LocalReadReg03);

let khposPinak_Num2Bool03 = LiteGraph.createNode("Deos/Num2Bool");
khposPinak_Num2Bool03.pos = [khposPinakPosition.x+200,khposPinakPosition.y+100+khposPinak_offsetY_i8];
graph.add(khposPinak_Num2Bool03);

let khposPinak_Not03 = LiteGraph.createNode("Deos/Not");
khposPinak_Not03.pos = [khposPinakPosition.x+400,khposPinakPosition.y+100+khposPinak_offsetY_i8];
graph.add(khposPinak_Not03);

let khposPinak_PropSendBoolean03 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean03.pos = [khposPinakPosition.x+560,khposPinakPosition.y+100+khposPinak_offsetY_i8];
khposPinak_PropSendBoolean03.init(broadcastDeosHandle, "k_pinak_i8");
graph.add(khposPinak_PropSendBoolean03);

khposPinak_LocalReadReg03.connect(0, khposPinak_Num2Bool03, 0);
khposPinak_Num2Bool03.connect(0, khposPinak_Not03, 0);
khposPinak_Not03.connect(0, khposPinak_PropSendBoolean03, 0);

//KHPOS I0
let khposPinak_yOffsetVI00 = 400;

let khposPinak_LocalReadReg00VI00 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg00VI00.pos = [khposPinakPosition.x,khposPinakPosition.y+khposPinak_yOffsetVI00];
khposPinak_LocalReadReg00VI00.init(database_BusReadAllTRG00, "S42:R108");
graph.add(khposPinak_LocalReadReg00VI00);

let khposPinak_ExpandBits00VI00 = LiteGraph.createNode("Deos/ExpandBits");
khposPinak_ExpandBits00VI00.pos = [khposPinakPosition.x+200,khposPinakPosition.y+khposPinak_yOffsetVI00];
graph.add(khposPinak_ExpandBits00VI00);

let khposPinak_Not00VI00 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI00.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI00];
graph.add(khposPinak_Not00VI00);

let khposPinak_PropSendBoolean00VI00 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI00.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI00];
khposPinak_PropSendBoolean00VI00.init(broadcastDeosHandle, "k_pinak_i0");
graph.add(khposPinak_PropSendBoolean00VI00);

khposPinak_LocalReadReg00VI00.connect(0, khposPinak_ExpandBits00VI00, 0);

//KHPOS I1
let khposPinak_yOffsetVI01 = 500;

let khposPinak_Not00VI01 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI01.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI01];
graph.add(khposPinak_Not00VI01);

let khposPinak_PropSendBoolean00VI01 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI01.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI01];
khposPinak_PropSendBoolean00VI01.init(broadcastDeosHandle, "k_pinak_i1");
graph.add(khposPinak_PropSendBoolean00VI01);

//KHPOS I2
let khposPinak_yOffsetVI02 = 600;

let khposPinak_Not00VI02 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI02.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI02];
graph.add(khposPinak_Not00VI02);

let khposPinak_PropSendBoolean00VI02 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI02.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI02];
khposPinak_PropSendBoolean00VI02.init(broadcastDeosHandle, "k_pinak_i2");
graph.add(khposPinak_PropSendBoolean00VI02);

//KHPOS I3
let khposPinak_yOffsetVI03 = 700;

let khposPinak_Not00VI03 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI03.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI03];
graph.add(khposPinak_Not00VI03);

let khposPinak_PropSendBoolean00VI03 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI03.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI03];
khposPinak_PropSendBoolean00VI03.init(broadcastDeosHandle, "k_pinak_i3");
graph.add(khposPinak_PropSendBoolean00VI03);

//KHPOS I4
let khposPinak_yOffsetVI04 = 800;

let khposPinak_Not00VI04 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI04.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI04];
graph.add(khposPinak_Not00VI04);

let khposPinak_PropSendBoolean00VI04 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI04.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI04];
khposPinak_PropSendBoolean00VI04.init(broadcastDeosHandle, "k_pinak_i4");
graph.add(khposPinak_PropSendBoolean00VI04);

//KHPOS I5
let khposPinak_yOffsetVI05 = 900;

let khposPinak_Not00VI05 = LiteGraph.createNode("Deos/Not");
khposPinak_Not00VI05.pos = [khposPinakPosition.x+500,khposPinakPosition.y+khposPinak_yOffsetVI05];
graph.add(khposPinak_Not00VI05);

let khposPinak_PropSendBoolean00VI05 = LiteGraph.createNode("Deos/PropSendBoolean");
khposPinak_PropSendBoolean00VI05.pos = [khposPinakPosition.x+660,khposPinakPosition.y+khposPinak_yOffsetVI05];
khposPinak_PropSendBoolean00VI05.init(broadcastDeosHandle, "k_pinak_i5");
graph.add(khposPinak_PropSendBoolean00VI05);

khposPinak_ExpandBits00VI00.connect(0, khposPinak_Not00VI00, 0);
khposPinak_ExpandBits00VI00.connect(1, khposPinak_Not00VI01, 0);
khposPinak_ExpandBits00VI00.connect(2, khposPinak_Not00VI02, 0);
khposPinak_ExpandBits00VI00.connect(3, khposPinak_Not00VI03, 0);
khposPinak_ExpandBits00VI00.connect(4, khposPinak_Not00VI04, 0);
khposPinak_ExpandBits00VI00.connect(5, khposPinak_Not00VI05, 0);

khposPinak_Not00VI00.connect(0, khposPinak_PropSendBoolean00VI00, 0);
khposPinak_Not00VI01.connect(0, khposPinak_PropSendBoolean00VI01, 0);
khposPinak_Not00VI02.connect(0, khposPinak_PropSendBoolean00VI02, 0);
khposPinak_Not00VI03.connect(0, khposPinak_PropSendBoolean00VI03, 0);
khposPinak_Not00VI04.connect(0, khposPinak_PropSendBoolean00VI04, 0);
khposPinak_Not00VI05.connect(0, khposPinak_PropSendBoolean00VI05, 0);

//KHPOS P0 (YP00)
let yOffsetYP00 = 1000;

let khposPinak_LocalReadReg00YP00 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg00YP00.pos = [khposPinakPosition.x,khposPinakPosition.y+yOffsetYP00];
khposPinak_LocalReadReg00YP00.init(database_BusReadAllTRG00, "S42:R100");
graph.add(khposPinak_LocalReadReg00YP00);

let khposPinak_ConstNumber00YP00 = LiteGraph.createNode("Deos/ConstNumber");
khposPinak_ConstNumber00YP00.pos = [khposPinakPosition.x,khposPinakPosition.y+70+yOffsetYP00];
khposPinak_ConstNumber00YP00.init(100);
graph.add(khposPinak_ConstNumber00YP00);

let khposPinak_DivideNumber00YP00 = LiteGraph.createNode("Deos/DivideNumber");
khposPinak_DivideNumber00YP00.pos = [khposPinakPosition.x+200,khposPinakPosition.y+yOffsetYP00];
graph.add(khposPinak_DivideNumber00YP00);

let khposPinak_PropSendNumber00YP00 = LiteGraph.createNode("Deos/PropSendNumber");
khposPinak_PropSendNumber00YP00.pos = [khposPinakPosition.x+400,khposPinakPosition.y+yOffsetYP00];
khposPinak_PropSendNumber00YP00.init(broadcastDeosHandle, "k_pres_sensor_1");
graph.add(khposPinak_PropSendNumber00YP00);

let zzz_PropSaveNumber00P01 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00P01.pos = [khposPinakPosition.x+400,khposPinakPosition.y+yOffsetYP00+70];
zzz_PropSaveNumber00P01.init(g_broadcastDeosContainer, "g_alert_P01");
graph.add(zzz_PropSaveNumber00P01);
khposPinak_DivideNumber00YP00.connect(0, zzz_PropSaveNumber00P01, 0);

khposPinak_LocalReadReg00YP00.connect(0, khposPinak_DivideNumber00YP00, 0);
khposPinak_ConstNumber00YP00.connect(0, khposPinak_DivideNumber00YP00, 1);
khposPinak_DivideNumber00YP00.connect(0, khposPinak_PropSendNumber00YP00, 0);

//KHPOS T11 (YP01)
let yOffsetYP01 = 1200;

let khposPinak_LocalReadReg00YP01 = LiteGraph.createNode("Deos/LocalReadReg");
khposPinak_LocalReadReg00YP01.pos = [khposPinakPosition.x,khposPinakPosition.y+yOffsetYP01];
khposPinak_LocalReadReg00YP01.init(database_BusReadAllTRG00, "S42:R101");
graph.add(khposPinak_LocalReadReg00YP01);

let khposPinak_ConstNumber00YP01 = LiteGraph.createNode("Deos/ConstNumber");
khposPinak_ConstNumber00YP01.pos = [khposPinakPosition.x,khposPinakPosition.y+70+yOffsetYP01];
khposPinak_ConstNumber00YP01.init(10);
graph.add(khposPinak_ConstNumber00YP01);

let khposPinak_DivideNumber00YP01 = LiteGraph.createNode("Deos/DivideNumber");
khposPinak_DivideNumber00YP01.pos = [khposPinakPosition.x+200,khposPinakPosition.y+yOffsetYP01];
graph.add(khposPinak_DivideNumber00YP01);

let khposPinak_PropSendNumber00YP01 = LiteGraph.createNode("Deos/PropSendNumber");
khposPinak_PropSendNumber00YP01.pos = [khposPinakPosition.x+400,khposPinakPosition.y+yOffsetYP01];
khposPinak_PropSendNumber00YP01.init(broadcastDeosHandle, "k_temp_sensor_11");
graph.add(khposPinak_PropSendNumber00YP01);

let zzz_PropSaveNumber00T11 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00T11.pos = [khposPinakPosition.x+400,khposPinakPosition.y+yOffsetYP01+70];
zzz_PropSaveNumber00T11.init(g_broadcastDeosContainer, "g_alert_T11");
graph.add(zzz_PropSaveNumber00T11);
khposPinak_DivideNumber00YP01.connect(0, zzz_PropSaveNumber00T11, 0);

khposPinak_LocalReadReg00YP01.connect(0, khposPinak_DivideNumber00YP01, 0);
khposPinak_ConstNumber00YP01.connect(0, khposPinak_DivideNumber00YP01, 1);
khposPinak_DivideNumber00YP01.connect(0, khposPinak_PropSendNumber00YP01, 0);
//////////////////////////////////////////////////
//#endregion KHPOS PINAKAS KAI TIMES
//////////////////////////////////////////////////

let twoWayPosition = {x:1750, y:3620};
//////////////////////////////////////////////////
//#region TWO WAY VALVE
//////////////////////////////////////////////////
let twoWayBufferPosition = {x:twoWayPosition.x+0, y:twoWayPosition.y+0};
let twoWaySetpointPosition = {x:twoWayPosition.x+650, y:twoWayPosition.y};
let twoWayLatchPosition = {x:twoWayPosition.x+1250, y:twoWayPosition.y};
let twoWayRatePosition = {x:twoWayPosition.x+650, y:twoWayPosition.y+200};

//VALVE BUFFER

let twoWay_Title00 = LiteGraph.createNode("Deos/Title");
twoWay_Title00.pos = [twoWayBufferPosition.x,twoWayBufferPosition.y-220];
twoWay_Title00.init("ΕΛΕΓΧΟΣ ΔΙΟΔΗΣ ΗΛΕΚΤΡΟΒΑΝΑΣ - Ενεργοποιείται υπό δύο συνθήκες. Αν η πίεση του κλειστού κυκλώματος <Π0> πέσει κάτω από ένα σημείο <p_valve_SP> ή πέσει απότομα σε χρόνο <p_valve_dt> κατά τουλάχιστον <p_valve_dP> βάσει τιμών properties. Η Or2 είναι των δύο συνθηκών του σφάλματος.", 1800);
graph.add(twoWay_Title00);

let twoWay_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
twoWay_TickReceiverTRG00.pos = [twoWayBufferPosition.x,twoWayBufferPosition.y];
graph.add(twoWay_TickReceiverTRG00);

let twoWay_BusReadTRG00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
twoWay_BusReadTRG00.pos = [twoWayBufferPosition.x+200,twoWayBufferPosition.y];
twoWay_BusReadTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "40", "101");
graph.add(twoWay_BusReadTRG00);

let twoWay_BufferTRG00 = LiteGraph.createNode("DeosTrigger/BufferTRG");
twoWay_BufferTRG00.pos = [twoWayBufferPosition.x+400,twoWayBufferPosition.y];
graph.add(twoWay_BufferTRG00);

twoWay_TickReceiverTRG00.connect(0, twoWay_BusReadTRG00, 0);
twoWay_BusReadTRG00.connect(0, twoWay_BufferTRG00, 0);
twoWay_BusReadTRG00.connect(1, twoWay_BufferTRG00, 1);

//VALVE PRESS <= SP

let twoWay_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
twoWay_ConstNumber00.pos = [twoWaySetpointPosition.x-230,twoWaySetpointPosition.y+140];
twoWay_ConstNumber00.init(100);
graph.add(twoWay_ConstNumber00);

let twoWay_DivideNumber00 = LiteGraph.createNode("Deos/DivideNumber");
twoWay_DivideNumber00.pos = [twoWaySetpointPosition.x,twoWaySetpointPosition.y];
graph.add(twoWay_DivideNumber00);

let twoWay_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
twoWay_PropReadNumber00.pos = [twoWaySetpointPosition.x,twoWaySetpointPosition.y+90];
twoWay_PropReadNumber00.init(g_broadcastDeosContainer, "p_valve_SP");
graph.add(twoWay_PropReadNumber00);

let twoWay_PropSendNumber00 = LiteGraph.createNode("Deos/PropSendNumber");
twoWay_PropSendNumber00.pos = [twoWaySetpointPosition.x+200,twoWaySetpointPosition.y-70];
twoWay_PropSendNumber00.init(broadcastDeosHandle, "m_pres_sensor_0");
graph.add(twoWay_PropSendNumber00);

let zzz_PropSaveNumber00P00 = LiteGraph.createNode("Deos/PropSaveNumber");
zzz_PropSaveNumber00P00.pos = [twoWaySetpointPosition.x+200,twoWaySetpointPosition.y-140];
zzz_PropSaveNumber00P00.init(g_broadcastDeosContainer, "g_alert_P00");
graph.add(zzz_PropSaveNumber00P00);
twoWay_DivideNumber00.connect(0, zzz_PropSaveNumber00P00, 0);

let twoWay_LessThanOrEqual00 = LiteGraph.createNode("Deos/LessThanOrEqual");
twoWay_LessThanOrEqual00.pos = [twoWaySetpointPosition.x+200,twoWaySetpointPosition.y];
graph.add(twoWay_LessThanOrEqual00);

twoWay_BufferTRG00.connect(0, twoWay_DivideNumber00, 0);
twoWay_ConstNumber00.connect(0, twoWay_DivideNumber00, 1);
twoWay_DivideNumber00.connect(0, twoWay_PropSendNumber00, 0);
twoWay_DivideNumber00.connect(0, twoWay_LessThanOrEqual00, 0);
twoWay_PropReadNumber00.connect(0, twoWay_LessThanOrEqual00, 1);

//VALVE LATCH

let twoWay_Or200 = LiteGraph.createNode("Deos/Or2");
twoWay_Or200.pos = [twoWayLatchPosition.x,twoWayLatchPosition.y];
graph.add(twoWay_Or200);

let twoWay_ButtonTRG00 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
twoWay_ButtonTRG00.pos = [twoWayLatchPosition.x,twoWayLatchPosition.y+90];
twoWay_ButtonTRG00.init(g_broadcastDeosContainer, "p_valve_btn_rst");
graph.add(twoWay_ButtonTRG00);

let twoWay_LatchTRG00 = LiteGraph.createNode("DeosTrigger/LatchTRG");
twoWay_LatchTRG00.pos = [twoWayLatchPosition.x+200,twoWayLatchPosition.y];
graph.add(twoWay_LatchTRG00);

let twoWay_Not00 = LiteGraph.createNode("Deos/Not");
twoWay_Not00.pos = [twoWayLatchPosition.x+400,twoWayLatchPosition.y];
graph.add(twoWay_Not00);

let twoWay_PropSelectHOA00 = LiteGraph.createNode("Deos/PropSelectHOA");
twoWay_PropSelectHOA00.pos = [twoWayLatchPosition.x+560,twoWayLatchPosition.y];
twoWay_PropSelectHOA00.init(g_broadcastDeosContainer, "k_valve_select");
graph.add(twoWay_PropSelectHOA00);

let twoWay_PropSendBoolean00 = LiteGraph.createNode("Deos/PropSendBoolean");
twoWay_PropSendBoolean00.pos = [twoWayLatchPosition.x+760,twoWayLatchPosition.y];
twoWay_PropSendBoolean00.init(broadcastDeosHandle, "k_valve_isOpenning");
graph.add(twoWay_PropSendBoolean00);

let twoWay_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
twoWay_PropSaveBoolean00.pos = [twoWayLatchPosition.x+760,twoWayLatchPosition.y+70];
twoWay_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_valve_isOpenning");
graph.add(twoWay_PropSaveBoolean00);

twoWay_LessThanOrEqual00.connect(0, twoWay_Or200, 0);
twoWay_Or200.connect(0, twoWay_LatchTRG00, 0);
twoWay_ButtonTRG00.connect(0, twoWay_LatchTRG00, 1);
twoWay_LatchTRG00.connect(0, twoWay_Not00, 0);
twoWay_Not00.connect(0, twoWay_PropSelectHOA00, 0);
twoWay_PropSelectHOA00.connect(0, twoWay_PropSendBoolean00, 0);
twoWay_PropSelectHOA00.connect(0, twoWay_PropSaveBoolean00, 0);

//VALVE RATE OF CHANGE

let twoWay_DivideNumber01 = LiteGraph.createNode("Deos/DivideNumber");
twoWay_DivideNumber01.pos = [twoWayRatePosition.x,twoWayRatePosition.y];
graph.add(twoWay_DivideNumber01);

let twoWay_DivideNumber02 = LiteGraph.createNode("Deos/DivideNumber");
twoWay_DivideNumber02.pos = [twoWayRatePosition.x,twoWayRatePosition.y+100];
graph.add(twoWay_DivideNumber02);

let twoWay_SubtractNumber00 = LiteGraph.createNode("Deos/SubtractNumber");
twoWay_SubtractNumber00.pos = [twoWayRatePosition.x+200,twoWayRatePosition.y];
graph.add(twoWay_SubtractNumber00);

let twoWay_GreatThanOrEqual00 = LiteGraph.createNode("Deos/GreatThanOrEqual");
twoWay_GreatThanOrEqual00.pos = [twoWayRatePosition.x+400,twoWayRatePosition.y];
graph.add(twoWay_GreatThanOrEqual00);

let twoWay_PropReadNumber01 = LiteGraph.createNode("Deos/PropReadNumber");
twoWay_PropReadNumber01.pos = [twoWayRatePosition.x+200,twoWayRatePosition.y+90];
twoWay_PropReadNumber01.init(g_broadcastDeosContainer, "p_valve_dP");
graph.add(twoWay_PropReadNumber01);

twoWay_BufferTRG00.connect(1, twoWay_DivideNumber01, 0);
twoWay_ConstNumber00.connect(0, twoWay_DivideNumber01, 1);
twoWay_BufferTRG00.connect(0, twoWay_DivideNumber02, 0);
twoWay_ConstNumber00.connect(0, twoWay_DivideNumber02, 1);
twoWay_DivideNumber01.connect(0, twoWay_SubtractNumber00, 0);
twoWay_DivideNumber02.connect(0, twoWay_SubtractNumber00, 1);
twoWay_SubtractNumber00.connect(0, twoWay_GreatThanOrEqual00, 0);
twoWay_PropReadNumber01.connect(0, twoWay_GreatThanOrEqual00, 1);
twoWay_GreatThanOrEqual00.connect(0, twoWay_Or200, 1);
//////////////////////////////////////////////////
//#endregion TWO WAY VALVE
//////////////////////////////////////////////////

let transistorPosition = {x:1750, y:4150};
//////////////////////////////////////////////////
//#region TRANSISTOR
//////////////////////////////////////////////////
let transistor_Title00 = LiteGraph.createNode("Deos/Title");
transistor_Title00.pos = [transistorPosition.x,transistorPosition.y-80];
transistor_Title00.init("ΕΛΕΓΧΟΣ ΕΞΟΔΩΝ ΤΡΑΝΖΙΣΤΟΡ S5138 - Σύνθεση byte από επιμέρους λογικές <Valve> <Ποτίσματα> <Φωτισμοί> και εγγραφή σε <S42:R109>.", 1000);
graph.add(transistor_Title00);

//TRANSISTOR BYTE CONTRUSTION

//TRANS 00
let transOffsetY00 = 0;

let transistor_PropReadBoolean00 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean00.pos = [transistorPosition.x,transistorPosition.y+transOffsetY00];
transistor_PropReadBoolean00.init(g_broadcastDeosContainer, "g_valve_isOpenning");
graph.add(transistor_PropReadBoolean00);

let transistor_Not00 = LiteGraph.createNode("Deos/Not");
transistor_Not00.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY00];
graph.add(transistor_Not00);

//TRANS 01
let transOffsetY01 = 140;

let transistor_PropReadBoolean01 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean01.pos = [transistorPosition.x,transistorPosition.y+transOffsetY01];
transistor_PropReadBoolean01.init(g_broadcastDeosContainer, "k_transistor_01");
graph.add(transistor_PropReadBoolean01);

let transistor_Not01 = LiteGraph.createNode("Deos/Not");
transistor_Not01.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY01];
graph.add(transistor_Not01);

let transistor_PropSendBoolean01 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean01.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY01];
transistor_PropSendBoolean01.init(broadcastDeosHandle, "k_transistor_led_01");
graph.add(transistor_PropSendBoolean01);

transistor_PropReadBoolean01.connect(0, transistor_PropSendBoolean01, 0);

//TRANS 02
let transOffsetY02 = 280;

let transistor_PropReadBoolean02 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean02.pos = [transistorPosition.x,transistorPosition.y+transOffsetY02];
transistor_PropReadBoolean02.init(g_broadcastDeosContainer, "k_transistor_02");
graph.add(transistor_PropReadBoolean02);

let transistor_Not02 = LiteGraph.createNode("Deos/Not");
transistor_Not02.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY02];
graph.add(transistor_Not02);

let transistor_PropSendBoolean02 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean02.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY02];
transistor_PropSendBoolean02.init(broadcastDeosHandle, "k_transistor_led_02");
graph.add(transistor_PropSendBoolean02);

transistor_PropReadBoolean02.connect(0, transistor_PropSendBoolean02, 0);

//TRANS 03
let transOffsetY03 = 420;

let transistor_PropReadBoolean03 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean03.pos = [transistorPosition.x,transistorPosition.y+transOffsetY03];
transistor_PropReadBoolean03.init(g_broadcastDeosContainer, "k_transistor_03");
graph.add(transistor_PropReadBoolean03);

let transistor_Not03 = LiteGraph.createNode("Deos/Not");
transistor_Not03.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY03];
graph.add(transistor_Not03);

let transistor_PropSendBoolean03 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean03.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY03];
transistor_PropSendBoolean03.init(broadcastDeosHandle, "k_transistor_led_03");
graph.add(transistor_PropSendBoolean03);

transistor_PropReadBoolean03.connect(0, transistor_PropSendBoolean03, 0);

//TRANS 04
let transOffsetY04 = 560;

let transistor_PropReadBoolean04 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean04.pos = [transistorPosition.x,transistorPosition.y+transOffsetY04];
transistor_PropReadBoolean04.init(g_broadcastDeosContainer, "k_transistor_04");
graph.add(transistor_PropReadBoolean04);

let transistor_Not04 = LiteGraph.createNode("Deos/Not");
transistor_Not04.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY04];
graph.add(transistor_Not04);

let transistor_PropSendBoolean04 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean04.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY04];
transistor_PropSendBoolean04.init(broadcastDeosHandle, "k_transistor_led_04");
graph.add(transistor_PropSendBoolean04);

transistor_PropReadBoolean04.connect(0, transistor_PropSendBoolean04, 0);

//TRANS 05
let transOffsetY05 = 700;

let transistor_PropReadBoolean05 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean05.pos = [transistorPosition.x,transistorPosition.y+transOffsetY05];
transistor_PropReadBoolean05.init(g_broadcastDeosContainer, "k_transistor_05");
graph.add(transistor_PropReadBoolean05);

let transistor_Not05 = LiteGraph.createNode("Deos/Not");
transistor_Not05.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY05];
graph.add(transistor_Not05);

let transistor_PropSendBoolean05 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean05.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY05];
transistor_PropSendBoolean05.init(broadcastDeosHandle, "k_transistor_led_05");
graph.add(transistor_PropSendBoolean05);

transistor_PropReadBoolean05.connect(0, transistor_PropSendBoolean05, 0);

//TRANS 06
let transOffsetY06 = 840;

let transistor_PropReadBoolean06 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean06.pos = [transistorPosition.x,transistorPosition.y+transOffsetY06];
transistor_PropReadBoolean06.init(g_broadcastDeosContainer, "k_transistor_06");
graph.add(transistor_PropReadBoolean06);

let transistor_Not06 = LiteGraph.createNode("Deos/Not");
transistor_Not06.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY06];
graph.add(transistor_Not06);

let transistor_PropSendBoolean06 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean06.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY06];
transistor_PropSendBoolean06.init(broadcastDeosHandle, "k_transistor_led_06");
graph.add(transistor_PropSendBoolean06);

transistor_PropReadBoolean06.connect(0, transistor_PropSendBoolean06, 0);

//TRANS 07
let transOffsetY07 = 980;

let transistor_PropReadBoolean07 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean07.pos = [transistorPosition.x,transistorPosition.y+transOffsetY07];
transistor_PropReadBoolean07.init(g_broadcastDeosContainer, "k_transistor_07");
graph.add(transistor_PropReadBoolean07);

let transistor_Not07 = LiteGraph.createNode("Deos/Not");
transistor_Not07.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY07];
graph.add(transistor_Not07);

let transistor_PropSendBoolean07 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean07.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY07];
transistor_PropSendBoolean07.init(broadcastDeosHandle, "k_transistor_led_07");
graph.add(transistor_PropSendBoolean07);

transistor_PropReadBoolean07.connect(0, transistor_PropSendBoolean07, 0);

//TRANS 08
let transOffsetY08 = 1120;

let transistor_PropReadBoolean08 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean08.pos = [transistorPosition.x,transistorPosition.y+transOffsetY08];
transistor_PropReadBoolean08.init(g_broadcastDeosContainer, "k_transistor_08");
graph.add(transistor_PropReadBoolean08);

let transistor_Not08 = LiteGraph.createNode("Deos/Not");
transistor_Not08.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY08];
graph.add(transistor_Not08);

let transistor_PropSendBoolean08 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean08.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY08];
transistor_PropSendBoolean08.init(broadcastDeosHandle, "k_transistor_led_08");
graph.add(transistor_PropSendBoolean08);

transistor_PropReadBoolean08.connect(0, transistor_PropSendBoolean08, 0);

//TRANS 09
let transOffsetY09 = 1260;

let transistor_PropReadBoolean09 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean09.pos = [transistorPosition.x,transistorPosition.y+transOffsetY09];
transistor_PropReadBoolean09.init(g_broadcastDeosContainer, "k_transistor_09");
graph.add(transistor_PropReadBoolean09);

let transistor_Not09 = LiteGraph.createNode("Deos/Not");
transistor_Not09.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY09];
graph.add(transistor_Not09);

let transistor_PropSendBoolean09 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean09.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY09];
transistor_PropSendBoolean09.init(broadcastDeosHandle, "k_transistor_led_09");
graph.add(transistor_PropSendBoolean09);

transistor_PropReadBoolean09.connect(0, transistor_PropSendBoolean09, 0);

//TRANS 10
let transOffsetY10 = 1400;

let transistor_PropReadBoolean10 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean10.pos = [transistorPosition.x,transistorPosition.y+transOffsetY10];
transistor_PropReadBoolean10.init(g_broadcastDeosContainer, "k_transistor_10");
graph.add(transistor_PropReadBoolean10);

let transistor_Not10 = LiteGraph.createNode("Deos/Not");
transistor_Not10.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY10];
graph.add(transistor_Not10);

let transistor_PropSendBoolean10 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean10.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY10];
transistor_PropSendBoolean10.init(broadcastDeosHandle, "k_transistor_led_10");
graph.add(transistor_PropSendBoolean10);

transistor_PropReadBoolean10.connect(0, transistor_PropSendBoolean10, 0);

//TRANS 11
let transOffsetY11 = 1540;

let transistor_PropReadBoolean11 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean11.pos = [transistorPosition.x,transistorPosition.y+transOffsetY11];
transistor_PropReadBoolean11.init(g_broadcastDeosContainer, "k_transistor_11");
graph.add(transistor_PropReadBoolean11);

let transistor_Not11 = LiteGraph.createNode("Deos/Not");
transistor_Not11.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY11];
graph.add(transistor_Not11);

let transistor_PropSendBoolean11 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean11.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY11];
transistor_PropSendBoolean11.init(broadcastDeosHandle, "k_transistor_led_11");
graph.add(transistor_PropSendBoolean11);

transistor_PropReadBoolean11.connect(0, transistor_PropSendBoolean11, 0);

//TRANS 12
let transOffsetY12 = 1680;

let transistor_PropReadBoolean12 = LiteGraph.createNode("Deos/PropReadBoolean");
transistor_PropReadBoolean12.pos = [transistorPosition.x,transistorPosition.y+transOffsetY12];
transistor_PropReadBoolean12.init(g_broadcastDeosContainer, "k_transistor_12");
graph.add(transistor_PropReadBoolean12);

let transistor_Not12 = LiteGraph.createNode("Deos/Not");
transistor_Not12.pos = [transistorPosition.x+200,transistorPosition.y+transOffsetY12];
graph.add(transistor_Not12);

let transistor_PropSendBoolean12 = LiteGraph.createNode("Deos/PropSendBoolean");
transistor_PropSendBoolean12.pos = [transistorPosition.x+200,transistorPosition.y-70+transOffsetY12];
transistor_PropSendBoolean12.init(broadcastDeosHandle, "k_transistor_led_12");
graph.add(transistor_PropSendBoolean12);

transistor_PropReadBoolean12.connect(0, transistor_PropSendBoolean12, 0);

//REST OF SET BIT ALL 16

let transistor_ConstBoolean00 = LiteGraph.createNode("Deos/ConstBoolean");
transistor_ConstBoolean00.pos = [transistorPosition.x+500,transistorPosition.y+980];
transistor_ConstBoolean00.init("true");
graph.add(transistor_ConstBoolean00);

let transistor_SetBitAll1600 = LiteGraph.createNode("Deos/SetBitAll16");
transistor_SetBitAll1600.pos = [transistorPosition.x+700,transistorPosition.y+560];
graph.add(transistor_SetBitAll1600);

transistor_PropReadBoolean00.connect(0, transistor_Not00, 0);
transistor_Not00.connect(0, transistor_SetBitAll1600, 0);

transistor_PropReadBoolean01.connect(0, transistor_Not01, 0);
transistor_Not01.connect(0, transistor_SetBitAll1600, 1);

transistor_PropReadBoolean02.connect(0, transistor_Not02, 0);
transistor_Not02.connect(0, transistor_SetBitAll1600, 2);

transistor_PropReadBoolean03.connect(0, transistor_Not03, 0);
transistor_Not03.connect(0, transistor_SetBitAll1600, 3);

transistor_PropReadBoolean04.connect(0, transistor_Not04, 0);
transistor_Not04.connect(0, transistor_SetBitAll1600, 4);

transistor_PropReadBoolean05.connect(0, transistor_Not05, 0);
transistor_Not05.connect(0, transistor_SetBitAll1600, 5);

transistor_PropReadBoolean06.connect(0, transistor_Not06, 0);
transistor_Not06.connect(0, transistor_SetBitAll1600, 6);

transistor_PropReadBoolean07.connect(0, transistor_Not07, 0);
transistor_Not07.connect(0, transistor_SetBitAll1600, 7);

transistor_PropReadBoolean08.connect(0, transistor_Not08, 0);
transistor_Not08.connect(0, transistor_SetBitAll1600, 8);

transistor_PropReadBoolean09.connect(0, transistor_Not09, 0);
transistor_Not09.connect(0, transistor_SetBitAll1600, 9);

transistor_PropReadBoolean10.connect(0, transistor_Not10, 0);
transistor_Not10.connect(0, transistor_SetBitAll1600, 10);

transistor_PropReadBoolean11.connect(0, transistor_Not11, 0);
transistor_Not11.connect(0, transistor_SetBitAll1600, 11);

transistor_PropReadBoolean12.connect(0, transistor_Not12, 0);
transistor_Not12.connect(0, transistor_SetBitAll1600, 12);

transistor_ConstBoolean00.connect(0, transistor_SetBitAll1600, 13);
transistor_ConstBoolean00.connect(0, transistor_SetBitAll1600, 14);
transistor_ConstBoolean00.connect(0, transistor_SetBitAll1600, 15);

//TRANSISTOR WRITE
let transistor_TickReceiverTRG00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
transistor_TickReceiverTRG00.pos = [transistorPosition.x+740,transistorPosition.y+940];
graph.add(transistor_TickReceiverTRG00);

let transistor_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
transistor_BusWriteTRG00.pos = [transistorPosition.x+950,transistorPosition.y+560];
transistor_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "42", "109");
graph.add(transistor_BusWriteTRG00);

transistor_SetBitAll1600.connect(0, transistor_BusWriteTRG00, 0);
transistor_TickReceiverTRG00.connect(0, transistor_BusWriteTRG00, 1);
//////////////////////////////////////////////////
//#endregion TRANSISTOR
//////////////////////////////////////////////////

let alertsPositionGroupA = {x:3050, y:4150};
let alertsPositionGroupB = {x:4150, y:4150};
//////////////////////////////////////////////////
//#region SENSOR LIMIT ALERTS
//////////////////////////////////////////////////
let alerts_Title00 = LiteGraph.createNode("Deos/Title");
alerts_Title00.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y-80];
alerts_Title00.init("ALERTS ΑΙΣΘΗΤΗΡΙΩΝ - Έλεγχος αισθητηρίων <Τ0-Τ12> <Μ0-Μ4> <Π0-1> και ενεργοποίηση της κεντρικής ένδειξης LED του μηχανοστασίου <m_alerts_led> αλλα και ειδοποιήσεις <EMAIL>.", 2000);
graph.add(alerts_Title00);

// LIMIT T00
let offsetY_T00 = 0;

let alerts_PropReadNumber00T00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T00.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T00];
alerts_PropReadNumber00T00.init(g_broadcastDeosContainer, "g_hliak_xflow_temp");
graph.add(alerts_PropReadNumber00T00);

let alerts_PropReadNumber01T00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T00.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T00];
alerts_PropReadNumber01T00.init(g_broadcastDeosContainer, "p_limit_T00_min");
graph.add(alerts_PropReadNumber01T00);

let alerts_PropReadNumber02T00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T00.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T00];
alerts_PropReadNumber02T00.init(g_broadcastDeosContainer, "p_limit_T00_max");
graph.add(alerts_PropReadNumber02T00);

let alerts_LessThanOrEqual00T00 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T00.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T00];
graph.add(alerts_LessThanOrEqual00T00);

let alerts_GreatThanOrEqual00T00 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T00.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T00];
graph.add(alerts_GreatThanOrEqual00T00);

alerts_PropReadNumber00T00.connect(0, alerts_LessThanOrEqual00T00, 0);
alerts_PropReadNumber01T00.connect(0, alerts_LessThanOrEqual00T00, 1);
alerts_PropReadNumber00T00.connect(0, alerts_GreatThanOrEqual00T00, 0);
alerts_PropReadNumber02T00.connect(0, alerts_GreatThanOrEqual00T00, 1);

// LIMIT T01
let offsetY_T01 = 220;

let alerts_PropReadNumber00T01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T01.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T01];
alerts_PropReadNumber00T01.init(g_broadcastDeosContainer, "g_alert_T01");
graph.add(alerts_PropReadNumber00T01);

let alerts_PropReadNumber01T01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T01.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T01];
alerts_PropReadNumber01T01.init(g_broadcastDeosContainer, "p_limit_T01_min");
graph.add(alerts_PropReadNumber01T01);

let alerts_PropReadNumber02T01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T01.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T01];
alerts_PropReadNumber02T01.init(g_broadcastDeosContainer, "p_limit_T01_max");
graph.add(alerts_PropReadNumber02T01);

let alerts_LessThanOrEqual00T01 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T01.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T01];
graph.add(alerts_LessThanOrEqual00T01);

let alerts_GreatThanOrEqual00T01 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T01.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T01];
graph.add(alerts_GreatThanOrEqual00T01);

alerts_PropReadNumber00T01.connect(0, alerts_LessThanOrEqual00T01, 0);
alerts_PropReadNumber01T01.connect(0, alerts_LessThanOrEqual00T01, 1);
alerts_PropReadNumber00T01.connect(0, alerts_GreatThanOrEqual00T01, 0);
alerts_PropReadNumber02T01.connect(0, alerts_GreatThanOrEqual00T01, 1);

// LIMIT T02
let offsetY_T02 = 440;

let alerts_PropReadNumber00T02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T02.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T02];
alerts_PropReadNumber00T02.init(g_broadcastDeosContainer, "g_alert_T02");
graph.add(alerts_PropReadNumber00T02);

let alerts_PropReadNumber01T02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T02.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T02];
alerts_PropReadNumber01T02.init(g_broadcastDeosContainer, "p_limit_T02_min");
graph.add(alerts_PropReadNumber01T02);

let alerts_PropReadNumber02T02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T02.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T02];
alerts_PropReadNumber02T02.init(g_broadcastDeosContainer, "p_limit_T02_max");
graph.add(alerts_PropReadNumber02T02);

let alerts_LessThanOrEqual00T02 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T02.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T02];
graph.add(alerts_LessThanOrEqual00T02);

let alerts_GreatThanOrEqual00T02 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T02.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T02];
graph.add(alerts_GreatThanOrEqual00T02);

alerts_PropReadNumber00T02.connect(0, alerts_LessThanOrEqual00T02, 0);
alerts_PropReadNumber01T02.connect(0, alerts_LessThanOrEqual00T02, 1);
alerts_PropReadNumber00T02.connect(0, alerts_GreatThanOrEqual00T02, 0);
alerts_PropReadNumber02T02.connect(0, alerts_GreatThanOrEqual00T02, 1);

// LIMIT T03
let offsetY_T03 = 660;

let alerts_PropReadNumber00T03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T03.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T03];
alerts_PropReadNumber00T03.init(g_broadcastDeosContainer, "g_alert_T03");
graph.add(alerts_PropReadNumber00T03);

let alerts_PropReadNumber01T03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T03.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T03];
alerts_PropReadNumber01T03.init(g_broadcastDeosContainer, "p_limit_T03_min");
graph.add(alerts_PropReadNumber01T03);

let alerts_PropReadNumber02T03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T03.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T03];
alerts_PropReadNumber02T03.init(g_broadcastDeosContainer, "p_limit_T03_max");
graph.add(alerts_PropReadNumber02T03);

let alerts_LessThanOrEqual00T03 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T03.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T03];
graph.add(alerts_LessThanOrEqual00T03);

let alerts_GreatThanOrEqual00T03 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T03.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T03];
graph.add(alerts_GreatThanOrEqual00T03);

alerts_PropReadNumber00T03.connect(0, alerts_LessThanOrEqual00T03, 0);
alerts_PropReadNumber01T03.connect(0, alerts_LessThanOrEqual00T03, 1);
alerts_PropReadNumber00T03.connect(0, alerts_GreatThanOrEqual00T03, 0);
alerts_PropReadNumber02T03.connect(0, alerts_GreatThanOrEqual00T03, 1);

// LIMIT T04
let offsetY_T04 = 880;

let alerts_PropReadNumber00T04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T04.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T04];
alerts_PropReadNumber00T04.init(g_broadcastDeosContainer, "g_alert_T04");
graph.add(alerts_PropReadNumber00T04);

let alerts_PropReadNumber01T04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T04.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T04];
alerts_PropReadNumber01T04.init(g_broadcastDeosContainer, "p_limit_T04_min");
graph.add(alerts_PropReadNumber01T04);

let alerts_PropReadNumber02T04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T04.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T04];
alerts_PropReadNumber02T04.init(g_broadcastDeosContainer, "p_limit_T04_max");
graph.add(alerts_PropReadNumber02T04);

let alerts_LessThanOrEqual00T04 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T04.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T04];
graph.add(alerts_LessThanOrEqual00T04);

let alerts_GreatThanOrEqual00T04 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T04.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T04];
graph.add(alerts_GreatThanOrEqual00T04);

alerts_PropReadNumber00T04.connect(0, alerts_LessThanOrEqual00T04, 0);
alerts_PropReadNumber01T04.connect(0, alerts_LessThanOrEqual00T04, 1);
alerts_PropReadNumber00T04.connect(0, alerts_GreatThanOrEqual00T04, 0);
alerts_PropReadNumber02T04.connect(0, alerts_GreatThanOrEqual00T04, 1);

// LIMIT T05
let offsetY_T05 = 1100;

let alerts_PropReadNumber00T05 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T05.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T05];
alerts_PropReadNumber00T05.init(g_broadcastDeosContainer, "g_hliak_solar_temp");
graph.add(alerts_PropReadNumber00T05);

let alerts_PropReadNumber01T05 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T05.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T05];
alerts_PropReadNumber01T05.init(g_broadcastDeosContainer, "p_limit_T05_min");
graph.add(alerts_PropReadNumber01T05);

let alerts_PropReadNumber02T05 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T05.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T05];
alerts_PropReadNumber02T05.init(g_broadcastDeosContainer, "p_limit_T05_max");
graph.add(alerts_PropReadNumber02T05);

let alerts_LessThanOrEqual00T05 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T05.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T05];
graph.add(alerts_LessThanOrEqual00T05);

let alerts_GreatThanOrEqual00T05 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T05.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T05];
graph.add(alerts_GreatThanOrEqual00T05);

alerts_PropReadNumber00T05.connect(0, alerts_LessThanOrEqual00T05, 0);
alerts_PropReadNumber01T05.connect(0, alerts_LessThanOrEqual00T05, 1);
alerts_PropReadNumber00T05.connect(0, alerts_GreatThanOrEqual00T05, 0);
alerts_PropReadNumber02T05.connect(0, alerts_GreatThanOrEqual00T05, 1);

// LIMIT T06
let offsetY_T06 = 1320;

let alerts_PropReadNumber00T06 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T06.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T06];
alerts_PropReadNumber00T06.init(g_broadcastDeosContainer, "g_alert_T06");
graph.add(alerts_PropReadNumber00T06);

let alerts_PropReadNumber01T06 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T06.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T06];
alerts_PropReadNumber01T06.init(g_broadcastDeosContainer, "p_limit_T06_min");
graph.add(alerts_PropReadNumber01T06);

let alerts_PropReadNumber02T06 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T06.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T06];
alerts_PropReadNumber02T06.init(g_broadcastDeosContainer, "p_limit_T06_max");
graph.add(alerts_PropReadNumber02T06);

let alerts_LessThanOrEqual00T06 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T06.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T06];
graph.add(alerts_LessThanOrEqual00T06);

let alerts_GreatThanOrEqual00T06 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T06.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T06];
graph.add(alerts_GreatThanOrEqual00T06);

alerts_PropReadNumber00T06.connect(0, alerts_LessThanOrEqual00T06, 0);
alerts_PropReadNumber01T06.connect(0, alerts_LessThanOrEqual00T06, 1);
alerts_PropReadNumber00T06.connect(0, alerts_GreatThanOrEqual00T06, 0);
alerts_PropReadNumber02T06.connect(0, alerts_GreatThanOrEqual00T06, 1);

// LIMIT T07
let offsetY_T07 = 1540;

let alerts_PropReadNumber00T07 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T07.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T07];
alerts_PropReadNumber00T07.init(g_broadcastDeosContainer, "g_alert_T07");
graph.add(alerts_PropReadNumber00T07);

let alerts_PropReadNumber01T07 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T07.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T07];
alerts_PropReadNumber01T07.init(g_broadcastDeosContainer, "p_limit_T07_min");
graph.add(alerts_PropReadNumber01T07);

let alerts_PropReadNumber02T07 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T07.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T07];
alerts_PropReadNumber02T07.init(g_broadcastDeosContainer, "p_limit_T07_max");
graph.add(alerts_PropReadNumber02T07);

let alerts_LessThanOrEqual00T07 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T07.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T07];
graph.add(alerts_LessThanOrEqual00T07);

let alerts_GreatThanOrEqual00T07 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T07.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T07];
graph.add(alerts_GreatThanOrEqual00T07);

alerts_PropReadNumber00T07.connect(0, alerts_LessThanOrEqual00T07, 0);
alerts_PropReadNumber01T07.connect(0, alerts_LessThanOrEqual00T07, 1);
alerts_PropReadNumber00T07.connect(0, alerts_GreatThanOrEqual00T07, 0);
alerts_PropReadNumber02T07.connect(0, alerts_GreatThanOrEqual00T07, 1);

// LIMIT T08
let offsetY_T08 = 1760;

let alerts_PropReadNumber00T08 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T08.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T08];
alerts_PropReadNumber00T08.init(g_broadcastDeosContainer, "g_alert_T08");
graph.add(alerts_PropReadNumber00T08);

let alerts_PropReadNumber01T08 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T08.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T08];
alerts_PropReadNumber01T08.init(g_broadcastDeosContainer, "p_limit_T08_min");
graph.add(alerts_PropReadNumber01T08);

let alerts_PropReadNumber02T08 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T08.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T08];
alerts_PropReadNumber02T08.init(g_broadcastDeosContainer, "p_limit_T08_max");
graph.add(alerts_PropReadNumber02T08);

let alerts_LessThanOrEqual00T08 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T08.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T08];
graph.add(alerts_LessThanOrEqual00T08);

let alerts_GreatThanOrEqual00T08 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T08.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T08];
graph.add(alerts_GreatThanOrEqual00T08);

alerts_PropReadNumber00T08.connect(0, alerts_LessThanOrEqual00T08, 0);
alerts_PropReadNumber01T08.connect(0, alerts_LessThanOrEqual00T08, 1);
alerts_PropReadNumber00T08.connect(0, alerts_GreatThanOrEqual00T08, 0);
alerts_PropReadNumber02T08.connect(0, alerts_GreatThanOrEqual00T08, 1);

// LIMIT T09
let offsetY_T09 = 1980;

let alerts_PropReadNumber00T09 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T09.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+offsetY_T09];
alerts_PropReadNumber00T09.init(g_broadcastDeosContainer, "g_alert_T09");
graph.add(alerts_PropReadNumber00T09);

let alerts_PropReadNumber01T09 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T09.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+70+offsetY_T09];
alerts_PropReadNumber01T09.init(g_broadcastDeosContainer, "p_limit_T09_min");
graph.add(alerts_PropReadNumber01T09);

let alerts_PropReadNumber02T09 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T09.pos = [alertsPositionGroupA.x,alertsPositionGroupA.y+140+offsetY_T09];
alerts_PropReadNumber02T09.init(g_broadcastDeosContainer, "p_limit_T09_max");
graph.add(alerts_PropReadNumber02T09);

let alerts_LessThanOrEqual00T09 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T09.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+offsetY_T09];
graph.add(alerts_LessThanOrEqual00T09);

let alerts_GreatThanOrEqual00T09 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T09.pos = [alertsPositionGroupA.x+220,alertsPositionGroupA.y+100+offsetY_T09];
graph.add(alerts_GreatThanOrEqual00T09);

alerts_PropReadNumber00T09.connect(0, alerts_LessThanOrEqual00T09, 0);
alerts_PropReadNumber01T09.connect(0, alerts_LessThanOrEqual00T09, 1);
alerts_PropReadNumber00T09.connect(0, alerts_GreatThanOrEqual00T09, 0);
alerts_PropReadNumber02T09.connect(0, alerts_GreatThanOrEqual00T09, 1);

//GROUP A OR

let alerts_Or2000 = LiteGraph.createNode("Deos/Or20");
alerts_Or2000.pos = [alertsPositionGroupA.x+540,alertsPositionGroupA.y];
alerts_Or2000.init(broadcastDeosHandle, "a_Or0");
graph.add(alerts_Or2000);

let alerts_PropSaveBoolean00 = LiteGraph.createNode("Deos/PropSaveBoolean");
alerts_PropSaveBoolean00.pos = [alertsPositionGroupA.x+760,alertsPositionGroupA.y];
alerts_PropSaveBoolean00.init(g_broadcastDeosContainer, "g_alerts_group_A");
graph.add(alerts_PropSaveBoolean00);

alerts_Or2000.connect(0, alerts_PropSaveBoolean00, 0);

alerts_LessThanOrEqual00T00.connect(0, alerts_Or2000, 0);
alerts_GreatThanOrEqual00T00.connect(0, alerts_Or2000, 1);

alerts_LessThanOrEqual00T01.connect(0, alerts_Or2000, 2);
alerts_GreatThanOrEqual00T01.connect(0, alerts_Or2000, 3);

alerts_LessThanOrEqual00T02.connect(0, alerts_Or2000, 4);
alerts_GreatThanOrEqual00T02.connect(0, alerts_Or2000, 5);

alerts_LessThanOrEqual00T03.connect(0, alerts_Or2000, 6);
alerts_GreatThanOrEqual00T03.connect(0, alerts_Or2000, 7);

alerts_LessThanOrEqual00T04.connect(0, alerts_Or2000, 8);
alerts_GreatThanOrEqual00T04.connect(0, alerts_Or2000, 9);

alerts_LessThanOrEqual00T05.connect(0, alerts_Or2000, 10);
alerts_GreatThanOrEqual00T05.connect(0, alerts_Or2000, 11);

alerts_LessThanOrEqual00T06.connect(0, alerts_Or2000, 12);
alerts_GreatThanOrEqual00T06.connect(0, alerts_Or2000, 13);

alerts_LessThanOrEqual00T07.connect(0, alerts_Or2000, 14);
alerts_GreatThanOrEqual00T07.connect(0, alerts_Or2000, 15);

alerts_LessThanOrEqual00T08.connect(0, alerts_Or2000, 16);
alerts_GreatThanOrEqual00T08.connect(0, alerts_Or2000, 17);

alerts_LessThanOrEqual00T09.connect(0, alerts_Or2000, 18);
alerts_GreatThanOrEqual00T09.connect(0, alerts_Or2000, 19);

// LIMIT T10
let offsetY_T10 = 0;

let alerts_PropReadNumber00T10 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T10.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_T10];
alerts_PropReadNumber00T10.init(g_broadcastDeosContainer, "g_alert_T10");
graph.add(alerts_PropReadNumber00T10);

let alerts_PropReadNumber01T10 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T10.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_T10];
alerts_PropReadNumber01T10.init(g_broadcastDeosContainer, "p_limit_T10_min");
graph.add(alerts_PropReadNumber01T10);

let alerts_PropReadNumber02T10 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T10.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_T10];
alerts_PropReadNumber02T10.init(g_broadcastDeosContainer, "p_limit_T10_max");
graph.add(alerts_PropReadNumber02T10);

let alerts_LessThanOrEqual00T10 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T10.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_T10];
graph.add(alerts_LessThanOrEqual00T10);

let alerts_GreatThanOrEqual00T10 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T10.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_T10];
graph.add(alerts_GreatThanOrEqual00T10);

alerts_PropReadNumber00T10.connect(0, alerts_LessThanOrEqual00T10, 0);
alerts_PropReadNumber01T10.connect(0, alerts_LessThanOrEqual00T10, 1);
alerts_PropReadNumber00T10.connect(0, alerts_GreatThanOrEqual00T10, 0);
alerts_PropReadNumber02T10.connect(0, alerts_GreatThanOrEqual00T10, 1);

// LIMIT T11
let offsetY_T11 = 220;

let alerts_PropReadNumber00T11 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T11.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_T11];
alerts_PropReadNumber00T11.init(g_broadcastDeosContainer, "g_alert_T11");
graph.add(alerts_PropReadNumber00T11);

let alerts_PropReadNumber01T11 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T11.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_T11];
alerts_PropReadNumber01T11.init(g_broadcastDeosContainer, "p_limit_T11_min");
graph.add(alerts_PropReadNumber01T11);

let alerts_PropReadNumber02T11 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T11.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_T11];
alerts_PropReadNumber02T11.init(g_broadcastDeosContainer, "p_limit_T11_max");
graph.add(alerts_PropReadNumber02T11);

let alerts_LessThanOrEqual00T11 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T11.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_T11];
graph.add(alerts_LessThanOrEqual00T11);

let alerts_GreatThanOrEqual00T11 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T11.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_T11];
graph.add(alerts_GreatThanOrEqual00T11);

alerts_PropReadNumber00T11.connect(0, alerts_LessThanOrEqual00T11, 0);
alerts_PropReadNumber01T11.connect(0, alerts_LessThanOrEqual00T11, 1);
alerts_PropReadNumber00T11.connect(0, alerts_GreatThanOrEqual00T11, 0);
alerts_PropReadNumber02T11.connect(0, alerts_GreatThanOrEqual00T11, 1);

// LIMIT T12
let offsetY_T12 = 440;

let alerts_PropReadNumber00T12 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00T12.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_T12];
alerts_PropReadNumber00T12.init(g_broadcastDeosContainer, "g_alert_T12");
graph.add(alerts_PropReadNumber00T12);

let alerts_PropReadNumber01T12 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01T12.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_T12];
alerts_PropReadNumber01T12.init(g_broadcastDeosContainer, "p_limit_T12_min");
graph.add(alerts_PropReadNumber01T12);

let alerts_PropReadNumber02T12 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02T12.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_T12];
alerts_PropReadNumber02T12.init(g_broadcastDeosContainer, "p_limit_T12_max");
graph.add(alerts_PropReadNumber02T12);

let alerts_LessThanOrEqual00T12 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00T12.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_T12];
graph.add(alerts_LessThanOrEqual00T12);

let alerts_GreatThanOrEqual00T12 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00T12.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_T12];
graph.add(alerts_GreatThanOrEqual00T12);

alerts_PropReadNumber00T12.connect(0, alerts_LessThanOrEqual00T12, 0);
alerts_PropReadNumber01T12.connect(0, alerts_LessThanOrEqual00T12, 1);
alerts_PropReadNumber00T12.connect(0, alerts_GreatThanOrEqual00T12, 0);
alerts_PropReadNumber02T12.connect(0, alerts_GreatThanOrEqual00T12, 1);

// LIMIT M00
let offsetY_M00 = 660;

let alerts_PropReadNumber00M00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00M00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_M00];
alerts_PropReadNumber00M00.init(g_broadcastDeosContainer, "g_alert_M00");
graph.add(alerts_PropReadNumber00M00);

let alerts_PropReadNumber01M00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01M00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_M00];
alerts_PropReadNumber01M00.init(g_broadcastDeosContainer, "p_limit_M00_min");
graph.add(alerts_PropReadNumber01M00);

let alerts_PropReadNumber02M00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02M00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_M00];
alerts_PropReadNumber02M00.init(g_broadcastDeosContainer, "p_limit_M00_max");
graph.add(alerts_PropReadNumber02M00);

let alerts_LessThanOrEqual00M00 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00M00.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_M00];
graph.add(alerts_LessThanOrEqual00M00);

let alerts_GreatThanOrEqual00M00 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00M00.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_M00];
graph.add(alerts_GreatThanOrEqual00M00);

alerts_PropReadNumber00M00.connect(0, alerts_LessThanOrEqual00M00, 0);
alerts_PropReadNumber01M00.connect(0, alerts_LessThanOrEqual00M00, 1);
alerts_PropReadNumber00M00.connect(0, alerts_GreatThanOrEqual00M00, 0);
alerts_PropReadNumber02M00.connect(0, alerts_GreatThanOrEqual00M00, 1);

// LIMIT M01
let offsetY_M01 = 880;

let alerts_PropReadNumber00M01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00M01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_M01];
alerts_PropReadNumber00M01.init(g_broadcastDeosContainer, "g_alert_M01");
graph.add(alerts_PropReadNumber00M01);

let alerts_PropReadNumber01M01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01M01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_M01];
alerts_PropReadNumber01M01.init(g_broadcastDeosContainer, "p_limit_M01_min");
graph.add(alerts_PropReadNumber01M01);

let alerts_PropReadNumber02M01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02M01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_M01];
alerts_PropReadNumber02M01.init(g_broadcastDeosContainer, "p_limit_M01_max");
graph.add(alerts_PropReadNumber02M01);

let alerts_LessThanOrEqual00M01 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00M01.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_M01];
graph.add(alerts_LessThanOrEqual00M01);

let alerts_GreatThanOrEqual00M01 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00M01.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_M01];
graph.add(alerts_GreatThanOrEqual00M01);

alerts_PropReadNumber00M01.connect(0, alerts_LessThanOrEqual00M01, 0);
alerts_PropReadNumber01M01.connect(0, alerts_LessThanOrEqual00M01, 1);
alerts_PropReadNumber00M01.connect(0, alerts_GreatThanOrEqual00M01, 0);
alerts_PropReadNumber02M01.connect(0, alerts_GreatThanOrEqual00M01, 1);

// LIMIT M02
let offsetY_M02 = 1100;

let alerts_PropReadNumber00M02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00M02.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_M02];
alerts_PropReadNumber00M02.init(g_broadcastDeosContainer, "g_alert_M02");
graph.add(alerts_PropReadNumber00M02);

let alerts_PropReadNumber01M02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01M02.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_M02];
alerts_PropReadNumber01M02.init(g_broadcastDeosContainer, "p_limit_M02_min");
graph.add(alerts_PropReadNumber01M02);

let alerts_PropReadNumber02M02 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02M02.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_M02];
alerts_PropReadNumber02M02.init(g_broadcastDeosContainer, "p_limit_M02_max");
graph.add(alerts_PropReadNumber02M02);

let alerts_LessThanOrEqual00M02 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00M02.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_M02];
graph.add(alerts_LessThanOrEqual00M02);

let alerts_GreatThanOrEqual00M02 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00M02.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_M02];
graph.add(alerts_GreatThanOrEqual00M02);

alerts_PropReadNumber00M02.connect(0, alerts_LessThanOrEqual00M02, 0);
alerts_PropReadNumber01M02.connect(0, alerts_LessThanOrEqual00M02, 1);
alerts_PropReadNumber00M02.connect(0, alerts_GreatThanOrEqual00M02, 0);
alerts_PropReadNumber02M02.connect(0, alerts_GreatThanOrEqual00M02, 1);

// LIMIT M03
let offsetY_M03 = 1320;

let alerts_PropReadNumber00M03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00M03.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_M03];
alerts_PropReadNumber00M03.init(g_broadcastDeosContainer, "g_alert_M03");
graph.add(alerts_PropReadNumber00M03);

let alerts_PropReadNumber01M03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01M03.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_M03];
alerts_PropReadNumber01M03.init(g_broadcastDeosContainer, "p_limit_M03_min");
graph.add(alerts_PropReadNumber01M03);

let alerts_PropReadNumber02M03 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02M03.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_M03];
alerts_PropReadNumber02M03.init(g_broadcastDeosContainer, "p_limit_M03_max");
graph.add(alerts_PropReadNumber02M03);

let alerts_LessThanOrEqual00M03 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00M03.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_M03];
graph.add(alerts_LessThanOrEqual00M03);

let alerts_GreatThanOrEqual00M03 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00M03.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_M03];
graph.add(alerts_GreatThanOrEqual00M03);

alerts_PropReadNumber00M03.connect(0, alerts_LessThanOrEqual00M03, 0);
alerts_PropReadNumber01M03.connect(0, alerts_LessThanOrEqual00M03, 1);
alerts_PropReadNumber00M03.connect(0, alerts_GreatThanOrEqual00M03, 0);
alerts_PropReadNumber02M03.connect(0, alerts_GreatThanOrEqual00M03, 1);

// LIMIT M04
let offsetY_M04 = 1540;

let alerts_PropReadNumber00M04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00M04.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_M04];
alerts_PropReadNumber00M04.init(g_broadcastDeosContainer, "g_alert_M04");
graph.add(alerts_PropReadNumber00M04);

let alerts_PropReadNumber01M04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01M04.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_M04];
alerts_PropReadNumber01M04.init(g_broadcastDeosContainer, "p_limit_M04_min");
graph.add(alerts_PropReadNumber01M04);

let alerts_PropReadNumber02M04 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02M04.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_M04];
alerts_PropReadNumber02M04.init(g_broadcastDeosContainer, "p_limit_M04_max");
graph.add(alerts_PropReadNumber02M04);

let alerts_LessThanOrEqual00M04 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00M04.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_M04];
graph.add(alerts_LessThanOrEqual00M04);

let alerts_GreatThanOrEqual00M04 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00M04.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_M04];
graph.add(alerts_GreatThanOrEqual00M04);

alerts_PropReadNumber00M04.connect(0, alerts_LessThanOrEqual00M04, 0);
alerts_PropReadNumber01M04.connect(0, alerts_LessThanOrEqual00M04, 1);
alerts_PropReadNumber00M04.connect(0, alerts_GreatThanOrEqual00M04, 0);
alerts_PropReadNumber02M04.connect(0, alerts_GreatThanOrEqual00M04, 1);

// LIMIT P00
let offsetY_P00 = 1760;

let alerts_PropReadNumber00P00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00P00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_P00];
alerts_PropReadNumber00P00.init(g_broadcastDeosContainer, "g_alert_P00");
graph.add(alerts_PropReadNumber00P00);

let alerts_PropReadNumber01P00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01P00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_P00];
alerts_PropReadNumber01P00.init(g_broadcastDeosContainer, "p_limit_P00_min");
graph.add(alerts_PropReadNumber01P00);

let alerts_PropReadNumber02P00 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02P00.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_P00];
alerts_PropReadNumber02P00.init(g_broadcastDeosContainer, "p_limit_P00_max");
graph.add(alerts_PropReadNumber02P00);

let alerts_LessThanOrEqual00P00 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00P00.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_P00];
graph.add(alerts_LessThanOrEqual00P00);

let alerts_GreatThanOrEqual00P00 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00P00.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_P00];
graph.add(alerts_GreatThanOrEqual00P00);

alerts_PropReadNumber00P00.connect(0, alerts_LessThanOrEqual00P00, 0);
alerts_PropReadNumber01P00.connect(0, alerts_LessThanOrEqual00P00, 1);
alerts_PropReadNumber00P00.connect(0, alerts_GreatThanOrEqual00P00, 0);
alerts_PropReadNumber02P00.connect(0, alerts_GreatThanOrEqual00P00, 1);

// LIMIT P01
let offsetY_P01 = 1980;

let alerts_PropReadNumber00P01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber00P01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+offsetY_P01];
alerts_PropReadNumber00P01.init(g_broadcastDeosContainer, "g_alert_P01");
graph.add(alerts_PropReadNumber00P01);

let alerts_PropReadNumber01P01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber01P01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+70+offsetY_P01];
alerts_PropReadNumber01P01.init(g_broadcastDeosContainer, "p_limit_P01_min");
graph.add(alerts_PropReadNumber01P01);

let alerts_PropReadNumber02P01 = LiteGraph.createNode("Deos/PropReadNumber");
alerts_PropReadNumber02P01.pos = [alertsPositionGroupB.x,alertsPositionGroupB.y+140+offsetY_P01];
alerts_PropReadNumber02P01.init(g_broadcastDeosContainer, "p_limit_P01_max");
graph.add(alerts_PropReadNumber02P01);

let alerts_LessThanOrEqual00P01 = LiteGraph.createNode("Deos/LessThanOrEqual");
alerts_LessThanOrEqual00P01.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+offsetY_P01];
graph.add(alerts_LessThanOrEqual00P01);

let alerts_GreatThanOrEqual00P01 = LiteGraph.createNode("Deos/GreatThanOrEqual");
alerts_GreatThanOrEqual00P01.pos = [alertsPositionGroupB.x+220,alertsPositionGroupB.y+100+offsetY_P01];
graph.add(alerts_GreatThanOrEqual00P01);

alerts_PropReadNumber00P01.connect(0, alerts_LessThanOrEqual00P01, 0);
alerts_PropReadNumber01P01.connect(0, alerts_LessThanOrEqual00P01, 1);
alerts_PropReadNumber00P01.connect(0, alerts_GreatThanOrEqual00P01, 0);
alerts_PropReadNumber02P01.connect(0, alerts_GreatThanOrEqual00P01, 1);

//GROUP B OR

let alerts_Or2001 = LiteGraph.createNode("Deos/Or20");
alerts_Or2001.pos = [alertsPositionGroupB.x+540,alertsPositionGroupB.y];
alerts_Or2001.init(broadcastDeosHandle, "a_Or1");
graph.add(alerts_Or2001);

let alerts_PropSaveBoolean01 = LiteGraph.createNode("Deos/PropSaveBoolean");
alerts_PropSaveBoolean01.pos = [alertsPositionGroupB.x+760,alertsPositionGroupB.y];
alerts_PropSaveBoolean01.init(g_broadcastDeosContainer, "g_alerts_group_B");
graph.add(alerts_PropSaveBoolean01);

alerts_Or2001.connect(0, alerts_PropSaveBoolean01, 0);

alerts_LessThanOrEqual00T10.connect(0, alerts_Or2001, 0);
alerts_GreatThanOrEqual00T10.connect(0, alerts_Or2001, 1);

alerts_LessThanOrEqual00T11.connect(0, alerts_Or2001, 2);
alerts_GreatThanOrEqual00T11.connect(0, alerts_Or2001, 3);

alerts_LessThanOrEqual00T12.connect(0, alerts_Or2001, 4);
alerts_GreatThanOrEqual00T12.connect(0, alerts_Or2001, 5);

alerts_LessThanOrEqual00M00.connect(0, alerts_Or2001, 6);
alerts_GreatThanOrEqual00M00.connect(0, alerts_Or2001, 7);

alerts_LessThanOrEqual00M01.connect(0, alerts_Or2001, 8);
alerts_GreatThanOrEqual00M01.connect(0, alerts_Or2001, 9);

alerts_LessThanOrEqual00M02.connect(0, alerts_Or2001, 10);
alerts_GreatThanOrEqual00M02.connect(0, alerts_Or2001, 11);

alerts_LessThanOrEqual00M03.connect(0, alerts_Or2001, 12);
alerts_GreatThanOrEqual00M03.connect(0, alerts_Or2001, 13);

alerts_LessThanOrEqual00M04.connect(0, alerts_Or2001, 14);
alerts_GreatThanOrEqual00M04.connect(0, alerts_Or2001, 15);

alerts_LessThanOrEqual00P00.connect(0, alerts_Or2001, 16);
alerts_GreatThanOrEqual00P00.connect(0, alerts_Or2001, 17);

alerts_LessThanOrEqual00P01.connect(0, alerts_Or2001, 18);
alerts_GreatThanOrEqual00P01.connect(0, alerts_Or2001, 19);

// GROUP A | B

let alerts_PropReadBooleanF00 = LiteGraph.createNode("Deos/PropReadBoolean");
alerts_PropReadBooleanF00.pos = [alertsPositionGroupB.x+560,alertsPositionGroupB.y+500];
alerts_PropReadBooleanF00.init(g_broadcastDeosContainer, "g_alerts_group_A");
graph.add(alerts_PropReadBooleanF00);

let alerts_PropReadBooleanF01 = LiteGraph.createNode("Deos/PropReadBoolean");
alerts_PropReadBooleanF01.pos = [alertsPositionGroupB.x+560,alertsPositionGroupB.y+570];
alerts_PropReadBooleanF01.init(g_broadcastDeosContainer, "g_alerts_group_B");
graph.add(alerts_PropReadBooleanF01);

let alerts_Or2F00 = LiteGraph.createNode("Deos/Or2");
alerts_Or2F00.pos = [alertsPositionGroupB.x+760,alertsPositionGroupB.y+500];
graph.add(alerts_Or2F00);

let alerts_NotF00 = LiteGraph.createNode("Deos/Not");
alerts_NotF00.pos = [alertsPositionGroupB.x+940,alertsPositionGroupB.y+500];
graph.add(alerts_NotF00);

let alerts_PropSendBooleanF00 = LiteGraph.createNode("Deos/PropSendBoolean");
alerts_PropSendBooleanF00.pos = [alertsPositionGroupB.x+1100,alertsPositionGroupB.y+500];
alerts_PropSendBooleanF00.init(broadcastDeosHandle, "m_alerts_led");
graph.add(alerts_PropSendBooleanF00);

alerts_PropReadBooleanF00.connect(0, alerts_Or2F00, 0);
alerts_PropReadBooleanF01.connect(0, alerts_Or2F00, 1);
alerts_Or2F00.connect(0, alerts_NotF00, 0);
alerts_NotF00.connect(0, alerts_PropSendBooleanF00, 0);
//////////////////////////////////////////////////
//#endregion SENSOR LIMIT ALERTS
//////////////////////////////////////////////////

let energyPosition = {x:5650, y:4150};
//////////////////////////////////////////////////
//#region ENERGY METER TO MHX
//////////////////////////////////////////////////
let energy_Title00V00 = LiteGraph.createNode("Deos/Title");
energy_Title00V00.pos = [energyPosition.x,energyPosition.y-80];
energy_Title00V00.init("ΜΕΤΡΗΤΗΣ ΕΝΕΡΓΕΙΑΣ - ΤΙΜΕΣ ΑΠΟ ΜΗΧΑΝΗΜΑ CEM ΠΡΟΣ ΣΤΟ ΜΗΧΑΝΟΣΤΑΣΙΟ.", 600);
graph.add(energy_Title00V00);

//MHXANOSTASIO VOLTS L1
let offsetY_energy_V00 = 0;

let energy_LocalReadReg00V00 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V00.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V00];
energy_LocalReadReg00V00.init(database_BusReadAllTRG00, "S43:R1842");
graph.add(energy_LocalReadReg00V00);

let energy_PropSendNumber00V00 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V00.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V00];
energy_PropSendNumber00V00.init(broadcastDeosHandle, "m_energy_volts_l1");
graph.add(energy_PropSendNumber00V00);

energy_LocalReadReg00V00.connect(0, energy_PropSendNumber00V00, 0);

//MHXANOSTASIO VOLTS L2
let offsetY_energy_V01 = 70;

let energy_LocalReadReg00V01 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V01.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V01];
energy_LocalReadReg00V01.init(database_BusReadAllTRG00, "S43:R1844");
graph.add(energy_LocalReadReg00V01);

let energy_PropSendNumber00V01 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V01.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V01];
energy_PropSendNumber00V01.init(broadcastDeosHandle, "m_energy_volts_l2");
graph.add(energy_PropSendNumber00V01);

energy_LocalReadReg00V01.connect(0, energy_PropSendNumber00V01, 0);

//MHXANOSTASIO VOLTS L3
let offsetY_energy_V02 = 140;

let energy_LocalReadReg00V02 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V02.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V02];
energy_LocalReadReg00V02.init(database_BusReadAllTRG00, "S43:R1846");
graph.add(energy_LocalReadReg00V02);

let energy_PropSendNumber00V02 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V02.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V02];
energy_PropSendNumber00V02.init(broadcastDeosHandle, "m_energy_volts_l3");
graph.add(energy_PropSendNumber00V02);

energy_LocalReadReg00V02.connect(0, energy_PropSendNumber00V02, 0);

//MHXANOSTASIO AMPS L1
let offsetY_energy_V03 = 210;

let energy_LocalReadReg00V03 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V03.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V03];
energy_LocalReadReg00V03.init(database_BusReadAllTRG00, "S43:R1848");
graph.add(energy_LocalReadReg00V03);

let energy_PropSendNumber00V03 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V03.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V03];
energy_PropSendNumber00V03.init(broadcastDeosHandle, "m_energy_amps_l1");
graph.add(energy_PropSendNumber00V03);

energy_LocalReadReg00V03.connect(0, energy_PropSendNumber00V03, 0);

//MHXANOSTASIO AMPS L2
let offsetY_energy_V04 = 280;

let energy_LocalReadReg00V04 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V04.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V04];
energy_LocalReadReg00V04.init(database_BusReadAllTRG00, "S43:R1850");
graph.add(energy_LocalReadReg00V04);

let energy_PropSendNumber00V04 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V04.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V04];
energy_PropSendNumber00V04.init(broadcastDeosHandle, "m_energy_amps_l2");
graph.add(energy_PropSendNumber00V04);

energy_LocalReadReg00V04.connect(0, energy_PropSendNumber00V04, 0);

//MHXANOSTASIO AMPS L3
let offsetY_energy_V05 = 350;

let energy_LocalReadReg00V05 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V05.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V05];
energy_LocalReadReg00V05.init(database_BusReadAllTRG00, "S43:R1852");
graph.add(energy_LocalReadReg00V05);

let energy_PropSendNumber00V05 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V05.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V05];
energy_PropSendNumber00V05.init(broadcastDeosHandle, "m_energy_amps_l3");
graph.add(energy_PropSendNumber00V05);

energy_LocalReadReg00V05.connect(0, energy_PropSendNumber00V05, 0);

//MHXANOSTASIO COST
let offsetY_energy_V06 = 420;

let energy_LocalReadReg00V06 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V06.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V06];
energy_LocalReadReg00V06.init(database_BusReadAllTRG00, "S43:R192");
graph.add(energy_LocalReadReg00V06);

let energy_PropSendNumber00V06 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V06.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V06];
energy_PropSendNumber00V06.init(broadcastDeosHandle, "m_energy_cost_partial");
graph.add(energy_PropSendNumber00V06);

energy_LocalReadReg00V06.connect(0, energy_PropSendNumber00V06, 0);

//MHXANOSTASIO EMISSIONS
let offsetY_energy_V07 = 490;

let energy_LocalReadReg00V07 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V07.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V07];
energy_LocalReadReg00V07.init(database_BusReadAllTRG00, "S43:R194");
graph.add(energy_LocalReadReg00V07);

let energy_PropSendNumber00V07 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V07.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V07];
energy_PropSendNumber00V07.init(broadcastDeosHandle, "m_energy_emiss_partial");
graph.add(energy_PropSendNumber00V07);

energy_LocalReadReg00V07.connect(0, energy_PropSendNumber00V07, 0);

//MHXANOSTASIO KW INSTANT
let offsetY_energy_V08 = 560;

let energy_LocalReadReg00V08 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V08.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V08];
energy_LocalReadReg00V08.init(database_BusReadAllTRG00, "S43:R1868");
graph.add(energy_LocalReadReg00V08);

let energy_ConstNumber00V08 = LiteGraph.createNode("Deos/ConstNumber");
energy_ConstNumber00V08.pos = [energyPosition.x,energyPosition.y+70+offsetY_energy_V08];
energy_ConstNumber00V08.init(1000);
graph.add(energy_ConstNumber00V08);

let energy_DivideNumber00V08 = LiteGraph.createNode("Deos/DivideNumber");
energy_DivideNumber00V08.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V08];
graph.add(energy_DivideNumber00V08);

let energy_PropSendNumber00V08 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V08.pos = [energyPosition.x+400,energyPosition.y+offsetY_energy_V08];
energy_PropSendNumber00V08.init(broadcastDeosHandle, "m_energy_kw_instant");
graph.add(energy_PropSendNumber00V08);

energy_LocalReadReg00V08.connect(0, energy_DivideNumber00V08, 0);
energy_ConstNumber00V08.connect(0, energy_DivideNumber00V08, 1);
energy_DivideNumber00V08.connect(0, energy_PropSendNumber00V08, 0);

//MHXANOSTASIO KWH TOTAL
let offsetY_energy_V09 = 760;

let energy_LocalReadReg00V09 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V09.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V09];
energy_LocalReadReg00V09.init(database_BusReadAllTRG00, "S43:R0");
graph.add(energy_LocalReadReg00V09);

let energy_ConstNumber00V09 = LiteGraph.createNode("Deos/ConstNumber");
energy_ConstNumber00V09.pos = [energyPosition.x,energyPosition.y+70+offsetY_energy_V09];
energy_ConstNumber00V09.init(1000);
graph.add(energy_ConstNumber00V09);

let energy_DivideNumber00V09 = LiteGraph.createNode("Deos/DivideNumber");
energy_DivideNumber00V09.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V09];
graph.add(energy_DivideNumber00V09);

let energy_PropSendNumber00V09 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V09.pos = [energyPosition.x+400,energyPosition.y+offsetY_energy_V09];
energy_PropSendNumber00V09.init(broadcastDeosHandle, "m_energy_kwh_total");
graph.add(energy_PropSendNumber00V09);

energy_LocalReadReg00V09.connect(0, energy_DivideNumber00V09, 0);
energy_ConstNumber00V09.connect(0, energy_DivideNumber00V09, 1);
energy_DivideNumber00V09.connect(0, energy_PropSendNumber00V09, 0);

//MHXANOSTASIO HOURS TOTAL
let offsetY_energy_V10 = 960;

let energy_LocalReadReg00V10 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V10.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V10];
energy_LocalReadReg00V10.init(database_BusReadAllTRG00, "S43:R198");
graph.add(energy_LocalReadReg00V10);

let energy_ConstNumber00V10 = LiteGraph.createNode("Deos/ConstNumber");
energy_ConstNumber00V10.pos = [energyPosition.x,energyPosition.y+70+offsetY_energy_V10];
energy_ConstNumber00V10.init(3600);
graph.add(energy_ConstNumber00V10);

let energy_DivideNumber00V10 = LiteGraph.createNode("Deos/DivideNumber");
energy_DivideNumber00V10.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V10];
graph.add(energy_DivideNumber00V10);

let energy_PropSendNumber00V10 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V10.pos = [energyPosition.x+400,energyPosition.y+offsetY_energy_V10];
energy_PropSendNumber00V10.init(broadcastDeosHandle, "m_energy_hours_total");
graph.add(energy_PropSendNumber00V10);

energy_LocalReadReg00V10.connect(0, energy_DivideNumber00V10, 0);
energy_ConstNumber00V10.connect(0, energy_DivideNumber00V10, 1);
energy_DivideNumber00V10.connect(0, energy_PropSendNumber00V10, 0);

//MHXANOSTASIO KWH PARTIAL
let offsetY_energy_V11 = 1160;

let energy_LocalReadReg00V11 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V11.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V11];
energy_LocalReadReg00V11.init(database_BusReadAllTRG00, "S43:R48");
graph.add(energy_LocalReadReg00V11);

let energy_ConstNumber00V11 = LiteGraph.createNode("Deos/ConstNumber");
energy_ConstNumber00V11.pos = [energyPosition.x,energyPosition.y+70+offsetY_energy_V11];
energy_ConstNumber00V11.init(1000);
graph.add(energy_ConstNumber00V11);

let energy_DivideNumber00V11 = LiteGraph.createNode("Deos/DivideNumber");
energy_DivideNumber00V11.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V11];
graph.add(energy_DivideNumber00V11);

let energy_PropSendNumber00V11 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V11.pos = [energyPosition.x+400,energyPosition.y+offsetY_energy_V11];
energy_PropSendNumber00V11.init(broadcastDeosHandle, "m_energy_kwh_partial");
graph.add(energy_PropSendNumber00V11);

energy_LocalReadReg00V11.connect(0, energy_DivideNumber00V11, 0);
energy_ConstNumber00V11.connect(0, energy_DivideNumber00V11, 1);
energy_DivideNumber00V11.connect(0, energy_PropSendNumber00V11, 0);

//MHXANOSTASIO HOURS PARTIAL
let offsetY_energy_V12 = 1360;

let energy_LocalReadReg00V12 = LiteGraph.createNode("Deos/LocalReadReg");
energy_LocalReadReg00V12.pos = [energyPosition.x,energyPosition.y+offsetY_energy_V12];
energy_LocalReadReg00V12.init(database_BusReadAllTRG00, "S43:R196");
graph.add(energy_LocalReadReg00V12);

let energy_ConstNumber00V12 = LiteGraph.createNode("Deos/ConstNumber");
energy_ConstNumber00V12.pos = [energyPosition.x,energyPosition.y+70+offsetY_energy_V12];
energy_ConstNumber00V12.init(3600);
graph.add(energy_ConstNumber00V12);

let energy_DivideNumber00V12 = LiteGraph.createNode("Deos/DivideNumber");
energy_DivideNumber00V12.pos = [energyPosition.x+200,energyPosition.y+offsetY_energy_V12];
graph.add(energy_DivideNumber00V12);

let energy_PropSendNumber00V12 = LiteGraph.createNode("Deos/PropSendNumber");
energy_PropSendNumber00V12.pos = [energyPosition.x+400,energyPosition.y+offsetY_energy_V12];
energy_PropSendNumber00V12.init(broadcastDeosHandle, "m_energy_hours_partial");
graph.add(energy_PropSendNumber00V12);

energy_LocalReadReg00V12.connect(0, energy_DivideNumber00V12, 0);
energy_ConstNumber00V12.connect(0, energy_DivideNumber00V12, 1);
energy_DivideNumber00V12.connect(0, energy_PropSendNumber00V12, 0);
//////////////////////////////////////////////////
//#endregion ENERGY METER TO MHX
//////////////////////////////////////////////////

let energyPropPosition = {x:6450, y:4150};
//////////////////////////////////////////////////
//#region ENERGY METER FROM PROPERTIES
//////////////////////////////////////////////////
let energyProp_Title00V00 = LiteGraph.createNode("Deos/Title");
energyProp_Title00V00.pos = [energyPropPosition.x,energyPropPosition.y-80];
energyProp_Title00V00.init("ΜΕΤΡΗΤΗΣ ΕΝΕΡΓΕΙΑΣ - ΤΙΜΕΣ ΑΠΟ PROPERTIES ΠΡΟΣ MHXANHMA CEM.", 600);
graph.add(energyProp_Title00V00);

// ENERGY PROP V00
let energyProp_V00_OffsetY = 0;

let energyProp_PropReadNumber00V00 = LiteGraph.createNode("Deos/PropReadNumber");
energyProp_PropReadNumber00V00.pos = [energyPropPosition.x,energyPropPosition.y+energyProp_V00_OffsetY];
energyProp_PropReadNumber00V00.init(g_broadcastDeosContainer, "p_energy_ekwh");
graph.add(energyProp_PropReadNumber00V00);

let energyProp_ConstNumber00V00 = LiteGraph.createNode("Deos/ConstNumber");
energyProp_ConstNumber00V00.pos = [energyPropPosition.x,energyPropPosition.y+100+energyProp_V00_OffsetY];
energyProp_ConstNumber00V00.init(0);
graph.add(energyProp_ConstNumber00V00);

let energyProp_ConstNumber01V00 = LiteGraph.createNode("Deos/ConstNumber");
energyProp_ConstNumber01V00.pos = [energyPropPosition.x,energyPropPosition.y+200+energyProp_V00_OffsetY];
energyProp_ConstNumber01V00.init(10);
graph.add(energyProp_ConstNumber01V00);

let energyProp_ClampMinMax00V00 = LiteGraph.createNode("Deos/ClampMinMax");
energyProp_ClampMinMax00V00.pos = [energyPropPosition.x+200,energyPropPosition.y+energyProp_V00_OffsetY];
graph.add(energyProp_ClampMinMax00V00);

energyProp_PropReadNumber00V00.connect(0, energyProp_ClampMinMax00V00, 0);
energyProp_ConstNumber00V00.connect(0, energyProp_ClampMinMax00V00, 1);
energyProp_ConstNumber01V00.connect(0, energyProp_ClampMinMax00V00, 2);

//READ CHECK WRITE
let energyProp_TickReceiverTRG00V00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
energyProp_TickReceiverTRG00V00.pos = [energyPropPosition.x,energyPropPosition.y+300+energyProp_V00_OffsetY];
graph.add(energyProp_TickReceiverTRG00V00);

let energyProp_BusReadTRG00V00 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
energyProp_BusReadTRG00V00.pos = [energyPropPosition.x+200,energyPropPosition.y+300+energyProp_V00_OffsetY];
energyProp_BusReadTRG00V00.init(broadcastModbusHandle, g_broadcastModbusContainer, "43", "176");
graph.add(energyProp_BusReadTRG00V00);

let energyProp_IsNotEqualTRGTRG00V00 = LiteGraph.createNode("DeosTrigger/IsNotEqualTRG");
energyProp_IsNotEqualTRGTRG00V00.pos = [energyPropPosition.x+400,energyPropPosition.y+300+energyProp_V00_OffsetY];
graph.add(energyProp_IsNotEqualTRGTRG00V00);

let energyProp_BusWriteTRG00V00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
energyProp_BusWriteTRG00V00.pos = [energyPropPosition.x+640,energyPropPosition.y+260+energyProp_V00_OffsetY];
energyProp_BusWriteTRG00V00.init(broadcastModbusHandle, g_broadcastModbusContainer, "43", "176");
graph.add(energyProp_BusWriteTRG00V00);

energyProp_TickReceiverTRG00V00.connect(0, energyProp_BusReadTRG00V00, 0);
energyProp_BusReadTRG00V00.connect(0, energyProp_IsNotEqualTRGTRG00V00, 1);
energyProp_BusReadTRG00V00.connect(1, energyProp_IsNotEqualTRGTRG00V00, 2);
energyProp_IsNotEqualTRGTRG00V00.connect(0, energyProp_BusWriteTRG00V00, 1);
energyProp_ClampMinMax00V00.connect(0, energyProp_IsNotEqualTRGTRG00V00, 0);
energyProp_ClampMinMax00V00.connect(0, energyProp_BusWriteTRG00V00, 0);

// ENERGY PROP V01
let energyProp_V01_OffsetY = 500;

let energyProp_PropReadNumber00V01 = LiteGraph.createNode("Deos/PropReadNumber");
energyProp_PropReadNumber00V01.pos = [energyPropPosition.x,energyPropPosition.y+energyProp_V01_OffsetY];
energyProp_PropReadNumber00V01.init(g_broadcastDeosContainer, "p_energy_kgco2kwh");
graph.add(energyProp_PropReadNumber00V01);

let energyProp_ConstNumber00V01 = LiteGraph.createNode("Deos/ConstNumber");
energyProp_ConstNumber00V01.pos = [energyPropPosition.x,energyPropPosition.y+100+energyProp_V01_OffsetY];
energyProp_ConstNumber00V01.init(0);
graph.add(energyProp_ConstNumber00V01);

let energyProp_ConstNumber01V01 = LiteGraph.createNode("Deos/ConstNumber");
energyProp_ConstNumber01V01.pos = [energyPropPosition.x,energyPropPosition.y+200+energyProp_V01_OffsetY];
energyProp_ConstNumber01V01.init(10);
graph.add(energyProp_ConstNumber01V01);

let energyProp_ClampMinMax00V01 = LiteGraph.createNode("Deos/ClampMinMax");
energyProp_ClampMinMax00V01.pos = [energyPropPosition.x+200,energyPropPosition.y+energyProp_V01_OffsetY];
graph.add(energyProp_ClampMinMax00V01);

energyProp_PropReadNumber00V01.connect(0, energyProp_ClampMinMax00V01, 0);
energyProp_ConstNumber00V01.connect(0, energyProp_ClampMinMax00V01, 1);
energyProp_ConstNumber01V01.connect(0, energyProp_ClampMinMax00V01, 2);

//READ CHECK WRITE
let energyProp_TickReceiverTRG00V01 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
energyProp_TickReceiverTRG00V01.pos = [energyPropPosition.x,energyPropPosition.y+300+energyProp_V01_OffsetY];
graph.add(energyProp_TickReceiverTRG00V01);

let energyProp_BusReadTRG00V01 = LiteGraph.createNode("DeosTrigger/BusReadTRG");
energyProp_BusReadTRG00V01.pos = [energyPropPosition.x+200,energyPropPosition.y+300+energyProp_V01_OffsetY];
energyProp_BusReadTRG00V01.init(broadcastModbusHandle, g_broadcastModbusContainer, "43", "178");
graph.add(energyProp_BusReadTRG00V01);

let energyProp_IsNotEqualTRGTRG00V01 = LiteGraph.createNode("DeosTrigger/IsNotEqualTRG");
energyProp_IsNotEqualTRGTRG00V01.pos = [energyPropPosition.x+400,energyPropPosition.y+300+energyProp_V01_OffsetY];
graph.add(energyProp_IsNotEqualTRGTRG00V01);

let energyProp_BusWriteTRG00V01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
energyProp_BusWriteTRG00V01.pos = [energyPropPosition.x+640,energyPropPosition.y+260+energyProp_V01_OffsetY];
energyProp_BusWriteTRG00V01.init(broadcastModbusHandle, g_broadcastModbusContainer, "43", "178");
graph.add(energyProp_BusWriteTRG00V01);

energyProp_TickReceiverTRG00V01.connect(0, energyProp_BusReadTRG00V01, 0);
energyProp_BusReadTRG00V01.connect(0, energyProp_IsNotEqualTRGTRG00V01, 1);
energyProp_BusReadTRG00V01.connect(1, energyProp_IsNotEqualTRGTRG00V01, 2);
energyProp_IsNotEqualTRGTRG00V01.connect(0, energyProp_BusWriteTRG00V01, 1);
energyProp_ClampMinMax00V01.connect(0, energyProp_IsNotEqualTRGTRG00V01, 0);
energyProp_ClampMinMax00V01.connect(0, energyProp_BusWriteTRG00V01, 0);

// ENERGY BUTTON V02
let energyProp_V02_OffsetY = 1200;

let energyProp_Title00V02 = LiteGraph.createNode("Deos/Title");
energyProp_Title00V02.pos = [energyPropPosition.x,energyPropPosition.y-80+energyProp_V02_OffsetY];
energyProp_Title00V02.init("ΜΕΤΡΗΤΗΣ ΕΝΕΡΓΕΙΑΣ - Με πάτημα button μηχανοστασίου <m_energy_reset_button> αποστολή τιμής RESET <0xFF00>.", 800);
graph.add(energyProp_Title00V02);

let energyProp_ConstNumber00V02 = LiteGraph.createNode("Deos/ConstNumber");
energyProp_ConstNumber00V02.pos = [energyPropPosition.x,energyPropPosition.y+energyProp_V02_OffsetY];
energyProp_ConstNumber00V02.init(65280);
graph.add(energyProp_ConstNumber00V02);

let energyProp_ButtonTRG00V02 = LiteGraph.createNode("DeosTrigger/ButtonTRG");
energyProp_ButtonTRG00V02.pos = [energyPropPosition.x,energyPropPosition.y+100+energyProp_V02_OffsetY];
energyProp_ButtonTRG00V02.init(g_broadcastDeosContainer, "m_energy_reset_btn");
graph.add(energyProp_ButtonTRG00V02);

let energyProp_BusWriteTRG00V02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
energyProp_BusWriteTRG00V02.pos = [energyPropPosition.x+200,energyPropPosition.y+energyProp_V02_OffsetY];
energyProp_BusWriteTRG00V02.init(broadcastModbusHandle, g_broadcastModbusContainer, "43", "2048");
graph.add(energyProp_BusWriteTRG00V02);

energyProp_ConstNumber00V02.connect(0, energyProp_BusWriteTRG00V02, 0);
energyProp_ButtonTRG00V02.connect(0, energyProp_BusWriteTRG00V02, 1);
//////////////////////////////////////////////////
//#endregion ENERGY METER FROM PROPERTIES
//////////////////////////////////////////////////

let statOutdoorPosition = {x:4750, y:2950};
let statDhwPosition = {x:5250, y:2950};
let statHliakPosition = {x:5750, y:2950};
//////////////////////////////////////////////////
//#region STAT TO THERMOSTATS
//////////////////////////////////////////////////
let statOutdoor_Title00V00 = LiteGraph.createNode("Deos/Title");
statOutdoor_Title00V00.pos = [statOutdoorPosition.x,statOutdoorPosition.y-80];
statOutdoor_Title00V00.init("ΘΕΡΜΟΚΡΑΣΙΕΣ ΣΥΣΤΗΜΑΤΟΣ ΠΡΟΣ ΘΕΡΜΟΣΤΑΤΕΣ - Αποστολή εξωτερικής θερμοκρασίας <S42:R102>, ζεστού νερού χρήσης <S40:R103> και ηλιακών <S40:R107> προς θερμοστάτες <SLAVES 30,31,32>.", 1200);
graph.add(statOutdoor_Title00V00);

//STAT = statOutdoor
let statOutdoor_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
statOutdoor_LocalReadReg00.pos = [statOutdoorPosition.x,statOutdoorPosition.y];
statOutdoor_LocalReadReg00.init(database_BusReadAllTRG00, "S42:R102");
graph.add(statOutdoor_LocalReadReg00);

let statOutdoor_TickReceiverTRG00V00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
statOutdoor_TickReceiverTRG00V00.pos = [statOutdoorPosition.x,statOutdoorPosition.y+70];
graph.add(statOutdoor_TickReceiverTRG00V00);

let statOutdoor_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statOutdoor_BusWriteTRG00.pos = [statOutdoorPosition.x+200,statOutdoorPosition.y];
statOutdoor_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "66");
graph.add(statOutdoor_BusWriteTRG00);

let statOutdoor_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statOutdoor_BusWriteTRG01.pos = [statOutdoorPosition.x+200,statOutdoorPosition.y+150];
statOutdoor_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "66");
graph.add(statOutdoor_BusWriteTRG01);

let statOutdoor_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statOutdoor_BusWriteTRG02.pos = [statOutdoorPosition.x+200,statOutdoorPosition.y+300];
statOutdoor_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "66");
graph.add(statOutdoor_BusWriteTRG02);

statOutdoor_LocalReadReg00.connect(0, statOutdoor_BusWriteTRG00, 0);
statOutdoor_TickReceiverTRG00V00.connect(0, statOutdoor_BusWriteTRG00, 1);
statOutdoor_LocalReadReg00.connect(0, statOutdoor_BusWriteTRG01, 0);
statOutdoor_TickReceiverTRG00V00.connect(0, statOutdoor_BusWriteTRG01, 1);
statOutdoor_LocalReadReg00.connect(0, statOutdoor_BusWriteTRG02, 0);
statOutdoor_TickReceiverTRG00V00.connect(0, statOutdoor_BusWriteTRG02, 1);

//STAT = statDhw
let statDhw_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
statDhw_LocalReadReg00.pos = [statDhwPosition.x,statDhwPosition.y];
statDhw_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R103");
graph.add(statDhw_LocalReadReg00);

let statDhw_TickReceiverTRG00V00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
statDhw_TickReceiverTRG00V00.pos = [statDhwPosition.x,statDhwPosition.y+70];
graph.add(statDhw_TickReceiverTRG00V00);

let statDhw_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statDhw_BusWriteTRG00.pos = [statDhwPosition.x+200,statDhwPosition.y];
statDhw_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "67");
graph.add(statDhw_BusWriteTRG00);

let statDhw_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statDhw_BusWriteTRG01.pos = [statDhwPosition.x+200,statDhwPosition.y+150];
statDhw_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "67");
graph.add(statDhw_BusWriteTRG01);

let statDhw_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statDhw_BusWriteTRG02.pos = [statDhwPosition.x+200,statDhwPosition.y+300];
statDhw_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "67");
graph.add(statDhw_BusWriteTRG02);

statDhw_LocalReadReg00.connect(0, statDhw_BusWriteTRG00, 0);
statDhw_TickReceiverTRG00V00.connect(0, statDhw_BusWriteTRG00, 1);
statDhw_LocalReadReg00.connect(0, statDhw_BusWriteTRG01, 0);
statDhw_TickReceiverTRG00V00.connect(0, statDhw_BusWriteTRG01, 1);
statDhw_LocalReadReg00.connect(0, statDhw_BusWriteTRG02, 0);
statDhw_TickReceiverTRG00V00.connect(0, statDhw_BusWriteTRG02, 1);

//STAT = statHliak
let statHliak_LocalReadReg00 = LiteGraph.createNode("Deos/LocalReadReg");
statHliak_LocalReadReg00.pos = [statHliakPosition.x,statHliakPosition.y];
statHliak_LocalReadReg00.init(database_BusReadAllTRG00, "S40:R107");
graph.add(statHliak_LocalReadReg00);

let statHliak_TickReceiverTRG00V00 = LiteGraph.createNode("DeosTrigger/TickReceiverTRG");
statHliak_TickReceiverTRG00V00.pos = [statHliakPosition.x,statHliakPosition.y+70];
graph.add(statHliak_TickReceiverTRG00V00);

let statHliak_BusWriteTRG00 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statHliak_BusWriteTRG00.pos = [statHliakPosition.x+200,statHliakPosition.y];
statHliak_BusWriteTRG00.init(broadcastModbusHandle, g_broadcastModbusContainer, "30", "68");
graph.add(statHliak_BusWriteTRG00);

let statHliak_BusWriteTRG01 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statHliak_BusWriteTRG01.pos = [statHliakPosition.x+200,statHliakPosition.y+150];
statHliak_BusWriteTRG01.init(broadcastModbusHandle, g_broadcastModbusContainer, "31", "68");
graph.add(statHliak_BusWriteTRG01);

let statHliak_BusWriteTRG02 = LiteGraph.createNode("DeosTrigger/BusWriteTRG");
statHliak_BusWriteTRG02.pos = [statHliakPosition.x+200,statHliakPosition.y+300];
statHliak_BusWriteTRG02.init(broadcastModbusHandle, g_broadcastModbusContainer, "32", "68");
graph.add(statHliak_BusWriteTRG02);

statHliak_LocalReadReg00.connect(0, statHliak_BusWriteTRG00, 0);
statHliak_TickReceiverTRG00V00.connect(0, statHliak_BusWriteTRG00, 1);
statHliak_LocalReadReg00.connect(0, statHliak_BusWriteTRG01, 0);
statHliak_TickReceiverTRG00V00.connect(0, statHliak_BusWriteTRG01, 1);
statHliak_LocalReadReg00.connect(0, statHliak_BusWriteTRG02, 0);
statHliak_TickReceiverTRG00V00.connect(0, statHliak_BusWriteTRG02, 1);
//////////////////////////////////////////////////
//#endregion STATS TO THERMOSTATS
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//#region TICKERS (Should be last!)
//////////////////////////////////////////////////
const tickerPosition = {x:50, y:-50};

//TRIGGER FAST
let ticker_ConstNumber00 = LiteGraph.createNode("Deos/ConstNumber");
ticker_ConstNumber00.pos = [tickerPosition.x-170,tickerPosition.y];
ticker_ConstNumber00.init(5000);
graph.add(ticker_ConstNumber00);

let ticker_TimerTRG00 = LiteGraph.createNode("DeosTrigger/TimerTRG");
ticker_TimerTRG00.pos = [tickerPosition.x,tickerPosition.y];
graph.add(ticker_TimerTRG00);

ticker_ConstNumber00.connect(0, ticker_TimerTRG00, 0);

let ticker_TickSenderTRG00 = LiteGraph.createNode("DeosTrigger/TickSenderTRG");
ticker_TickSenderTRG00.pos = [tickerPosition.x+200,tickerPosition.y];
ticker_TickSenderTRG00.init("Fast");
ticker_TickSenderTRG00.addReceiver(relay_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(regelchreg_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(demuS30_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(demuS31_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(demuS32_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(operS30_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(operS31_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(operS32_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(speedS30_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(speedS31_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(speedS32_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(modeS0_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(setpointS0_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(setpointS1_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(setpointS2_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(ypogYpTemp_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogYpFan_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogYpEnd_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(ypogGrTemp_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogGrFan_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogGrEnd_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(ypogKoTemp_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogKoFan_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(ypogKoEnd_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(endodHyd_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(endodKyk_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(endodProp_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(dhw_TickReceiverTRG00);
ticker_TickSenderTRG00.addReceiver(dhwProp_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(transistor_TickReceiverTRG00);

ticker_TickSenderTRG00.addReceiver(energyProp_TickReceiverTRG00V00);
ticker_TickSenderTRG00.addReceiver(energyProp_TickReceiverTRG00V01);

ticker_TickSenderTRG00.addReceiver(statOutdoor_TickReceiverTRG00V00);
ticker_TickSenderTRG00.addReceiver(statHliak_TickReceiverTRG00V00);
ticker_TickSenderTRG00.addReceiver(statDhw_TickReceiverTRG00V00);

graph.add(ticker_TickSenderTRG00);

ticker_TimerTRG00.connect(0, ticker_TickSenderTRG00, 0);

//TRIGGER ENDODAPEDIA
let ticker_ConstNumber01 = LiteGraph.createNode("Deos/ConstNumber");
ticker_ConstNumber01.pos = [tickerPosition.x-170,tickerPosition.y-100];
ticker_ConstNumber01.init(3000);
graph.add(ticker_ConstNumber01);

let ticker_TimerTRG01 = LiteGraph.createNode("DeosTrigger/TimerTRG");
ticker_TimerTRG01.pos = [tickerPosition.x,tickerPosition.y-100];
graph.add(ticker_TimerTRG01);

ticker_ConstNumber01.connect(0, ticker_TimerTRG01, 0);

let ticker_TickSenderTRG01 = LiteGraph.createNode("DeosTrigger/TickSenderTRG");
ticker_TickSenderTRG01.pos = [tickerPosition.x+200,tickerPosition.y-100];
ticker_TickSenderTRG01.init("Endodap");
ticker_TickSenderTRG01.addReceiver(triod_TickReceiverTRG00);
ticker_TickSenderTRG01.addReceiver(triod_TickReceiverTRG01);
graph.add(ticker_TickSenderTRG01);

ticker_TimerTRG01.connect(0, ticker_TickSenderTRG01, 0);

//TRIGGER VALVE
let ticker_PropReadNumber00 = LiteGraph.createNode("Deos/PropReadNumber");
ticker_PropReadNumber00.pos = [tickerPosition.x-400,tickerPosition.y-200];
ticker_PropReadNumber00.init(g_broadcastDeosContainer, "p_valve_dt");
graph.add(ticker_PropReadNumber00);

let ticker_ConstNumber02 = LiteGraph.createNode("Deos/ConstNumber");
ticker_ConstNumber02.pos = [tickerPosition.x-400,tickerPosition.y-130];
ticker_ConstNumber02.init(1000);
graph.add(ticker_ConstNumber02);

let ticker_MultiplyNumber00 = LiteGraph.createNode("Deos/MultiplyNumber");
ticker_MultiplyNumber00.pos = [tickerPosition.x-200,tickerPosition.y-200];
graph.add(ticker_MultiplyNumber00);

let ticker_TimerTRG02 = LiteGraph.createNode("DeosTrigger/TimerTRG");
ticker_TimerTRG02.pos = [tickerPosition.x,tickerPosition.y-200];
graph.add(ticker_TimerTRG02);

ticker_PropReadNumber00.connect(0, ticker_MultiplyNumber00, 0);
ticker_ConstNumber02.connect(0, ticker_MultiplyNumber00, 1);
ticker_MultiplyNumber00.connect(0, ticker_TimerTRG02, 0);

let ticker_TickSenderTRG02 = LiteGraph.createNode("DeosTrigger/TickSenderTRG");
ticker_TickSenderTRG02.pos = [tickerPosition.x+200,tickerPosition.y-200];
ticker_TickSenderTRG02.init("ValveTime");
ticker_TickSenderTRG02.addReceiver(twoWay_TickReceiverTRG00);
graph.add(ticker_TickSenderTRG02);

ticker_TimerTRG02.connect(0, ticker_TickSenderTRG02, 0);
//////////////////////////////////////////////////
//#endregion
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//DEBUG
//////////////////////////////////////////////////
let g_get_coordinates = false;

//document.addEventListener("keypress", DebugGetPositionKey);
function DebugGetPositionKey(e)
{
    if(e.key === "p" || e.key === "P")
    {
        g_get_coordinates = !g_get_coordinates;
    }
}

//document.addEventListener("click", DebugGetPositionClick);
function DebugGetPositionClick(e)
{
    if(g_get_coordinates) console.log("Χ = " + (-1*e.target.data.canvas_mouse[0]) + ", Υ = " + (-1*e.target.data.canvas_mouse[1]));
}

//////////////////////////////////////////////////
//DEBUG SAVE IMAGES
//////////////////////////////////////////////////
let g_xxx = 2200;
let g_yyy = 3200;

//document.addEventListener("keypress", SaveImage);
function SaveImage(e)
{   
    if(e.key === "s" || e.key === "S")
    {
        // MOVE
        canvas.ds.offset[0] = g_xxx; //x
        canvas.ds.offset[1] = g_yyy; //y

        // SAVE IMAGE
        // var image = canvasHandle.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
        // window.location.href=image; // it will save locally

        setTimeout(GetImage, 2000);

        // MOVE VARS
        g_xxx -= 1800;
        if(g_xxx < -11000)
        {
            g_xxx = 2200;
            g_yyy -= 1000;
            if(g_yyy < -7000) alert("Telos!");
        }
    }
}

function GetImage()
{
    canvasHandle.toBlob(function(blob) { 
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
    });
}

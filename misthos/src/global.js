//////////////////////////////////////////////////
// GLOBAL - LOGIKH
//////////////////////////////////////////////////
const g_SidebarInterval = 1000 //ms
const g_DeosDatabaseInterval = 5000 //ms
const g_Titles =
{
    "1" : "IDU LG (Δνση: 1, Χώρος: Υπνοδωμάτιο υπογείου)",
    "2" : "IDU LG (Δνση: 2, Χώρος: Γραφείο υπογείου)",
    "3" : "IDU LG (Δνση: 3, Χώρος: Σαλόνι υπογείου)",
    "9" : "HYDRO LG (Δνση: 9, Χώρος: Μηχανοστάσιο)",

    "10": "WILO STRATOS (Δνση: 10, Χώρος: Μηχανοστάσιο)",

    "30": "REGELTECHNIK (Δνση: 30, Χώρος: Υπνοδωμάτιο υπογείου)",
    "31": "REGELTECHNIK (Δνση: 31, Χώρος: Γραφείο υπογείου)",
    "32": "REGELTECHNIK (Δνση: 32, Χώρος: Σαλόνι υπογείου)",
    
    "40": "S5102 (Δνση: 40, Χώρος: Πίνακας)",
    "41": "S5140 (Δνση: 41, Χώρος: Πίνακας)",
    "42": "S5138 (Δνση: 42, Χώρος: Πίνακας)",
    "43": "CEM-C21 (Δνση: 43, Χώρος: Πίνακας)",
}

//CANVAS
const g_min_scale         = 0.2;  //Don't change.
const g_max_scale         = 1.0;  //Don't change.
const g_scale             = 0.65; //Zoom. //0.7 Default zoom!!!
const g_offsetX           = 200;  //X = (+) Αριστερά, (-) Δεξιά
const g_offsetY           = 200;  //Y = (+) Πάνω, (-), Κάτω
const g_LitegraphInterval = 1000  //ms

//DEBUG
const debug_deos_communication      = false;
const debug_modbus_communication    = false;
const debug_sidebar                 = false;

//PERFORMANCE
const performance_prop_database     = false;

//////////////////////////////////////////////////
// GLOBAL - THERMOSTATES
//////////////////////////////////////////////////
const g_RymaskonUpdateInterval = 1000;

//DEBUG
const debug_modbus_packet_received          = false;
const debug_modbus_read_single_response     = false;
const debug_modbus_read_all_response        = false;
const debug_modbus_write_single_response    = false;

//////////////////////////////////////////////////
// GLOBAL - MHXANOSTASIO
//////////////////////////////////////////////////

//DEBUG
const debug_deos_container_mhxanostasio     = false;
const debug_deos_container_try_mhxanostasio = false;

//PERFORMANCE
const performance_prop_incomming            = false;

//////////////////////////////////////////////////
// GLOBAL - PARAMETROI
//////////////////////////////////////////////////
const g_PropertiesSendInterval = 1000;

//DEBUG
const debug_deos_container_properties     = false;
const debug_deos_container_try_properties = false;

//////////////////////////////////////////////////
// GLOBAL - LITEGRAPH CUSTOM NODES
//////////////////////////////////////////////////

//GLOBAL SIZES
g_TinySize = 140;
g_SmallSize = 160;
g_MidSize = 180;
g_LargeSize = 200;
g_HugeSize = 250;

//NUMBER TO STRING
function Number2String(inValue)
{
    return String(inValue).substring(0,6);
}

//GENERATE ID
const characters ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateId(length)
{
    let result = "";
    const charactersLength = characters.length;
    for (let i=0; i<length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

//////////////////////////////////////////////////
// GLOBAL - YPOGEIO
//////////////////////////////////////////////////
const g_AddDesigns = false;
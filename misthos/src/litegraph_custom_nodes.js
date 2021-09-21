//////////////////////////////////////////////////
//INPUTS
//WIDGETS OR PROPERTIES (WITH NUMBER)
//LOGIC
//NAMING (WITH STRING SUBSTRIING)
//OUTPUTS
//////////////////////////////////////////////////
let g_color_global       = "#440000";
let g_color_properties   = "#444400";
let g_color_mhxanostasio = "#000033";
let g_color_orofos       = "#000066";
let g_color_khpos        = "#000099";
let g_color_bus          = "#111111";
let g_color_local_bus    = "#002200";

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//DEOS COMMUNICATION TRIGGER NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////










/*
this.c_propName = null;
    }

    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);

        //NAMING
        this.inputs[0].name = `${this.c_propName} = ${in0}`;
        
        //CREATE PACKET
        let packetRequest = {};
        packetRequest[this.c_propName] = in0;

        //SEND PACKET
        this.c_comHandle.postMessage(packetRequest);
*/













//////////////////////////////////////////////////
// DEOS OR2 (Checked)
//////////////////////////////////////////////////
class Or20
{
    constructor()
    {
        this.addInput("B0", "boolean");
        this.addInput("B1", "boolean");
        this.addInput("B2", "boolean");
        this.addInput("B3", "boolean");
        this.addInput("B4", "boolean");
        this.addInput("B5", "boolean");
        this.addInput("B6", "boolean");
        this.addInput("B7", "boolean");
        this.addInput("B8", "boolean");
        this.addInput("B9", "boolean");
        this.addInput("B10", "boolean");
        this.addInput("B11", "boolean");
        this.addInput("B12", "boolean");
        this.addInput("B13", "boolean");
        this.addInput("B14", "boolean");
        this.addInput("B15", "boolean");
        this.addInput("B16", "boolean");
        this.addInput("B17", "boolean");
        this.addInput("B18", "boolean");
        this.addInput("B19", "boolean");
        this.addOutput("OR", "boolean");

        this.size[0] = g_LargeSize;
    }
    
    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;
    }

    onExecute()
    {
        //INPUTS

        let B0 = this.getInputData(0);
        let B1 = this.getInputData(1);
        let B2 = this.getInputData(2);
        let B3 = this.getInputData(3);
        let B4 = this.getInputData(4);
        let B5 = this.getInputData(5);
        let B6 = this.getInputData(6);
        let B7 = this.getInputData(7);
        let B8 = this.getInputData(8);
        let B9 = this.getInputData(9);
        let B10 = this.getInputData(10);
        let B11 = this.getInputData(11);
        let B12 = this.getInputData(12);
        let B13 = this.getInputData(13);
        let B14 = this.getInputData(14);
        let B15 = this.getInputData(15);
        let B16 = this.getInputData(16);
        let B17 = this.getInputData(17);
        let B18 = this.getInputData(18);
        let B19 = this.getInputData(19);

        //LOGIC

        let out = Boolean(B0|B1|B2|B3|B4|B5|B6|B7|B8|B9|B10|B11|B12|B13|B14|B15|B16|B17|B18|B19);

        //OUTPUTS

        this.setOutputData(0, out);

        //NAMING

        this.inputs[0].name = `B0 = ${B0}`;
        this.inputs[1].name = `B1 = ${B1}`;
        this.inputs[2].name = `B2 = ${B2}`;
        this.inputs[3].name = `B3 = ${B3}`;
        this.inputs[4].name = `B4 = ${B4}`;
        this.inputs[5].name = `B5 = ${B5}`;
        this.inputs[6].name = `B6 = ${B6}`;
        this.inputs[7].name = `B7 = ${B7}`;
        this.inputs[8].name = `B8 = ${B8}`;
        this.inputs[9].name = `B9 = ${B9}`;
        this.inputs[10].name = `B10 = ${B10}`;
        this.inputs[11].name = `B11 = ${B11}`;
        this.inputs[12].name = `B12 = ${B12}`;
        this.inputs[13].name = `B13 = ${B13}`;
        this.inputs[14].name = `B14 = ${B14}`;
        this.inputs[15].name = `B15 = ${B15}`;
        this.inputs[16].name = `B16 = ${B16}`;
        this.inputs[17].name = `B17 = ${B17}`;
        this.inputs[18].name = `B18 = ${B18}`;
        this.inputs[19].name = `B19 = ${B19}`;

        this.outputs[0].name = `OR = ${out}`;

        //PACKET BROADCAST

        for(let i=0; i<20; i++)
        {
            let inpBool = this.getInputData(i);

            if(inpBool)
            {
                let addedChar = "";
                if(i<10) addedChar = "0";

                //CREATE PACKET
                let packetRequest = {};
                packetRequest[this.c_propName] = addedChar+i;

                //SEND PACKET
                this.c_comHandle.postMessage(packetRequest);
            }
        }
    }
}
LiteGraph.registerNodeType("Deos/Or20", Or20);

//////////////////////////////////////////////////
// DEOS SET MULTIPLE BITS (Checked)
//////////////////////////////////////////////////
class SetBitAll16
{
    constructor()
    {
        this.addInput("B0", "boolean");
        this.addInput("B1", "boolean");
        this.addInput("B2", "boolean");
        this.addInput("B3", "boolean");
        this.addInput("B4", "boolean");
        this.addInput("B5", "boolean");
        this.addInput("B6", "boolean");
        this.addInput("B7", "boolean");
        this.addInput("B8", "boolean");
        this.addInput("B9", "boolean");
        this.addInput("B10", "boolean");
        this.addInput("B11", "boolean");
        this.addInput("B12", "boolean");
        this.addInput("B13", "boolean");
        this.addInput("B14", "boolean");
        this.addInput("B15", "boolean");
        
        this.addOutput("ValOut", "number");
        
        this.size[0] = g_MidSize;
    }

    onExecute()
    {
        //INPUTS
        let b0   = this.getInputData(0);
        let b1   = this.getInputData(1);
        let b2   = this.getInputData(2);
        let b3   = this.getInputData(3);
        let b4   = this.getInputData(4);
        let b5   = this.getInputData(5);
        let b6   = this.getInputData(6);
        let b7   = this.getInputData(7);
        let b8   = this.getInputData(8);
        let b9   = this.getInputData(9);
        let b10   = this.getInputData(10);
        let b11   = this.getInputData(11);
        let b12   = this.getInputData(12);
        let b13   = this.getInputData(13);
        let b14   = this.getInputData(14);
        let b15   = this.getInputData(15);

        //LOGIC
        let outVal = 0;
        
        if(b0 === true) outVal |=  (1<<0);
        else            outVal &= ~(1<<0);
        
        if(b1 === true) outVal |=  (1<<1);
        else            outVal &= ~(1<<1);
        
        if(b2 === true) outVal |=  (1<<2);
        else            outVal &= ~(1<<2);
        
        if(b3 === true) outVal |=  (1<<3);
        else            outVal &= ~(1<<3);
        
        if(b4 === true) outVal |=  (1<<4);
        else            outVal &= ~(1<<4);
        
        if(b5 === true) outVal |=  (1<<5);
        else            outVal &= ~(1<<5);
        
        if(b6 === true) outVal |=  (1<<6);
        else            outVal &= ~(1<<6);
        
        if(b7 === true) outVal |=  (1<<7);
        else            outVal &= ~(1<<7);

        if(b8 === true) outVal |=  (1<<8);
        else            outVal &= ~(1<<8);
        
        if(b9 === true) outVal |=  (1<<9);
        else            outVal &= ~(1<<9);
        
        if(b10 === true) outVal |=  (1<<10);
        else            outVal &= ~(1<<10);
        
        if(b11 === true) outVal |=  (1<<11);
        else            outVal &= ~(1<<11);
        
        if(b12 === true) outVal |=  (1<<12);
        else            outVal &= ~(1<<12);
        
        if(b13 === true) outVal |=  (1<<13);
        else            outVal &= ~(1<<13);
        
        if(b14 === true) outVal |=  (1<<14);
        else            outVal &= ~(1<<14);
        
        if(b15 === true) outVal |=  (1<<15);
        else            outVal &= ~(1<<15);

        //NAMING
        this.inputs[0].name  = `Β0 = ${b0}`;
        this.inputs[1].name  = `Β1 = ${b1}`;
        this.inputs[2].name  = `Β2 = ${b2}`;
        this.inputs[3].name  = `Β3 = ${b3}`;
        this.inputs[4].name  = `Β4 = ${b4}`;
        this.inputs[5].name  = `Β5 = ${b5}`;
        this.inputs[6].name  = `Β6 = ${b6}`;
        this.inputs[7].name  = `Β7 = ${b7}`;
        this.inputs[8].name  = `Β0 = ${b8}`;
        this.inputs[9].name  = `Β1 = ${b9}`;
        this.inputs[10].name  = `Β2 = ${b10}`;
        this.inputs[11].name  = `Β3 = ${b11}`;
        this.inputs[12].name  = `Β4 = ${b12}`;
        this.inputs[13].name  = `Β5 = ${b13}`;
        this.inputs[14].name  = `Β6 = ${b14}`;
        this.inputs[15].name  = `Β7 = ${b15}`;
        
        this.outputs[0].name = `ValOut = ${Number2String(outVal)}`;

        //OUTPUTS
        this.setOutputData(0, outVal);
    }
}
LiteGraph.registerNodeType("Deos/SetBitAll16", SetBitAll16);

//////////////////////////////////////////////////
// DEOS BUFFER TRIGGER (Checked)
//////////////////////////////////////////////////
class BufferTRG
{
    constructor()
    {
        this.addInput("In", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("O0", "number");
        this.addOutput("O1", "number");
        this.addOutput("O2", "number");
        this.addOutput("O3", "number");
        
        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //LOGIC
            let inVal = this.getInputData(0);

            //OUTPUTS
            this.setOutputData(3, this.outputs[2]._data);
            this.setOutputData(2, this.outputs[1]._data);
            this.setOutputData(1, this.outputs[0]._data);
            this.setOutputData(0, inVal);

            //NAMING
            this.inputs[0].name  = `In = ${inVal}`;
            this.outputs[0].name = `O0 = ${this.outputs[0]._data}`;
            this.outputs[1].name = `O1 = ${this.outputs[1]._data}`;
            this.outputs[2].name = `O2 = ${this.outputs[2]._data}`;
            this.outputs[3].name = `O3 = ${this.outputs[3]._data}`;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/BufferTRG", BufferTRG);

//////////////////////////////////////////////////
// DEOS LATCH (Checked)
//////////////////////////////////////////////////
class LatchTRG
{
    constructor()
    {
        this.addInput("Set", "boolean");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Out", "boolean");
        
        this.c_out = false;
        this.size[0] = g_MidSize;
    }

    onExecute()
    {
        //INPUTS
        let set = this.getInputData(0);

        //LOGIC
        if(set)
        {
            this.c_out = true;
        }

        //NAMING
        this.inputs[0].name  = `Set = ${set}`;
        this.outputs[0].name = `Out = ${this.c_out}`;

        //OUTPUTS
        this.setOutputData(0, this.c_out);
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //LOGIC
            this.c_out = false;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/LatchTRG", LatchTRG);

//////////////////////////////////////////////////
// DEOS NOR2 (Checked)
//////////////////////////////////////////////////
class Nor2
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addOutput("A NOR B", "boolean");

        this.size[0] = g_MidSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);

        let out = Boolean(!(A|B));

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A NOR B = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/Nor2", Nor2);

//////////////////////////////////////////////////
// DEOS EXPAND BITS (Checked)
//////////////////////////////////////////////////
class ExpandBits
{
    constructor()
    {
        this.addInput("N0", "number");

        this.addOutput("B0", "boolean");
        this.addOutput("B1", "boolean");
        this.addOutput("B2", "boolean");
        this.addOutput("B3", "boolean");
        this.addOutput("B4", "boolean");
        this.addOutput("B5", "boolean");
        this.addOutput("B6", "boolean");
        this.addOutput("B7", "boolean");
        
        this.size[0] = g_MidSize;
    }

    onExecute()
    {
        //INPUTS
        let n0   = this.getInputData(0);

        //LOGIC
        let b0 = undefined;
        let b1 = undefined;
        let b2 = undefined;
        let b3 = undefined;
        let b4 = undefined;
        let b5 = undefined;
        let b6 = undefined;
        let b7 = undefined;
        
        b0 = (n0 & (1<<0) ? true : false);
        b1 = (n0 & (1<<1) ? true : false);
        b2 = (n0 & (1<<2) ? true : false);
        b3 = (n0 & (1<<3) ? true : false);
        b4 = (n0 & (1<<4) ? true : false);
        b5 = (n0 & (1<<5) ? true : false);
        b6 = (n0 & (1<<6) ? true : false);
        b7 = (n0 & (1<<7) ? true : false);

        //NAMING
        this.inputs[0].name  = `N0 = ${Number2String(n0)}`;

        this.outputs[0].name  = `Β0 = ${b0}`;
        this.outputs[1].name  = `Β1 = ${b1}`;
        this.outputs[2].name  = `Β2 = ${b2}`;
        this.outputs[3].name  = `Β3 = ${b3}`;
        this.outputs[4].name  = `Β4 = ${b4}`;
        this.outputs[5].name  = `Β5 = ${b5}`;
        this.outputs[6].name  = `Β6 = ${b6}`;
        this.outputs[7].name  = `Β7 = ${b7}`;

        //OUTPUTS
        this.setOutputData(0, b0);
        this.setOutputData(1, b1);
        this.setOutputData(2, b2);
        this.setOutputData(3, b3);
        this.setOutputData(4, b4);
        this.setOutputData(5, b5);
        this.setOutputData(6, b6);
        this.setOutputData(7, b7);
    }
}
LiteGraph.registerNodeType("Deos/ExpandBits", ExpandBits);

//////////////////////////////////////////////////
// DEOS PROPERTIES WRITE NUMBER TRIGGER (Checked)
//////////////////////////////////////////////////
class PropSendBooleanTRG
{
    constructor()
    {
        this.addInput("", "boolean");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.size[0] = g_MidSize;
        this.c_propName = null;
    }
    
    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;
        
        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let in0 = this.getInputData(0);

            //NAMING
            this.inputs[0].name = `${this.c_propName} = ${in0}`;
            
            //CREATE PACKET
            let packetRequest = {};
            packetRequest[this.c_propName] = in0;

            //SEND PACKET
            this.c_comHandle.postMessage(packetRequest);
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/PropSendBooleanTRG", PropSendBooleanTRG);

//////////////////////////////////////////////////
// DEOS Num2BoolTRG (Checked)
//////////////////////////////////////////////////
class Num2BoolTRG
{
    constructor()
    {
        this.addInput("Num", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Bool", "boolean");
        this.addOutput("Tick", LiteGraph.EVENT);
        
        this.size[0] = g_MidSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let inNum = this.getInputData(0);

            //LOGIC
            let outBool = undefined;

            if(inNum === 0)
            {
                outBool = false;
            }
            else
            {
                outBool = true;
            }

            this.inputs[0].name  = `Num = ${Number2String(inNum)}`;
            this.outputs[0].name = `Bool = ${outBool}`;

            //OUTPUTS
            this.setOutputData(0, outBool);
            this.trigger("Tick"); //SHOULD BE LAST
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/Num2BoolTRG", Num2BoolTRG);

//////////////////////////////////////////////////
// DEOS Num2Bool (Checked)
//////////////////////////////////////////////////
class Num2Bool
{
    constructor()
    {
        this.addInput("Num", "number");

        this.addOutput("Bool", "boolean");
        
        this.size[0] = g_MidSize;
    }

    onExecute()
    {
        //INPUTS
        let inNum = this.getInputData(0);

        //LOGIC
        let outBool = undefined;

        if(inNum === 0)
        {
            outBool = false;
        }
        else
        {
            outBool = true;
        }

        this.inputs[0].name  = `Num = ${Number2String(inNum)}`;
        this.outputs[0].name = `Bool = ${outBool}`;

        //OUTPUTS
        this.setOutputData(0, outBool);
    }
}
LiteGraph.registerNodeType("Deos/Num2Bool", Num2Bool);

//////////////////////////////////////////////////
// DEOS TITLE (Checked)
//////////////////////////////////////////////////
class Title
{
    constructor()
    {
        this.addInput("Title", "boolean");
    }

    init(inName, inSize)
    {
        this.inputs[0].name  = inName;
        this.size[0] = inSize;
    }

    onExecute()
    {
        //Empty...
    }
}
LiteGraph.registerNodeType("Deos/Title", Title);

//////////////////////////////////////////////////
// DEOSTRIGGER IS NOT EQUAL (Checked)
//////////////////////////////////////////////////
class IsNotEqualTRG
{
    constructor()
    {
        this.addInput("Ain", "number");
        this.addInput("Bin", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Tick", LiteGraph.EVENT);
        
        this.size[0] = g_MidSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let Ain = this.getInputData(0);
            let Bin = this.getInputData(1);
            
            //LOGIC
            if(Ain !== Bin)
            {
                //OUTPUTS
                this.trigger("Tick");
            }

            this.inputs[0].name  = `Ain = ${Number2String(Ain)}`;
            this.inputs[1].name  = `Bin = ${Number2String(Bin)}`;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/IsNotEqualTRG", IsNotEqualTRG);

//////////////////////////////////////////////////
// DEOS SET MULTIPLE BITS (Checked)
//////////////////////////////////////////////////
class SetBitAll
{
    constructor()
    {
        this.addInput("B0", "boolean");
        this.addInput("B1", "boolean");
        this.addInput("B2", "boolean");
        this.addInput("B3", "boolean");
        this.addInput("B4", "boolean");
        this.addInput("B5", "boolean");
        this.addInput("B6", "boolean");
        this.addInput("B7", "boolean");
        
        this.addOutput("ValOut", "number");
        
        this.size[0] = g_MidSize;
    }

    onExecute()
    {
        //INPUTS
        let b0   = this.getInputData(0);
        let b1   = this.getInputData(1);
        let b2   = this.getInputData(2);
        let b3   = this.getInputData(3);
        let b4   = this.getInputData(4);
        let b5   = this.getInputData(5);
        let b6   = this.getInputData(6);
        let b7   = this.getInputData(7);

        //LOGIC
        let outVal = 0;
        
        if(b0 === true) outVal |=  (1<<0);
        else            outVal &= ~(1<<0);
        
        if(b1 === true) outVal |=  (1<<1);
        else            outVal &= ~(1<<1);
        
        if(b2 === true) outVal |=  (1<<2);
        else            outVal &= ~(1<<2);
        
        if(b3 === true) outVal |=  (1<<3);
        else            outVal &= ~(1<<3);
        
        if(b4 === true) outVal |=  (1<<4);
        else            outVal &= ~(1<<4);
        
        if(b5 === true) outVal |=  (1<<5);
        else            outVal &= ~(1<<5);
        
        if(b6 === true) outVal |=  (1<<6);
        else            outVal &= ~(1<<6);
        
        if(b7 === true) outVal |=  (1<<7);
        else            outVal &= ~(1<<7);

        //NAMING
        this.inputs[0].name  = `Β0 = ${b0}`;
        this.inputs[1].name  = `Β1 = ${b1}`;
        this.inputs[2].name  = `Β2 = ${b2}`;
        this.inputs[3].name  = `Β3 = ${b3}`;
        this.inputs[4].name  = `Β4 = ${b4}`;
        this.inputs[5].name  = `Β5 = ${b5}`;
        this.inputs[6].name  = `Β6 = ${b6}`;
        this.inputs[7].name  = `Β7 = ${b7}`;
        
        this.outputs[0].name = `ValOut = ${Number2String(outVal)}`;

        //OUTPUTS
        this.setOutputData(0, outVal);
    }
}
LiteGraph.registerNodeType("Deos/SetBitAll", SetBitAll);

//////////////////////////////////////////////////
// DEOS SET BIT (Checked)
//////////////////////////////////////////////////
class SetBit
{
    constructor()
    {
        this.addInput("ValIn", "number");
        this.addInput("State", "boolean");
        
        this.addOutput("ValOut", "number");

        this.addWidget("text", "Bit");
        
        this.size[0] = g_MidSize;
    }

    init(inBit)
    {
        this.widgets[0].value = inBit;
    }

    onExecute()
    {
        //INPUTS
        let inVal   = this.getInputData(0);
        let inState = this.getInputData(1);
        let inBit = this.widgets[0].value;

        //LOGIC
        let outVal = undefined;
        if(inState === true)
        {
            outVal = inVal | (1<<inBit);
        }
        else if (inState === false)
        {
            outVal = inVal & ~(1<<inBit);
        }

        this.inputs[0].name  = `Valin = ${Number2String(inVal)}`;
        this.inputs[1].name  = `State = ${inState}`;
        this.outputs[0].name = `ValOut = ${Number2String(outVal)}`;

        //OUTPUTS
        this.setOutputData(0, outVal);
    }
}
LiteGraph.registerNodeType("Deos/SetBit", SetBit);

//////////////////////////////////////////////////
// DEOS MULTIPLEXER (Checked)
//////////////////////////////////////////////////
class Multiplexer2
{
    constructor()
    {
        this.addInput("S", "boolean");
        this.addInput("A", "number");
        this.addInput("B", "number");

        this.addOutput("Q", "number");
        
        this.size[0] = g_SmallSize;
    }

    onExecute()
    {
        let S = this.getInputData(0);
        let A = this.getInputData(1);
        let B = this.getInputData(2);
        
        //LOGIC
        let out = 0;
        if(S)
        {
            out = B;
        }
        else
        {
            out = A;
        }

        //OUTPUT
        this.setOutputData(0, out);

        //NAMING
        this.inputs[0].name = `S = ${S}`;
        this.inputs[1].name = `A = ${Number2String(A)}`;
        this.inputs[2].name = `B = ${Number2String(B)}`;
        this.outputs[0].name = `Q = ${Number2String(out)}`;
    }
}
LiteGraph.registerNodeType("Deos/Multiplexer2", Multiplexer2);

//////////////////////////////////////////////////
// DEOSTRIGGER DEMULTIPLEXER TRIGGER (Checked)
//////////////////////////////////////////////////
class DemultiplexerTRG
{
    constructor()
    {
        this.addInput("S0", "boolean");
        this.addInput("S1", "boolean");

        this.addInput("Trigger", LiteGraph.ACTION);
        
        this.addOutput("Tick 0", LiteGraph.EVENT);
        this.addOutput("Tick 1", LiteGraph.EVENT);
        this.addOutput("Tick 2", LiteGraph.EVENT);
        this.addOutput("Tick 3", LiteGraph.EVENT);
        
        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            let s0 = this.getInputData(0);
            let s1 = this.getInputData(1);

            let switchNum = s0<<0 | s1<<1;

            switch(switchNum)
            {
                case 0:
                    this.trigger("Tick 0");
                    break;
                case 1:
                    this.trigger("Tick 1");
                    break;
                case 2:
                    this.trigger("Tick 2");
                    break;
                case 3:
                    this.trigger("Tick 3");
                    break;
            }

            //NAMING
            this.inputs[0].name = `S0 = ${s0}`;
            this.inputs[1].name = `S1 = ${s1}`;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/DemultiplexerTRG", DemultiplexerTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER BUTTON TRIGGER (Checked)
//////////////////////////////////////////////////
class ButtonTRG
{
    constructor()
    {
        this.addOutput("Tick", LiteGraph.EVENT);
        this.addWidget("text", "", "");
        
        this.size[0] = g_SmallSize;
    }

    init(inComContainer, inName)
    {
        this.widgets[0].name = inName;
        inComContainer[inName] = this; //Name and Instance storing in container.

        if(inName.substring(0,2) === "g_") this.color = g_color_global;
        if(inName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onReceive()
    {
        this.trigger("Tick");
    }
}
LiteGraph.registerNodeType("DeosTrigger/ButtonTRG", ButtonTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER TICK SENDER TRIGGER (Checked)
//////////////////////////////////////////////////
class TickSenderTRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);

        this.arrayHandle = [];

        this.c_name;
        this.size[0] = g_SmallSize;
    }

    init(inName)
    {
        this.c_name = inName;
        this.inputs[0].name = "Trigger "+inName;
    }

    addReceiver(inHandle)
    {
        this.arrayHandle.push(inHandle.onCall.bind(inHandle));
        inHandle.outputs[0].name = "Tick "+this.c_name;
    }

    onAction(inAction)
    {
        if(inAction === this.inputs[0].name)
        {
            for(let i=0; i<this.arrayHandle.length; i++)
            {
                this.arrayHandle[i]();
            }
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/TickSenderTRG", TickSenderTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER TICK RECEIVER TRIGGER (Checked)
//////////////////////////////////////////////////
class TickReceiverTRG
{
    constructor()
    {
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_TinySize;
    }

    onCall()
    {
        this.triggerSlot(0);
    }
}
LiteGraph.registerNodeType("DeosTrigger/TickReceiverTRG", TickReceiverTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER TICK OR TRIGGER 2 (Checked)
//////////////////////////////////////////////////
class OrTrigger2TRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/OrTrigger2TRG", OrTrigger2TRG);

//////////////////////////////////////////////////
// DEOSTRIGGER TICK OR TRIGGER 3 (Checked)
//////////////////////////////////////////////////
class OrTrigger3TRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/OrTrigger3TRG", OrTrigger3TRG);

//////////////////////////////////////////////////
// DEOSTRIGGER TICK OR TRIGGER 5 (Checked)
//////////////////////////////////////////////////
class OrTrigger5TRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/OrTrigger5TRG", OrTrigger5TRG);

//////////////////////////////////////////////////
// DEOS PULSE DELAY TRIGGER (Checked)
//////////////////////////////////////////////////
class PulsePassOffDelayTRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Tick", LiteGraph.EVENT);
        this.addOutput("Remain", "number");

        this.addWidget("text", "Remain (sec)");

        this.c_started = false;
        this.c_sent = false;
        this.c_timeRemaining = 0;

        this.size[0] = g_MidSize;
    }

    init(inRemainSec)
    {
        if(typeof inRemainSec !== "string") console.error("Wrong variable type (inRemainSec).");

        this.widgets[0].value = inRemainSec;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            if(this.c_started === false)
            {
                this.trigger("Tick");

                this.c_started = true;
                this.c_timeRemaining = Number(this.widgets[0].value);
            }
        }
    }

    onExecute()
    {
        if(this.c_started === true)
        {
            this.c_timeRemaining -= this.graph.elapsed_time;
            
            if(this.c_timeRemaining <= 0)
            {
                this.c_timeRemaining = 0;
                this.c_started = false;
            }
        }

        //NAMING
        this.outputs[1].name = `Remain = ${this.c_timeRemaining.toFixed(0)}`;

        //OUTPUTS
        this.setOutputData(1, Math.floor(this.c_timeRemaining));
    }
}
LiteGraph.registerNodeType("DeosTrigger/PulsePassOffDelayTRG", PulsePassOffDelayTRG);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//MODBUS COMMUNICATION TRIGGER NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// DEOSTRIGGER BUS READ TRIGGER (Checked)
//////////////////////////////////////////////////
class SetBitTRG
{
    constructor()
    {
        this.addInput("State", "boolean");

        this.addInput("ValIn", "number");
        this.addInput("Trigger", LiteGraph.ACTION);
        
        this.addOutput("ValOut", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.addWidget("text", "Bit");
        
        this.size[0] = g_MidSize;
    }

    init(inBit)
    {
        this.widgets[0].value = inBit;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let inState = this.getInputData(0);
            let inVal   = this.getInputData(1);
            let inBit = this.widgets[0].value;

            //LOGIC
            let outVal = undefined;
            if(inState === true)
            {
                outVal = inVal | (1<<inBit);
            }
            else if (inState === false)
            {
                outVal = inVal & ~(1<<inBit);
            }

            //NAMING
            this.inputs[0].name  = `State = ${inState}`;
            this.inputs[1].name  = `Valin = ${Number2String(inVal)}`;
            this.outputs[0].name = `ValOut = ${Number2String(outVal)}`;

            //OUTPUTS
            this.setOutputData(0, outVal);
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/SetBitTRG", SetBitTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER BUS READ TRIGGER (Checked)
//////////////////////////////////////////////////
class BusReadTRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addWidget("text", "Slave");
        this.addWidget("text", "Reg");

        this.addOutput("Value", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.c_comHandle;
        this.c_masterid = generateId(16);

        this.size[0] = g_SmallSize;
        this.color = g_color_bus;
    }

    init(inComHandle, inComContainer, inSlave, inReg)
    {
        this.c_comHandle = inComHandle;

        inComContainer[this.c_masterid] = this; //Master Id and Instance storing in container.

        this.widgets[0].value = inSlave;
        this.widgets[1].value = inReg;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //CREATE PACKET
            let packetRequest =
            {
                masterid: this.c_masterid,
                slave: this.widgets[0].value,
                action: "rs",
                register: this.widgets[1].value
            }

            //SEND PACKET
            this.c_comHandle.postMessage(packetRequest);
        }
    }

    onReceive(inPacketData)
    {
        this.outputs[0].name = `Value = ${Number2String(inPacketData.value)}`;

        //OUTPUTS
        this.setOutputData(0, inPacketData.value);
        this.trigger("Tick");
    }
}
LiteGraph.registerNodeType("DeosTrigger/BusReadTRG", BusReadTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER BUS WRITE TRIGGER (Checked)
//////////////////////////////////////////////////
class BusWriteTRG
{
    constructor()
    {
        this.addInput("Value", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addWidget("text", "Slave");
        this.addWidget("text", "Reg");

        this.addOutput("Tick", LiteGraph.EVENT);

        this.c_masterid = generateId(16);
        this.c_comHandle;

        this.size[0] = g_SmallSize;
        this.color = g_color_bus;
    }

    init(inComHandle, inComContainer, inSlave, inReg)
    {
        this.c_comHandle = inComHandle;

        inComContainer[this.c_masterid] = this; //Master Id and Instance storing in container.

        this.widgets[0].value = inSlave;
        this.widgets[1].value = inReg;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            let value = Number(this.getInputData(0));
            if(!isNaN(value) && typeof value === "number")
            {
                ////// value = Math.floor(value) //Register has no decimals. (UNDERWAY) (CHANGED IN THE MIDDLE OF THE PROJECT) (BEEN CANCELLED FOR STRATOS FLOATS)

                //NAMING
                this.inputs[0].name = `Value = ${Number2String(value)}`;

                //CREATE PACKET
                let packetRequest =
                {
                    "masterid": this.c_masterid,
                    "slave": this.widgets[0].value,
                    "action": "ws",
                    "register": this.widgets[1].value,
                    "value": value
                }

                //SEND PACKET
                this.c_comHandle.postMessage(packetRequest);
            }
        }
    }

    onReceive()
    {
        //OUTPUTS
        this.trigger("Tick");
    }
}
LiteGraph.registerNodeType("DeosTrigger/BusWriteTRG", BusWriteTRG);

//////////////////////////////////////////////////
// DEOS BUS READ ALL TRIGGER (Checked)
//////////////////////////////////////////////////
class BusReadAllTRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);

        this.c_comHandle;
        this.c_masterid = generateId(16);

        this.slaveArray = [];

        this.size[0] = g_MidSize;
        this.color = g_color_local_bus;
    }

    init(inComHandle, inComContainer)
    {
        this.c_comHandle = inComHandle;
        inComContainer[this.c_masterid] = this; //Master Id and Instance storing in container.
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //CREATE PACKET
            let packetRequest =
            {
                "masterid": this.c_masterid,
                "action": "ra"
            }

            //SEND PACKET
            this.c_comHandle.postMessage(packetRequest);
        }
    }

    onReceive(inReceive)
    {
        let widgetCounter = 0;

        for (const inSlave in inReceive.register) //For all slaves in packet.
        {
            let slaveAdded = this.slaveArray.includes(inSlave); //Is slave already added?

            if(!slaveAdded) //If slave not added add widget for each reg that has "data-ir" class in slave.
            {
                this.slaveArray.push(inSlave);

                for (const inReg in inReceive.register[inSlave])
                {
                    if(inReceive.register[inSlave][inReg][4].includes("data-ir"))
                    {
                        this.addWidget("text", "S"+inSlave+":R"+inReg, inReceive.register[inSlave][inReg][0])
                    }
                }

                this.size[0] = g_MidSize; //Set size again because it resets after add widget.
            }
            else
            {
                for (const inReg in inReceive.register[inSlave])
                {
                    if(inReceive.register[inSlave][inReg][4].includes("data-ir"))
                    {
                        this.widgets[widgetCounter++].value = inReceive.register[inSlave][inReg][0];
                    }
                }
            }
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/BusReadAllTRG", BusReadAllTRG); //Class name is shown on node tree. Also is name in code.

//////////////////////////////////////////////////
// DEOS LOCAL READ REGISTER (Checked)
//////////////////////////////////////////////////
class LocalReadReg
{
    constructor()
    {
        this.addOutput("", "number");

        this.size[0] = g_SmallSize;

        this.c_handle = null;
        this.c_name = null;
        this.c_pos = null;
        this.c_found = false;

        this.color = g_color_local_bus;
    }

    init(inHandle, inRegLocalName)
    {
        this.c_handle = inHandle;
        this.c_name = inRegLocalName;
    }

    onExecute()
    {
        if(!this.c_found && this.c_handle.widgets != undefined)
        {
            for(let i=0; i<this.c_handle.widgets.length; i++)
            {
                if(this.c_handle.widgets[i].name == this.c_name)
                {
                    this.c_pos = i;
                    this.c_found = true;
                }
            }
        }
        else if (this.c_handle.widgets != undefined)
        {
            //LOGIC
            let value = this.c_handle.widgets[this.c_pos].value;

            //NAMING
            this.outputs[0].name = `${this.c_name} = ${value}`;

            //OUTPUTS
            this.setOutputData(0, value);
        }
    }
}
LiteGraph.registerNodeType("Deos/LocalReadReg", LocalReadReg);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//DEOS TRIGGER NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// DEOSTRIGGER ADD NUMBER TRIGGER
//////////////////////////////////////////////////
class AddNumberTRG
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("A+B", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let A = this.getInputData(0);
            let B = this.getInputData(1);

            //LOGIC
            let value = A+B;
            
            //NAMING
            this.inputs[0].name = `A = ${Number2String(A)}`;
            this.inputs[1].name = `B = ${Number2String(B)}`;
            this.outputs[0].name = `A+B = ${Number2String(value)}`;
            
            //OUTPUTS
            this.setOutputData(0, value);
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/AddNumberTRG", AddNumberTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER SUBTRACT NUMBER TRIGGER
//////////////////////////////////////////////////
class SubNumberTRG
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("A-B", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let A = this.getInputData(0);
            let B = this.getInputData(1);

            //LOGIC
            let value = Math.round((A-B)*10)/10;
            
            //NAMING
            this.inputs[0].name = `A = ${Number2String(A)}`;
            this.inputs[1].name = `B = ${Number2String(B)}`;
            this.outputs[0].name = `A-B = ${Number2String(value)}`;
            
            //OUTPUTS
            this.setOutputData(0, value);
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/SubNumberTRG", SubNumberTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER MULTIPLY NUMBER TRIGGER (Checked)
//////////////////////////////////////////////////
class MulNumberTRG
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("A*B", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let A = this.getInputData(0);
            let B = this.getInputData(1);

            //LOGIC
            let value = A*B;
            
            //NAMING
            this.inputs[0].name = `A = ${Number2String(A)}`;
            this.inputs[1].name = `B = ${Number2String(B)}`;
            this.outputs[0].name = `A*B = ${Number2String(value)}`;
            
            //OUTPUTS
            this.setOutputData(0, value);
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/MulNumberTRG", MulNumberTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER DIVIDE NUMBER TRIGGER (Checked)
//////////////////////////////////////////////////
class DivNumberTRG
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("A/B", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let A = this.getInputData(0);
            let B = this.getInputData(1);

            //LOGIC
            let value = A/B;
            
            //NAMING
            this.inputs[0].name = `A = ${Number2String(A)}`;
            this.inputs[1].name = `B = ${Number2String(B)}`;
            this.outputs[0].name = `A/B = ${Number2String(value)}`;
            
            //OUTPUTS
            this.setOutputData(0, value);
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/DivNumberTRG", DivNumberTRG);

//////////////////////////////////////////////////
// DEOSTRIGGER WATCH TRIGGER
//////////////////////////////////////////////////
class WatchTRG
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("Trigger", LiteGraph.ACTION);
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let A = this.getInputData(0);

            //NAMING
            this.inputs[0].name = `A = ${Number2String(A)}`;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/WatchTRG", WatchTRG);

//////////////////////////////////////////////////
// DEOS TIMER WITH STATE TRIGGER
//////////////////////////////////////////////////
class TimerTRG
{
    constructor()
    {
        this.addInput("Time", "number")
        this.addOutput("Tick", LiteGraph.EVENT);

        this.c_timeElapsed = 0;
        this.size[0] = g_TinySize;
    }

    onExecute()
    {
        //INPUTS
        let time = this.getInputData(0)/1000;

        //LOGIC
        this.c_timeElapsed += this.graph.elapsed_time;

        if(this.c_timeElapsed >= time)
        {
            this.c_timeElapsed = 0;

            //OUTPUTS
            this.trigger("Tick");
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/TimerTRG", TimerTRG);

//////////////////////////////////////////////////
// DEOS PROPERTIES TOGGLE BOOLEAN TRIGGER (Checked)
//////////////////////////////////////////////////
class PropToggleBoolTRG
{
    constructor()
    {
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addWidget("text");

        this.c_containerHandle;

        this.size[0] = g_MidSize;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_containerHandle = inBroadcastDeosContainerHandle;
        this.widgets[0].name = inPropName;
        this.widgets[0].value = this.c_containerHandle[this.widgets[0].name];

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let strBool = this.c_containerHandle[this.widgets[0].name];

            //LOGIC
            let out = undefined;
            if(strBool === "true" || strBool === true)
            {
                out = false;
            }
            if(strBool === "false" || strBool === false)
            {
                out = true;
            }

            //OUPUTS
            this.c_containerHandle[this.widgets[0].name] = out;

            //NAMING
            this.widgets[0].value = out;
        }
    }
}
LiteGraph.registerNodeType("Deos/PropToggleBoolTRG", PropToggleBoolTRG);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//DEOS NORMAL NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// DEOS CONSTANT NUMBER (Checked)
//////////////////////////////////////////////////
class ConstNumber
{
    constructor()
    {
        this.addOutput("Num", "number");
        this.addWidget("text", "Const");

        this.size[0] = g_TinySize;
    }

    init(inNumber)
    {
        this.widgets[0].value = inNumber;
    }

    onExecute()
    {
        //WIDGETS
        let widget0 = Number(this.widgets[0].value);

        //NAMING
        this.outputs[0].name = `Num = ${Number2String(widget0)}`;

        //OUTPUTS
        this.setOutputData(0, widget0);
    }
}
LiteGraph.registerNodeType("Deos/ConstNumber", ConstNumber);

//////////////////////////////////////////////////
// DEOS CONSTANT BOOLEAN (Checked)
//////////////////////////////////////////////////
class ConstBoolean
{
    constructor()
    {
        this.addOutput("Bool", "boolean");
        this.addWidget("text", "Bool");

        this.size[0] = g_TinySize;
    }

    init(inState)
    {
        this.widgets[0].value = inState;
    }

    onExecute()
    {
        //LOGIC
        let state = undefined;
        if(this.widgets[0].value === "true")
        {
            state = true;
        }
        else if(this.widgets[0].value === "false")
        {
            state = false;
        }

        //NAMING
        this.outputs[0].name = `Bool = ${state}`;

        //OUPUTS
        this.setOutputData(0, state);
    }
}
LiteGraph.registerNodeType("Deos/ConstBoolean", ConstBoolean);

//////////////////////////////////////////////////
// DEOS ADD NUMBER (Checked)
//////////////////////////////////////////////////
class AddNumber
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A+B", "number");

        this.size[0] = g_SmallSize;
    }

    onExecute()
    {
        let A = Number(this.getInputData(0));
        let B = Number(this.getInputData(1));
        let value = A+B;
        
        this.setOutputData(0, value);

        this.inputs[0].name = `A = ${Number2String(A)}`;
        this.inputs[1].name = `B = ${Number2String(B)}`;
        this.outputs[0].name = `A+B = ${Number2String(value)}`;
    }
}
LiteGraph.registerNodeType("Deos/AddNumber", AddNumber);

//////////////////////////////////////////////////
// DEOS SUBTRACT NUMBER (Checked)
//////////////////////////////////////////////////
class SubtractNumber
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A-B", "number");

        this.size[0] = g_SmallSize;
    }

    onExecute()
    {
        //INPUTS
        let A = this.getInputData(0);
        let B = this.getInputData(1);

        //LOGIC
        let value = Math.round((A-B)*10)/10;
        
        //OUTPUTS
        this.setOutputData(0, value);

        //NAMING
        this.inputs[0].name = `A = ${Number2String(A)}`;
        this.inputs[1].name = `B = ${Number2String(B)}`;
        this.outputs[0].name = `A-B = ${Number2String(value)}`;
    }
}
LiteGraph.registerNodeType("Deos/SubtractNumber", SubtractNumber);

//////////////////////////////////////////////////
// DEOS MULTIPLY NUMBER (Checked)
//////////////////////////////////////////////////
class MultiplyNumber
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A*B", "number");

        this.size[0] = g_SmallSize;
    }

    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        let value = A*B;
        
        this.setOutputData(0, value);

        this.inputs[0].name = `A = ${Number2String(A)}`;
        this.inputs[1].name = `B = ${Number2String(B)}`;
        this.outputs[0].name = `A*B = ${Number2String(value)}`;
    }
}
LiteGraph.registerNodeType("Deos/MultiplyNumber", MultiplyNumber);

//////////////////////////////////////////////////
// DEOS DIVIDE NUMBER (Checked)
//////////////////////////////////////////////////
class DivideNumber
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A/B", "number");

        this.size[0] = g_SmallSize;
    }

    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        let value = Math.round((A/B)*10)/10;
        
        this.setOutputData(0, value);

        this.inputs[0].name = `A = ${Number2String(A)}`;
        this.inputs[1].name = `B = ${Number2String(B)}`;
        this.outputs[0].name = `A/B = ${Number2String(value)}`;
    }
}
LiteGraph.registerNodeType("Deos/DivideNumber", DivideNumber);

//////////////////////////////////////////////////
// DEOS PROPERTIES (Checked)
//////////////////////////////////////////////////
class PropIncoming
{
    constructor()
    {
        this.addInput("", "number");

        this.c_comContainerHandle;
        this.size[0] = g_HugeSize;

        this.widgetCount = 0;
    }
    
    init(inComContainer)
    {
        this.c_comContainerHandle = inComContainer; //Keep the communication container handle/
    }
    
    onExecute()
    {
        const t0 = performance.now();

        let keyCount = Object.keys(this.c_comContainerHandle).length;

        if(keyCount != this.widgetCount)
        {
            this.widgets = null;
            let arrayOrdered = [];

            for(const inKey in this.c_comContainerHandle)
            {
                let value = this.c_comContainerHandle[inKey];
                if(typeof value === "object") value = "Hidden";

                arrayOrdered.push([inKey, value]);
            }
            arrayOrdered.sort();

            for(let i=0; i<arrayOrdered.length; i++)
            {
                this.addWidget("text", arrayOrdered[i][0], arrayOrdered[i][1]);
            }

            this.size[0] = g_HugeSize;
            this.widgetCount++;
        }
        else
        {
            for(let i=0; i<this.widgets.length; i++)
            {
                let value = this.c_comContainerHandle[this.widgets[i].name];
                if(typeof value === "object") value = "Hidden";

                this.widgets[i].value = value;
            }
        }

        const t1 = performance.now();
        performance_prop_database&&console.log(`PropDatabase took ${t1 - t0} milliseconds.`);
    }
}
LiteGraph.registerNodeType("Deos/PropIncoming", PropIncoming); //Class name is shown on node tree. Also is name in code.

//////////////////////////////////////////////////
// DEOS PROPERTIES SAVE BOOLEAN (Checked)
//////////////////////////////////////////////////
class PropSaveBoolean
{
    constructor()
    {
        this.addInput("", "boolean");

        this.c_containerHandle;
        this.c_propName;

        this.size[0] = g_MidSize;
        this.color = g_color_global;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_containerHandle = inBroadcastDeosContainerHandle;
        this.c_propName = inPropName;

        
    }

    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);

        //NAMING
        this.inputs[0].name = `${this.c_propName} = ${in0}`;
        
        //OUTPUT
        this.c_containerHandle[this.c_propName] = in0;
    }
}
LiteGraph.registerNodeType("Deos/PropSaveBoolean", PropSaveBoolean);

//////////////////////////////////////////////////
// DEOS PROPERTIES SAVE NUMBER (Checked)
//////////////////////////////////////////////////
class PropSaveNumber
{
    constructor()
    {
        this.addInput("", "number");

        this.c_containerHandle;
        this.c_propName;

        this.size[0] = g_MidSize;
        this.color = g_color_global;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_containerHandle = inBroadcastDeosContainerHandle;
        this.c_propName = inPropName;
    }

    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);

        //NAMING
        this.inputs[0].name = `${this.c_propName} = ${in0}`;
        
        //OUTPUT
        this.c_containerHandle[this.c_propName] = in0;
    }
}
LiteGraph.registerNodeType("Deos/PropSaveNumber", PropSaveNumber);

//////////////////////////////////////////////////
// DEOS PROPERTIES READ BOOLEAN (Checked)
//////////////////////////////////////////////////
class PropReadBoolean
{
    constructor()
    {
        this.addOutput("", "boolean");

        this.size[0] = g_MidSize;
        this.c_name;
        this.c_handle;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_name = inPropName;
        this.c_handle = inBroadcastDeosContainerHandle;

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onExecute()
    {
        //INPUTS
        let strBool = this.c_handle[this.c_name];

        //LOGIC
        let out = undefined;
        if(strBool === "true" || strBool === true)
        {
            out = true;
        }
        if(strBool === "false" || strBool === false)
        {
            out = false;
        }

        //OUTPUTS
        this.setOutputData(0, out);

        //NAMING
        this.outputs[0].name = `${this.c_name} = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/PropReadBoolean", PropReadBoolean);

//////////////////////////////////////////////////
// DEOS PROPERTIES READ NUMBER (Checked)
//////////////////////////////////////////////////
class PropReadNumber
{
    constructor()
    {
        this.addOutput("", "number");

        this.size[0] = g_MidSize;
        this.c_name;
        this.c_handle;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_name = inPropName;
        this.c_handle = inBroadcastDeosContainerHandle;

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onExecute()
    {
        let value = Number(this.c_handle[this.c_name]);

        this.setOutputData(0, value);

        this.outputs[0].name = `${this.c_name} = ${value}`;
    }
}
LiteGraph.registerNodeType("Deos/PropReadNumber", PropReadNumber);

//////////////////////////////////////////////////
// DEOS PROPERTIES SEND BOOLEAN (Checked)
//////////////////////////////////////////////////
class PropSendBoolean
{
    constructor()
    {
        this.addInput("prop_name", "boolean");

        this.size[0] = g_MidSize;
        this.c_propName;
    }

    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);

        //NAMING
        this.inputs[0].name = `${this.c_propName} = ${in0}`;

        //CREATE PACKET
        let packetRequest = {};
        packetRequest[this.c_propName] = in0;

        //SEND PACKET
        this.c_comHandle.postMessage(packetRequest);
    }
}
LiteGraph.registerNodeType("Deos/PropSendBoolean", PropSendBoolean);

//////////////////////////////////////////////////
// DEOS PROPERTIES WRITE NUMBER (Checked)
//////////////////////////////////////////////////
class PropSendNumber
{
    constructor()
    {
        this.addInput("", "number");

        this.size[0] = g_MidSize;
        this.c_propName = null;
    }

    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;

        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);

        //NAMING
        this.inputs[0].name = `${this.c_propName} = ${in0}`;
        
        //CREATE PACKET
        let packetRequest = {};
        packetRequest[this.c_propName] = in0;

        //SEND PACKET
        this.c_comHandle.postMessage(packetRequest);
    }
}
LiteGraph.registerNodeType("Deos/PropSendNumber", PropSendNumber);

//////////////////////////////////////////////////
// DEOS PROPERTIES WRITE NUMBER TRIGGER (Checked)
//////////////////////////////////////////////////
class PropSendNumberTRG
{
    constructor()
    {
        this.addInput("", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.size[0] = g_MidSize;
        this.c_propName = null;
    }
    
    init(inComHandle, inPropName)
    {
        this.c_comHandle = inComHandle;
        this.c_propName = inPropName;
        
        if(inPropName.substring(0,2) === "g_") this.color = g_color_global;
        if(inPropName.substring(0,2) === "p_") this.color = g_color_properties;
        if(inPropName.substring(0,2) === "m_") this.color = g_color_mhxanostasio;
        if(inPropName.substring(0,2) === "y_") this.color = g_color_orofos;
        if(inPropName.substring(0,2) === "k_") this.color = g_color_khpos;
    }

    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let in0 = this.getInputData(0);

            //NAMING
            this.inputs[0].name = `${this.c_propName} = ${in0}`;
            
            //CREATE PACKET
            let packetRequest = {};
            packetRequest[this.c_propName] = in0;

            //SEND PACKET
            this.c_comHandle.postMessage(packetRequest);
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/PropSendNumberTRG", PropSendNumberTRG);

//////////////////////////////////////////////////
// DEOS PROPERTIES SELECT HOA (Checked)
//////////////////////////////////////////////////
class PropSelectHOA
{
    constructor()
    {
        this.addInput("In", "boolean");
        this.addOutput("Out", "boolean");

        this.addWidget("text");

        this.c_broadcastDeosContainerHandle;
        this.size[0] = g_MidSize;
    }

    init(inBroadcastDeosContainerHandle, inPropName)
    {
        this.c_broadcastDeosContainerHandle = inBroadcastDeosContainerHandle;
        this.widgets[0].name = inPropName;
    }
    
    onExecute()
    {
        //INPUTS
        let in0 = this.getInputData(0);
        //if(typeof in0 !== "boolean") console.error("Wrong input type.");

        //PROPERTIES
        let selection = this.c_broadcastDeosContainerHandle[this.widgets[0].name];
        
        //LOGIC
        let out0;
        if(selection === "off")    out0 = false;
        if(selection === "hand")   out0 = true;
        if(selection === "auto")   out0 = in0;
        
        //NAMING
        this.inputs[0].name = `In = ${in0}`;
        this.outputs[0].name = `Out = ${out0}`;
        this.widgets[0].value = selection;

        //OUPUTS
        this.setOutputData(0, out0);
    }
}
LiteGraph.registerNodeType("Deos/PropSelectHOA", PropSelectHOA);

//////////////////////////////////////////////////
// DEOS COMPARE HEAT (Checked)
//////////////////////////////////////////////////
class CompareHeat
{
    constructor()
    {
        this.addInput("T", "number");
        this.addInput("Setpoint", "number");
        this.addInput("dT", "number");

        this.addOutput("Out", "boolean");

        this.size[0] = g_MidSize;

        this.c_state = false;
    }

    onExecute()
    {
        //INPUTS
        let temp = Number(this.getInputData(0));
        let sp = Number(this.getInputData(1));
        let dt = Number(this.getInputData(2));

        //LOGIC
        if(temp >= sp) this.c_state = false;
        if(temp <= sp-dt) this.c_state = true;

        //OUTPUTS
        this.setOutputData(0, this.c_state);

        //NAMING
        this.inputs[0].name = `T = ${Number2String(temp)}`;
        this.inputs[1].name = `Setpoint = ${Number2String(sp)}`;
        this.inputs[2].name = `dT = ${Number2String(dt)}`;

        this.outputs[0].name = `Out = ${this.c_state}`;
    }
}
LiteGraph.registerNodeType("Deos/CompareHeat", CompareHeat); //Class name is shown on node tree. Also is name in code.

//////////////////////////////////////////////////
// DEOS COMPARE COOL (Checked)
//////////////////////////////////////////////////
class CompareCool
{
    constructor()
    {
        this.addInput("T", "number");
        this.addInput("Setpoint", "number");
        this.addInput("dT", "number");

        this.addOutput("Out", "boolean");

        this.size[0] = g_MidSize;

        this.c_state = false;
    }

    onExecute()
    {
        //INPUTS
        let temp = Number(this.getInputData(0));
        let sp = Number(this.getInputData(1));
        let dt = Number(this.getInputData(2));

        //LOGIC
        if(temp <= sp) this.c_state = false;
        if(temp >= sp+dt) this.c_state = true;

        //OUTPUTS
        this.setOutputData(0, this.c_state);

        //NAMING
        this.inputs[0].name = `T = ${Number2String(temp)}`;
        this.inputs[1].name = `Setpoint = ${Number2String(sp)}`;
        this.inputs[2].name = `dT = ${Number2String(dt)}`;

        this.outputs[0].name = `Out = ${this.c_state}`;
    }
}
LiteGraph.registerNodeType("Deos/CompareCool", CompareCool); //Class name is shown on node tree. Also is name in code.

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//NEW NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// DEOS Not (Checked)
//////////////////////////////////////////////////
class Not
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addOutput("!A", "boolean");

        this.size[0] = g_TinySize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        //if(typeof A !== "boolean") console.error("Wrong input type.");

        let out = !A;

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.outputs[0].name = `!A = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/Not", Not);

//////////////////////////////////////////////////
// DEOS OR2 (Checked)
//////////////////////////////////////////////////
class Or2
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addOutput("A|B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "boolean") console.error("Wrong input type.");
        //if(typeof B !== "boolean") console.error("Wrong input type.");

        let out = Boolean(A|B);

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A|B = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/Or2", Or2);

//////////////////////////////////////////////////
// DEOS OR3 (Checked)
//////////////////////////////////////////////////
class Or3
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addInput("C", "boolean");
        this.addOutput("A|B|C", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        let C = this.getInputData(2);
        //if(typeof A !== "boolean") console.error("Wrong input type.");
        //if(typeof B !== "boolean") console.error("Wrong input type.");
        //if(typeof C !== "boolean") console.error("Wrong input type.");

        let out = Boolean(A|B|C);

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.inputs[2].name = `C = ${C}`;
        this.outputs[0].name = `A|B|C = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/Or3", Or3);

//////////////////////////////////////////////////
// DEOS AND2 (Checked)
//////////////////////////////////////////////////
class And2
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addOutput("A&B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "boolean") console.error("Wrong input type.");
        //if(typeof B !== "boolean") console.error("Wrong input type.");

        let out = Boolean(A&B);

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A&B = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/And2", And2);

//////////////////////////////////////////////////
// DEOS AND3 (Checked)
//////////////////////////////////////////////////
class And3
{
    constructor()
    {
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addInput("C", "boolean");
        this.addOutput("A&B&C", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        let C = this.getInputData(2);
        //if(typeof A !== "boolean") console.error("Wrong input type.");
        //if(typeof B !== "boolean") console.error("Wrong input type.");
        //if(typeof C !== "boolean") console.error("Wrong input type.");

        let out = Boolean(A&B&C);

        this.setOutputData(0, out);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.inputs[2].name = `C = ${C}`;
        this.outputs[0].name = `A&B&C = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/And3", And3);

//////////////////////////////////////////////////
// DEOS GREATER THAN (Checked)
//////////////////////////////////////////////////
class GreatThan
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A>B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "number") console.error("Wrong input type.");
        //if(typeof B !== "number") console.error("Wrong input type.");

        this.setOutputData(0, A>B);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A>B = ${A>B}`;
    }
}
LiteGraph.registerNodeType("Deos/GreatThan", GreatThan);

//////////////////////////////////////////////////
// DEOS LESS THAN (Checked)
//////////////////////////////////////////////////
class LessThan
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A<B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "number") console.error("Wrong input type.");
        //if(typeof B !== "number") console.error("Wrong input type.");

        this.setOutputData(0, A<B);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A<B = ${A<B}`;
    }
}
LiteGraph.registerNodeType("Deos/LessThan", LessThan);

//////////////////////////////////////////////////
// DEOS GREATER THAN OR EQUAL (Checked)
//////////////////////////////////////////////////
class GreatThanOrEqual
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A>=B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "number") console.error("Wrong input type.");
        //if(typeof B !== "number") console.error("Wrong input type.");

        this.setOutputData(0, A>=B);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A>=B = ${A>=B}`;
    }
}
LiteGraph.registerNodeType("Deos/GreatThanOrEqual", GreatThanOrEqual);

//////////////////////////////////////////////////
// DEOS LESS THAN OR EQUAL (Checked)
//////////////////////////////////////////////////
class LessThanOrEqual
{
    constructor()
    {
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A<=B", "boolean");

        this.size[0] = g_SmallSize;
    }
    
    onExecute()
    {
        let A = this.getInputData(0);
        let B = this.getInputData(1);
        //if(typeof A !== "number") console.error("Wrong input type.");
        //if(typeof B !== "number") console.error("Wrong input type.");

        this.setOutputData(0, A<=B);

        this.inputs[0].name = `A = ${A}`;
        this.inputs[1].name = `B = ${B}`;
        this.outputs[0].name = `A<=B = ${A<=B}`;
    }
}
LiteGraph.registerNodeType("Deos/LessThanOrEqual", LessThanOrEqual);

//////////////////////////////////////////////////
// DEOS CLAMP (Checked)
//////////////////////////////////////////////////
class ClampMinMax
{
    constructor()
    {
        this.addInput("In", "number");
        this.addInput("Min", "number");
        this.addInput("Max", "number");

        this.addOutput("Out", "number");

        this.size[0] = 160;
    }
    
    onExecute()
    {
        //INPUTS
        let inp = this.getInputData(0);
        let min = this.getInputData(1);
        let max = this.getInputData(2);

        //LOGIC
        let out = Math.min(Math.max(inp, min), max);

        //OUPUTS
        this.setOutputData(0, out);

        //NAMING
        this.inputs[0].name = `In = ${inp}`;
        this.inputs[1].name = `Min = ${min}`;
        this.inputs[2].name = `Max = ${max}`;

        this.outputs[0].name = `Out = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/ClampMinMax", ClampMinMax);

//////////////////////////////////////////////////
// DEOS CLAMP (Checked)
//////////////////////////////////////////////////
class ClampMinMaxTRG
{
    constructor()
    {
        this.addInput("In", "number");
        this.addInput("Min", "number");
        this.addInput("Max", "number");
        this.addInput("Trigger", LiteGraph.ACTION);

        this.addOutput("Out", "number");
        this.addOutput("Tick", LiteGraph.EVENT);

        this.size[0] = g_SmallSize;
    }
    
    onAction(inAction)
    {
        if(inAction === "Trigger")
        {
            //INPUTS
            let inp = this.getInputData(0);
            let min = this.getInputData(1);
            let max = this.getInputData(2);

            //LOGIC
            let out = Math.min(Math.max(inp, min), max);

            //OUPUTS
            this.setOutputData(0, out);
            this.trigger("Tick"); //Last after logic!!!

            //NAMING
            this.inputs[0].name = `In = ${inp}`;
            this.inputs[1].name = `Min = ${min}`;
            this.inputs[2].name = `Max = ${max}`;

            this.outputs[0].name = `Out = ${out}`;
        }
    }
}
LiteGraph.registerNodeType("DeosTrigger/ClampMinMaxTRG", ClampMinMaxTRG);

//////////////////////////////////////////////////
// DEOS CHECK BIT STATE (Checked)
//////////////////////////////////////////////////
class CheckBitState
{
    constructor()
    {
        this.addInput("Num", "number");
        
        this.addOutput("Bool", "boolean");

        this.addWidget("text", "Bit");
        this.addWidget("text", "State");
        
        this.size[0] = g_MidSize;
    }

    init(inBit, inState)
    {
        if(typeof inBit !== "string") console.error("Wrong variable type (inBit).");
        if(typeof inState !== "string") console.error("Wrong variable type (inState).");

        this.widgets[0].value = inBit;
        this.widgets[1].value = inState;
    }
    
    onExecute()
    {
        let num = this.getInputData(0);
        let bit = this.widgets[0].value;
        let state = this.widgets[1].value;

        let out = undefined;

        if(state === "true")
        {
            let oper = num & (1<<bit); 
            if(oper)
            {
                out = true;
            }
            else
            {
                out = false;
            }
        }
        else if(state === "false")
        {
            let oper = num & (1<<bit);
            if(!oper)
            {
                out = true;
            }
            else
            {
                out = false;
            }
        }

        this.setOutputData(0, out);

        this.inputs[0].name = `Num = ${num}`;
        this.outputs[0].name = `Bool = ${out}`;
    }
}
LiteGraph.registerNodeType("Deos/CheckBitState", CheckBitState);

//////////////////////////////////////////////////
// DEOS PULSE DELAY (Checked)
//////////////////////////////////////////////////
class PulsePassOffDelay
{
    constructor()
    {
        this.addInput("State", "boolean");

        this.addOutput("Tick", LiteGraph.EVENT);
        this.addOutput("Remain", "number");

        this.addWidget("text", "Remain (sec)");

        this.c_timeRemaining = 0;
        this.c_started = false;

        this.size[0] = g_MidSize;
    }

    init(inRemainSec)
    {
        if(typeof inRemainSec !== "string") console.error("Wrong variable type (inRemainSec).");

        this.widgets[0].value = inRemainSec;
    }

    onExecute()
    {
        let state = this.getInputData(0);

        //LOGIC
        if(state === true && this.c_started === false)
        {
            this.trigger("Tick");
            this.c_started = true;
            this.c_timeRemaining = Number(this.widgets[0].value);
        }

        if(this.c_started === true)
        {
            this.c_timeRemaining -= this.graph.elapsed_time;

            if(this.c_timeRemaining <= 0)
            {
                this.c_started = false;
                this.c_timeRemaining = 0;
            }
        }

        //NAMING
        this.inputs[0].name = `State = ${state}`;
        this.outputs[1].name = `Remain = ${this.c_timeRemaining.toFixed(0)}`;

        //OUTPUTS
        this.setOutputData(1, Math.floor(this.c_timeRemaining));
    }
}
LiteGraph.registerNodeType("Deos/PulsePassOffDelay", PulsePassOffDelay);

//////////////////////////////////////////////////
// DEOS TIMER WITH ACTIVATION (Checked)
//////////////////////////////////////////////////
class TimerWithActivation
{
    constructor()
    {
        this.addInput("State", "boolean");

        this.addOutput("Tick", LiteGraph.EVENT);

        this.addWidget("string", "Interval (ms)");

        this.c_timeElapsed = 0;
        this.size[0] = g_MidSize;
    }

    init(inTime)
    {
        if(typeof inTime !== "string") console.error("Wrong variable type (inTime).");

        this.widgets[0].value = inTime;
    }

    onExecute()
    {
        //INPUTS
        let state = this.getInputData(0);
        
        //LOGIC
        if(state === true)
        {
            this.c_timeElapsed += this.graph.elapsed_time;

            if(this.c_timeElapsed >= this.widgets[0].value/1000)
            {
                this.c_timeElapsed = 0;

                //OUTPUTS
                this.trigger("Tick");
            }
        }
        else
        {
            this.c_timeElapsed = 0;
        }

        //NAMING
        this.inputs[0].name = `State = ${state}`;
    }
}
LiteGraph.registerNodeType("Deos/TimerWithActivation", TimerWithActivation);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//SUPER NEWEST NODES
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////
// DEOS LINEAR INTERPOLATION (Checked)
//////////////////////////////////////////////////
class LinearInterpClamp
{
    constructor()
    {
        this.addInput("inA", "number");
        
        this.addInput("Amin", "number");
        this.addInput("Amax", "number");
        
        this.addInput("Bmin", "number");
        this.addInput("Bmax", "number");

        this.addInput("Forward", "boolean");
        
        this.addOutput("outB", "number");

        this.size[0] = g_MidSize;
    }

    clamp(inp, min, max)
    {
        return Math.min(Math.max(inp, min), max);
    }

    onExecute()
    {
        //INPUTS
        let inA     = this.getInputData(0);
        let inAmin  = this.getInputData(1);
        let inAmax  = this.getInputData(2);
        let inBmin  = this.getInputData(3);
        let inBmax  = this.getInputData(4);

        let forward  = this.getInputData(5);

        //LOGIC
        let outB;
        if(forward)
        {
            outB = this.clamp(((inA-inAmin)*(inBmax-inBmin))/(inAmax-inAmin)+inBmin, inBmin, inBmax);
        }
        else
        {
            outB = this.clamp(inBmax-(((inA-inAmin)*(inBmax-inBmin))/(inAmax-inAmin)), inBmin, inBmax);
        }

        //OUTPUTS
        this.setOutputData(0, outB);

        //NAMING
        this.inputs[0].name = `inA = ${Number2String(inA)}`;
        this.inputs[1].name = `Amin = ${Number2String(inAmin)}`;
        this.inputs[2].name = `Amax = ${Number2String(inAmax)}`;
        this.inputs[3].name = `Bmin = ${Number2String(inBmin)}`;
        this.inputs[4].name = `Bmax = ${Number2String(inBmax)}`;

        this.inputs[5].name = `Forward = ${forward}`;

        this.outputs[0].name = `outB = ${Number2String(outB)}`;
    }
}
LiteGraph.registerNodeType("Deos/LinearInterpClamp", LinearInterpClamp); //Class name is shown on node tree. Also is name in code.

//////////////////////////////////////////////////
// DEOS CONTROL PI (Checked)
//////////////////////////////////////////////////
class ControlPI
{
    constructor()
    {
        this.addInput("CurrT", "number");
        this.addInput("TargT", "number");

        this.addInput("CoefP", "number");
        this.addInput("CoefI", "number");
        this.addInput("CoefTime", "number");
        this.addInput("MinOut", "number");
        this.addInput("MaxOut", "number");
        
        this.addOutput("Control", "number");

        this.c_outI = 0;
        this.c_timeElapsed = 0;
        this.size[0] = g_LargeSize;
    }

    clamp(inp, min, max)
    {
        return Math.min(Math.max(inp, min), max);
    }

    onExecute()
    {
        //INPUTS
        let CurrT       = this.getInputData(0);
        let TargT       = this.getInputData(1);
        let CoefP       = this.getInputData(2);
        let CoefI       = this.getInputData(3);
        let CoefTime    = this.getInputData(4);
        let MinOut      = this.getInputData(5);
        let MaxOut      = this.getInputData(6);

        if(isNaN(CurrT)) CurrT = 0;
        if(isNaN(TargT)) TargT = 0;
        if(isNaN(CoefP)) CoefP = 0;
        if(isNaN(CoefI)) CoefI = 0;
        if(isNaN(CoefTime)) CoefTime = 0;
        if(isNaN(MinOut)) MinOut = 0;
        if(isNaN(MaxOut)) MaxOut = 0;

        let err = TargT - CurrT;
        let pPart = (100/CoefP);
        let iPart = CoefI;

        // CONTROL P PART
        let outP = err*pPart;
        
        // CONTROL I PART
        this.c_timeElapsed += this.graph.elapsed_time;
        if(this.c_timeElapsed >= CoefTime)
        {
            this.c_timeElapsed = 0;

            this.c_outI += err*iPart;
            this.c_outI = this.clamp(this.c_outI, 0, 100);
        }
        
        // CONTROL SUM P+I
        //////console.log("P PART = ", outP);
        //////console.log("I PART = ", this.c_outI);
        let out = outP+this.c_outI;
        out = this.clamp(out, MinOut, MaxOut); //Claamped min max
        out = Math.round(out * 10) / 10;  //One decimal.

        //OUTPUTS
        this.setOutputData(0, out);

        //NAMING
        this.inputs[0].name = `CurrT = ${Number2String(CurrT)}`;
        this.inputs[1].name = `TargT = ${Number2String(TargT)}`;
        this.inputs[2].name = `CoefP = ${Number2String(CoefP)}`;
        this.inputs[3].name = `CoefI = ${Number2String(CoefI)}`;
        this.inputs[4].name = `CoefTime = ${Number2String(CoefTime)}`;
        this.inputs[5].name = `MinOut = ${Number2String(MinOut)}`;
        this.inputs[6].name = `MaxOut = ${Number2String(MaxOut)}`;

        this.outputs[0].name = `Control = ${Number2String(out)}`;
    }
}
LiteGraph.registerNodeType("Deos/ControlPI", ControlPI); //Class name is shown on node tree. Also is name in code.



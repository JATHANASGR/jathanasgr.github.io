//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//REGISTER MAP
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
let g_RegMap =
{
    "1" :
    {
        "1"     : [0, 0, 1, 1, "", "Operate. (On/Off) (0=Stop, 1=Run)"],
        "10001" : [1, 0, 1, 1, "data-ir", "Status connection. (0=Disconnected, 1=Connected)"],
        "10002" : [0, 0, 1, 1, "data-ir", "Status alarm. (0=Normal, 1=Alarm)"],
        "30001" : [0, 0, 255, 1, "data-ir", "Error code. (0-255 for CH code.)"],
        "30002" : [190, -100, 1800, 5, "data-ir", "Temp room. (x/10 = οC)"],
        "30003" : [450, -100, 1800, 5, "data-ir", "Temp inlet refrig. (x/10 = οC)"],
        "30004" : [400, -100, 1800, 5, "data-ir", "Temp outlet refrig. (x/10 = οC)"],
        "40001" : [4, 0, 4, 1, "", "Mode select. (C/H) (0=Cooling, 4=Heating)"],
        "40002" : [1, 1, 4, 1, "", "Setpoint fan speed. (1=Low, 2=Med, 3=High, 4=Auto)"],
        "40003" : [210, 180, 300, 5, "", "Setpoint room temp. (x = (oC)*10 [18-30])"]
    },
    "2" :
    {
        "1"     : [0, 0, 1, 1, "", "Operate. (On/Off) (0=Stop, 1=Run)"],
        "10001" : [1, 0, 1, 1, "data-ir", "Status connection. (0=Disconnected, 1=Connected)"],
        "10002" : [0, 0, 1, 1, "data-ir", "Status alarm. (0=Normal, 1=Alarm)"],
        "30001" : [0, 0, 255, 1, "data-ir", "Error code. (0-255 for CH code.)"],
        "30002" : [190, -100, 1800, 5, "data-ir", "Temp room. (x/10 = οC)"],
        "30003" : [450, -100, 1800, 5, "data-ir", "Temp inlet refrig. (x/10 = οC)"],
        "30004" : [400, -100, 1800, 5, "data-ir", "Temp outlet refrig. (x/10 = οC)"],
        "40001" : [4, 0, 4, 1, "", "Mode select. (C/H) (0=Cooling, 4=Heating)"],
        "40002" : [1, 1, 4, 1, "", "Setpoint fan speed. (1=Low, 2=Med, 3=High, 4=Auto)"],
        "40003" : [210, 180, 300, 5, "", "Setpoint room temp. (x = (oC)*10 [18-30])"]
    },
    "3" :
    {
        "1"     : [0, 0, 1, 1, "", "Operate. (On/Off) (0=Stop, 1=Run)"],
        "10001" : [1, 0, 1, 1, "data-ir", "Status connection. (0=Disconnected, 1=Connected)"],
        "10002" : [0, 0, 1, 1, "data-ir", "Status alarm. (0=Normal, 1=Alarm)"],
        "30001" : [0, 0, 255, 1, "data-ir", "Error code. (0-255 for CH code.)"],
        "30002" : [190, -100, 1800, 5, "data-ir", "Temp room. (x/10 = οC)"],
        "30003" : [450, -100, 1800, 5, "data-ir", "Temp inlet refrig. (x/10 = οC)"],
        "30004" : [400, -100, 1800, 5, "data-ir", "Temp outlet refrig. (x/10 = οC)"],
        "40001" : [4, 0, 4, 1, "", "Mode select. (C/H) (0=Cooling, 4=Heating)"],
        "40002" : [1, 1, 4, 1, "", "Setpoint fan speed. (1=Low, 2=Med, 3=High, 4=Auto)"],
        "40003" : [210, 180, 300, 5, "", "Setpoint room temp. (x = (oC)*10 [18-30])"]
    },
    "9" :
    {
        "1"     : [0, 0, 1, 1, "", "Cool/Heat Operate. (Όχι γενικό) (On/Off) (0=Stop, 1=Run)"],
        "2"     : [0, 0, 1, 1, "", "Hot water mode (On/Off) (0=Disable, 1=Enable)"],
        "10001" : [1, 0, 1, 1, "data-ir", "Status connection. (0=Disconnected, 1=Connected)"],
        "10002" : [0, 0, 1, 1, "data-ir", "Status alarm. (0=Normal, 1=Alarm)"],
        "30001" : [0, 0, 255, 1, "data-ir", "Error code. (0-255 for CH code.)"],
        "30002" : [280, -100, 1800, 5, "data-ir", "Temp room. (M1) (x/10 = οC)"],
        "30003" : [400, -100, 1800, 5, "data-ir", "Temp inlet water. (M2) (x/10 = οC)"],
        "30004" : [450, -100, 1800, 5, "data-ir", "Temp outlet water. (M3) (x/10 = οC)"],
        "30005" : [420, -100, 1800, 5, "data-ir", "Temp DHW. (M0) (x/10 = οC)"],
        "40001" : [4, 0, 4, 1, "", "Mode select. (C/H) (0=Cooling, 4=Heating)"],
        "40002" : [300, 300, 500, 5, "", "Setpoint DHW. (x = [oC]*10)"],
        "40003" : [300, 300, 500, 5, "", "Setpoint C/H Water. (x = [oC]*10)"]
    },
    "10" :
    {
        "30002"     : [0, 0, 100, 1, "data-ir", "Τρέχον μανομετρικό. (/10 mH2O) (ex. REG 10 = 1mH2O) (0-65535)"],
        "30003"     : [0, 0, 100, 1, "data-ir", "Τρέχουσα παροχή. (/10 m3/h) (ex. REG 12 = 1.2 m3/h) (0-9999)"],
        "30007"     : [0, 0, 100, 1, "data-ir", "Τρέχον ρεύμα κυκλοφορητή. (/10 A) (ex. REG 12 = 1.2A) (0-65535)"],
        "30009"     : [0, -100, 1800, 5, "data-ir", "Θερμοκρασία προσαγωγής ενδοδαπέδιας. (/10 oC) (ex. REG 350 = 35oC) (0-65535)"],
        "30037"     : [0, 0, 65535, 1, "data-ir", "Ένδειξη σφάλματος κυκλοφορητή. bit0-4 (except bit2) (REG 0=OK, REG>0 =ERROR)"],
        "30038"     : [0, 0, 65535, 1, "data-ir", "Κωδικός σφάλματος κυκλοφορητή. (table in properties)"],
        "30301"     : [0, 0, 50000, 100, "data-ir", "Τρέχουσα ισχύς ενδοδαπέδιας. (/1000 kW) (ex. REG 1200 = 1.2kW) (32 Bit REAL Signed)"],
        "30313"     : [0, 0, 50000, 1, "data-ir", "Συνολική ενέργεια ενδοδαπέδιας. (kWh) (ex. REG 125.52 = 125.52 kWH) (32 Bit REAL Signed)"],
        "30319"     : [300, -100, 1800, 5, "data-ir", "Θερμοκρασία επιστροφής ενδοδαπέδιας. (/10 oC) (ex. REG 350 = 35oC) (UINT)"],
        "30321"     : [2300, 0, 3000, 10, "data-ir", "Τρέχουσα τάση κυκλοφορητή. (/10 V) (ex. REG 2300 = 230V) (UINT)"],

        "40002"     : [0, 0, 200, 2, "", "Επιθυμητό μανομετρικό. (%) (REG = 20*mH2O) (ex. REG 100 = 5mH2O) (16bit Signed INT)"],
        "40041"     : [8, 0, 65535, 1, "", "On/Off κυκλοφορητή. bit0 (0 = Off, 1=On) (16bit Unsigned WORD) (maybe RCbitW)"],
        "40421"     : [0, 0, 10, 0.1, "", "Όριο παροχής λειτουργίας ΜΑΧ. (m3/h) (ex. REG 3.15 = 3.15m3/h) (32 Bit REAL Signed)"],
        "40423"     : [0, 0, 10, 0.1, "", "Όριο παροχής λειτουργίας ΜIN. (m3/h) (ex. REG 3.15 = 3.15m3/h) (32 Bit REAL Signed)"]
    },
    "30" :
    {
        "2"     : [0, 0, 255, 1, "data-ir", "Long press. (bit7 1=Pressed 0=Not Pressed)"],
        "48"    : [220, -100, 1800, 5, "data-ir", "Room temperature sensor. (x/10 = οC)"],
        "50"    : [12400, 0, 20000, 100, "data-ir", "Relative Humidity. (x/200 = rH)"],
        "66"    : [0, -100, 1000, 5, "", "Θερμοκρασία περιβάλλοντος. (x = (oC)*10)"],
        "67"    : [0, -100, 1000, 5, "", "Θερμοκρασία ΖΝΧ. (x = (oC)*10)"],
        "68"    : [0, -100, 1000, 5, "", "Θερμοκρασία ηλιακών. (x = (oC)*10)"],
        "97"    : [0, 0, 65535, 1, "", "Σύμβολο ΡΟΛΟΓΙΟΥ. (bit14 1=On, 2=Off)"],
        "98"    : [0, 0, 65535, 1, "", "Σύμβολo COOL/HEAT. (bit0,2 1=On, 2=Off)"],
        "384"   : [210, 180, 300, 5, "data-ir", "SP Θερμοκρασίας χώρου. (18-30) (x = (oC)*10)"],
        "385"   : [0, 0, 3, 1, "data-ir", "SP Ταχύτητας ανεμιστήρα. (0-3)"],
        "386"   : [0, 0, 1, 1, "data-ir", "SP Ενδοδαπέδιας Off/On. (0-1)"]
    },
    "31" :
    {
        "2"     : [1, 0, 255, 1, "data-ir", "Long press. (bit7 1=Pressed 0=Not Pressed)"],
        "48"    : [230, -100, 1800, 5, "data-ir", "Room temperature sensor. (x/10 = οC)"],
        "50"    : [12600, 0, 20000, 100, "data-ir", "Relative Humidity. (x/200 = rH)"],
        "66"    : [0, -100, 1000, 5, "", "Θερμοκρασία περιβάλλοντος. (x = (oC)*10)"],
        "67"    : [0, -100, 1000, 5, "", "Θερμοκρασία ΖΝΧ. (x = (oC)*10)"],
        "68"    : [0, -100, 1000, 5, "", "Θερμοκρασία ηλιακών. (x = (oC)*10)"],
        "97"    : [0, 0, 65535, 1, "", "Σύμβολο ΡΟΛΟΓΙΟΥ. (bit14 1=On, 2=Off)"],
        "98"    : [0, 0, 65535, 1, "", "Σύμβολo COOL/HEAT. (bit0,2 1=On, 2=Off)"],
        "384"   : [210, 180, 300, 5, "data-ir", "SP Θερμοκρασίας χώρου. (18-30) (x = (oC)*10)"],
        "385"   : [0, 0, 3, 1, "data-ir", "SP Ταχύτητας ανεμιστήρα. (0-3)"],
        "386"   : [0, 0, 1, 1, "data-ir", "SP Ενδοδαπέδιας Off/On. (0-1)"]
    },
    "32" :
    {
        "2"     : [2, 0, 255, 1, "data-ir", "Long press. (bit7 1=Pressed 0=Not Pressed)"],
        "48"    : [240, -100, 1800, 5, "data-ir", "Room temperature sensor. (x/10 = οC)"],
        "50"    : [12800, 0, 20000, 100, "data-ir", "Relative Humidity. (x/200 = rH)"],
        "66"    : [0, -100, 1000, 5, "", "Θερμοκρασία περιβάλλοντος. (x = (oC)*10)"],
        "67"    : [0, -100, 1000, 5, "", "Θερμοκρασία ΖΝΧ. (x = (oC)*10)"],
        "68"    : [0, -100, 1000, 5, "", "Θερμοκρασία ηλιακών. (x = (oC)*10)"],
        "97"    : [0, 0, 65535, 1, "", "Σύμβολο ΡΟΛΟΓΙΟΥ. (bit14 1=On, 2=Off)"],
        "98"    : [0, 0, 65535, 1, "", "Σύμβολo COOL/HEAT. (bit0,2 1=On, 2=Off)"],
        "384"   : [210, 180, 300, 5, "data-ir", "SP Θερμοκρασίας χώρου. (18-30) (x = (oC)*10)"],
        "385"   : [0, 0, 3, 1, "data-ir", "SP Ταχύτητας ανεμιστήρα. (0-3)"],
        "386"   : [0, 0, 1, 1, "data-ir", "SP Ενδοδαπέδιας Off/On. (0-1)"]
    },
    "40" :
    {
        "100"   : [200, 0, 1000, 10, "", "(2-10V) FEEDBACK ΘΕΣΗΣ ΤΡΙΟΔΗΣ ΕΝΔ/ΙΑΣ. (x/100 = V)"],
        "101"   : [190, 0, 1000, 10, "", "(Π0) (0-10V) ΠΙΕΣΗ ΑΠΟΘΗΚΗΣ. (x/100 = V)"],
        "102"   : [400, -100, 1800, 5, "data-ir", "(Θ0) ΘΕΡΜ XFLOW ΚΑΤΩ. (x/10 = οC)"],
        "103"   : [440, -100, 1800, 5, "data-ir", "(Θ1) ΘΕΡΜ XFLOW ΠΑΝΩ. (x/10 = οC)"],
        "104"   : [430, -100, 1800, 5, "data-ir", "(Θ2) ΘΕΡΜ ΑΝΤΙΡΡΟΗΣ. (x/10 = οC)"],
        "105"   : [410, -100, 1800, 5, "data-ir", "(Θ3) ΘΕΡΜ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ. (x/10 = οC)"],
        "106"   : [200, -100, 1800, 5, "data-ir", "(Θ4) ΘΕΡΜ ΜΙΞΗΣ ΤΡΙΟΔΗΣ ΕΝΔ/ΙΑΣ. (x/10 = οC)"],
        "107"   : [490, -100, 1800, 5, "data-ir", "(Θ5) ΘΕΡΜ ΗΛΙΑΚΩΝ ΣΥΛΛΕΚΤΩΝ. (x/10 = οC)"],
        "108"   : [0, 0, 65535, 1, "data-ir", "DI (Σφαλμα Κυκ. Hydro (I36), ΔΔΕ LG (I0), Επιτ LG (I1), Επιτ ρελέ (I2), Ασφ Hydro (I3), Ασφ εξωτ (I4).) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "109"   : [0, 0, 65535, 1, "", "Ρελέ DO ΠΑΡ(Ηλιακ, Αντιρ, Ανακ, Αντιστ) Η/Θ ΥΠ(Υπν, Γρ, Κουζ) Η/Θ ΙΣΟ(Ολο) Η/Θ ΟΡ(ΥΔ.ΒΔ, ΥΔ.ΒΑ, ΥΔ.ΝΑ) (0 = Ανοιγμα Επ. 1 = Κλείσιμο Επ.)"],
        "110"   : [0, 0, 10000, 100, "", "( 0-10V ) ΕΛΕΓΧΟΣ ΤΡΙΟΔΗΣ (x = V/*1000)"]
    },
    "41" :
    {
        "100"   : [390, -100, 1800, 5, "data-ir", "(Θ6) ΘΕΡΜ ΠΡΟΣΑΓΩΓΗΣ ΠΡΟΣ ΣΥΛΛΕΚΤΕΣ (ΚΡΥΟ) (x/10 = οC)"],
        "101"   : [480, -100, 1800, 5, "data-ir", "(Θ7) ΘΕΡΜ ΕΠΙΣΤΡΟΦΗΣ ΑΠΟ ΣΥΛΛΕΚΤΕΣ (ΖΕΣΤΟ) (x/10 = οC)"],
        "102"   : [370, -100, 1800, 5, "data-ir", "(Θ8) ΘΕΡΜ ΚΟΛΛΕΚΤΕΡ ΕΠΙΣΤΡΟΦΗΣ ΕΝΔ ΥΠΟΓΕΙΟΥ (x/10 = οC)"],
        "103"   : [360, -100, 1800, 5, "data-ir", "(Θ9) ΘΕΡΜ ΚΟΛΛΕΚΤΕΡ ΕΠΙΣΤΡΟΦΗΣ ΕΝΔ ΙΣΟΓΕΙΟΥ (x/10 = οC)"],
        "104"   : [350, -100, 1800, 5, "data-ir", "(Θ10) ΘΕΡΜ ΚΟΛΛΕΚΤΕΡ ΕΠΙΣΤΡΟΦΗΣ ΕΝΔ ΟΡΟΦΟΥ (x/10 = οC)"],
        
        "105"   : [0, 0, 65535, 1, "data-ir", "(I37) ΑΣΦ ΚΑΙ ΔΔΕ ΦΩΤΙΣΜΟΥ ΜΗΧΑΝΟΣΤΑΣΙΟΥ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "106"   : [0, 0, 65535, 1, "data-ir", "(I38) ΑΣΦ ΚΑΙ ΔΔΕ ΠΡΙΖΩΝ ΜΗΧΑΝΟΣΤΑΣΙΟΥ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],

        "108"   : [0, 0, 65535, 1, "data-ir", "(I5) ΑΣΦ ΠΙΝΑΚΑ 2 (ΣΚΑΛΑΣ) (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "109"   : [0, 0, 65535, 1, "data-ir", "(I6) ΑΣΦ+ΔΔΕ ΗΛΕΚ/ΘΕΡ. ΚΙΝΗΤΗΡΩΝ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "110"   : [0, 0, 65535, 1, "data-ir", "(I7) ΡΕΛΕ Η/Θ ΥΠΟΓΕΙΟ ΥΠΝΟΔΩΜΑΤΙΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "111"   : [0, 0, 65535, 1, "data-ir", "(I8) ΡΕΛΕ Η/Θ ΥΠΟΓΕΙΟ ΓΡΑΦΕΙΟ ή και ΒΕΣΤΙΑΡΙΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "112"   : [0, 0, 65535, 1, "data-ir", "(I9) ΡΕΛΕ Η/Θ ΥΠΟΓΕΙΟ ΚΟΥΖΙΝΑ ή και ΑΠΟΘΗΚΗ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "113"   : [0, 0, 65535, 1, "data-ir", "(I10) ΡΕΛΕ Η/Θ ΙΣΟΓΕΙΟ ΣΥΝΟΛΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "114"   : [0, 0, 65535, 1, "data-ir", "(I11) ΡΕΛΕ Η/Θ ΟΡΟΦΟΣ Υ/Δ ΒΟΡΕΙΟΔΥΤΙΚΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "115"   : [0, 0, 65535, 1, "data-ir", "(I12) ΡΕΛΕ Η/Θ ΟΡΟΦΟΣ Υ/Δ ΒΟΡ/ΑΝΑΤΟΛΙΚΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "116"   : [0, 0, 65535, 1, "data-ir", "(I13) ΡΕΛΕ Η/Θ ΟΡΟΦΟΣ Υ/Δ ΝΟΤ/ΑΝΑΤΟΛΙΚΟ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "117"   : [0, 0, 65535, 1, "data-ir", "(I14) ΑΣΦ ΚΑΙ ΔΔΕ ΑΝΤΙΣΤΑΣΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "118"   : [1, 0, 65535, 1, "data-ir", "(I15) ΜΤΓ ΑΝΤΙΣΤΑΣΗΣ (MANUAL) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "119"   : [0, 0, 65535, 1, "data-ir", "(I16) ΜΤΓ ΑΝΤΙΣΤΑΣΗΣ (AUTO) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "120"   : [0, 0, 65535, 1, "data-ir", "(I17) ΡΕΛΕ ΕΝΤΟΛΗΣ ΑΝΤΙΣΤΑΣΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "121"   : [0, 0, 65535, 1, "data-ir", "(I18) ΡΕΛΕ ΠΑΡΟΧΗΣ ΑΝΤΙΣΤΑΣΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "122"   : [0, 0, 65535, 1, "data-ir", "(I19) ΑΣΦ ΡΕΛΕ ΠΙΝΑΚΑ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "123"   : [0, 0, 65535, 1, "data-ir", "(I20) ΔΔΕ ΚΥΚΛΟΦΟΡΗΤΩΝ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "124"   : [0, 0, 65535, 1, "data-ir", "(I21) ΑΣΦ ΚΥΚΛ ΕΝΔΟΔΑΠΕΔΙΑΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "125"   : [0, 0, 65535, 1, "data-ir", "(I22) ΑΣΦ ΚΥΚΛ HYDRO (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "126"   : [0, 0, 65535, 1, "data-ir", "(I23) ΡΕΛΕ ΚΥΚΛ HYDRO (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "127"   : [0, 0, 65535, 1, "data-ir", "(I24) ΑΣΦ ΚΥΚΛ ΗΛΙΑΚΩΝ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "128"   : [1, 0, 65535, 1, "data-ir", "(I25) ΜΤΓ ΚΥΚΛ ΗΛΙΑΚΩΝ (MANUAL) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "129"   : [0, 0, 65535, 1, "data-ir", "(I26) ΜΤΓ ΚΥΚΛ ΗΛΙΑΚΩΝ (AUTO) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "130"   : [0, 0, 65535, 1, "data-ir", "(I27) ΡΕΛΕ ΚΥΚΛ ΗΛΙΑΚΩΝ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "131"   : [0, 0, 65535, 1, "data-ir", "(I28) ΑΣΦ ΚΥΚΛ ΑΝΤΙΡΡΟΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "132"   : [1, 0, 65535, 1, "data-ir", "(I29) ΜΤΓ ΚΥΚΛ ΑΝΤΙΡΡΟΗΣ (MANUAL) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "133"   : [0, 0, 65535, 1, "data-ir", "(I30) ΜΤΓ ΚΥΚΛ ΑΝΤΙΡΡΟΗΣ (AUTO) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "134"   : [0, 0, 65535, 1, "data-ir", "(I31) ΡΕΛΕ ΚΥΚΛ ΑΝΤΙΡΡΟΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "135"   : [0, 0, 65535, 1, "data-ir", "(I32) ΑΣΦ ΚΥΚΛ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "136"   : [1, 0, 65535, 1, "data-ir", "(I33) ΜΤΓ ΚΥΚΛ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ (MANUAL) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "137"   : [0, 0, 65535, 1, "data-ir", "(I34) ΜΤΓ ΚΥΚΛ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ (AUTO) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "138"   : [0, 0, 65535, 1, "data-ir", "(I35) ΡΕΛΕ ΚΥΚΛ ΑΝΑΚΥΚΛΟΦΟΡΙΑΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"]
    },
    "42" :
    {
        "100"   : [250, 0, 1000, 10, "data-ir", "(Π1) (0-10V) ΠΙΕΣΗ ΔΙΚΤΥΟΥ (x/100 = V)"],
        "101"   : [180, -100, 1800, 5, "data-ir", "(Θ11) ΘΕΡΜ ΔΙΚΤΥΟΥ (x/10 = οC)"],
        "102"   : [200, -100, 1800, 5, "data-ir", "(Θ12) ΘΕΡΜ ΠΕΡΙΒΑΛΛΟΝΤΟΣ (x/10 = οC)"],

        "103"   : [0, 0, 65535, 1, "data-ir", "(I9) ΑΣΦ ΚΑΙ ΔΔΕ ΦΩΤΙΣΜΟΥ ΑΠΟΘΗΚΗΣ ΚΗΠΟΥ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "104"   : [0, 0, 65535, 1, "data-ir", "(I10) ΑΣΦ ΚΑΙ ΔΔΕ ΠΡΙΖΩΝ ΚΗΠΟΥ ΚΑΙ ΔΙΟΔΗΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],

        "105"   : [0, 0, 65535, 1, "data-ir", "(I6) ΕΠΙΤΗΡΗΤΗΣ ΦΑΣΕΩΝ (OΚ) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "106"   : [0, 0, 65535, 1, "data-ir", "(I7) ΘΕΡΜ/ΜΑΓΝ. + ΔΔΕ ΥΠΟΒΡΥΧΙΑΣ ΑΝΤΛΙΑΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "107"   : [0, 0, 65535, 1, "data-ir", "(I8) ΡΕΛΕ ΥΠΟΒΡΥΧΙΑΣ ΑΝΤΛΙΑΣ (ON) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "108"   : [8, 0, 65535, 1, "data-ir", "DI (ΔΔΕ+Ασφ.Εξωτ.Φωτισμ. (I0), Ρελέ εντ. δίοδης OPENNING (I1), Ρελέ επιστ. δίοδης OPEN (I2), Ρελέ επιστ. δίοδης CLOSE (I3), Ασφ. Ρελέ (I4), Ασφ. ΜΣΧ (I5)) (0 = Κλειστή Επ. 1 = Ανοιχτή Επ.)"],
        "109"   : [0, 0, 65535, 1, "", "Τρανζίστορ DO(Εντολή δίοδης, Εντολές ποτίσματος 1,2,3,4,5,6,7,8, Εντολές φωτισμού 1,2,3,4) (0 = Ενεργ. Trans. 1 = Απενεργ. Trans.)"]
    },
    "43" :
    {
        "0"      : [0, 0, 10000000, 100, "data-ir", "Imported active energy. (TOTAL) (Wh) (/1000 kWh) (32bit)"],
        "48"     : [0, 0, 10000000, 100, "data-ir", "Imported active energy. (PARTIAL) (Wh) (/1000 kWh) (32bit)"],
        "176"    : [0, 0, 10, 0.1, "", "Setting of Cost per kWh (Euro/kWh) (32bit) (0.2)"],
        "178"    : [0, 0, 10, 0.1, "", "Setting of Emmisions kgCO2 per kWh (kgCO2/kWh) (32bit) (0.65)"],
        "192"    : [0, 0, 10000000, 0.1, "data-ir", "Cost of the consumption. (PARTIAL) (Euro) (32bit)"],
        "194"    : [0, 0, 10000000, 0.1, "data-ir", "kgCO2 atmospheric emissions of the consumption. (PARTIAL) (kgCO2) (32bit)"],
        "196"    : [0, 0, 10000000, 1, "data-ir", "Seconds of the operation. (PARTIAL) (Sec) (/3600 h) (32bit)"],
        "198"    : [0, 0, 10000000, 1, "data-ir", "Seconds of the operation. (TOTAL) (Sec) (/3600 h) (32bit)"],
        "1842"   : [0, 0, 500, 0.1, "data-ir", "Phase 1 voltage. (INSTANT) (V) (32bit)"],
        "1844"   : [0, 0, 500, 0.1, "data-ir", "Phase 2 voltage. (INSTANT) (V) (32bit)"],
        "1846"   : [0, 0, 500, 0.1, "data-ir", "Phase 3 voltage. (INSTANT) (V) (32bit)"],
        "1848"   : [0, 0, 65, 0.1, "data-ir", "Phase 1 current. (INSTANT) (A) (32bit)"],
        "1850"   : [0, 0, 65, 0.1, "data-ir", "Phase 2 current. (INSTANT) (A) (32bit)"],
        "1852"   : [0, 0, 65, 0.1, "data-ir", "Phase 3 current. (INSTANT) (A) (32bit)"],
        "1868"   : [0, 0, 60000, 100, "data-ir", "Total active power. (INSTANT) (W) (/1000 kW) (32bit)"],
        "2048"   : [0, 0, 65535, 1, "", "Reset μετρούμενων μεγεθών μερικής ενέργειας (Partial) με 0xFF00. (ΠΡΟΣΟΧΗ ΧΡΗΣΗ FC 05). Να ελεγθεί αν επανέρχεται η τιμή."]
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//MODBUS
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
//INIT
//////////////////////////////////////////////////
const broadcastModbusHandle = new BroadcastChannel("modbus");       //Create the channel.
broadcastModbusHandle.addEventListener("message", BroadcastModbusReceived);   //Event listener for incoming messages.

//////////////////////////////////////////////////
//RECEIVED
//////////////////////////////////////////////////
function BroadcastModbusReceived(packetReceived)
{
    //////////////////////////////////////////////////
    //OBJECT IMPLEMENTATION
    //////////////////////////////////////////////////

    //PACKET NAMES
    //packetRequest     (Sender)
    //packetReceived    (Receiver)
    //packetResponse    (Receiver Response)

    //ACTIONS
    //rs = read multi    (requests)
    //ra = read all      (requests)
    //rf = read full     (requests)
    //ws = write single  (requests)
    //rsr = read multi   (responses)
    //rar = read all     (responses)
    //rfr = read full    (responses)
    //wsr = write single (responses)

    //PACKET OBJECT
    // let packetRequest =
    // {
    //     masterid: As1d2FAs1d2FAs1d,
    //     slave: 30,
    //     action: "rs",
    //     register: "2",   //Optional
    //     value: "288",    //Optional
    //     database: {...}  //Optional
    // }

    debug_modbus_packet_received&&console.log("Received MB = ...");
    debug_modbus_packet_received&&console.log(packetReceived.data);

    if(packetReceived.data.action == "rs")
    {
        //Create and send response packet.
        let packetResponse =
        {
            masterid: packetReceived.data.masterid,
            slave: packetReceived.data.slave,
            action: "rsr",
            value: g_RegMap[packetReceived.data.slave][packetReceived.data.register][0]
        }
        broadcastModbusHandle.postMessage(packetResponse);

        debug_modbus_read_single_response&&console.log("Action = RS, Response MB = ...");
        debug_modbus_read_single_response&&console.log(packetResponse);
    }
    else if(packetReceived.data.action == "ra")
    {
        //Create and send response packet.
        let packetResponse =
        {
            masterid: packetReceived.data.masterid,
            action: "rar",
            register: g_RegMap
        }
        broadcastModbusHandle.postMessage(packetResponse);
        
        debug_modbus_read_all_response&&console.log("Action = RA, Response MB = ...");
        debug_modbus_read_all_response&&console.log(packetResponse);
    }
    else if(packetReceived.data.action == "ws")
    {
        //Special case for Rymaskon R2 to disable the button bits (hold or press) based on what is sent.
        if((packetReceived.data.slave == 30 || packetReceived.data.slave == 31 || packetReceived.data.slave == 32) && packetReceived.data.register == 2)
        {
            debug_modbus_write_single_response&&console.log("Action = WS, Received Packet = ...");
            debug_modbus_write_single_response&&console.log(packetReceived.data);

            g_RegMap[packetReceived.data.slave][packetReceived.data.register][0] = g_RegMap[packetReceived.data.slave][packetReceived.data.register][0] & (~packetReceived.data.value); //Disable the bit that is sent as 1;
        }
        else
        {
            //PACKET OBJECT
            // let packetRequest =
            // {
            //     masterid: As1d2FAs1d2FAs1d,
            //     slave: 30,
            //     action: "rs",
            //     register: "2",   //Optional
            //     value: "288",    //Optional
            //     database: {...}  //Optional
            // }

            //Change global register map.
            g_RegMap[packetReceived.data.slave][packetReceived.data.register][0] = packetReceived.data.value;

            //Change global register map (SAME AS ABOVE BUT WITH CLAMP) (PROPER IMPLEMENTATION).
            // const read = Number(packetReceived.data.value);
            // const min  = g_RegMap[packetReceived.data.slave][packetReceived.data.register][1];
            // const max  = g_RegMap[packetReceived.data.slave][packetReceived.data.register][2];
            // const clamped = clamp(read, min, max);
            // g_RegMap[packetReceived.data.slave][packetReceived.data.register][0] = clamped;
            ////// DEBUG LINE - if(packetReceived.data.register == 384) console.log(g_RegMap[packetReceived.data.slave][packetReceived.data.register][0]);

            //Create and send response packet.
            let packetResponse =
            {
                masterid: packetReceived.data.masterid,
                slave: packetReceived.data.slave,
                action: "wsr"
            }
            broadcastModbusHandle.postMessage(packetResponse);
            
            debug_modbus_write_single_response&&console.log("Action = WS, Response MB = ...");
            debug_modbus_write_single_response&&console.log(packetResponse);
        }
    }
    else
    {
        //Error message.
        let errorStr = "ERROR: Wrong action used."
        
        //LOG THE ERROR
        console.error(errorStr);
    }
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//RYMASKON
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// DISPLAYS
//////////////////////////////////////////////////
// 0) ROOM
// 1) HUM
// 2) OUT
// 3) HEAT
// 4) DIS

// 5) SP_TEMP
// 6) SP_FAN
// 7) SP_UNDERFLOOR
// 8) SP_TEMP_OFFSET

//////////////////////////////////////////////////
// CLASS
//////////////////////////////////////////////////
class Rymaskon
{
    constructor(handle)
    {
        //TOGGLE AND FLASH COOL HEAT
        this.toggleCoolHeat = false;

        // HANDLE
        this.c_handle = handle;
        this.c_id = handle.id.substring(1,10);
        
        // OTHER HANDLES
        this.c_bigFonts_handle      = this.c_handle.querySelector(".rymaskon_fonts");
        this.c_smallFonts_handle    = this.c_handle.querySelector(".rymaskon_fonts_decimals");
        this.c_title_handle         = this.c_handle.querySelector(".rymaskon_fonts_title");
        
        // SET STARTING SCREEN DISPLAY 0
        this.pre_displayMode = -1;
        this.cur_displayMode = 0;

        // BEGIN UPDATE INTERVAL
        setInterval(this.updateClass.bind(this), g_RymaskonUpdateInterval);

        //ADD BUTTON EVENT LISTENERS
        handle.addEventListener("click", this.clickChecker.bind(this));
    }

    clickChecker(e)
    {
        const btnPress = e.target.dataset.btn;

        if(btnPress)
        {
            switch(btnPress)
            {
                // SETPOINT TEMPERATURE
                case "0":
                    this.cur_displayMode = 5;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 384;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read+5, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;
                case "4":
                    this.cur_displayMode = 5;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 384;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read-5, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;
                
                // SETPOINT FAN
                case "1":
                    this.cur_displayMode = 6;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 385;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read+1, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;
                case "5":
                    this.cur_displayMode = 6;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 385;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read-1, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;

                // SETPOINT UNDERFLOOR
                case "2":
                    this.cur_displayMode = 7;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 386;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read+1, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;
                case "6":
                    this.cur_displayMode = 7;
                    if(this.pre_displayMode === this.cur_displayMode)
                    {
                        let regNum = 386;
                        const read = Number(g_RegMap[this.c_id][regNum][0]);
                        const min  = g_RegMap[this.c_id][regNum][1];
                        const max  = g_RegMap[this.c_id][regNum][2];
                        const clamped = this.clamp(read-1, min, max);
                        g_RegMap[this.c_id][regNum][0] = clamped;
                    }
                    this.updateClass(this);
                    break;

                // CHANGE SCREEN
                case "3":
                    if(++this.cur_displayMode>4) this.cur_displayMode = 0;
                    this.updateClass(this);
                    break;

                // HOME
                case "7":
                    let regValue = Number(g_RegMap[this.c_id][2][0]);
                    g_RegMap[this.c_id][2][0] = regValue | 128;
                    break;
            }
        }
    }

    updateClass() //RUNS IN INTERVAL (1000 ms) AND CLICK
    {
        //UPDATE ALL CLASS REGISTERS
        this.updateRegisters();

        //BASED ON CLASS REGISTERS PROCEED WITH SCREEN UPDATE
        this.updateScreen();
    }

    updateRegisters()
    {
        let regNum;

        //CLAMP ALL REGISTERS BEFORE PROCESSING
        regNum = 2;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);

        regNum = 48;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 50;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);

        regNum = 66;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 67;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 68;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);

        regNum = 97;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 98;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);

        regNum = 384;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 385;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
        regNum = 386;
        g_RegMap[this.c_id][regNum][0] = this.clamp(Number(g_RegMap[this.c_id][regNum][0]), g_RegMap[this.c_id][regNum][1], g_RegMap[this.c_id][regNum][2]);
    }

    updateScreen()
    {
        // UPDATE SETPOINT ICONS (BASED ON DISPLAY)
        if(this.cur_displayMode>=0 && this.cur_displayMode<=4)
        {
            this.setClock(g_RegMap[this.c_id][97][0]);
            this.setCool(g_RegMap[this.c_id][98][0]);
            this.setHeat(g_RegMap[this.c_id][98][0]);
            this.TogglerCoolHeat();
            this.setSpeed(g_RegMap[this.c_id][385][0]);
            this.setUnderfloor(g_RegMap[this.c_id][386][0]);
        }

        // UPDATE OTHER ICONS (BASED ON DISPLAY)
        switch(this.cur_displayMode)
        {
            case 0:
                if(this.pre_displayMode != this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.unhide(".rym_Celcius");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.unhide(".rym_InTemp");
                    this.unhide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Water");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.unhide(".rymaskon_fonts_title");

                    this.c_title_handle.innerHTML = "ROOM";

                    this.pre_displayMode = this.cur_displayMode;
                }

                // THESE NEED CONSTANT UPDATE
                let bigSmallValue = g_RegMap[this.c_id][48][0]/10;
                this.c_bigFonts_handle.innerHTML = this.getBigNum(bigSmallValue);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(bigSmallValue);
                break;
            case 1:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.hide(".rym_Celcius");
                    this.unhide(".rym_Home");
                    this.unhide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.unhide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.unhide(".rym_Rh");
                    this.hide(".rym_Water");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.unhide(".rymaskon_fonts_title");

                    this.c_title_handle.innerHTML = "HUM";

                    this.pre_displayMode = this.cur_displayMode;
                }

                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][50][0]/200);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(g_RegMap[this.c_id][50][0]/200);
                break;
            case 2:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.unhide(".rym_Celcius");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.unhide(".rym_Man");
                    this.unhide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Water");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.unhide(".rymaskon_fonts_title");
                    
                    this.c_title_handle.innerHTML = "OUT";
                    
                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][66][0]/10);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(g_RegMap[this.c_id][66][0]/10);
                break;
            case 3:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.unhide(".rym_Celcius");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.unhide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.unhide(".rym_Water");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.unhide(".rymaskon_fonts_title");
                    
                    this.c_title_handle.innerHTML = "HEAT";
                    
                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][67][0]/10);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(g_RegMap[this.c_id][67][0]/10);
                break;
            case 4:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.unhide(".rym_Celcius");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.unhide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Water");
                    this.hide(".rym_Fan");
    
                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.unhide(".rymaskon_fonts_title");
    
                    
                    this.c_title_handle.innerHTML = "DIS";
                    
                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][68][0]/10);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(g_RegMap[this.c_id][68][0]/10);
                break;
            case 5:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.hide(".rym_Celcius");
                    this.hide(".rym_Clock");
                    this.hide(".rym_Cool");
                    this.hide(".rym_Heat");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.unhide(".rym_InTemp");
                    this.hide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Speed1");
                    this.hide(".rym_Speed2");
                    this.hide(".rym_Speed3");
                    this.hide(".rym_Water");
                    this.hide(".rym_End");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.unhide(".rymaskon_fonts_decimals");
                    this.hide(".rymaskon_fonts_title");

                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][384][0]/10);
                this.c_smallFonts_handle.innerHTML = "."+this.getSmallNum(g_RegMap[this.c_id][384][0]/10);
                break;
            case 6:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.hide(".rym_Celcius");
                    this.hide(".rym_Clock");
                    this.hide(".rym_Cool");
                    this.hide(".rym_Heat");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.hide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.hide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Speed1");
                    this.hide(".rym_Speed2");
                    this.hide(".rym_Speed3");
                    this.hide(".rym_Water");
                    this.hide(".rym_End");
                    this.unhide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.hide(".rymaskon_fonts_decimals");
                    this.hide(".rymaskon_fonts_title");
                    
                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][385][0]);
                break;
            case 7:
                if(this.pre_displayMode !== this.cur_displayMode)
                {
                    // ALL THESE NEED TO CHANGE ONCE DURING DISPLAY CHANGE
                    this.hide(".rym_Celcius");
                    this.hide(".rym_Clock");
                    this.hide(".rym_Cool");
                    this.hide(".rym_Heat");
                    this.unhide(".rym_Home");
                    this.hide(".rym_Humidity");
                    this.hide(".rym_InTemp");
                    this.hide(".rym_Man");
                    this.hide(".rym_OutTemp");
                    this.unhide(".rym_Protect");
                    this.hide(".rym_Rh");
                    this.hide(".rym_Speed1");
                    this.hide(".rym_Speed2");
                    this.hide(".rym_Speed3");
                    this.hide(".rym_Water");
                    this.hide(".rym_End");
                    this.hide(".rym_Fan");

                    this.unhide(".rymaskon_fonts");
                    this.hide(".rymaskon_fonts_decimals");
                    this.hide(".rymaskon_fonts_title");
                    
                    this.pre_displayMode = this.cur_displayMode;
                }
                
                // THESE NEED CONSTANT UPDATE
                this.c_bigFonts_handle.innerHTML = this.getBigNum(g_RegMap[this.c_id][386][0]);
                break;
        }
    }

    clamp(inNum, inMin, inMax)
    {
        return Math.min(Math.max(inNum, inMin), inMax);
    }

    getBigNum(inNum)
    {
        let str = String(inNum.toFixed(1));
        var strSplitted = str.split(".");
        return strSplitted[0];
    }

    getSmallNum(inNum)
    {
        let str = String(inNum.toFixed(1));
        var strSplitted = str.split(".");
        return strSplitted[1];
    }

    hide(inClass)
    {
        this.c_handle.querySelector(inClass).classList.add("rymaskon_hide");
    }

    unhide(inClass)
    {
        this.c_handle.querySelector(inClass).classList.remove("rymaskon_hide");
    }

    setClock(inClock)
    {
        let state = 0;
        if(inClock & 0b0100000000000000) state = 1;

        switch(state)
        {
            case 0:
                this.hide(".rym_Clock");
                break;
            case 1:
                this.unhide(".rym_Clock");
        }
    }

    setCool(inCoolHeat)
    {
        let state = 0;
        if(inCoolHeat & 0b0000000000000010) state = 2;
        else if(inCoolHeat & 0b0000000000000001) state = 1;

        switch(state)
        {
            case 0:
                this.hide(".rym_Cool");
                break;
            case 1:
                this.unhide(".rym_Cool");
                break;
            case 2:
                if(this.toggleCoolHeat)
                {
                    this.hide(".rym_Cool");
                }
                else
                {
                    this.unhide(".rym_Cool");
                }
        }
    }

    setHeat(inCoolHeat)
    {
        let state = 0;
        if(inCoolHeat & 0b0000000000001000) state = 2;
        else if(inCoolHeat & 0b0000000000000100) state = 1;

        switch(state)
        {
            case 0:
                this.hide(".rym_Heat");
                break;
            case 1:
                this.unhide(".rym_Heat");
                break;
            case 2:
                if(this.toggleCoolHeat)
                {
                    this.hide(".rym_Heat");
                }
                else
                {
                    this.unhide(".rym_Heat");
                }
        }
    }

    TogglerCoolHeat()
    {
        if(this.toggleCoolHeat)
        {
            this.toggleCoolHeat = false;
        }
        else
        {
            this.toggleCoolHeat = true;
        }
    }

    setSpeed(inSpeed)
    {
        switch(inSpeed)
        {
            case 0:
                this.hide(".rym_Speed1");
                this.hide(".rym_Speed2");
                this.hide(".rym_Speed3");
                break;
            case 1:
                this.unhide(".rym_Speed1");
                this.hide(".rym_Speed2");
                this.hide(".rym_Speed3");
                break;
            case 2:
                this.hide(".rym_Speed1");
                this.unhide(".rym_Speed2");
                this.hide(".rym_Speed3");
                break;
            case 3:
                this.hide(".rym_Speed1");
                this.hide(".rym_Speed2");
                this.unhide(".rym_Speed3");
        }
    }

    setUnderfloor(inUnderfloor)
    {
        switch(inUnderfloor)
        {
            case 0:
                this.hide(".rym_End");
                break;
            case 1:
                this.unhide(".rym_End");
        }
    }
}

//////////////////////////////////////////////////
// INSTANCES
//////////////////////////////////////////////////
const rymHandle01 = document.querySelector("#S30");
const rym01 = new Rymaskon(rymHandle01);

const rymHandle02 = document.querySelector("#S31");
const rym02 = new Rymaskon(rymHandle02);

const rymHandle03 = document.querySelector("#S32");
const rym03 = new Rymaskon(rymHandle03);

//////////////////////////////////////////////////
// REST OF SLAVE LIMITING
//////////////////////////////////////////////////
let arrayRestLimits = Object.keys(g_RegMap);

setInterval(ClampValues, 1000, arrayRestLimits);
function ClampValues(inSlaveArray)
{
    for(let i=0; i<=inSlaveArray.length; i++)
    {
        slave = inSlaveArray[i];
        if(slave != "30" && slave != "31" && slave != "32")
        {
            for(const inReg in g_RegMap[inSlaveArray[i]])
            {
                g_RegMap[inSlaveArray[i]][inReg][0] = clamp(Number(g_RegMap[inSlaveArray[i]][inReg][0]), g_RegMap[inSlaveArray[i]][inReg][1], g_RegMap[inSlaveArray[i]][inReg][2]);
            }
        }
    }
}

function clamp(inNum, inMin, inMax)
{
    return Math.min(Math.max(inNum, inMin), inMax);
}

//////////////////////////////////////////////////
// MIXING VALVE AND TEMPERATURES
//////////////////////////////////////////////////
let signalMax = 100;

let valveLogicInterval = 500;
let secFor90 = 140;

let g_valveT0 = 0;
let g_valveT1 = 0;

setInterval(MixingValveLogic, valveLogicInterval);
function MixingValveLogic()
{
    //MIXING VALVE - LOOP TIMING
    g_valveT1 = performance.now();
    let deltaTime = g_valveT1-g_valveT0;
    
    //MIXING VALVE - POSITION
    // console.log(g_RegMap["40"]["100"]["0"]);
    // let position = clamp(Number(g_RegMap["40"]["100"]["0"])/10,  0, signalMax); //0-100 (GIA 0-10V EKSODO FEEDBACK TRIODHS)
    let position = clamp((Number(g_RegMap["40"]["100"]["0"])-200)/8,  0, signalMax); //0-100 (GIA 2-10V EKSODO FEEDBACK TRIODHS)
    let command  = clamp(Number(g_RegMap["40"]["110"]["0"])/100, 0, signalMax); //0-100
    let dif      = command-position;
    let stepCalc = (signalMax/secFor90)*(deltaTime/1000);
    
    //MIXING VALVE - CALC AND SET NEW POSITION BASED ON COMMAND
    position += clamp(dif, -stepCalc, stepCalc);
    // g_RegMap["40"]["100"]["0"] = Math.floor(position*10); //Output (GIA 0-10V EKSODO FEEDBACK TRIODHS)
    g_RegMap["40"]["100"]["0"] = Math.floor(position*8+200); //Output (GIA 2-10V EKSODO FEEDBACK TRIODHS)

    //MIXING VALVE - SET WATER TEMP
    let positionPercent = position/signalMax;
    let znx = g_RegMap[9][30005][0];
    let epi = g_RegMap[10][30319][0];
    g_RegMap["40"]["106"]["0"] = Math.floor((positionPercent*znx)+((1-positionPercent)*epi)); //Output

    //ANTISTOIXISH THERMOKRASIAS MIKSHS SHJ ME WILO STRATOS PROSAGWGH
    g_RegMap[10][30009][0] = g_RegMap["40"]["106"]["0"];

    //MIXING VALVE - LOOP TIMING
    g_valveT0 = performance.now();
}

setInterval(StratosLogic, 1000);
function StratosLogic()
{
    //ΕΑΝ ΔΟΥΛΕΥΕΙ Ο ΚΥΚΛΟΦΟΡΗΤΗΣ
    if(g_RegMap[10][40041][0] & 1)
    {
        //ΤΡΕΧΟΝ ΜΑΝΟΜΕΤΡΙΚΟ
        let t01 = (g_RegMap[10][40002][0]/20)*10;
        t01 += Math.random()*4-2;//+-0.2mΥΣ
        t01 = Math.round(clamp(t01, 0, 100)); //Clamp 0-10m manometriko.
        g_RegMap[10][30002][0] = FloatOneDecimal(t01);

        //ΤΡΕΧΟΥΣΑ ΠΑΡΟΧΗ
        let t02 = 22*t01/70; //22 = 2.2m3/h
        t02 += Math.random()*4-2;//+-0.2mΥΣ
        t02 = Math.round(clamp(t02, g_RegMap[10][40423][0]*10, g_RegMap[10][40421][0]*10));
        t02 = Math.round(clamp(t02, 0, 100));
        g_RegMap[10][30003][0] = FloatOneDecimal(t02);
        
        //ΤΡΕΧΟΝ ΡΕΥΜΑ
        let t03 = 12;
        t03 += Math.random()*2-1;//+-0.2mΥΣ
        t03 = Math.round(t03);
        g_RegMap[10][30007][0] = FloatOneDecimal(t03);

        //ΤΡΕΧΟΥΣΑ ΙΣΧΥΣ ΕΝΔΟΔΑΠΕΔΙΑΣ
        let dT = g_RegMap[10][30009][0]/10-g_RegMap[10][30319][0]/10;
        dT = clamp(dT, 0, 100);
        let power = (4186/36)*g_RegMap[10][30003][0]*dT;

        g_RegMap[10][30301][0] = FloatOneDecimal(power); //8000=8kW;
        
        //ΣΥΝΟΛΙΚΗ ΕΝΕΡΓΕΙΑ ΕΝΔΟΔΑΠΕΔΙΑΣ
        let ener = g_RegMap[10][30313][0];
        ener += (power/1000)/60;
        g_RegMap[10][30313][0] = FloatOneDecimal(ener);
    }
    else
    {
        g_RegMap[10][30002][0] = 0;
        g_RegMap[10][30003][0] = 0;
        g_RegMap[10][30007][0] = 0;
        g_RegMap[10][30301][0] = 0;
    }

    //ΕΚΤΟΣ ΕΝΔΕΙΞΗ ΣΦΑΛΜΑΤΟΣ
    //ΕΚΤΟΣ ΚΩΔΙΚΟΣ ΣΦΑΛΜΑΤΟΣ
    //ΕΚΤΟΣ ΘΕΡΜΟΚΡΑΣΙΑ ΕΠΙΣΤΡΟΦΗΣ ΕΝΔΟΔΑΠΕΔΙΑΣ
    //ΕΚΤΟΣ ΤΡΕΧΟΥΣΑ ΤΑΣΗ ΚΥΚΛΟΦΟΡΗΤΗ

    //LG - ΑΝΤΙΓΡΑΦΗ MODE (C/H) ΑΠΟ ΤΗΝ MASTER ΜΟΝΑΔΑ (0x00)
    g_RegMap[2][40001][0] = g_RegMap[1][40001][0];
    g_RegMap[3][40001][0] = g_RegMap[1][40001][0];
    g_RegMap[9][40001][0] = g_RegMap[1][40001][0];
}

function FloatOneDecimal(inNum)
{
    let outNum = Math.round(inNum*10)/10;
    return (outNum);
}

//////////////////////////////////////////////////
// ENERGY METER LOGIC
//////////////////////////////////////////////////
let g_LgOnTime = 0;
let g_energy = 0;

function RandomNum(inMin, inMax)
{
    return (Math.random()*(inMax-inMin))+inMin;
}

function RoundNum(inNum, inDec)
{
    return Math.round(inNum*10**inDec)/(10**inDec);
}

setInterval(EnergyLogic, 1000);
function EnergyLogic()
{
    //XRONOS
    g_RegMap[43][196][0] += 1;
    g_RegMap[43][198][0] += 1;

    //TASH
    g_RegMap[43][1842][0] = RoundNum(230+RandomNum(-1.0,1.0), 1);
    g_RegMap[43][1844][0] = RoundNum(230+RandomNum(-1.0,1.0), 1);
    g_RegMap[43][1846][0] = RoundNum(230+RandomNum(-1.0,1.0), 1);

    //REYMA
    if(g_LgOnTime > 0)
    {
        let phaseAmp = (15/30)*g_LgOnTime;

        g_RegMap[43][1848][0] = RoundNum(phaseAmp+RandomNum(0, 0.5), 1);
        g_RegMap[43][1850][0] = RoundNum(phaseAmp+RandomNum(0, 0.5), 1);
        g_RegMap[43][1852][0] = RoundNum(phaseAmp+RandomNum(0, 0.5), 1);
    }
    else
    {
        g_RegMap[43][1848][0] = 0;
        g_RegMap[43][1850][0] = 0;
        g_RegMap[43][1852][0] = 0;
    }

    //ISXYS
    if(g_LgOnTime > 0)
    {
        let power = (5800/30)*g_LgOnTime;
        g_RegMap[43][1868][0] = RoundNum(power+RandomNum(0, 200), 0);
    }
    else
    {
        g_RegMap[43][1868][0] = 0;
    }


    //ENERGEIA
    let dEnergy = RoundNum(g_RegMap[43][1868][0]/60, 0);
    g_RegMap[43][0][0]  += dEnergy;
    g_RegMap[43][48][0] += dEnergy;

    //COST
    let tempCost = (g_RegMap[43][48][0]/1000)*g_RegMap[43][176][0];
    tempCost = Math.round(tempCost*100)/100
    g_RegMap[43][192][0] = tempCost;
    
    //EMISSIONS
    let tempEmission = (g_RegMap[43][48][0]/1000)*g_RegMap[43][178][0];
    tempEmission = Math.round(tempEmission*100)/100
    g_RegMap[43][194][0] = tempEmission;
    
    //RESET
    if(g_RegMap[43][2048][0] != 0)
    {
        if(g_RegMap[43][2048][0] == 65280)
        {
            g_RegMap[43][48][0] = 0;
            g_RegMap[43][192][0] = 0;
            g_RegMap[43][194][0] = 0;
            g_RegMap[43][196][0] = 0;
        }

        g_RegMap[43][2048][0] = 0;
    }

    //TIME
    if(g_RegMap[1][1][0] || g_RegMap[2][1][0] || g_RegMap[3][1][0] || g_RegMap[9][1][0])
    {
        g_LgOnTime = clamp(++g_LgOnTime, 0, 30);
    }
    else
    {
        g_LgOnTime = clamp(--g_LgOnTime, 0, 30);
    }
}

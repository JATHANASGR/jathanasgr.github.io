let utf8Encode = new TextEncoder();
let test = ':CH1:DISPlay ON'
let test_byte = utf8Encode.encode("test");

const options = {
    filters: [{vendorId: 0x5345}]
}

connectButton.onclick = async () => {

    let device = await navigator.usb.requestDevice(options);
    // console.log(device);
    await device.open();
    
    // if (usbDevice.configuration === null)
        // await usbDevice.selectConfiguration(1);

    await device.claimInterface(0);
    // await device.close();
    await device.transferOut(1, test_byte);

    // console.log("Pat!");

    // navigator.hid.requestDevice(requestParams).then((devices) => {
    // if (devices.length == 0) return;
    // devices[0].open().then(() => {
    //     console.log("Opened device: " + device.productName);
    //     device.addEventListener("inputreport", handleInputReport);
    //     device.sendReport(outputReportId, outputReport).then(() => {
    //     console.log("Sent output report " + outputReportId);
    //     });
    // });
    // });
}
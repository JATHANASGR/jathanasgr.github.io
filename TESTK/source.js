const options = {
    filters: [{vendorId: 0x5345}]
}

connectButton.onclick = async () => {

    let device = await navigator.usb.requestDevice(options)
    console.log(device);
    await device.open();

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
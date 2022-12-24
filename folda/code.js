const options = {
    filters: [{cendorId: 0x5345}]
}





connectButton.onclick = async () => {
    let device = await navigator.usb.requestDevice(options);
    await device.open();
    console.log(device.productName, device.manufacturerName);

    // navigator.usb.requestDevice({ filters: [
    //     {'vendorId': 0x5345}
    // ]})
    // .then(device => {device.open()})
    // // .then(device.claimInterface(0))
    // // .then(device => { console.log(device); console.log(device.vendorId.toString(16)); console.log(device.productId.toString(16)); })
    // .catch(error => { console.log(error); })
}
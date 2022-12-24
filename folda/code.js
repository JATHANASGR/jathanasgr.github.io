let deviceFilter = { vendorId: 0x1234, productId: 0xabcd };
let requestParams = { filters: [deviceFilter] };
let outputReportId = 0x01;
let outputReport = new Uint8Array([42]);

function handleConnectedDevice(e) {
  console.log("Device connected: " + e.device.productName);
}

function handleDisconnectedDevice(e) {
  console.log("Device disconnected: " + e.device.productName);
}

function handleInputReport(e) {
  console.log(e.device.productName + ": got input report " + e.reportId);
  console.log(new Uint8Array(e.data.buffer));
}

navigator.hid.addEventListener("connect", handleConnectedDevice);
navigator.hid.addEventListener("disconnect", handleDisconnectedDevice);

navigator.hid.requestDevice(requestParams).then((devices) => {
  if (devices.length == 0) return;
  devices[0].open().then(() => {
    console.log("Opened device: " + device.productName);
    device.addEventListener("inputreport", handleInputReport);
    device.sendReport(outputReportId, outputReport).then(() => {
      console.log("Sent output report " + outputReportId);
    });
  });
});
console.log("HAHAHA!");

const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const colourButton = document.getElementById('colourButton');

let device;
connectButton.onclick = function()
{
    navigator.usb.requestDevice({ filters: [
        {'vendorId': 0x5345}
    ]})
    .then(device => {device.open()})
    // .then(device.claimInterface(0))
    // .then(device => { console.log(device); console.log(device.vendorId.toString(16)); console.log(device.productId.toString(16)); })
    .catch(error => { console.log(error); })
}
// connectButton.onclick = async () => {
    // console.log("Hello!");
    // device = await navigator.usb.requestDevice({
    // filters: [{ vendorId: 0x5345 }]
    // });

    // await device.open();
    // device.claimInterface(0);
    // console.log(device);
    // await device.close();
    // await device.selectConfiguration(1);
    // await device.claimInterface(0);

    // console.log("VENDOR ID : ", device.vendorId);
    // connected.style.display = 'block';
    // connectButton.style.display = 'none';
    // disconnectButton.style.display = 'initial';
// };

disconnectButton.onclick = async () => {
    await device.close();

    // connected.style.display = 'none';
    // connectButton.style.display = 'initial';
    // disconnectButton.style.display = 'none';
};

colourButton.onclick = async () => {
    // const data = new Uint8Array([1, ...hexToRgb(colourPicker.value)]);
    // const data = new Uint8Array([1, ...hexToRgb(colourPicker.value)]);
    const data = utf8Encode.encode(test)
    await device.transferOut(1, data);
};

let utf8Encode = new TextEncoder();
// console.log(utf8Encode.encode("abc"));


test = ':CH1:DISPlay ON'
// test_byte = utf8Encode.encode("abc");
// console.log(test_byte)
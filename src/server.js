const net = require("node:net");
const os = require("os");

const getLocalAddress = () => {
    try {
        const localIpAddress = os.networkInterfaces()["Wi-Fi"][1]["address"];

        return localIpAddress
    } catch (err) {
        console.log(`An error occurred (maybe you're not connected to the internet): ${err}`);
        process.exit(1);
    }
}

const LOCAL_IP_ADDRESS = getLocalAddress();


const server = net.createServer((connection) => {
    console.log("A new connection");
})

server.listen(0, LOCAL_IP_ADDRESS, () => {
    console.log("Server is listening on", server.address())
})
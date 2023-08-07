const net = require("node:net");
const os = require("os");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("node:path");

const PRIVATE_IP_ADDRESSES = ["10.", "172.", "192.168."];

const getLocalAddress = () => {
    try {

        const localIpAddress = os.networkInterfaces()["Wi-Fi"][1]["address"];

        const result = PRIVATE_IP_ADDRESSES.some(addr => {
            localIpAddress.startsWith(addr);
        })

        if (!result) throw Error("Not a private address");

        return localIpAddress
    } catch (err) {
        console.log(`An error occurred (maybe you're not connected to the internet): ${err}`);
        process.exit(1);
    }
}

const LOCAL_IP_ADDRESS = getLocalAddress();
const DIRECTORY = path.join(process.cwd(), "..", "message-man-storage");

const server = net.createServer();

server.on("connection", async (socket) => {
    console.log("New connection");
    let fileHandle, fileWriteStream, fileName;

    console.log(DIRECTORY)

        // if (!fsSync.existsSync(DIRECTORY)) {
        //     await fs.mkdir(DIRECTORY);
        // }

    socket.on("data", async (data) => {
        if (!fileHandle) {
            socket.pause();

            const indexOfDivider = data.indexOf("---");
            fileName = data.subarray(10, indexOfDivider).toString("utf-8");
            const filePath = path.join(DIRECTORY, fileHandle)
            fileHandle = await fs.open(filePath, "w");
            fileWriteStream = fileHandle.createWriteStream();

            fileWriteStream.write(data.subarray(indexOfDivider + 3));

            socket.resume();
            fileWriteStream.on("drain", () => {
                socket.resume();
            })
        } else {
            if (!fileWriteStream.write(data)) {
                socket.pause()
            }
        }
    })

    socket.on("end", () => {
        if (fileHandle) fileHandle.close();
        fileHandle = undefined;
        fileWriteStream = undefined;
        console.log(`File received successfully: ${filePath }`);
        socket.end();
    })

    socket.on("error", () => {
        console.log("An error occurred so the client closed the connection");
        process.exit(1);
    })
})

server.listen(0, LOCAL_IP_ADDRESS, () => {
    console.log("Server is listening on", server.address())
})
const net = require("node:net");
const fs = require("fs/promises");
const path = require("node:path");

// node client.js <ip_address> <file_path> 

const IP_ADDRESS = process.argv[2].split(":");
const HOST = IP_ADDRESS[0];
const PORT = Number(IP_ADDRESS[1]);

const socket = net.createConnection({ host: HOST, port: PORT }, async () => {
    const filePath = process.argv[3];    
    const fileName = path.basename(filePath);
    const fileHandle = await fs.open(filePath, "r");
    const fileReadStream = fileHandle.createReadStream();

    socket.write(`fileName: ${fileName}---`)

    fileReadStream.pipe(socket);

    fileReadStream.on("end", () => {
        console.log("The file was successfully sent");
        socket.end()
    })
})

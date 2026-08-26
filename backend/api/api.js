import express from "express";
import { randomUUID } from "crypto";
import Docker from "dockerode";
import { createClient } from "redis";

const redis = createClient({
  url: "redis://cache:6379"
});

await redis.connect();


const app = express();

const PORT = 8080;

app.use(express.json());

app.post("/newServer", async (req, res) => {

    const data = req.body;

    console.log("NewServercalled");
    const info = await createGameContainer(data.noRounds, data.userName);

    console.log("info", info);
    
    await registerContainerRedis(info.roomNo, info.noRounds);
    console.log("-> Container registered")
    await addConnectionToGateway(info.roomNo);
    console.log("===0 connection added")

    res.json({
    userKey: info.userKey
    }); 
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


async function createGameContainer(noRounds, userName) {
    
    const docker = new Docker();

    const roomNo = Math.floor(100000 + Math.random() * 900000);
    const userKey = randomUUID();

    const container = await docker.createContainer({
    Image: "docker-game-server",
    name: `game-server-${roomNo}`,
    HostConfig: {
        NetworkMode: "drawing-app-network",
        AutoRemove: true,
    },

    Env: [
        `NO_ROUNDS=${noRounds}`,
        `ROOM_NU=${roomNo}`,
        `ADMIN_NAME=${userName}`,
        `ADMIN_KEY=${userKey}`
    ]
    });

    await container.start();
    console.log("Container started");

    return {userKey, roomNo, noRounds};
}

async function registerContainerRedis(roomNo, noRounds) {
    // This function only indicates that the room is created.
    const sec = noRounds*(200);
    console.log(sec);
    await redis.set(`room-${roomNo}`, "", { EX: sec });
}
async function addConnectionToGateway(roomNo) {
    await fetch("http:gateway:8080/connectGameServer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomNo: roomNo,
        })
    });

}
import express from "express";
import { randomUUID } from "crypto";
import Docker from "dockerode";
import { createClient } from "redis";
import cors from "cors";



const redis = createClient({
    url: "redis://cache:6379"
});
await redis.connect().then(() => {
    console.log("Sucessfully connected");
});

const app = express();

app.use(cors({
  origin: "*"
}));

const PORT = 8080;

app.use(express.json());

app.post("/newServer", async (req, res) => {
    // Request must have: noRounds, userName
    const data = req.body;

    console.log("NewServercalled");
    const info = await createGameContainer(data.noRounds, data.userName);

    console.log("info", info);
    
    await registerContainerRedis(info.roomNo, info.noRounds, info.userKey);
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

    // TODO: The container has a bind mount. I need to change it to the real image.
    
    const docker = new Docker();

    const roomNo = Math.floor(100000 + Math.random() * 900000);
    const userKey = randomUUID();

    const container = await docker.createContainer({
    Image: "docker-game-server",
    name: `game-server-${roomNo}`,

    HostConfig: {
        // AutoRemove: true,
        Binds: [
            "D:/Documentos/El bueno ENDGAME/AWS/Painting Game/backend/game:/app",
            "node_modules_game_server:/app/node_modules",
        ]
    },

    NetworkingConfig: {
        EndpointsConfig: {
            "drawing-app-network": {
                Aliases: [
                    `game-server-${roomNo}`
                ]
            }
        }
    },

    Env: [
        `NO_ROUNDS=${noRounds}`,
        `ROOM_NU=${roomNo}`,
        `ADMIN_NAME=${userName}`,
        `ADMIN_KEY=${userKey}`
    ]
    });

    try {
        await container.start();
    } catch (e) {
        console.log(e);
    }

    console.log("Container started");
    
    const info = await container.inspect();

    return {userKey, roomNo, noRounds};
}

async function registerContainerRedis(roomNo, noRounds, userKey) {
    
    // This function only indicates that the room is created.
    const sec = noRounds*(200);
    console.log(sec);
    await redis.set(String(roomNo), "WAITING", { EX: sec });
    await redis.set(userKey, roomNo, { EX: sec }); 
}
async function addConnectionToGateway(roomNo) {
    await fetch("http://gateway:8080/connectGameServer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomNo: roomNo,
        })
    })
    .then(() => {
        console.log("The connection was sucessful");
    })
    .catch(() => {
        console.log("The connection failed");
    });

}